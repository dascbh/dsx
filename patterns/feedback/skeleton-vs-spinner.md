---
id: skeleton-vs-spinner
title: "Skeleton or spinner: when should you use each?"
category: feedback
components: [skeleton, spinner, progress-bar, loading]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["4.1.3", "2.2.2", "2.3.3", "1.4.1"]
related: [skeleton-screen, progress-percentage, long-loading, double-submit]
---

# Skeleton or spinner: when should you use each?

> **Rule:** A skeleton for the initial load of content with a known shape; an inline spinner for short actions; a progress bar only when there is a real measure.

## Context

Without feedback, a blank screen looks like a defect and an action looks like it had no effect. Skeletons, spinners, page loading, progress bars and progressive loading serve different cases. To choose, find out what is loading, how long it will probably take, whether the structure is predictable and whether the person can still interact.

The wrong pattern also does harm: a full-page spinner hides the structure, a skeleton on a control does not explain an action and an invented percentage creates false expectations. Waits without feedback cause anxiety and repeated clicks.

There is no universal time limit. The classic 0.1, 1 and 10 second milestones are a historical response-time heuristic, not a criterion for choosing the indicator.

## Decision

- **IF** it is the initial load of a list, card, table or area with a known shape **THEN** use a skeleton that reproduces the approximate structure.
- **IF** it is a short asynchronous action (save, refresh, search, submit) **THEN** use a spinner or inline loading next to the target and prevent repeated activation.
- **IF** the page or a critical area is really blocked **THEN** use page loading or an overlay on that area only.
- **IF** the task is long and there are real steps or a real percentage **THEN** use determinate progress.
- **IF** there is a wait but its duration is unknown **THEN** use indeterminate progress.
- **IF** the page is slow or uses several sources **THEN** load progressively: structure first, data next, without wiping what already exists.
- **IF** the wait is long **THEN** report the state and offer cancel, try again or leave.
- **ELSE** a labeled inline spinner.

## When to use

- Skeleton: initial load with a predictable layout.
- Inline spinner: a localized action.
- Determinate progress: upload, download, import with a real measure.
- Progressive: dashboards and filters with several sources.

## When to avoid

- A skeleton on buttons, fields, menus, modals or toasts → **use instead:** an inline spinner or a labeled disabled state.
- A page spinner for a small area → **use instead:** a local indicator.
- A percentage without measurement → **use instead:** indeterminate.
- Several competing loaders → **use instead:** one indicator per scope.
- A spinner with no error or way out → **use instead:** a timeout with try again.

## Do

- Preserve the layout to avoid jumps.
- Place the indicator close to the target.
- Report completion, failure and timeout.
- Respect reduced motion.
- Test real duration and recovery.

## Avoid

- Blocking the whole interface unnecessarily.
- Simulating a percentage.
- Relying only on animation or color.
- Removing the focused control from the DOM.

## Accessibility

- Communicate the state through text and semantics, not only motion (1.4.1).
- Use `role="status"` or an aria-live region, without moving focus (4.1.3).
- Use `aria-busy="true"` on the updating region and remove it when done.
- Determinate progress: `role="progressbar"` with a name and minimum, current and maximum values.
- A spinner with an accessible label ("Saving").
- Respect `prefers-reduced-motion` (2.3.3) and give control over long animations (2.2.2).

## Microcopy

| Situation | Example |
|---|---|
| Action spinner | "Saving…" |
| List load | "Loading results…" |
| Long wait | "This is taking longer than usual." |
| Timeout | "We couldn't load it. Try again" |
| Done | "Results updated." |

## Verification checklist

- [ ] It is clear what is loading.
- [ ] The chosen pattern matches the scope.
- [ ] The skeleton reflects the final structure.
- [ ] The spinner sits next to the target.
- [ ] The page is blocked only when necessary.
- [ ] Percentages reflect real progress.
- [ ] Long waits offer status and a way out.
- [ ] Duplicate clicks are prevented without losing focus.
- [ ] There is an announcement through a status region.
- [ ] It was tested with keyboard, zoom and reduced motion.

## Rationale

- IBM Carbon (Loading pattern, Inline loading, Progress bar): the difference between skeleton, loading and progress; a warning against competing loaders.
- Shopify Polaris (Spinner): an accessible label and no full-page spinner.
- Brazilian Government Digital Standard GOV.BR (Loading): determinate and indeterminate indicators with ARIA.
- W3C WAI (status messages) and WCAG 4.1.3: state announced without moving focus.
- Baymard Institute: anxiety and repeated clicks during waits without feedback.
- Nielsen Norman Group (response times, progress indicators): expectations and feedback, with the caveat that the limits are historical.
- GitHub Primer (Degraded experiences): report loading, error and timeout.
