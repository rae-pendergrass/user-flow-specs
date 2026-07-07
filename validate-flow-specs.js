#!/usr/bin/env node
// validate-flow-specs.js — advisory linter for User Flow Specs.
//
//   node validate-flow-specs.js <flow-specs-dir> [more dirs...]
//
// Companion to the User Flow Specs methodology (SPEC-TEMPLATE.md is the format
// it encodes). Advisory — exits 1 on ISSUES;
// WARNINGS and INFO never block.
//
// Scans NN-*.md spec files in each dir, plus three context files:
//   README.md        (in dir)     → Flow Spec Index table + status vocab
//   SCREENS.md       (in dir)     → screen inventory cross-reference
//   REQUIREMENTS.md  (dir parent) → R# coverage
//
// ISSUES (blocking):
//   I1  missing required element: **Goal:** line, Entry Point(s), Edge Cases,
//       UX Notes, Prototype Scope section, or any 4-tuple flow content at all
//   I2  H1 is not "# Flow Spec NN: Title"
//   I3  filename NN- prefix ≠ H1 spec number
//   I4  README index out of sync (spec file with no row / row with no file)
//   I5  README status cell doesn't start with a vocab term:
//       Draft | Reviewed | Prototyped | Audited ✓ | Superseded by NN
//   I6  relative .md link target doesn't resolve
//   I7  a "### Step N" block with zero 4-tuple labels
//       (What they want / What they see / What they do / What happens)
//   I8  supersession mismatch: README "Superseded by" without the file's
//       **Superseded by:** metadata line, or vice versa
//   I9  duplicate spec numbers across files
//   I10 Edge Cases section has no table data row
//
// WARNINGS (design issues — consider, don't obey blindly):
//   W1  UI-Stack gap: no error-, empty-, or loading-state language anywhere
//       in the spec (reported per missing state family)
//   W2  >9 distinct main step numbers in one flow section — scope too broad?
//   W3  Goal line names no actor — solution-first framing
//   W4  lettered sub-step with no sibling (a 5a with no 5b)
//   W5  step with only one 4-tuple label (legal but often a thin step)
//   W6  ad-hoc metadata: "Verified YYYY" outside ## Verified, or supersession
//       prose outside the **Supersedes:/Superseded by:** lines
//   W7  Prototype Scope has no bullets (and isn't the "- None — reason" form)
//   W8  design language in a spec (Altitude Rule): color words, hex values,
//       px/pt sizes, font names, style adjectives — visual design belongs to
//       the prototype phase. Lines marked "(prototype-phase decision" are
//       exempt (that's the sanctioned parking format).
//   W9  spec has no **Covers:** R# line (only when REQUIREMENTS.md exists)
//   W10 step lacks the "What they want:" intent line
//
// INFO (context, never action-forcing):
//   N1  no "New User vs. Returning User" section (omission may be deliberate)
//   N2  numbering gap in the spec sequence (normal after supersession)
//   N3  SCREENS.md screen not mentioned in any spec (possible orphan)
//   N4  no REQUIREMENTS.md at project root (grandfathered project)
//   N5  requirement R# not covered by any spec (coverage report)
//
// KNOWN GAP (deliberate, so it's never a silent blind spot): the reverse
// screen check — "spec mentions a screen that SCREENS.md lacks" — needs
// reliable screen-name extraction from prose, which markdown can't give us.
// Keep SCREENS.md updated in the same pass as each draft (Phase 2).

const fs = require('fs');
const path = require('path');

const STATUS_VOCAB = /^(Draft|Reviewed|Prototyped|Audited ✓|Superseded by \d+)/;
const TUPLE_LABELS = ['**What they want:**', '**What they see:**', '**What they do:**', '**What happens:**'];

const DESIGN_LANGUAGE = [
  { re: /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/, name: 'hex color' },
  { re: /\b\d+(\.\d+)?(px|pt)\b/, name: 'px/pt size' },
  { re: /\b(pink|purple|teal|magenta|maroon|crimson|beige|lavender)\b/i, name: 'color word' },
  { re: /\b(bright red|dark blue|light green|bold red|big red)\b/i, name: 'color styling' },
  { re: /\b(Inter|Helvetica|Arial|Roboto|sans-serif|serif font)\b/, name: 'font name' },
  { re: /\b(rounded corners|drop shadow|gradient|font size|font-weight)\b/i, name: 'style property' },
];

