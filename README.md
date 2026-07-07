# User Flow Specs

User Flow Specs is a Claude Code skill for building better UX designs with Claude through spec-driven design. You describe what your app needs to do, and Claude drafts Flow Spec documents that walk through how a user completes each task, step by step. You review and rewrite those together until you agree on the experience you want, then Claude builds Figma prototypes from the specs. After that, you compare the prototype back to the spec to see where they diverged and why.

NOTE: This is not a set-and-forget AI design skill. Human design expertise is a critical step at several points in the process. 

Each step in a flow answers four questions:

1. **What they want** — the user's micro-goal (motivation precedes perception)
2. **What they see** — the screen, at behavior/content level
3. **What they do** — the user's action
4. **What happens** — the system's response

## How this differs from spec-driven code generation

Spec-driven development (SDD) has mostly been about code: write a spec → AI writes code → verify the code matches. User Flow Specs applies that loop to design (spec → prototype → audit), with a few adjustment:

**Divergence between spec and prototype is part of the process.** Most SDD treats any gap between spec and output as a defect. In design, the prototype sometimes *improves* on the spec (ex: a layout choice the spec couldn't anticipate, a simpler interaction that only becomes obvious in context). The post-prototype audit classifies every mismatch as Deliberate (keep the prototype's version), Drift (unintentional — fix it), or Not Prototyped (gap — build it or defer it). The spec is a living contract, not a straitjacket.

**Motivation before perception.** Code specs describe inputs and outputs. Design specs need to start earlier with *why the user is here*. The "What they want" line forces you to articulate intent before describing the screen, which grounds AI-generated prototypes in user goals rather than interface patterns. 

**The Altitude Rule: specs describe behavior, prototypes decide how it looks.** Code specs and their output live at the same level of abstraction. Design specs don't. Behavioral intent and visual design are different concerns that belong to different phases. Specs own behavior, sequence, structure, and content intent. Prototypes own all visual design, like color, size, layout aesthetics, final copy, and the spec linter checks to ensure this is followed. This separation prevents premature visual lock-in ("a big pink button" written into an early spec forecloses the mindful choice that should happen at prototype time with full context).

**Spec ordering is a design tool.** Claude reads all existing specs before writing the next one, which means earlier specs act as context that shapes later ones (the same way chain-of-thought prompting works, where earlier reasoning shapes later output). The first flow you spec defines the core screens and interaction patterns; every flow after that inherits and builds on those decisions. So the order you write specs in isn't just project management, it's a design choice.

## Prerequisites

