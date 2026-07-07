# Requirements — [Project Name]

> Single source of truth for what this app must do. Every flow spec traces back to a numbered requirement via its `**Covers:**` line. Changes to this file are dated edits — see the Change Log at the bottom.

## Problem Statement

[What problem does this app solve? One short paragraph. Goal-first: describe the user's need, not the solution.]

## The User

- **Who:** [Who uses this — their role, context, and how often]
- **Context:** [Where/when/how the app gets used — device, situation, frequency]
- **Standing accessibility requirements (always apply):**
  - WCAG AA compliance, especially text contrast and size
  - Light mode + dark mode
  - Font switcher: system default + at least one dyslexia-friendly option (e.g. OpenDyslexic, Comic Neue)
  - Scannable UI: structured layouts, short text, clear hierarchy

## Emotional Core

[One line naming the app's personality — the feeling every screen should serve. Example: "trusting the system without holding it all in your head." This line steers tone in every flow spec.]

## Functional Requirements

<!-- Numbered R1, R2, … — never renumber existing entries; retired requirements are struck through with a dated note, keeping their number. One requirement per line, affirmative, testable. -->

- **R1:** [The app lets the user …]
- **R2:** [The app …]

## Constraints

- **Design system:** [which DS, if any]
- **Platform:** [PWA / web / desktop …]
- **Technical:** [local-first, no backend, etc.]

## Out of Scope

<!-- Explicit non-goals, so "we never decided that" can't happen. -->

- [Thing this app deliberately does not do]

## Change Log

- **YYYY-MM-DD:** Initial version.
