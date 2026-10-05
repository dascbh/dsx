---
id: when-to-use-modal
title: When should you use a modal?
category: modals
components: [modal, dialog, button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["2.1.1", "2.1.2", "2.4.3", "2.4.7", "1.4.10", "4.1.2"]
related: [when-to-avoid-modal, close-modal, keyboard-focus, confirm-action]
---

# When should you use a modal?

> **Rule:** Use a modal only for a short decision or task that needs immediate attention; if a page, inline message or side panel would do, do not use a modal.

## Context

A modal overlays the current page and prevents interaction with the background. The interruption helps with important decisions, but it costs the person their context and makes navigation harder, especially on small screens, with a keyboard and with assistive technology.

Overuse increases cognitive load. Before opening a modal, check whether another pattern solves the problem with less interruption.

When used, the modal must manage focus, prevent accidental interaction with the background and close predictably.

## Decision

- **IF** the person must confirm an important or hard-to-undo action **THEN** use a short modal.
- **IF** the message is critical and requires acknowledgement **THEN** use a modal.
- **IF** the task is short (a few fields) and should not take the person off the screen **THEN** use a modal.
- **IF** the choice blocks the next step **THEN** use a modal.
- **IF** the form is long or complex **THEN** use a dedicated page.
- **IF** there are several steps **THEN** use a page flow with a progress indicator.
- **IF** it is a routine error or success message **THEN** use an inline message or toast.
- **IF** it is the main content of the page **THEN** do not use a modal.
- **IF** it would open automatically and often **THEN** do not use a modal.
- **ELSE** prefer a side panel or contextual content.

## When to use

- Confirming an important action.
- A hard-to-undo decision.
- A critical message that requires acknowledgement.
- A short task with no loss of context.
- Occasional supplementary information.
- A choice that blocks the next step.

## When to avoid

- Long or complex forms → **use instead:** dedicated page.
- Multi-step flows → **use instead:** page flow.
- Routine error or success messages → **use instead:** inline message or toast.
- Main content → **use instead:** page body.
- External link that needs no confirmation → **use instead:** direct link.
- Automatic, frequent interruptions → **use instead:** non-blocking notice.

## Do

- Use modals sparingly.
- Open them only after a clear action by the person.
- Write a specific title that explains the purpose.
- Use buttons with explicit actions ("Delete", "Keep").
- Keep the content short.
- Provide a visible close button and a clear exit.

## Avoid

- Opening without context or without a prior action.
- Using "Yes" and "No" on their own.
- Putting whole pages inside modals.
- Hiding the close button.
- Using a modal for every message.
- Blocking the person without explanation.
- Creating several nested scroll areas.

## Accessibility

- Use role="dialog" and name it with a visible title via aria-labelledby (4.1.2).
- Use aria-modal="true" only when the background is truly inert for everyone.
- On open, move focus inside; Tab stays inside the modal without trapping the person (2.1.1, 2.1.2).
- Escape closes when appropriate; on close, focus returns to the element that opened it (2.4.3).
- Visible close button and a preserved focus indicator (2.4.7).
- Allow vertical scrolling for larger content and test 400% zoom without loss of content (1.4.10).
- Test keyboard and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Title | "Discard draft?" |
| Primary action | "Discard" |
| Secondary action | "Keep editing" |
| Close | "Close" |
| Bounded choice | "Choose a delivery method" |

## Verification checklist

- [ ] No less disruptive pattern solves the case.
- [ ] The modal opens after an action by the person.
- [ ] The title explains the purpose.
- [ ] The buttons describe their actions, with no "Yes" and "No".
- [ ] The content is short and does not need a multi-step flow.
- [ ] There is a visible close button.
- [ ] Focus enters the modal and stays in it.
- [ ] Escape closes it, when appropriate.
- [ ] Focus returns to the triggering element.
- [ ] Tested with keyboard and screen reader.

## Rationale

- W3C WAI-ARIA Authoring Practices, modal dialog pattern: initial focus, Tab, Escape, focus return and aria-modal.
- U.S. Web Design System, modal: use sparingly, less disruptive alternatives, avoid complex flows and common messages.
- Brazilian Government Digital Standard, modal: deliberate interruptions, critical decisions and short tasks; concise content and clear actions.
- AMAWeb, ABNT NBR 17225 checklist and digital accessibility manual: visible focus, predictable order and keyboard operation.
