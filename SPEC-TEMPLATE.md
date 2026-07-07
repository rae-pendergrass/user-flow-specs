# Flow Spec NN: [Title — the user's goal, not a screen name]

**Goal:** [Actor] wants to [outcome]. [Optional second sentence: the trigger or context.]
**Covers:** R#, R#

<!-- Optional metadata lines — use these exact forms, never ad-hoc prose:
**Supersedes:** Flow Spec NN ([scope of supersession])
**Superseded by:** Flow Spec NN ([scope])
-->

---

## Entry Points

- **From [screen or context]:** [what the user did or what triggered the need]

<!-- Every entry point names WHERE FROM + WHAT TRIGGERED. Use singular "## Entry Point" when there is only one. -->

---

## The Flow

### Step 1: [Phase name]

**What they want:** [The user's micro-goal at this step — motivation precedes perception. One short sentence.]

**What they see:** [The screen, described at behavior/content level — the Altitude Rule applies: no colors, sizes, or visual styling. Content intent or strings marked (draft copy).]

**What they do:** [The user's action.]

**What happens:** [The system's response.]

<!-- Branching rules:
- Letter suffixes (### Step 5a / ### Step 5b) ONLY for mutually exclusive branches of the same step. Each lettered heading names its condition: "Step 5a: Auto-advance ON".
- A variant flow (a genuinely different mode of the whole flow) gets its own H2 section with step numbering restarted.
-->

---

## Edge Cases

| Scenario | What the user sees |
|---|---|
| [Condition] | [Behavioral result] |

<!-- UI Stack check — for each key screen in this flow, consider: empty/blank · loading · partial · error. (The ideal state lives in The Flow.) States that genuinely don't apply are fine; states never considered aren't. -->

---

## New User vs. Returning User

<!-- Include this section when the two experiences differ. Omit it entirely when they are identical. -->

---

## UX Notes

- [Design intent, tone, accessibility — the "why" behind the flow]

---

## Prototype Scope

- [One concrete frame or state to build in Figma, per bullet]

<!-- Required. Each bullet is self-contained and actionable. If this spec genuinely needs no prototype work, write exactly: "- None — <reason>". Deferred/optional items go to TO-DO.md, not here. -->

## Verified

<!-- Optional section — feasibility findings ONLY, in this exact form, one per line:
- **Verified YYYY-MM-DD:** [claim checked, confirmed or refuted, one sentence + its consequence for this flow]
-->
