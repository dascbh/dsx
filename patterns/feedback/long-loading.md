---
id: long-loading
title: How do you handle loads that take a long time?
category: feedback
components: [loading-indicator, progress-bar, skeleton]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["4.1.3", "2.2.2", "2.3.3"]
related: [skeleton-vs-spinner, progress-percentage, skeleton-screen, double-submit]
---

# How do you handle loads that take a long time?

> **Rule:** Choose the indicator by duration and type of wait: nothing under 1 s, indeterminate from 1 to 3 s, real progress above 3 s and, above 10 s, preserve the task and offer to continue, cancel or follow up later.

## Context

When the response is slow, people need to know whether the system is working, how far it has gone and what they can do while waiting. Without feedback, the wait looks like a failure and leads to repeated clicks, abandonment and loss of trust.

The indicator does not speed up the process, but it reduces uncertainty and helps people decide whether to wait or try something else. The choice depends on the expected duration, on whether progress is measurable and on the scope affected.

The ranges below are design heuristics cross-checked across several sources, not universal limits.

## Decision

- **IF** the operation takes less than 1 s **THEN** show no indicator, to avoid a flash.
- **IF** it takes 1 to 3 s **THEN** show a localized indeterminate loading indicator, if the wait is noticeable.
- **IF** it takes more than 3 s and there is a reliable estimate **THEN** use determinate progress; **ELSE** keep an indeterminate state with textual context.
- **IF** it exceeds 10 s **THEN** do not leave an endless spinner: report the state, save the task and allow continuing, cancelling or following up later.
- **IF** the content's structure is known and appears in parts **THEN** use a skeleton; **ELSE** do not.
- **IF** the loading affects a small area **THEN** limit the indicator to it; do not use a full-page overlay.
- **IF** the state changes **THEN** replace the indicator with success, error or cancellation.
- **IF** it is a submission **THEN** block duplicate clicks without clearing data.
- **ELSE** keep only one indicator per context.

## When to use

- Slow searches, filters and data loads.
- Long submissions, imports, exports and calculations.
- Operations of variable duration (network, volume, external service).
- Processes that can continue in the background.

## When to avoid

- An operation so fast the indicator flickers → **use instead:** no indicator.
- A spinner with no context or way out → **use instead:** status text + an option to continue or cancel.
- A percentage without real progress → **use instead:** indeterminate.
- Several simultaneous loaders → **use instead:** one per context.

## Do

- Say what is loading.
- Show progress only when it is measurable.
- Preserve context and data.
- Offer cancel or recovery when safe.
- Always end in success, error or cancellation.

## Avoid

- A spinner with no explanation.
- Blocking the whole screen unnecessarily.
- Imprecise time promises.
- Processing duplicate clicks.

## Accessibility

- Understandable associated text, such as "Loading results".
- `role="status"` or `aria-live="polite"` for messages, without moving focus (WCAG 4.1.3); `aria-busy="true"` on the affected region.
- Use progress bar semantics only with a real current value; do not invent `aria-valuenow` for indeterminate states.
- Do not rely on color, motion or sound; respect reduced motion (WCAG 2.3.3).
- Report completion, failure and cancellation programmatically.

## Microcopy

| Situation | Example |
|---|---|
| Indeterminate | "Loading results…" |
| Determinate | "Importing… 75%" |
| Long | "This may take a few minutes. You can keep using the system and we'll let you know when it's done." |
| Cancel | "Cancel import" |
| Failure | "The import didn't finish. Try again" |

## Verification checklist

- [ ] Does the state say what is loading?
- [ ] Is the indicator in the right scope?
- [ ] Do waits under 1 s show no indicator?
- [ ] Does the percentage reflect real progress?
- [ ] Does the skeleton mirror the expected structure?
- [ ] Above 10 s, is there an option to continue, cancel or follow up?
- [ ] Does loading end in success, error or cancellation?
- [ ] Are duplicate submissions prevented?
- [ ] Is the status announced without moving focus?

## Rationale

- Nielsen Norman Group: progress indicators reduce uncertainty and increase tolerance for waiting.
- Baymard Institute: impatience and repeated clicks in slow e-commerce steps.
- GitHub Primer (Loading): short waits, indeterminate, determinate and long tasks.
- IBM Carbon (Loading): skeleton for progressive content, scope, avoiding multiple loaders.
- WCAG 2.2, 4.1.3 (Status Messages).
- Brazilian Government Digital Standard GOV.BR (Loading): determinate with cancel, and indeterminate.
