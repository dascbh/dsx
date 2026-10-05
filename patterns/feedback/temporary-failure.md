---
id: temporary-failure
title: How do you communicate temporary system failures?
category: feedback
components: [alert, inline-message, toast, unavailable-page, button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["4.1.3", "1.4.1", "2.2.1", "3.3.1"]
related: [retry, preserve-data-after-error, technical-error-code, toast-vs-inline-alert, long-loading]
---

# How do you communicate temporary system failures?

> **Rule:** Say what failed, whether the operation completed, is in progress or did not happen, keep the data and propose a single safe action.

## Context

A temporary failure happens when the system, the network or an external service cannot finish the operation at that moment, but the person can try later. It is not an input error: the data entered is not the problem.

The message must answer two questions: what happened and what is safe to do. Before suggesting "Try again", say where the operation stands. That avoids duplicate submissions, repeated payments and loss of trust.

A generic message increases uncertainty and leads to repetition, abandonment or duplication. Hostile messages hand the work of interpreting the problem to the person.

## Decision

- **IF** the failure is localized (one block of content) **THEN** use an inline message next to the affected content.
- **IF** the whole service is unavailable **THEN** use a persistent message or an unavailability page.
- **IF** the failure is brief, clear and recoverable with nothing to keep on record **THEN** a temporary notification is acceptable.
- **IF** the failure requires action **THEN** do not use a toast that disappears; keep the message visible.
- **IF** the server did not confirm the result **THEN** say "We couldn't confirm" and guide the person to check the history before repeating.
- **IF** the operation never started or can be repeated without risk **THEN** use "Try again" as the primary action.
- **IF** the operation may have been created even without confirmation **THEN** offer a persistent status check instead of resubmission.
- **IF** the failure persists **THEN** offer a concrete alternative: come back later, see the status or contact support.
- **IF** there is an ongoing incident **THEN** update the information without promising an unknown deadline.
- **ELSE** describe the failure in the language of the task, without a technical code.

## When to use

- A network or server failure.
- An unavailable external service.
- A result not yet confirmed.
- A failure that affects a whole area.

## When to avoid

- A problem with the field's data → **use instead:** a validation error next to the field.
- An operation still processing → **use instead:** a loading state.
- A permanent failure → **use instead:** a message that explains the change, without suggesting another attempt.
- Unlimited attempts → **use instead:** a limit and a support alternative.

## Do

- Bound the scope: "We couldn't load your orders".
- Preserve what the person typed, selected or attached.
- Keep the context of the task.
- Log the error for the team, without exposing it to the person.

## Avoid

- Blaming the person.
- Saying only "Error".
- Encouraging repetition of an uncertain operation.
- Clearing what was filled in.
- Technical jargon and uncertain deadlines.
- Relying only on red.

## Accessibility

- A non-urgent dynamic failure: a `role="status"` region already in the DOM before the text, a polite announcement, without stealing focus (4.1.3).
- An urgent error: `role="alert"`, used sparingly.
- Text, not only color, icon or sound (1.4.1).
- A retry button with an accessible name, visible focus and keyboard operation; it must not disappear before it is read (2.2.1).
- Associate the message with the affected content.

## Microcopy

| Situation | Example |
|---|---|
| Load failed | "We couldn't load your orders. Try again" |
| Uncertain result | "We couldn't confirm it was sent. Check History before sending it again." |
| Service down | "We're having some instability. Your data was kept. Try again in a few minutes." |
| Persistent | "Still not working. Contact support." |

## Verification checklist

- [ ] The message identifies what failed.
- [ ] It distinguishes a system failure from an input error.
- [ ] It says whether the operation finished, is still processing or did not happen.
- [ ] It makes clear whether it is safe to try again.
- [ ] The entered data was preserved.
- [ ] There is a clear recovery action.
- [ ] There is an alternative when the failure persists.
- [ ] The text uses no jargon or technical code.
- [ ] The state is announced without moving focus.
- [ ] The action works with screen reader and keyboard.

## Rationale

- Nielsen Norman Group (hostile error messages): avoid handing the person the work of interpreting the problem; explain and point to a way out.
- WCAG 2.2, criterion 4.1.3 (Status Messages): errors and states announced without moving focus.
- W3C WAI, technique ARIA19: an alert region or live region kept in the DOM before the update.
- Baymard Institute (validation and input preservation): specific messages and preserving data reduce effort; checkout evidence.
- IBM Carbon (notification) and Adobe Spectrum (toast): inline, toast and actionable formats depending on context.
- GOV.UK Design System (problem with the service page): guide people to try later, where their answers went and alternative channels.
- Brazilian Government Digital Standard (GOV.BR), Message: objective and accessible status messages.
