---
id: required-fields
title: How do you correctly mark required fields?
category: forms
components: [text-field, label, fieldset, legend, form]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.2", "1.3.1", "1.4.1", "4.1.2"]
related: [label-vs-placeholder, form-errors, field-order, validation-timing]
---

# How do you correctly mark required fields?

> **Rule:** Mark required status in text in the label, with a single convention per form, and expose the state programmatically as well.

## Context

The person needs to know, before submitting, which fields are needed. A field marked only in red, with an unexplained symbol, or with no indication for assistive technology may look optional.

Signaling early avoids incomplete submissions and back-and-forth corrections. A clear convention also helps people using zoom, screen readers or voice commands to understand the task before touching each field.

Before marking, ask whether the field needs to exist at all: requiring data the task does not use is the worst case.

## Decision

- **IF** almost every field is required **THEN** mark the optional ones with "(optional)" and say at the top that the rest are required.
- **IF** most fields are optional **THEN** mark the required ones with "(required)".
- **IF** every field is required **THEN** say so once in the subtitle and do not mark field by field.
- **IF** you use an asterisk **THEN** explain its meaning at the start of the form and expose the state in text or an attribute as well.
- **IF** the field is required **THEN** apply `required` (or `aria-required`) and associate the label with the field.
- **IF** a group of options is required **THEN** use `fieldset` and `legend` and mark the legend.
- **IF** the data is not needed for the task **THEN** remove the field.
- **ELSE** use "(required)" in the label, the most explicit convention.

## When to use

- Forms with required and optional fields.
- Groups of required options.
- Long or critical forms.
- Interfaces used with a keyboard or a screen reader.

## When to avoid

- Required status shown only by color → **use instead:** text in the label.
- An asterisk with no legend → **use instead:** an explicit legend or text.
- Mixed conventions (required and optional at the same time) → **use instead:** a single convention.
- A rule hidden in the placeholder → **use instead:** a visible label.

## Do

- Choose one convention and apply it across the product.
- Associate each label with its field.
- Test how it reads with a screen reader.

## Avoid

- Marking fields with no matching validation.
- Requiring data the task does not use.
- Using an asterisk to indicate an optional field.
- Marking almost every field when the exception is small.

## Accessibility

- Labels or instructions for data entry (3.3.2); the marker in the label or in the group legend (technique H90).
- Required state exposed programmatically (`required`), not only visually (1.3.1, 4.1.2).
- Do not rely only on color (1.4.1).
- Test label, marker and instructions with keyboard, zoom and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Required field | "Full name (required)" |
| Optional field | "Phone (optional)" |
| All required | "All fields are required." |
| Asterisk legend | "* Required field" |

## Verification checklist

- [ ] Every required field is identified in text.
- [ ] There is a single convention in the form.
- [ ] The convention is explained when it uses an asterisk.
- [ ] The marker does not rely only on color.
- [ ] The `required` attribute (or equivalent) is present.
- [ ] Each label is associated with its field.
- [ ] Option groups use `fieldset` and `legend`.
- [ ] No field requires unnecessary data.

## Rationale

- WCAG 2.2, criterion 3.3.2 (Labels or Instructions): labels or instructions, which includes marking required fields.
- W3C, technique H90: indicate required status in the label or legend.
- Material Design 3 (text fields): an asterisk in the label with an explanation in helper text.
- Brazilian Government Digital Standard (GOV.BR), form and input: "(required)" or "(optional)" in the label, one convention per form.
- U.S. Web Design System (Form): indicate required or optional and use `required`.
- Adobe Spectrum (Field label): mark only the minority and explain the asterisk.
- AMAWeb (accessibility checklist and manual): do not indicate required status only by color.