const STATE_FAMILIES = [
  { name: 'error', re: /(error|fails?\b|failed|invalid|wrong|corrupt|damaged)/i },
  { name: 'empty', re: /(empty|blank|no \w+ yet|nothing (here|yet)|first[- ](time|use|launch))/i },
  { name: 'loading', re: /(loading|spinner|skeleton|offline|slow|syncing|preparing|restoring)/i },
];

let findings = []; // {file, line, sev, code, msg}
function add(file, line, sev, code, msg) { findings.push({ file, line, sev, code, msg }); }

function lintDir(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Not a directory: ${dir}`);
    process.exitCode = 1;
    return;
  }
  const specFiles = fs.readdirSync(dir)
    .filter(f => /^\d{2}-.*\.md$/.test(f))
    .sort();

  const specs = specFiles.map(f => {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    return { file: f, full: path.join(dir, f), text, lines: text.split('\n') };
  });

  // ---- per-spec checks ----
  const numbersSeen = new Map(); // num -> [files]
  for (const s of specs) lintSpec(dir, s, numbersSeen);

  // I9 duplicate numbers
  for (const [num, files] of numbersSeen) {
    if (files.length > 1) add(files.join(' + '), 0, 'issue', 'I9', `duplicate spec number ${num}`);
  }
  // N2 numbering gaps
  const nums = [...numbersSeen.keys()].map(Number).sort((a, b) => a - b);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] > 1) {
      add(dir, 0, 'info', 'N2', `numbering gap: ${String(nums[i - 1]).padStart(2, '0')} → ${String(nums[i]).padStart(2, '0')} (normal after supersession)`);
    }
  }

  lintReadme(dir, specs);
  lintScreens(dir, specs);
  lintRequirements(dir, specs);

  // Grandfathering, encoded: in an Audited ✓ spec, body-format issues
  // (missing section, tuple-less step, empty Edge Cases) downgrade to
  // warnings — the doc already proved itself against the prototype; bring it
  // to template on its next edit. Link rot and index desync stay blocking.
  const audited = new Set();
  const readmePath = path.join(dir, 'README.md');
  if (fs.existsSync(readmePath)) {
    for (const ln of fs.readFileSync(readmePath, 'utf8').split('\n')) {
      const fm = ln.match(/(\d{2}-[a-z0-9-]+\.md)/i);
      if (fm && /\|\s*Audited ✓/.test(ln)) audited.add(fm[1]);
    }
  }
  for (const f of findings) {
    if (f.sev === 'issue' && audited.has(f.file) && ['I1', 'I7', 'I10'].includes(f.code)) {
      f.sev = 'warning';
      f.msg += ' (grandfathered — Audited ✓; bring to template on next edit)';
    }
  }
}

function sections(s) {
  // [{name, start, end}] from H2 headings
  const out = [];
  s.lines.forEach((ln, i) => {
    const m = ln.match(/^## (.+)$/);
    if (m) out.push({ name: m[1].trim(), start: i });
  });
  out.forEach((sec, i) => { sec.end = i + 1 < out.length ? out[i + 1].start : s.lines.length; });
  return out;
}

function lintSpec(dir, s, numbersSeen) {
  const { file, lines, text } = s;
  const secs = sections(s);
  const secNames = secs.map(x => x.name);

  // I2/I3 — H1
  const h1Idx = lines.findIndex(l => l.startsWith('# '));
  const h1 = h1Idx >= 0 ? lines[h1Idx] : '';
  const h1m = h1.match(/^# Flow Spec (\d{2}): .+/);
  if (!h1m) {
    add(file, h1Idx + 1, 'issue', 'I2', `H1 must be "# Flow Spec NN: Title" — found: ${h1 || '(no H1)'}`);
  } else {
    const fileNum = file.slice(0, 2);
    if (h1m[1] !== fileNum) add(file, h1Idx + 1, 'issue', 'I3', `filename number ${fileNum} ≠ H1 number ${h1m[1]}`);
    const list = numbersSeen.get(h1m[1]) || [];
    list.push(file);
    numbersSeen.set(h1m[1], list);
  }
  if (!numbersSeen.has(file.slice(0, 2)) && !h1m) {
    // still track filename number for gap/duplicate accounting
    const list = numbersSeen.get(file.slice(0, 2)) || [];
    list.push(file);
    numbersSeen.set(file.slice(0, 2), list);
  }

  // I1 — required elements
  if (!lines.some(l => l.startsWith('**Goal:**'))) add(file, 1, 'issue', 'I1', 'missing **Goal:** line');
  if (!secNames.some(n => n.startsWith('Entry Point'))) add(file, 1, 'issue', 'I1', 'missing ## Entry Point(s) section');
  if (!secNames.includes('Edge Cases')) add(file, 1, 'issue', 'I1', 'missing ## Edge Cases section');
  if (!secNames.includes('UX Notes')) add(file, 1, 'issue', 'I1', 'missing ## UX Notes section');
  const protoSec = secs.find(x => x.name.startsWith('Prototype Scope'));
  if (!protoSec) add(file, 1, 'issue', 'I1', 'missing ## Prototype Scope section');
  const tupleCount = TUPLE_LABELS.reduce((n, lab) => n + (text.split(lab).length - 1), 0);
  if (tupleCount === 0) add(file, 1, 'issue', 'I1', 'no 4-tuple flow content (What they want / What they see / What they do / What happens) anywhere');

  // Steps: H3 "Step N[letter]" blocks, grouped per containing H2 (variant
  // sections restart numbering — that's legal)
  let curSec = '(top)';
  const stepBlocks = []; // {sec, num, letter, start, end, line}
  lines.forEach((ln, i) => {
    const h2 = ln.match(/^## (.+)$/);
    if (h2) { curSec = h2[1]; return; }
    const h3 = ln.match(/^### Step\s+(\d+)([a-z])?\s*[:.]?/i);
    if (h3) stepBlocks.push({ sec: curSec, num: h3[1], letter: h3[2] || '', start: i, line: i + 1 });
  });
  // block end = next H3/H2 or EOF
  stepBlocks.forEach((b, i) => {
    let end = lines.length;
    for (let j = b.start + 1; j < lines.length; j++) {
      if (/^###? /.test(lines[j]) || /^## /.test(lines[j])) { end = j; break; }
    }
    b.end = Math.min(end, i + 1 < stepBlocks.length ? stepBlocks[i + 1].start : end);
  });

  const perSecNums = new Map(); // sec -> Set(num)
  const letterGroups = new Map(); // sec|num -> Set(letter)
  for (const b of stepBlocks) {
    const body = lines.slice(b.start, b.end).join('\n');
    const present = TUPLE_LABELS.filter(lab => body.includes(lab));
    const isCrossRef = /same as/i.test(body); // "(Same as above — …)" steps are a sanctioned shorthand
    if (present.length === 0 && !isCrossRef) add(file, b.line, 'issue', 'I7', `Step ${b.num}${b.letter} has none of the 4-tuple labels`);
    else if (present.length === 1) add(file, b.line, 'warning', 'W5', `Step ${b.num}${b.letter} has only "${present[0].replace(/\*/g, '')}" — thin step?`);
    // W10 — intent missing
    else if (!body.includes('**What they want:**') && !isCrossRef) {
      add(file, b.line, 'warning', 'W10', `Step ${b.num}${b.letter} has no "What they want:" intent line`);
    }
    if (!perSecNums.has(b.sec)) perSecNums.set(b.sec, new Set());
    perSecNums.get(b.sec).add(b.num);
    const key = `${b.sec}|${b.num}`;
    if (!letterGroups.has(key)) letterGroups.set(key, new Set());
    if (b.letter) letterGroups.get(key).add(b.letter);
  }
  for (const [sec, set] of perSecNums) {
    if (set.size > 9) add(file, 1, 'warning', 'W2', `${set.size} main steps in "${sec}" — scope too broad? Consider splitting the spec`);
  }
  for (const [key, letters] of letterGroups) {
    if (letters.size === 1) {
      const [sec, num] = key.split('|');
      add(file, 1, 'warning', 'W4', `Step ${num}${[...letters][0]} has no sibling branch — letters are for mutually exclusive branches`);
    }
  }

  // W3 — Goal actor detection: common role words that indicate the Goal line
  // names a person. If your project uses domain-specific terms (e.g. "member",
  // "patient", "contributor"), add them here so the linter recognizes them.
  const goalLine = lines.find(l => l.startsWith('**Goal:**'));
  if (goalLine && !/\b(user|users|they|she|he|designer|player|visitor|reader|creator|admin)\b/i.test(goalLine)) {
    add(file, lines.indexOf(goalLine) + 1, 'warning', 'W3', 'Goal line names no actor — solution-first framing (state who wants what)');
  }

  // I10 — Edge Cases table
  const edgeSec = secs.find(x => x.name === 'Edge Cases');
  if (edgeSec) {
    const body = lines.slice(edgeSec.start + 1, edgeSec.end);
    const tableRows = body.filter(l => /^\|/.test(l.trim()) && !/^\|[\s:|-]+\|?$/.test(l.trim()));
    if (tableRows.length <= 1) add(file, edgeSec.start + 1, 'issue', 'I10', 'Edge Cases has no table data rows');
  }

  // W7 — Prototype Scope content (bullets, numbered list, or table rows all count)
  if (protoSec) {
    const body = lines.slice(protoSec.start + 1, protoSec.end);
    const hasContent = body.some(l => /^\s*([-*]|\d+\.)\s+\S/.test(l) || (/^\|/.test(l.trim()) && !/^\|[\s:|-]+\|?$/.test(l.trim())));
    if (!hasContent) add(file, protoSec.start + 1, 'warning', 'W7', 'Prototype Scope has no items (use "- None — <reason>" if genuinely empty)');
  }

  // I6 — relative .md links resolve
  lines.forEach((ln, i) => {
    for (const m of ln.matchAll(/\]\(([^)#\s]+\.md)(#[^)]*)?\)/g)) {
      const target = m[1];
      if (/^https?:/.test(target) || target.startsWith('/')) continue;
      if (!fs.existsSync(path.resolve(dir, target))) {
        add(file, i + 1, 'issue', 'I6', `broken link: ${target}`);
      }
    }
  });

  // W1 — UI-Stack families
  const missing = STATE_FAMILIES.filter(f => !f.re.test(text)).map(f => f.name);
  if (missing.length) add(file, 1, 'warning', 'W1', `UI-Stack: no ${missing.join('-, no ')}-state language anywhere — considered and N/A, or never considered?`);

  // W6 — ad-hoc metadata
  const verifiedSec = secs.find(x => x.name === 'Verified');
  lines.forEach((ln, i) => {
    const inVerified = verifiedSec && i > verifiedSec.start && i < verifiedSec.end;
    if (/\bVerified 20\d\d/.test(ln) && !inVerified) {
      add(file, i + 1, 'warning', 'W6', 'dated Verified note outside the ## Verified section');
    }
    const t = ln.trim();
    // Only spec-supersession prose ("superseded by Flow Spec NN") is ad-hoc
    // metadata. Domain content may legitimately say "superseded" — e.g. a spec
    // describing how the dashboard renders superseded DECISIONS entries.
    if (
      /supersed/i.test(t) &&
      /\b(flow\s+)?spec\b/i.test(t) &&
      !t.startsWith('**Supersedes:**') &&
      !t.startsWith('**Superseded by:**')
    ) {
      add(file, i + 1, 'warning', 'W6', 'supersession prose outside the **Supersedes:/Superseded by:** metadata lines');
    }
  });

  // W8 — design language (Altitude Rule)
  lines.forEach((ln, i) => {
    if (ln.trim().startsWith('<!--') || ln.includes('(prototype-phase decision')) return;
    const hits = DESIGN_LANGUAGE.filter(d => d.re.test(ln)).map(d => d.name);
    if (hits.length) add(file, i + 1, 'warning', 'W8', `design language (${hits.join(', ')}) — visual design belongs to the prototype phase`);
  });

  // N1 — New vs Returning
  if (!secNames.some(n => /New User vs/.test(n))) {
    add(file, 1, 'info', 'N1', 'no "New User vs. Returning User" section (fine if the experiences are identical)');
  }
}

function lintReadme(dir, specs) {
  const readmePath = path.join(dir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    add('README.md', 0, 'issue', 'I4', 'no README.md (the Flow Spec Index lives there)');
    return;
  }
  const lines = fs.readFileSync(readmePath, 'utf8').split('\n');
  const indexRows = new Map(); // filename -> {status, line}
  lines.forEach((ln, i) => {
    if (!/^\|/.test(ln.trim())) return;
    const fm = ln.match(/(\d{2}-[a-z0-9-]+\.md)/i);
    if (!fm) return;
    const cells = ln.split('|').map(c => c.trim()).filter(Boolean);
    indexRows.set(fm[1], { status: cells[cells.length - 1] || '', line: i + 1 });
  });

  for (const s of specs) {
    if (!indexRows.has(s.file)) add('README.md', 0, 'issue', 'I4', `spec ${s.file} has no index row`);
  }
  for (const [f, row] of indexRows) {
    if (!fs.existsSync(path.join(dir, f))) {
      add('README.md', row.line, 'issue', 'I4', `index row points at missing file ${f}`);
      continue;
    }
    if (!STATUS_VOCAB.test(row.status)) {
      add('README.md', row.line, 'issue', 'I5', `status "${row.status}" — must start with Draft | Reviewed | Prototyped | Audited ✓ | Superseded by NN`);
    }
    // I8 both directions
    const spec = specs.find(s => s.file === f);
    if (spec) {
      const fileHasMeta = spec.text.includes('**Superseded by:**');
      const readmeSays = /^Superseded by/.test(row.status);
      if (readmeSays && !fileHasMeta) add(f, 1, 'issue', 'I8', 'README says Superseded but file lacks the **Superseded by:** metadata line');
      if (!readmeSays && fileHasMeta) add('README.md', row.line, 'issue', 'I8', `${f} has a **Superseded by:** line but its index status isn't "Superseded by NN"`);
    }
  }
}

