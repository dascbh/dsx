---
id: toast-vs-inline-alert
title: "Toast, alert or inline message: which should you use?"
category: feedback
components: [toast, alert, inline-message, banner]
type: contextual-decision
impact: medium
status: caution
evidence: strong
wcag: ["4.1.3", "3.3.1", "1.4.1", "1.4.3", "2.1.1"]
related: [toast-duration, form-errors, success-confirmation, temporary-failure]
---

# Toast, alert or inline message: which should you use?

> **Rule:** Choose the pattern by the message's scope: a toast for a brief confirmation, inline for something tied to an element, a persistent alert for a page or service condition.

## Context

Feedback should appear in the right place at the right time. Toasts, alerts and inline messages are not visual versions of the same thing: each has its own scope, duration and level of interaction.

A toast that disappears can hide an error that requires correction. An inline message far from the field gets in the way of understanding. A persistent alert for every event interrupts too much and wears out attention.

The right choice shows what happened, which part of the interface was affected and what the next step is.

## Decision

- **IF** it is a success, brief information or a low-impact action **THEN** use a toast.
- **IF** the feedback belongs to a field, item, form or section **THEN** use an inline message next to the element, until the problem is resolved or dismissed.
- **IF** the condition affects the page, the service or a large part of the experience **THEN** use a persistent alert, with one clear action if there is one.
- **IF** it is an error that requires correction **THEN** never use a toast; use inline or an alert.
- **IF** the information is critical **THEN** do not leave it only in a temporary message.
- **IF** the message has an action **THEN** keep it available until the action is taken.
- **IF** the situation requires blocking or an immediate decision **THEN** use a modal.
- **IF** there are several messages **THEN** prioritize them and do not stack them without order.
- **ELSE** prefer inline, close to what changed.

## When to use

- Toast: success, brief information, low-impact actions.
- Inline: errors, validations and guidance tied to an element.
- Persistent alert: page or service conditions.
- Modal: only when the situation requires blocking.
- A way to look up later any message that disappears.

## When to avoid

- A toast for errors that require correction → **use instead:** an inline message.
- Critical information in a temporary message → **use instead:** a persistent alert.
- Inline for a problem that affects the whole page → **use instead:** a page alert.
- A persistent alert for routine feedback → **use instead:** a toast.
- Several stacked messages with no priority → **use instead:** one at a time, ordered.

## Do

- Tie the message to the affected element.
- Explain what happened.
- Show the next step.
- Keep texts short.
- Preserve messages that require action.
- Allow looking up important messages later.

## Avoid

- Using a toast for everything.
- Making an important error disappear.
- Placing the message far from the problem.
- Repeating the same notice in several places.
- Generic text.
- Interrupting unnecessarily.

## Accessibility

- Messages without an action do not steal focus; announce without interrupting the flow (4.1.3).
- Use role status for simple information and role alert only for real urgency.
- Messages with an action stay available to keyboard and screen reader; a close button with an accessible name (2.1.1).
- A temporary message is never the only way to access important information.
- Field errors tied to the control and described in text (3.3.1).
- Do not rely only on color or an icon (1.4.1); keep contrast (1.4.3) and visible focus.
- Test zoom, keyboard and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Success toast | "Profile updated." |
| Inline on a field | "Enter a valid email, such as name@company.com." |
| Page alert | "We're having trouble sending invoices right now. Check status" |
| Close | "Close notice" |
| Failure with an action | "We couldn't save. Try again" |

## Verification checklist

- [ ] The pattern matches the message's scope.
- [ ] Field messages are adjacent to the field.
- [ ] No error that requires correction appears only in a toast.
- [ ] Messages with an action do not disappear on their own.
- [ ] There is a clear next step.
- [ ] Important messages can be looked up later.
- [ ] The message does not rely only on color or an icon.
- [ ] The close button has an accessible name.
- [ ] Tested with keyboard and screen reader.

## Rationale

- IBM Carbon, notification pattern, usage and accessibility: inline, toast, actionable, banner and modal by scope, persistence and interruption; status, alert and log roles.
- Brazilian Government Digital Standard, message and notification: global and contextual messages, feedback close to the element.
- Adobe Spectrum, writing errors: inline alerts for objects and validation; temporary ones for low consequence.
- U.S. Web Design System, alert: a persistent message in the page context.
- GOV.UK Design System, notification banner: persistent information that affects the service.
- Baymard Institute: inline validation helps locate and fix; premature validation frustrates (forms and checkout evidence).
- Nielsen Norman Group, 10 heuristics: visibility of status and error recovery.
- Interaction Design Foundation: clear, low-interruption feedback that is easy to dismiss.
