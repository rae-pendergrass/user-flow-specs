---
name: user-flow-specs
description: Use when writing, reviewing, ordering, editing, or auditing User Flow Specs — the prose design documents (What they want / What they see / What they do / What happens per step) written BEFORE Figma prototyping. Load it for any work inside a project's flow-specs/ folder, including the Flow Spec Index README, REQUIREMENTS.md, SCREENS.md, and AUDIT.md. Covers the full lifecycle: requirements → flow selection & ordering → drafting → human review loop → feasibility checks → prototype handoff (pairs with figma-prototype) → post-prototype audit, plus the advisory linter validate-flow-specs.js. Flow specs own behavior and content intent; visual design decisions belong to the prototype phase — never write them into a spec.
when_to_use: "write the flow specs", "review flow spec NN", "which flows do we need", "audit the specs against the prototype", "user journeys", "user flows", or starting design work on a new app project.
---

# User Flow Specs — Write, Review & Audit

A **User Flow Spec** is a prose document that walks one user goal through the product step by step: **What they want / What they see / What they do / What happens**. It is a narrative user flow (NN/g) with use-case structure (Cockburn) and wireflow-level screen detail, written as a durable spec for AI-collaborative design — Claude generates the prototype FROM it, then the prototype is audited AGAINST it. See `terminology.md` in this skill for the full industry mapping (it is NOT a journey map or a user story).

**The 4-tuple is sacred.** Every step uses exactly these four labels, in this order: `**What they want:**` · `**What they see:**` · `**What they do:**` · `**What happens:**`. Never rename, reorder, or merge them. The intent line states the user's micro-goal for this step — motivation precedes perception ("they want more context", "they want to confirm it saved").

**One scenario per spec.** A spec that spans multiple user goals gets split.

**Write scannably:** bold lead-ins, tables over paragraphs, short sentences. Prioritize accessibility — scannable structure helps everyone, and is essential for users with ADHD or dyslexia.

---

## The Altitude Rule — what each phase owns

| Phase | Owns |
|---|---|
| **Flow specs** | Behavior, sequence, structure, what information appears, content **intent** + tone |
| **Prototype** | ALL visual design — color, size, emphasis, layout aesthetics — and final copy |

Specs written early become gospel: a "big pink button" written into a spec forecloses the mindful visual choice that should happen at prototype time with full context. **Never write visual design decisions into a spec.** If a visual idea comes up during spec work, record it as `*(prototype-phase decision: …)*` so it's parked, not decided. The linter flags design language in specs.

**Copy convention:** specs always state content intent ("a reassuring one-liner explaining the gate cleared"). Literal strings are allowed only when marked `(draft copy)`. Final copy is decided at prototype time; the audit does not count marked-draft copy polish as drift.

---

## Writing Rules — every artifact is read by a fresh Claude

These apply to spec bodies, Prototype Scope items, README status cells, Verified notes, and AUDIT resolutions:

- **Self-contained.** Assume the reader has zero session memory. Name files, screens, and decisions explicitly.
- **Affirmative.** State what to build or do. Define things by what they are.
- **One fact per bullet.** A status note that mixes done-state, optional follow-ups, and caveats gets split.
- **Deferred work goes to TO-DO.md** — as its own entry, never as a trailing parenthetical inside a scope item.

---

## Lifecycle

```
Phase 0  Requirements        → REQUIREMENTS.md, human stakeholder reviews
Phase 1  Select & order      → proposed spec list + ordering rationale, human stakeholder approves
Phase 2  Draft               → one spec at a time, SCREENS.md grows alongside
Phase 3  Human review loop   → one spec at a time, status → Reviewed
Phase 4  Feasibility (opt.)  → findings into ## Verified, never silent edits
Phase 5  Prototype handoff   → figma-prototype skill builds from Prototype Scope
Phase 6  Audit               → AUDIT.md, status → Audited ✓
```

### Phase 0 — Requirements

Write `REQUIREMENTS.md` at the **project root** from `REQUIREMENTS-TEMPLATE.md` (in this skill). It contains: problem statement & goal · the user + standing accessibility requirements · the app's emotional core · **numbered functional requirements (R1, R2, …)** · constraints (DS, platform) · explicitly out of scope.

- The human stakeholder reviews REQUIREMENTS.md before any spec is written.
- Mid-design requirement changes are dated edits to the file.
- Scaffold `flow-specs/README.md` with the Flow Spec Index table (`# / Flow Spec / File / Status`) pointing at REQUIREMENTS.md for the emotional core.

### Phase 1 — Select & order the specs

**Selection.** Derive candidate flows FROM the requirements list. Prioritize by red routes: score each candidate by *frequency of use × consequence of failure*. If your user base is small enough to interview directly, do that rather than estimating.

Priority order: **core loop(s)** (what the app exists to do) → **first launch / onboarding** → secondary paths (settings, data management) → destructive/recovery paths (export, wipe).

Reject at selection time:
- A flow that is a feature list in disguise (no single user goal driving it)
- A flow with no clear actor + trigger
- A flow spanning multiple goals — split it

**Ordering — chain of thought is a design tool.** Claude re-reads earlier specs when writing later ones, so the order specs are written in shapes the design. Apply in priority order:

