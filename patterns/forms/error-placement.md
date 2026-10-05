---
id: error-placement
title: Where should error messages appear in forms?
category: forms
components: [error-message, error-summary, global-alert]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.1", "1.3.1", "1.4.1", "2.4.3"]
related: [field-error-position, form-errors, toast-vs-inline-alert, preserve-data-after-error]
---

# Where should error messages appear in forms?

> **Rule:** A field error stays next to the field; several errors get a navigable summary at the top; a global message is only for a failure that affects the whole form or service.

## Context

Where the message sits decides whether the person finds it, understands it and fixes the problem. A distant message goes unnoticed or leaves unclear which field needs attention.

The pattern combines three layers with different roles: a contextual message for the field, a summary to locate several problems (especially in long forms, or for keyboard and screen reader users) and a global message for what does not belong to a field.

After submitting, focus must go to a predictable place and the entered data must be kept.

## Decision

- **IF** the error belongs to a field **THEN** show the message inline next to it.
- **IF** there are several errors or the form is long **THEN** add a summary at the top with links to each field.
- **IF** the submit has just failed **THEN** move focus to the summary or to the first invalid field, always the same way.
- **IF** the problem affects the whole form or service (unavailability, general failure) **THEN** use a global message with a next step.
- **IF** the error requires a correction **THEN** never use a toast.
- **IF** it is ordinary validation **THEN** never use a modal.
- **IF** there is a summary **THEN** it cannot be the only way to identify the error.
- **ELSE** an inline message.

## When to use

- Inline: field-specific errors.
- Summary: several errors.
- Global: failures that affect the whole flow.
- Contextual: feedback tied to a component.

## When to avoid

- An error only at the top → **use instead:** inline plus a summary.
- A message in the footer or far away → **use instead:** next to the field.
- A modal for validation → **use instead:** summary and inline.
- A toast for a persistent error → **use instead:** inline.
- Several disconnected global messages → **use instead:** a single global message.

## Do

- Associate each error with its field.
- Use the same text in the summary and in the field.
- Preserve the data.
- Reserve the global message for what is not tied to a field.

## Avoid

- Clearing what was entered after the error.
- Repeating disconnected messages.
- Relying on color, icon or position.

## Accessibility

- Inline message programmatically associated with the field (1.3.1).
- Error described in text (3.3.1); not relying on color (1.4.1).
- Summary with direct links to the fields (skip-to-errors technique).
- Predictable focus order after submitting (2.4.3).
- Test with keyboard, zoom and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Summary title | "Fix the fields below to continue" |
| Summary item | "Phone: include the area code" |
| Global | "We couldn't submit right now. Try again in a moment." |
| Inline | "Phone: include the area code." |

## Verification checklist

- [ ] The message appears next to the affected field.
- [ ] There is a summary when there are several errors.
- [ ] The summary links lead to the right fields.
- [ ] The summary is not the only way to locate the error.
- [ ] Focus goes to the summary or to the first error.
- [ ] The entered data is preserved.
- [ ] General failures use a global message.
- [ ] Validation errors use neither a modal nor a toast.
- [ ] Tested with keyboard and screen reader.

## Rationale

- WCAG 2.2, 3.3.1: error identified and described in text, not by position alone.
- W3C technique G139: a mechanism to jump to the errors.
- W3C WAI (Form Notifications): a message per field and focus on the first invalid one.
- GOV.UK Design System (Error summary, Error message): summary at the top plus a nearby message; same text.
- GOV.BR Digital Standard (Message): distinguishes global and contextual.
- Atlassian Design (Error messages): inline versus global, with a next step.
- USWDS (Form) and AMAWeb: inline validation and accessibility in forms.
