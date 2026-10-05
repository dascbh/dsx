---
id: validation-timing
title: When should fields be validated while the person fills them in?
category: forms
components: [text-field, error-message, validation]
type: contextual-decision
impact: high
status: caution
evidence: strong
wcag: ["3.2.1", "3.3.1", "3.3.3", "4.1.3", "1.4.1"]
related: [form-errors, field-error-position, password-requirements, preserve-data-after-error]
---

# When should fields be validated while the person fills them in?

> **Rule:** Validate on moving on or submitting; bring feedback forward only when the value is complete or the requirement can be shown without interrupting typing.

## Context

Validating before submitting cuts rework, but it can interrupt typing and make the person think they made a mistake before they finished. The timing should follow the type of data, the expectation of the task and the cost of the interruption.

Studies show a gain from inline validation, but also irritation when the system flags an error too early. There is no universal technique: test the result with the real audience and field type.

Browser validation guides, but never replaces server validation.

## Decision

- **IF** the field is required **THEN** validate when the person tries to move on or submit.
- **IF** the field is empty and has just received focus **THEN** do not show an error.
- **IF** the format has a known length (postal code, phone, card) **THEN** validate when the input is complete.
- **IF** the rule requires a lookup (username availability, a calculation) **THEN** validate asynchronously after a pause, with a loading state and a clear message.
- **IF** it is a password **THEN** show the requirements before or during typing and mark each criterion as it is met.
- **IF** there are dependent fields (confirmation) **THEN** revalidate the related field as soon as the change fixes or creates the inconsistency.
- **IF** the value has become valid **THEN** remove the error immediately.
- **IF** the feedback would only repeat an instruction already visible **THEN** do not validate while typing.
- **ELSE** validate on trying to move on or submit, and always on the server too.

## When to use

- On trying to move on or submit.
- When the field reaches a complete, verifiable length.
- When an asynchronous rule responds without blocking the task.
- Password requirements with visible criteria.
- Dependent fields after a change that affects validity.

## When to avoid

- On focusing an empty field → **use instead:** validate on moving on.
- On every keystroke → **use instead:** validate when the value is complete.
- Before the person finishes the value → **use instead:** wait for leaving the field or a complete value.
- With automatic focus changes → **use instead:** keep focus where the person is.
- An asynchronous lookup with no state → **use instead:** a loading indicator and a clear result.

## Do

- Define the trigger per field.
- Show requirements before typing.
- Indicate asynchronous states.
- Revalidate dependent fields.
- Remove the error once fixed.
- Preserve the typed data.
- Keep the message next to the field.
- Validate on the server too.

## Avoid

- Validating on focus.
- Interrupting on every keystroke.
- Flagging a premature error.
- Moving focus without the person acting.
- Hiding the loading state.
- Keeping an error that was already fixed.
- Relying only on client validation.
- Using only color for the state.

## Accessibility

- Receiving focus must not trigger a change of context: no automatic submit, no moving focus (3.2.1).
- Link the message to the control with aria-describedby and apply aria-invalid="true" if invalid (3.3.1).
- Do not make the screen reader repeat a warning on every keystroke; announce dynamic changes carefully (4.1.3).
- Use text, not only color or icon (1.4.1).
- The message explains how to fix it (3.3.3).
- Keep label and instructions visible while typing, especially on mobile.
- Preserve the data and the keyboard order; test a slow connection.

## Microcopy

| Situation | Example |
|---|---|
| Required field on moving on | "Enter your email to continue." |
| Incomplete format | "The postal code has 8 digits. 2 to go." |
| Asynchronous | "Checking whether the name is available..." |
| Requirement met | "At least 8 characters" (marked as met) |
| Mismatch | "The passwords don't match." |

## Verification checklist

- [ ] The validation trigger is defined per field type.
- [ ] No error appears when an empty field gets focus.
- [ ] No error appears on every keystroke without need.
- [ ] Complete formats are validated when the input is complete.
- [ ] Password requirements are visible before the error.
- [ ] Asynchronous validation shows a loading state.
- [ ] Dependent fields are revalidated.
- [ ] The error disappears as soon as the value is valid.
- [ ] The message is linked to the field by aria-describedby.
- [ ] Focus does not move on its own.
- [ ] The same rule exists on the server.

## Rationale

- Baymard Institute, usability test of inline validation: benefits and risks of premature validation; e-commerce evidence.
- W3C WAI, input validation: client validation does not replace server validation; format tolerance.
- WCAG 2.2, criterion 3.2.1 (On Focus): no change of context.
- Nielsen Norman Group, hostile error messages: avoid premature messages and state restrictions beforehand.
- NHS Digital Service Manual, error message: show errors on trying to move on.
- U.S. Web Design System, validation: usability and accessibility problems in tests; immediate is not a universal default.
- Brazilian Government Digital Standard, input field: message next to the field with aria-describedby.
