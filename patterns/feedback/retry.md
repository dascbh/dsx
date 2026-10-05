---
id: retry
title: When and how should you offer "Try again" after an error?
category: feedback
components: [alert, button, snackbar]
type: recommendation
impact: medium
status: recommended
evidence: strong
wcag: ["4.1.3", "1.4.1", "2.1.1"]
related: [temporary-failure, double-submit, preserve-data-after-error, helpful-error-message]
---

# When and how should you offer "Try again" after an error?

> **Rule:** Offer "Try again" only when the cause is probably temporary and repeating is safe; preserve the state, avoid duplicates and give a way out after a few failures.

## Context

A retry action is useful when the failure may be transient and repeating has a real chance of completing the task. It should not be the automatic answer to every error.

Good recovery combines a short explanation, a preserved state, one clear action and a cap on attempts. If the operation may already have completed, let people check the result first or use a mechanism against duplicates.

Retrying blindly can charge twice, duplicate records or wipe data.

## Decision

- **IF** the cause is transient (connection dropped, timeout, momentary unavailability) **THEN** offer "Try again".
- **IF** the data is invalid **THEN** take the user to the field to fix it; do not offer a retry.
- **IF** permission is missing **THEN** explain and say how to get access; do not offer a retry.
- **IF** the system knows the attempt will always fail **THEN** do not offer a retry.
- **IF** the action creates, pays, sends or deletes **THEN** confirm the result before retrying, or apply idempotency in the service.
- **IF** the user triggers a retry **THEN** show processing, block duplicate clicks and communicate the outcome.
- **IF** there are one or a few consecutive failures **THEN** offer a way out: check the connection, see the status, go back, save locally or ask for help.
- **IF** the error is contextual and non-blocking **THEN** put the action next to the message (inline or snackbar), a single action.
- **ELSE** preserve data, filters, position and progress.

## When to use

- A network failure, timeout or brief unavailability.
- An operation that did not complete, with its state preserved.
- Visible feedback during the new attempt.

## When to avoid

- Invalid data → **use instead:** guided correction in the field.
- Missing permission → **use instead:** guidance on getting access.
- An action that may duplicate effects → **use instead:** check the state first.
- A permanent failure → **use instead:** an alternative way out.

## Do

- Say what failed and what the new attempt will do.
- Use a single clear action.
- State the recommended wait before retrying.
- Offer a way out after repeated failures.

## Avoid

- An "Error" message on its own.
- An infinite loop of identical attempts.
- Clearing data on failure.
- Several competing retry actions.
- Masking an action that has already completed.

## Accessibility

- A button with a clear accessible name; do not move focus away unexpectedly.
- Announce "Trying again" and the outcome in a status region, without moving focus (WCAG 4.1.3).
- Temporarily disabling prevents duplicates, but the user must understand what is happening.
- Do not rely only on red, an icon or animation (WCAG 1.4.1); keyboard operation (WCAG 2.1.1).

## Microcopy

| Situation | Example |
|---|---|
| Load failure | "We couldn't load the results. Try again" |
| In progress | "Trying again…" |
| Repeated failure | "Still not working. Check your connection or come back later." |
| Way out | "Go back" |

## Verification checklist

- [ ] Could the cause be temporary?
- [ ] Is repeating safe?
- [ ] Does the message say what failed?
- [ ] Does the button describe the action?
- [ ] Were data and progress preserved?
- [ ] Is the retry state announced?
- [ ] Are duplicate clicks blocked?
- [ ] Is there a limit on attempts and an alternative?
- [ ] Does it work by keyboard?

## Rationale

- WCAG 2.2, 4.1.3 and technique ARIA22: dynamic states announced without moving focus.
- Baymard Institute (adaptive error messages, checkout flow): specific messages, data preservation, guided recovery.
- Adobe Spectrum (writing errors, alert banner): explain, guide, a direct and inline action.
- Material Design (Errors): a snackbar with retry; do not offer it when it will always fail.
- IBM Carbon (common actions, notifications): a short, contextual action.
- Brazilian Government Digital Standard GOV.BR (Message): short feedback, global vs. contextual.
- IETF RFC 9110 and Stripe (idempotency): safely repeating idempotent operations.
