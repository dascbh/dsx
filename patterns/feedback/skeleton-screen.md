---
id: skeleton-screen
title: Does a skeleton screen improve perceived loading?
category: feedback
components: [skeleton, loading-indicator, table, card]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["4.1.3", "2.3.3", "1.4.1", "2.4.3"]
related: [skeleton-vs-spinner, long-loading, progress-percentage, empty-state]
---

# Does a skeleton screen improve perceived loading?

> **Rule:** Use a skeleton when the content's structure is predictable and the wait is noticeable; it improves perception, not actual performance.

## Context

A skeleton is a placeholder that imitates, in simplified form, the structure of the content while the data arrives. It anticipates what will appear and makes a moderate wait more tolerable, without shortening the real time.

The choice depends on context. A skeleton works best for loading a page or large areas with a known structure; a spinner fits a short action or an isolated module; a progress bar fits when progress is measurable.

An inaccurate placeholder, animated for too long or left on screen after a failure, makes frustration worse and gives a false impression of performance. The gain is perceptual and depends on execution; response time, layout stability and error recovery remain the product's responsibility.

## Decision

- **IF** there is a noticeable wait and the content's shape, hierarchy and size are predictable **THEN** use a skeleton.
- **IF** loading is usually immediate **THEN** show no intermediate state, to avoid flicker.
- **IF** the process has measurable progress (upload, export) **THEN** use a determinate indicator.
- **IF** the content can take very different shapes or the action is localized (a button, a small control) **THEN** use a spinner within the operation's scope.
- **IF** loading fails **THEN** replace the skeleton with an error with recovery.
- **IF** the result is empty **THEN** replace it with an empty state.
- **IF** a skeleton is used **THEN** reproduce the final layout and reserve the space, to avoid a visual jump.
- **ELSE** use a loading indicator suited to the scope.

## When to use

- A predictable final structure.
- A wait long enough to justify an intermediate state.
- A placeholder can reserve the content's space.
- The page stays recognizable while loading.
- A transition to the final content without a visual jump.
- The state can turn into error, empty or success.

## When to avoid

- A near-immediate response → **use instead:** no indicator.
- Content of unpredictable shape → **use instead:** a spinner.
- Measurable progress → **use instead:** a progress bar.
- A small control or momentary action → **use instead:** a local spinner.
- A placeholder that hides a failure or empty result → **use instead:** an error or empty state.
- Distracting animation → **use instead:** a static placeholder.

## Do

- Reproduce the final layout.
- Reserve the content's space.
- Show the state in the right scope.
- Use motion sparingly.
- Remove the placeholder when done.
- Measure real time and perception.

## Avoid

- Using it by default.
- Simulating progress.
- Leaving the screen blank.
- Animating endlessly.
- Hiding failures.
- Treating a skeleton as a performance optimization.

## Accessibility

- Announce that the area is loading once, without announcing each placeholder.
- Use aria-busy="true" on the region during loading and remove it when done.
- Status messages via role="status", without moving focus (4.1.3).
- Do not rely only on color, shimmer or motion to convey the state (1.4.1).
- Respect prefers-reduced-motion (2.3.3).
- Keep a stable focus order (2.4.3) and hide decorative lines from assistive reading.
- Validate with keyboard, zoom and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Single screen reader announcement | "Loading orders" |
| Failure | "We couldn't load the orders. Try again" |
| Empty | "You don't have any orders yet." |

## Verification checklist

- [ ] Loading lasts long enough to justify the skeleton.
- [ ] The placeholder has the same structure and space as the final content.
- [ ] There is no layout jump when the data arrives.
- [ ] Failure and empty states replace the skeleton.
- [ ] Uploads and exports use measurable progress.
- [ ] The animation is subtle and respects reduced motion.
- [ ] The region has aria-busy during loading.
- [ ] The screen reader hears a single notice, not one per placeholder.
- [ ] The real loading time was also optimized.

## Rationale

- Nielsen Norman Group, skeleton screens: a wireframe-like placeholder, its effect on perception, how it differs from a spinner and a progress bar, the risk of an empty frame.
- W3C WAI-ARIA, aria-busy and technique ARIA22 (role=status): communicate state without stealing focus.
- IBM Carbon, loading patterns: skeleton, indicators and progressive loading.
- GitHub Primer, loading and data table: skeleton for large areas and a single loading announcement.
- Atlassian Design System, skeleton: basic and shimmer variants, with caution about animation.
