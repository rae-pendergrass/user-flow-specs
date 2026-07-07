# Terminology — what a User Flow Spec is, in industry language

> The accurate jargon for talking to other designers and reading UX literature, plus the research grounding behind the methodology's rules.

## The one-sentence version

"I write my user flows as structured narrative specs — what the user sees, what they do, and what happens, at every step — and the prototype is built from and audited against them."

## What a User Flow Spec is

A hybrid with respectable ancestry on every side:

| Ancestor | What we take from it | Source |
|---|---|---|
| **User flow** (NN/g) | The scope: one task, one product, step by step, entry to end state | [NN/g: User Journeys vs. User Flows](https://www.nngroup.com/articles/user-journeys-vs-user-flows/) |
| **Use case, fully dressed** (Cockburn) | The structure: actor, trigger, main success scenario as numbered steps, extensions (= our Edge Cases) | Cockburn, *Writing Effective Use Cases* |
| **Wireflow** (NN/g) | The per-step screen detail: what the interface shows at each step, not just what the user does | [NN/g: Wireflows](https://www.nngroup.com/articles/wireflows/) |
| **Spec-driven development** | The lifecycle: a durable written spec drives AI generation, then output is verified against the spec | Emerging AI-collaboration practice (e.g. GitHub Spec Kit) |

The prose form (instead of diagrams) is a deliberate choice for AI-collaborative design: prose is an LLM's native medium, and it carries what boxes-and-arrows cannot — tone, content intent, rationale, emotional context.

## What it is NOT

| Term | What it actually means | Why ours isn't that |
|---|---|---|
| **Journey map** | Holistic visualization of a persona's experience across channels and time, with emotions, pain points, opportunities ([NN/g: Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/)) | Ours is task-scoped, in-product, screen-level |
| **User story** (agile) | Backlog unit: "As a [role], I want [goal], so that [benefit]" + acceptance criteria ([Atlassian](https://www.atlassian.com/agile/project-management/user-stories)) | Ours is a design narrative, not a sprint-planning ticket |
| **Task flow** | Diagram of the single most efficient path, usually no branching | Ours is prose, with branches and edge cases |
| **Storyboard** | Illustrated frames emphasizing context and emotion | Ours is written, behavior-level |

## The UI Stack — the five states (Scott Hurff)

Every key screen gets all five considered; the Edge Cases table holds the non-ideal four.

1. **Ideal** — full value, content-rich (this is The Flow itself)
2. **Blank/Empty** — first use, no data yet, cleared data, no results
3. **Loading** — fetching/processing (skeletons beat spinners)
4. **Partial** — some data, not the full experience; guide toward ideal
5. **Error** — something failed: preserve input, explain plainly, offer recovery

Source: [Scott Hurff: the UI Stack](https://www.scotthurff.com/posts/why-your-user-interface-is-awkward-youre-ignoring-the-ui-stack/). States that genuinely don't apply (e.g. loading in a local-first app) are fine to skip — the *consideration* is what's required.

## Red routes — which flows to spec first

Red routes are the critical paths delivering most of a product's value; spec these first. Classic scoring is *number of users × frequency of task*. For small teams or solo projects, *frequency of use × consequence of failure* works better — and if your user base is small enough to interview directly, do that rather than estimating.

Order: core loop(s) → first launch/onboarding → secondary paths → destructive/recovery paths.

## Pitfalls the linter and rules guard against (NN/g + practice)

| Pitfall | Smell | Our guard |
|---|---|---|
| Feature list in disguise | No single user goal driving the doc | Selection rule + `Covers:` traceability |
| Happy-path-only thinking | Edge Cases empty or ideal-only | UI-Stack check, lint W-rules |
| No clear actor or trigger | Goal describes the UI, not a want | Goal-line format + lint heuristic |
| Solution-first framing | "The app shows…" before "the user needs…" | Goal-first rule |
| Scope too broad | Step count balloons; multiple goals | One-scenario rule, >9-step lint warning |
| Multiple scenarios per doc | Confusing narrative | One-scenario rule (split) |
| Premature visual design | "big pink button" in a spec | Altitude Rule + design-language lint |
| First-use vs returning conflated | One description for two different experiences | New vs. Returning section convention |
| Maps as endpoints, never used | Spec ignored after writing | The audit phase — specs are verified against the prototype |