- [Claude Code](https://code.claude.com)
- Node.js (for the linter)

## Installation

```bash
git clone https://github.com/rae-pendergrass/user-flow-specs.git ~/.claude/skills/user-flow-specs
```

Or for a single project:

```bash
git clone https://github.com/rae-pendergrass/user-flow-specs.git .claude/skills/user-flow-specs
```

Once installed, Claude loads the skill automatically when relevant (e.g. when you ask to write flow specs or work in a `flow-specs/` directory), or you can invoke it directly with `/user-flow-specs`.

## What's in the box

| File | What it does |
|---|---|
| [SKILL.md](SKILL.md) | The skill itself — Claude's instructions for the full lifecycle |
| [SPEC-TEMPLATE.md](SPEC-TEMPLATE.md) | Copy this to start every new flow spec |
| [REQUIREMENTS-TEMPLATE.md](REQUIREMENTS-TEMPLATE.md) | Copy this to define your project's requirements (specs trace back to these) |
| [terminology.md](terminology.md) | Industry grounding — what this is, what it isn't, and the concepts it builds on |
| [validate-flow-specs.js](validate-flow-specs.js) | A linter that catches structural issues, design smells, and coverage gaps |

## Getting started

1. [Install the skill](#installation) into your Claude Code skills directory.
2. Copy `REQUIREMENTS-TEMPLATE.md` to your project root as `REQUIREMENTS.md`. Fill it in.
3. Create a `flow-specs/` directory with a `README.md` containing a Flow Spec Index table:
   ```markdown
   | # | Flow Spec | File | Status |
   |---|---|---|---|
   ```
4. Tell Claude to write the first flow spec, or invoke `/user-flow-specs` directly. Claude will identify your red routes, propose an ordering, and start drafting.
5. Review each spec with Claude — the human review loop is where the real design thinking happens. Expect substantive rewrites, not proofreading.

## The lifecycle

```
Requirements → Select & order flows → Draft → Human review → Feasibility check → Prototype → Audit
```

1. **Requirements** — Define the problem, the user, and numbered functional requirements (R1, R2, ...) using the requirements template.
2. **Select & order** — Derive candidate flows from requirements. Prioritize by red routes: *frequency of use × consequence of failure*. Order matters — later specs build on earlier ones.
3. **Draft** — One spec at a time, in order. Each spec traces to requirements via its `**Covers:** R#` line. Update the screen inventory (SCREENS.md) in the same pass.
4. **Human review** — Walk through each spec with stakeholders. Expect substantive rewrites, not proofreading.
5. **Feasibility** (optional) — Investigate technical questions. Findings go in the spec's `## Verified` section.
6. **Prototype** — Build from the spec's Prototype Scope section. Pairs with the `figma-prototype` skill. Visual design and final copy are decided here. Specs are not edited during prototyping — divergence is deliberate input for the audit.
7. **Audit** — Walk each spec against the prototype. Classify every mismatch as Deliberate (prototype improved on spec), Drift (unintentional), or Not Prototyped (gap).

See [SKILL.md](SKILL.md) for the full phase-by-phase instructions Claude follows.

## More key concepts

### The UI Stack (Scott Hurff)

Every key screen gets five states considered:

1. **Ideal** — full value (this is The Flow itself)
2. **Blank/Empty** — first use, no data yet
3. **Loading** — fetching or processing
4. **Partial** — some data, not the full experience
5. **Error** — something failed

The Edge Cases table in each spec holds states 2-5. States that genuinely don't apply are fine to skip — the *consideration* is what's required.

### Red routes

The critical paths that deliver most of a product's value. Spec these first. For small teams or solo projects, score by *frequency of use × consequence of failure* — and if your user base is small enough to interview directly, do that rather than estimating.

Priority order: core loop(s) → first launch/onboarding → secondary paths → destructive/recovery paths.

## The linter

```bash
node validate-flow-specs.js path/to/flow-specs/
```

The linter catches real design smells — happy-path-only thinking (no error/empty/loading states considered), solution-first framing (Goal line describes the UI instead of a user need), premature visual design in specs (the Altitude Rule), scope creep (too many steps in one flow). It also checks structural integrity: cross-references between specs, the screen inventory, the requirements doc, and the Flow Spec Index.

Findings are classified as:
- **Issues** (exit code 1) — structural problems to fix
- **Warnings** — design smells to consider (not commands)
- **Info** — context, never action-forcing

If your project uses domain-specific terms for users (e.g. "member", "patient", "contributor"), add them to the actor regex in `validate-flow-specs.js` so the linter recognizes them.

## Methodology roots

| Ancestor | What we take from it |
|---|---|
| **User flow** (NN/g) | Scope: one task, one product, step by step |
| **Use case, fully dressed** (Cockburn) | Structure: actor, trigger, numbered steps, extensions |
| **Wireflow** (NN/g) | Per-step screen detail |
| **Spec-driven development** | Lifecycle: write spec → generate → verify against spec |

See [terminology.md](terminology.md) for the full mapping with sources.

## Background

This methodology was developed through real-world use on multiple projects, refined through iterative AI-collaborative design practice. It was built for and tested in solo-user contexts, but the structure scales to any team size — the core insight (motivation before perception, spec before prototype, audit after prototype) is universal.

## Contributing

Found a bug or have a suggestion? [Open an issue](https://github.com/rae-pendergrass/user-flow-specs/issues).

## License

MIT
