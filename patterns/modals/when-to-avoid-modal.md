---
id: when-to-avoid-modal
title: When should you not use a modal?
category: modals
components: [modal, alert, toast, side-panel, page]
type: anti-pattern
impact: high
status: avoid
evidence: strong
wcag: ["2.1.2", "2.4.3", "2.4.7", "1.4.10", "4.1.3"]
related: [when-to-use-modal, close-modal, toast-vs-inline-alert, error-placement]
---

# When should you not use a modal?

> **Rule:** Treat the modal as a last resort: use it only for a short decision that needs immediate attention; long flows, routine messages and long texts stay on the page.

## Context

A modal interrupts the flow and blocks the page behind it. Used for long tasks or routine situations, it adds complexity and makes navigation harder.

It also creates focus, scrolling and reading problems on mobile devices and with assistive technology. Before opening a modal, check whether the content fits on the page, can become a contextual message or calls for its own screen.

Design system guidance treats the modal as an exception, especially for multi-step flows, common messages, long content and external links.

## Decision

- **IF** the flow has several steps or the form is long **THEN** use a dedicated page.
- **IF** it is a success or status message **THEN** use an alert or toast, not a modal.
- **IF** it is a field error **THEN** show it inline plus a summary, never in a modal.
- **IF** the content needs extended reading **THEN** use a page or an expandable section.
- **IF** it is supplementary information **THEN** use a side panel or an expandable section.
- **IF** it is a simple task **THEN** use inline creation or editing and keep the page interactive.
- **IF** the person is going to another address **THEN** use a direct link, with no confirmation modal.
- **IF** the decision is short and needs immediate attention **THEN** a modal is acceptable.
- **IF** the modal would open without any action from the person **THEN** do not open it.
- **ELSE** keep the content on the page.

## When to use

This pattern advises avoiding a modal for:

- Multi-step flows.
- Long forms.
- Extended reading.
- Common or routine messages.
- Situations where the page can stay interactive.
- Navigation to another address.

## When to avoid

- Success message → **use instead:** toast or alert.
- Field error → **use instead:** inline message and summary.
- Long text → **use instead:** page or expandable section.
- Complex task → **use instead:** dedicated page.
- External link blocked by a confirmation → **use instead:** a link with a note in its text.
- Unneeded automatic opening → **use instead:** content in the flow, opened by the person's action.

## Do

- Prefer a dedicated page for long tasks.
- Show errors in context.
- Use an alert for status.
- Keep the page interactive.
- Test the flow on mobile.
- Reserve modals for exceptions.

## Avoid

- Putting a whole flow inside a modal.
- Using a modal for every message.
- Hiding important content in a modal.
- Interrupting without any action from the person.
- Requiring confirmation to open links.
- Using internal scrolling as the default solution.

## Accessibility

- If the modal stays, follow the dialog pattern: focus trapped in the window, predictable keyboard, clear closing and focus returned to the trigger (2.4.3, 2.1.2).
- Use `aria-modal="true"` only when the background is truly inert for everyone; otherwise the semantics can hide needed content.
- Visible focus (2.4.7) and reflow on small screens and with zoom (1.4.10).
- Status messages on the page use a status region and do not steal focus (4.1.3).
- Test the alternative with keyboard, zoom, screen reader and different screens.

## Microcopy

| Situation | Example |
|---|---|
| Success without a modal | "Customer added." |
| Error without a modal | "Enter a valid email address." |
| External link | "View terms (opens in a new tab)" |
| Short decision that justifies a modal | "Discard your changes?" |

## Verification checklist

- [ ] The task can be completed on the page.
- [ ] The flow does not have several steps inside the modal.
- [ ] The content is short.
- [ ] The message is truly critical.
- [ ] The person started the action that opens the modal.
- [ ] A less disruptive alternative exists and was considered.
- [ ] The page remains usable on mobile.
- [ ] External links do not go through a confirmation modal.
- [ ] The alternative was tested with screen reader and keyboard.

## Rationale

- USWDS (Modal): consider another solution first; avoid for complex flows, common messages, long content and external links.
- W3C WAI-ARIA APG (Dialog Modal): inert background, focus, keyboard and return to trigger.
- GOV.BR Digital Standard (Modal): deliberate interruption, concise content, clear actions.
- IBM Carbon (creation flows; notifications): inline creation and toasts as non-blocking alternatives.
- GOV.UK Design System (Error summary): validation in the flow, without a modal.
- AMAWeb and ABNT NBR 17225: visible focus, predictable order and no keyboard trap.
