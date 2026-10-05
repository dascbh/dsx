---
id: helpful-error-message
title: How do you write helpful error messages?
category: ux-writing
components: [error-message, text-field, error-summary]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.1", "3.3.3", "1.4.1", "4.1.3"]
related: [form-errors, field-error-position, error-placement, preserve-data-after-error, technical-error-code]
---

# How do you write helpful error messages?

> **Rule:** Every error message must name the field, describe the problem in plain text and state the fix (format, limit or expected value), without blaming the person.

## Context

"An error occurred" says neither what happened nor how to continue. A helpful message turns the failure into guidance: it identifies the field, describes the problem and points to the fix.

Vague messages increase uncertainty and push the person into trial and error. Specific messages reduce the recovery effort and keep them from abandoning the form or filling everything in again.

When there is both a field message and an error summary, the text must be the same in both.

## Decision

- **IF** it is an input error **THEN** name the affected field and describe the rule in plain language.
- **IF** the fix is known **THEN** state the format, the limit or the expected value.
- **IF** a required field is empty **THEN** ask for the data ("Enter your email"), do not declare "invalid field".
- **IF** the value is out of bounds **THEN** quote the limit and, when useful, the value found.
- **IF** the data is incompatible with another field **THEN** name both fields involved.
- **IF** there is a field message and an error summary **THEN** use the same text in both.
- **IF** the fix hint would compromise security **THEN** use a neutral message (for example, at sign-in).
- **IF** the problem is on the service side **THEN** do not use this message; use the temporary failure pattern.
- **ELSE** preserve what was typed and keep the field editable.

## When to use

- An empty required field.
- A wrong format or value.
- Text above or below the limit.
- Data incompatible with another field.
- An error detected after submitting that the person can fix.

## When to avoid

- A failure that is purely the service's → **use instead:** a temporary failure message.
- A message that only says "invalid" → **use instead:** the rule plus the fix.
- Text that blames the person → **use instead:** a neutral sentence about the data.
- A technical code with no help → **use instead:** task language.
- Repeating an instruction already visible → **use instead:** only what remains to be fixed.

## Do

- Identify the field.
- Describe the problem.
- State the fix.
- Use plain, consistent language.
- Preserve the typed data.

## Avoid

- "An error occurred".
- "Invalid field".
- Blaming the person ("You typed it wrong").
- Technical codes.
- Vague instructions.
- Unnecessary repetition.

## Accessibility

- An automatically detected input error identifies the item and describes the problem in text (3.3.1).
- Offer a fix suggestion when known, unless it would compromise security or purpose (3.3.3).
- Associate the message with the field programmatically; a navigable summary when there are several errors.
- Do not rely only on color, icon or position (1.4.1); announce without stealing focus when dynamic (4.1.3).
- Test that field, error and guidance are read in an understandable order with keyboard, zoom and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Empty | "Enter your email." |
| Format | "The tax ID must have 11 digits. Example: 123.456.789-09." |
| Limit | "The password needs at least 8 characters." |
| Incompatible | "The end date must be after the start date." |
| Avoid | "Invalid field." |

## Verification checklist

- [ ] The message identifies the field.
- [ ] The problem is described clearly.
- [ ] The message says how to fix it.
- [ ] The text uses plain language and does not blame the person.
- [ ] The entered data was preserved.
- [ ] The message is associated with the field programmatically.
- [ ] The text is identical in the field and in the summary.
- [ ] Tested with keyboard and screen reader.

## Rationale

- WCAG 2.2, criterion 3.3.1 (Error Identification): identify the item and describe the problem in text.
- WCAG 2.2, criterion 3.3.3 (Error Suggestion): suggest a fix when known.
- Nielsen Norman Group (error message guidelines): nearby, specific, constructive messages, with no jargon and no blame.
- GOV.UK Design System (error message): explain what happened and how to fix it, align with the label and preserve data.
- Brazilian Government Digital Standard (GOV.BR), Message: clear language and accessible feedback.
- AMAWeb (digital accessibility manual): accessible communication of form errors.
- Adobe Spectrum (writing for errors): specific messages and the next action.
