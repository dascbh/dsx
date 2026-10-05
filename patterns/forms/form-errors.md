---
id: form-errors
title: How do you structure error messages in forms?
category: forms
components: [form-field, error-message, error-summary]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["3.3.1", "3.3.3", "1.4.1", "1.3.1", "4.1.3"]
related: [helpful-error-message, preserve-data-after-error, validation-timing, not-color-alone, required-fields]
---

# How do you structure error messages in forms?

> **Rule:** Every field error message names the field by its label, describes the problem, says how to fix it, is tied to the control and does not erase what the person typed.

## Context

During or after submitting, the person may enter data that is missing, invalid or incompatible with the rules. They need to identify the problem, understand the fix and resume the task without retyping everything.

"An error occurred" forces them to investigate; a message that names the field, explains what failed and points to the next step turns the failure into an action. This reduces rework and helps people with visual, cognitive or language limitations.

Predictable formats, limits and requirements should be explained before the error, in the field hint.

## Decision

- **IF** the system detects missing input, a wrong format or a value outside the allowed ones **THEN** show a message next to the field.
- **IF** there are several errors **THEN** repeat the messages in a summary at the start of the form.
- **IF** the format or limit is predictable **THEN** explain it beforehand, in the hint.
- **IF** a fix is known **THEN** suggest it, unless that is a security risk.
- **IF** the failure is about the service, permission or eligibility **THEN** do not use a field error; use dedicated communication with next steps.
- **IF** the fix requires looking something up or editing **THEN** do not use a temporary alert.
- **IF** the person has not yet had a reasonable chance to fill in the field **THEN** do not flag an error.
- **ELSE** validate when the person tries to move on or submit.

## When to use

- An empty required field.
- A wrong format (email, date).
- A number out of range or an option that is not allowed.
- A combination of values the system can explain.

## When to avoid

- Problems the person cannot solve by changing the input → **use instead:** a service message with context and a next step.
- A toast for an error that requires a fix → **use instead:** a persistent inline message.
- Treating inline message, focus and timing as a universal rule → **use instead:** testing in the real flow.

## Do

- Name the field with the same text as the label.
- Describe what was accepted or rejected.
- Point to a concrete action.
- Preserve the typed values.
- Keep the message visible until it is fixed.

## Avoid

- Vague messages.
- Relying only on color.
- Validating too early.
- Erasing data.
- Confusing an input error with a service failure.
- Making the message disappear on its own.

## Accessibility

- An automatically detected error is identified and described in text (3.3.1); a fix is suggested when known (3.3.3).
- Color is not the only signal (1.4.1).
- Link the message with `aria-describedby` or `aria-errormessage`; apply `aria-invalid="true"` when the value was judged invalid, not merely because a required field is empty before submitting.
- Dynamic messages in a live region; `role="alert"` only for what is truly important, without moving focus (4.1.3).
- The summary must allow navigating to each field.

## Microcopy

| Situation | Example |
|---|---|
| Empty required field | "Enter your email." |
| Format | "Enter the email in the format name@company.com." |
| Range | "The quantity must be between 1 and 10." |
| Date | "Enter a date from today onward." |
| Avoid | "Invalid input." |

## Verification checklist

- [ ] The text identifies the field.
- [ ] The message explains the problem.
- [ ] The message says how to fix it.
- [ ] The error does not rely only on color or icon.
- [ ] The message is associated with the field through an ARIA attribute.
- [ ] Typed data is preserved.
- [ ] The summary, when present, has links to the fields.
- [ ] The error does not appear before a reasonable attempt.
- [ ] Tested with keyboard, zoom and screen reader.

## Rationale

- WCAG 2.2: 3.3.1 (error identification), 3.3.3 (error suggestion), 1.4.1 (color), 1.3.1 (relationships).
- WAI-ARIA 1.2 (aria-invalid, aria-errormessage) and the APG Alert pattern.
- GOV.UK Design System (Error message, Error summary): proximity, linked summary, do not erase values.
- Nielsen Norman Group (error message guidelines; heuristic 9): human language, precise problem, constructive suggestion.
- GOV.BR Digital Standard (Message, Input) and Adobe Spectrum (writing for errors).
- CMS Design System (Error validation) and AMAWeb.
