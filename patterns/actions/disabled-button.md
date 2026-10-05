---
id: disabled-button
title: Hide or disable an unavailable action?
category: actions
components: [button, disabled-button, tooltip]
type: contextual-decision
impact: high
status: caution
evidence: moderate
wcag: ["4.1.2", "2.1.1", "1.4.1", "1.4.3", "2.4.7"]
related: [button-hierarchy, double-submit, helpful-error-message, required-fields]
---

# Hide or disable an unavailable action?

> **Rule:** Hide the irrelevant action; keep the central action that is temporarily blocked visible and explained; never disable without saying why.

## Context

An action becomes unavailable when a prerequisite is missing, when it does not fit the context, when the person lacks permission or when the system fails. You have to choose between removing the control from the screen and leaving it blocked.

Hiding and disabling send different messages. Hiding reduces noise; disabling keeps the action visible and in place but prevents use. A button that looks active but does not respond leaves doubt; a hidden button may suggest the feature does not even exist.

The native disabled attribute usually removes the control from the tab order, which reduces discovery by keyboard and screen reader. So the choice affects clarity, error prevention and accessibility.

## Decision

- **IF** the action is irrelevant to the context and its absence does not disorient **THEN** hide it.
- **IF** the action is permanently unavailable to the person and there is no request or upgrade path **THEN** hide it.
- **IF** the action is central to the flow and a clear, temporary condition is missing **THEN** keep it visible, disabled and with the requirement in persistent text next to it.
- **IF** the person needs to find out the reason when focusing or activating the control **THEN** use a focusable inactive state that responds with the explanation; do not set aria-disabled="true" if it can still be activated.
- **IF** the control cannot be activated but must stay discoverable by keyboard **THEN** use aria-disabled="true" and block the operation in code.
- **IF** availability is still loading **THEN** show a loading state; do not hide or disable without context.
- **IF** the block comes from a failure, permission or platform limitation **THEN** offer a persistent explanation, an alternative or a recovery path.
- **IF** the content must be viewable but not editable **THEN** use read-only, not disabled.
- **IF** validating on click and explaining what is missing is feasible **THEN** prefer it to disabling.
- **IF** the button prevents a second submission during processing **THEN** disable it and communicate the loading.

## When to use

- Hide: an action that makes no sense in the context or that the person can never access.
- Disable: a clear, temporary prerequisite, a position that helps people understand the flow, a central action of the task.
- Focusable inactive: the explanation depends on focus or activation.

## When to avoid

- Hiding a central action just because it is temporarily unavailable → **use instead:** keep it visible with an explanation.
- Disabling without explaining → **use instead:** persistent requirement text nearby.
- A tooltip as the only explanation of a native disabled control → **use instead:** visible text or a focusable inactive state.
- Only pointer-events: none → **use instead:** a real block in code.
- aria-hidden="true" on a focusable action → **use instead:** remove it from the DOM or from focus.

## Do

- Classify the cause: irrelevant, prerequisite, loading, permission or failure.
- Show the requirement near the control.
- Keep the label and position of the main action.
- Re-enable the control as soon as the condition is met.
- Announce the re-enabling when it matters.
- Test keyboard, screen reader, zoom and high contrast.

## Avoid

- Hiding the main action without saying how to finish the task.
- Leaving the control disabled after the condition is met.
- Using only gray, opacity or low contrast as the cue.
- Applying aria-disabled="true" while the operation is still executable.
- Keeping a control permanently disabled when it has no reason to exist.
- Removing an important action during a temporary failure.

## Accessibility

- The disabled attribute removes the control from tabbing and operation; use it when the person does not need to discover the action in that state (4.1.2).
- To keep it discoverable, use aria-disabled="true" with focus allowed, a block in code and an accessible explanation.
- Do not use aria-hidden="true" on a focusable element.
- Do not rely on color, opacity or low contrast to indicate the state (1.4.1, 1.4.3).
- Keep the accessible name, visible focus (2.4.7) and the reason near the control, reachable by keyboard (2.1.1).
- Test focus order, zoom, high contrast and re-enabling.

## Microcopy

| Situation | Example |
|---|---|
| Prerequisite | "Enter your tax ID to continue." |
| Permission | "Only administrators can invite people." |
| Desktop only | "Available only in the desktop version." |
| Loading | "Checking availability..." |
| Temporary maintenance | "Create new will be available from Nov 12." |

## Verification checklist

- [ ] The cause of unavailability is classified.
- [ ] An irrelevant action, or one with no access path, was removed, not disabled.
- [ ] Every disabled control has its reason in visible, persistent text.
- [ ] The reason does not depend on a tooltip alone.
- [ ] The state does not depend on color or opacity alone.
- [ ] With aria-disabled, the operation is blocked in code.
- [ ] No focusable element uses aria-hidden.
- [ ] The control returns to the active state when the condition changes.
- [ ] Keyboard and screen reader users can find the reason.

## Rationale

- W3C WAI-ARIA Authoring Practices: keyboard interface and handling of disabled controls.
- MDN, aria-disabled and aria-hidden: aria-disabled communicates the state without blocking behavior; aria-hidden must not be used on focusable elements.
- GitHub Primer, degraded experiences, creation and buttons: remove non-essential actions, hide creation without permission, distinguish an inactive button from a disabled one.
- Microsoft Fluent 2, button: explain what is unavailable and why.
- IBM Carbon, read-only states: distinguish temporary disabled from read-only.
- Material Design 3, states: disabled indicates an inoperable component.
- Nielsen Norman Group, disabled buttons: the risk of not responding without explaining.
- WCAG 2.2, criteria 4.1.2, 1.4.1 and 2.1.1.