function lintScreens(dir, specs) {
  const screensPath = path.join(dir, 'SCREENS.md');
  if (!fs.existsSync(screensPath)) return; // adoption is graceful
  const lines = fs.readFileSync(screensPath, 'utf8').split('\n');
  const allSpecText = specs.map(s => s.text).join('\n').toLowerCase();
  lines.forEach((ln, i) => {
    const t = ln.trim();
    if (!t.startsWith('|') || /^\|[\s:|-]+\|?$/.test(t)) return;
    const cells = t.split('|').map(c => c.trim()).filter(Boolean);
    const screen = (cells[0] || '').replace(/\*/g, '');
    if (!screen || /^Screen$/i.test(screen)) return;
    if (!allSpecText.includes(screen.toLowerCase())) {
      add('SCREENS.md', i + 1, 'info', 'N3', `screen "${screen}" isn't mentioned in any spec — orphan?`);
    }
  });
}

function lintRequirements(dir, specs) {
  const reqPath = path.join(path.dirname(path.resolve(dir)), 'REQUIREMENTS.md');
  if (!fs.existsSync(reqPath)) {
    add(path.basename(dir), 0, 'info', 'N4', 'no REQUIREMENTS.md at project root (grandfathered project — Phase 0 applies to new work)');
    return;
  }
  const reqText = fs.readFileSync(reqPath, 'utf8');
  const declared = new Set([...reqText.matchAll(/\*\*R(\d+)/g)].map(m => `R${m[1]}`));
  const covered = new Set();
  for (const s of specs) {
    const cov = s.text.match(/^\*\*Covers:\*\*\s*(.+)$/m);
    if (!cov) {
      add(s.file, 1, 'warning', 'W9', 'no **Covers:** R# line — every spec traces to a requirement');
      continue;
    }
    [...cov[1].matchAll(/R(\d+)/g)].forEach(m => covered.add(`R${m[1]}`));
  }
  for (const r of declared) {
    if (!covered.has(r)) add('REQUIREMENTS.md', 0, 'info', 'N5', `${r} is covered by no spec`);
  }
}

// ---- main ----
const dirs = process.argv.slice(2);
if (!dirs.length) {
  console.error('Usage: node validate-flow-specs.js <flow-specs-dir> [more dirs...]');
  process.exit(2);
}

for (const dir of dirs) {
  findings = [];
  lintDir(dir);

  const issues = findings.filter(f => f.sev === 'issue');
  const warnings = findings.filter(f => f.sev === 'warning');
  const infos = findings.filter(f => f.sev === 'info');

  console.log(`\n═══ ${dir} ═══`);
  const byFile = {};
  for (const f of findings) (byFile[f.file] = byFile[f.file] || []).push(f);
  for (const [file, fs_] of Object.entries(byFile)) {
    console.log(`\n  ${file}`);
    for (const f of fs_) {
      const tag = f.sev === 'issue' ? '✕ ISSUE' : f.sev === 'warning' ? '⚠ warn ' : 'ℹ info ';
      console.log(`    ${tag} [${f.code}] ${f.line ? `line ${f.line}: ` : ''}${f.msg}`);
    }
  }
  console.log(`\n  ${issues.length} issue(s) · ${warnings.length} warning(s) · ${infos.length} info`);
  if (issues.length === 0) console.log(`  PASS — format clean.`);
  else process.exitCode = 1;
}
