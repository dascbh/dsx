---
id: field-error-position
title: Does the error message go before or after the field?
category: forms
components: [form-field, error-message, error-summary]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.1", "3.3.3", "1.3.1", "1.4.1", "4.1.3"]
related: [error-placement, form-errors, validation-timing, preserve-data-after-error]
---

# Does the error message go before or after the field?

> **Rule:** Put the message in the same visual unit as the label and the field, in a consistent position and programmatically tied to the control; after submitting, repeat it in a summary at the top.

## Context

When a submit fails, the person needs to notice three things without hunting: that there is an error, which field is affected and how to fix it. The message must sit with the field and follow the reading order, not in a distant alert.

There is no universal answer to "before or after". In many patterns the message comes after the label and hint and before the control; what matters is that it is noticed in sequence, keeps a consistent position and is associated with the field. For radio or checkbox groups, it sits with the question.

Position goes hand in hand with timing: validating too early punishes the person; validating only at the end surprises them.

## Decision

- **IF** the error belongs to a simple field **THEN** show the message next to the field, in the same position throughout the form.
- **IF** the field is a radio or checkbox group **THEN** put the message with the question and the group.
- **IF** the submit failed **THEN** show a summary at the top of the main area and repeat each message beside its field, with identical text.
- **IF** there is a summary **THEN** each item points to the control and focus goes to the summary or to the first error.
- **IF** the field is empty and has just received focus **THEN** do not validate.
- **IF** validation while typing is justified by the rule **THEN** validate without interrupting typing; **ELSE** validate on moving on or submitting.
- **IF** the value was corrected **THEN** remove the message and preserve the data.
- **IF** the problem is about eligibility or the service **THEN** use dedicated communication, not a field error.

## When to use

- After trying to submit or move on.
- In long forms or with several errors.
- When feedback while filling in prevents a predictable error.

## When to avoid

- Validating when an empty field gets focus → **use instead:** validate on moving on.
- Validating on every keystroke → **use instead:** validate when the field is done, with a clear rule.
- A distant alert with no link to the field → **use instead:** an inline message plus a summary.
- A message that only says "invalid" → **use instead:** the problem plus the fix.

## Do

- Keep label, hint and message together.
- Explain the problem and how to fix it.
- Use the same text in the summary and in the field.
- Preserve what was already typed.

## Avoid

- Hiding the message in a tooltip.
- Duplicating conflicting texts.
- Signaling the error only by color, icon or position.
- Losing focus after submitting.

## Accessibility

- The text identifies the field and describes the error (3.3.1) and suggests a fix when known (3.3.3).
- Associate message and control with `aria-describedby` and set `aria-invalid="true"`.
- Groups use `fieldset` and `legend` (1.3.1).
- Do not rely on color (1.4.1); announce dynamic messages without stealing focus (4.1.3).
- Place the summary before the form, with a clear heading.

## Microcopy

| Situation | Example |
|---|---|
| Summary title | "There are 2 problems to fix" |
| Summary item | "Enter the tax ID with 11 digits" |
| Message on the field | "Enter the tax ID with 11 digits." |
| Group | "Choose a payment method." |

## Verification checklist

- [ ] The message identifies the field.
- [ ] It explains the problem and guides the fix.
- [ ] It is close to the field, in the same position for every field.
- [ ] There is a summary after submitting, with links to the fields.
- [ ] The summary text matches the field text.
- [ ] Nothing is validated when an empty field gets focus.
- [ ] Validation does not interrupt typing.
- [ ] The message disappears when the value is corrected.
- [ ] The entered data is preserved.
- [ ] Focus goes to the summary or to the first error.

## Rationale

- W3C WAI (User Notification) and WCAG 2.2 (3.3.1): summary plus inline message, with no single position imposed.
- Baymard Institute: inline validation avoids late discovery, but premature validation hurts.
- Nielsen Norman Group (hostile error messages; guidelines): proximity, human language, the right moment.
- NHS Digital Service Manual: message with the question; no validation on focus or while typing.
- USWDS (Form) and GOV.BR Digital Standard (Input): message tied to the field.
- CMS Design System and Adobe Spectrum: summary plus local message; values preserved.
