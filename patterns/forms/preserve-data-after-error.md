---
id: preserve-data-after-error
title: How do you preserve entered data after a form error?
category: forms
components: [form, field, error-summary]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.1", "3.3.3", "1.4.1", "4.1.3"]
related: [form-errors, error-placement, retry, session-expired]
---

# How do you preserve entered data after a form error?

> **Rule:** After an error, show the form again with every valid value kept and highlight only the fields that need fixing; discard only secrets, such as the password and the card security code.

## Context

When a form fails, the person must not lose what they already entered. Erasing everything turns a localized error into rework: remembering, finding and retyping what was already right, with more effort, frustration and abandonment.

Preserving does not mean keeping forever. The draft is useful while the task is being resumed, with proper protection; secrets and files follow their own security rules.

In checkout tests, card data erased because of an error in another field led to abandonment. The evidence comes from checkout; validate it in your context.

## Decision

- **IF** validation fails **THEN** show the form again with valid text, selections and options preserved.
- **IF** only one field is wrong **THEN** mark only that field; do not restart the task.
- **IF** there are errors **THEN** show a summary at the start, with links to each field, and repeat the message next to the field.
- **IF** the field is a password or a card security code **THEN** do not retain it after authorization; ask for it again.
- **IF** the field is a file the browser does not repopulate **THEN** explain and offer a new selection.
- **IF** the failure is temporary **THEN** allow trying again without erasing the input.
- **IF** the form is long or in steps **THEN** preserve the data while the task is active, across back/forward and unavoidable reloads (non-sensitive data only).
- **IF** the user chose to clear or cancel, the session expired, or the context belongs to another user **THEN** discard and warn.
- **ELSE** do not silently change the format of the values.

## When to use

- After validation with an error, on the client or on the server.
- Long forms and steps with back and forward.
- Temporary failures and retries.
- Data that is hard to retype.

## When to avoid

- Passwords and security codes after authorization → **use instead:** ask again.
- An expired session or a policy requiring discard → **use instead:** explain the discard.
- Data that does not belong to the current task → **use instead:** do not persist it.

## Do

- Preserve valid text and selections.
- Keep label, value and instruction visible together.
- Move focus predictably to the first error or to the summary.
- Protect the active draft and limit how long it lasts.

## Avoid

- Clearing the whole form.
- Requiring everything to be retyped.
- Persisting a password or CVV.
- Hiding the cause of the error.
- Confusing a technical error with a validation error.

## Accessibility

- Describe the error in text (WCAG 3.3.1) and suggest the fix when possible (WCAG 3.3.3).
- Associate each message with its control using `aria-describedby` and use `aria-invalid="true"` on the invalid field.
- The summary may receive focus or lead to the first error, keeping the form's order.
- Do not rely only on color, border or icon (WCAG 1.4.1).
- Test reloading, expiry, zoom, keyboard, screen reader and a slow connection.

## Microcopy

| Situation | Example |
|---|---|
| Summary | "Fix 1 field to continue." |
| Field | "Enter a postal code with 8 digits." |
| Card | "For your security, enter the card code again." |
| File | "Select the file again." |

## Verification checklist

- [ ] Do valid fields stay filled in?
- [ ] Were selections and options preserved?
- [ ] Is only the invalid field highlighted?
- [ ] Does the summary lead to each field?
- [ ] Does the message explain how to fix it?
- [ ] Are passwords and security codes not retained?
- [ ] Is it possible to try again without losing data?
- [ ] Is discarding on cancel or expiry explained?

## Rationale

- Baymard Institute: erased card data leads to abandonment (checkout context); a guideline on preserving input.
- W3C WAI (Easy Checks and User Notification): fields without errors stay filled in; summary with links and aria-describedby.
- WCAG 2.2, 3.3.1 (Error Identification).
- GOV.UK Design System (recovering from validation errors): show again with answers preserved, a summary and messages next to the field.
- PCI SSC: verification codes must not be retained after authorization.
- GOV.BR Digital Standard (Input): contextual messages associated with the field.
