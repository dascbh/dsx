---
id: label-vs-placeholder
title: Label or placeholder: which should forms use?
category: forms
components: [text-field, label, placeholder, helper-text]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.2", "1.3.1", "4.1.2", "1.4.3", "2.5.3"]
related: [required-fields, field-order, form-errors, helpful-error-message]
---

# Label or placeholder: which should forms use?

> **Rule:** Every field has a visible, associated label; the placeholder only serves as a short example or format, never as identification.

## Context

The placeholder disappears as soon as the person starts typing. If it is the only text that identifies the field, they forget what they were supposed to enter and struggle to review the data before submitting.

Placeholders also tend to have low contrast and are not treated as a label by assistive technologies. A visible label stays on screen during and after filling in, works as a click target and names the field for screen readers and voice commands.

Long instructions belong in helper text near the field, not in the placeholder.

## Decision

- **IF** there is an input field **THEN** provide a short, specific, visible label.
- **IF** the field needs a format or an example **THEN** use a short placeholder, only as a complement.
- **IF** the instruction is longer than one short sentence or must be reread **THEN** use helper text associated through aria-describedby.
- **IF** the field is required **THEN** say so in the label, never only in the placeholder.
- **IF** it is a search field **THEN** keep a label (visible or, at least, an accessible name) and a clear button.
- **IF** the design calls for a floating label **THEN** make sure the label stays visible when the field is filled.
- **ELSE** label above the field, helper text below the label.

## When to use

- Visible label: on every field.
- Placeholder: a short example ("name@company.com") or format ("MM/DD/YYYY").
- Helper text: rules, restrictions and persistent instructions.

## When to avoid

- A placeholder as the only label → **use instead:** a visible label.
- Long rules in the placeholder → **use instead:** helper text.
- Required status only in the placeholder → **use instead:** a marker in the label.
- A label that disappears on focus → **use instead:** a persistent label.

## Do

- Associate label and field with for and id.
- Write labels that identify the purpose without ambiguity.
- Keep placeholder examples to a few words.
- Relate the helper text to the field with aria-describedby.
- Test the field when already filled in.

## Avoid

- Using an example as if it were a label.
- Repeating in the placeholder the rule already written in the helper text.
- Trusting the default placeholder contrast.
- Removing the field's context when it gets focus.

## Accessibility

- The accessible name comes from the label, not the placeholder (3.3.2, 4.1.2).
- Programmatic label–field association (1.3.1).
- Instructions remain available after filling in.
- If there is a placeholder, ensure sufficient contrast (1.4.3).
- The accessible name must contain the label's visible text, for voice commands (2.5.3).

## Microcopy

| Situation | Example |
|---|---|
| Label | "Email" |
| Example placeholder | "name@company.com" |
| Helper text | "Use the email registered on your account." |
| Required label | "Tax ID (required)" |
| Search label | "Search orders" |

## Verification checklist

- [ ] Every field has a visible label.
- [ ] The label stays visible after filling in.
- [ ] The label clearly identifies the purpose.
- [ ] The placeholder is only a short example or format.
- [ ] No long instruction is in the placeholder.
- [ ] Label and field are associated (for/id).
- [ ] The helper text is linked by aria-describedby.
- [ ] Required status does not depend only on the placeholder.
- [ ] The field was tested with keyboard and screen reader.

## Rationale

- WCAG 2.2, criterion 3.3.2: labels or instructions for data entry.
- W3C Forms Tutorial (labeling controls; form instructions): for/id association and the limits of the placeholder.
- GOV.UK Design System (Text input): visible label, no placeholder in place of a label or hint.
- U.S. Web Design System (Text input): field with label and caution with placeholders.
- GOV.BR Digital Standard (Input): distinguishes label, placeholder and helper text.
- Material Design 3 and Apple Human Interface Guidelines: the label stays visible; the placeholder disappears.
- AMAWeb and ABNT NBR 17225: checking that labels exist and are clear.
