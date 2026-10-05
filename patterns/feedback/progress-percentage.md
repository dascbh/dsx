---
id: progress-percentage
title: When should you show a progress percentage?
category: feedback
components: [progress-bar, loading-indicator]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["4.1.3", "4.1.2", "1.4.1", "1.4.11", "2.2.2"]
related: [skeleton-vs-spinner, long-loading, file-upload, retry]
---

# When should you show a progress percentage?

> **Rule:** Show a percentage only when the total and the progress are really measured; without a reliable measure, use a labeled indeterminate indicator.

## Context

A percentage promises that there is a total and that the number shows the way to completion. Without a known total, it creates false precision and, if it changes inexplicably or stalls, it destroys trust and makes the wait feel longer.

Before showing the number, check four points: progress is measurable, the measure is stable, the task has a defined start and end, and the person needs to follow it. If any is missing, report only the state of the operation.

When progress happens across phases the person controls, use steps; do not convert phases of unequal duration into a misleading percentage.

## Decision

- **IF** the system knows the total size (files, items, bytes, quantifiable steps) **THEN** use a determinate bar with a real value from 0 to 100%.
- **IF** an absolute measure is more useful **THEN** show "42 of 100 items" instead of or alongside the percentage.
- **IF** the total or the progress are unknown **THEN** use a labeled indeterminate indicator; do not invent a percentage, time remaining or step.
- **IF** the total only becomes known during processing **THEN** start indeterminate and switch to determinate when there is a reliable measure.
- **IF** the percentage is derived only from elapsed time or a baseless estimate **THEN** do not show it.
- **IF** the operation is so fast the indicator becomes mere noise **THEN** skip the indicator.
- **IF** the task is long **THEN** name the task, report the result when it finishes and offer cancel, try again or resume when safe.
- **IF** the total changes **THEN** explain the change; progress cannot decrease or restart without warning.
- **ELSE** an indeterminate indicator.

## When to use

- A known total of files, items or bytes.
- Progress calculated from real data.
- A task with a defined start, end and completion.
- Long processing with meaningful progress.

## When to avoid

- Unknown total or progress → **use instead:** an indeterminate indicator.
- A percentage based on elapsed time → **use instead:** a "Processing" state.
- Phases of very unequal duration → **use instead:** a step indicator.
- An instant operation → **use instead:** no indicator.

## Do

- Confirm the total before showing the number.
- Keep the value stable and round it.
- Use a label that names the task.
- Communicate completion and failure.
- Offer a safe way out.

## Avoid

- Inventing a percentage or promising an uncertain deadline.
- Restarting the bar without explanation.
- Decimal places without real measurement.
- Several competing indicators.
- Communicating the state only by color or motion.

## Accessibility

- A visible label and accessible name for the task (4.1.2).
- Determinate: `role="progressbar"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` consistent with the value shown.
- Indeterminate: omit `aria-valuenow`; do not provide a fictitious number.
- Update via `role="status"` or `aria-live="polite"`, without moving focus (4.1.3); use `aria-busy="true"` on the affected region.
- Indicator contrast (1.4.11) and no reliance on color alone (1.4.1).

## Microcopy

| Situation | Example |
|---|---|
| Determinate | "Uploading files: 4 of 12" |
| Percentage | "Import at 42%" |
| Indeterminate | "Processing…" |
| Done | "Import complete: 120 contacts added." |
| Failure | "The import failed. Try again" |

## Verification checklist

- [ ] The total is known.
- [ ] The value comes from real data.
- [ ] The value does not decrease or restart without explanation.
- [ ] The label identifies the task.
- [ ] "4 of 12" was considered as a clearer alternative.
- [ ] Without a reliable measure, the state is indeterminate.
- [ ] The final result is communicated.
- [ ] There is a safe way out or recovery.
- [ ] Progress is announced without moving focus.
- [ ] It was tested with keyboard, zoom and screen reader.

## Rationale

- IBM Carbon (Progress bar): determinate and indeterminate states, labels and values.
- Brazilian Government Digital Standard GOV.BR (Loading): determinate loading with cancel, and indeterminate without promising a duration.
- GitHub Primer (ProgressBar): textual context such as "4 of 12 tasks".
- W3C ARIA Authoring Practices: aria-valuenow omitted when the value is unknown.
- WCAG 2.2, 4.1.3: progress and status without receiving focus.
- Baymard Institute (checkout flow): a step indicator should mirror the real process.
- Nielsen Norman Group (progress indicators): visibility makes long waits understandable.