1. **Foundational red-route first** — the flow that defines the app's core screens and interaction grammar; everything downstream inherits its vocabulary.
2. **First-launch after the core loop** — onboarding's job is to deliver users into the core loop; design the road before the on-ramp.
3. **Cross-cutting patterns before their consumers** — a flow defining a shared mechanism (e.g. a file-viewer used by multiple flows) precedes every flow that links into it.
4. **Shared-screen flows adjacent** — flows touching the same screen sit next to each other so the second is written with the first fresh.
5. **Create before edit before delete** — the create flow establishes the object's anatomy.

Present the proposed list + order to the human stakeholder with **one line of reasoning per spec** (why this flow, why this position) before drafting anything.

### Phase 2 — Draft

For each spec, in index order:

1. **Re-read specs 1..N-1 first** (at minimum the cross-cutting and shared-screen ones). This is the chain-of-thought payoff — it is a hard rule, not a suggestion.
2. Copy `SPEC-TEMPLATE.md` (in this skill) → `flow-specs/NN-kebab-title.md`.
3. Add the `**Covers:** R#` line — every spec traces to at least one requirement.
4. **Update `flow-specs/SCREENS.md` in the same pass**: every screen this spec touches gets a row (`| Screen | Purpose | Flow specs that touch it | States considered |`). Contradictions between specs about a shared screen surface here, not at audit.
5. **UI-Stack check per key screen**: consider empty/blank · loading · partial · error (the ideal state IS The Flow). States that genuinely don't apply are fine; states never considered aren't. Findings go in the Edge Cases table.
6. Goal-first, not solution-first: the Goal line states what the user wants, never what the UI does.
7. Apply the Altitude Rule and Writing Rules throughout.
8. Run the linter (below). Add the spec's row to the README index with status `Draft`.

### Phase 3 — Human review loop

The main design-thinking phase — expect substantive rewrites, not proofreading.

- One spec at a time, in index order. Walk the human stakeholder through the flow step by step.
- Surface open decisions explicitly: `*(Pending Decision — see Flow Spec NN)*` style, never silently resolved.
- If an edit contradicts an already-`Reviewed` spec, **stop and flag it**; reconcile both specs before continuing.
- On human stakeholder approval: status → `Reviewed`. Re-run the linter after each edit session.

### Phase 4 — Feasibility check (optional)

Technical questions raised during review get investigated. Findings come back into the spec as dated bullets in its `## Verified` section — **never as silent edits**. A finding that kills or reshapes a flow is a spec edit plus (if architectural) a project DECISIONS.md entry.

### Phase 5 — Prototype handoff

- The spec's **Prototype Scope** section is the work order for the `figma-prototype` skill: concrete frames and states to build, one per bullet.
- Visual design and final copy are decided HERE, with all spec context available.
- **Specs are not edited during prototyping.** Divergence is deliberate input for the audit — absorbing it silently destroys the audit's value.
- When a spec's screens are built: status → `Prototyped`.

### Phase 6 — Post-prototype audit

Maintain one standing `flow-specs/AUDIT.md` per project, **newest round at top**:

```markdown
## Audit — YYYY-MM-DD (prototype file <fileKey>)

### Flow Spec NN: Title
| Where | Spec says | Prototype shows | Class | Resolution |
|---|---|---|---|---|
```

Walk specs in index order, stepping through The Flow against prototype screenshots. Classify every mismatch with exactly one of:

| Class | Meaning | Resolution |
|---|---|---|
| **Deliberate** | Prototype is right — design improved during prototyping | Update the spec; real design decisions get a `/decision` entry |
| **Drift** | Unintentional divergence | The human stakeholder picks the winner; fix the spec or queue a prototype fix |
| **Not prototyped** | Gap | Stays in Prototype Scope as open work, or becomes a `/todo` entry |

Marked-`(draft copy)` string differences are not findings. When a spec's rows are resolved: status → `Audited ✓ — <date>`. Run the linter at audit start and end.

---

## Status lifecycle

`Draft → Reviewed → Prototyped → Audited ✓` — plus the terminal `Superseded by NN`.

- Status lives **only** in the README index (single source of truth — never duplicated in spec files).
- A status cell starts with a vocab term; a free-text suffix after an em-dash is allowed (`Audited ✓ — 2026-06-06`).
- Supersession gets `**Supersedes:** / **Superseded by:**` metadata lines in the affected spec files (see template) — never ad-hoc warning prose in the body.

---

## Validation

```
node ${CLAUDE_SKILL_DIR}/validate-flow-specs.js <path-to-flow-specs-dir>
```

Run it: after every draft · after every review-loop edit session · before any status change in the README · at audit start and end.

The linter is **advisory**. Issues (exit 1) are format violations to fix before moving on; warnings are design-smell prompts (UI-Stack gaps, design language in specs, scope creep) to consider, not commands; info is context. It checks specs, the README index, SCREENS.md cross-references, and REQUIREMENTS.md coverage — see the script header for the full rule list.

---

## Files in this skill

| File | Use |
|---|---|
| `SPEC-TEMPLATE.md` | Copy to start every new spec |
| `REQUIREMENTS-TEMPLATE.md` | Copy to start every project's REQUIREMENTS.md |
| `terminology.md` | Industry mapping, UI Stack, red routes, pitfall list |
| `validate-flow-specs.js` | The advisory linter |
