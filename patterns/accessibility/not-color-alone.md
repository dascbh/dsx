---
id: not-color-alone
title: Why not use color alone to communicate errors?
category: accessibility
components: [form-field, error-message, icon, chart]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["1.4.1", "1.4.11", "1.4.3", "3.3.1", "1.3.1"]
related: [form-errors, required-fields, field-error-position, success-confirmation]
---

# Why not use color alone to communicate errors?

> **Rule:** Color reinforces a state but is never the only cue: pair it with text that states the problem, next to the affected element.

## Context

Errors, warnings, required fields and confirmations usually have their own colors. When color is the only cue, people with color blindness or low vision, screens with dimmed brightness, grayscale printouts and screen reader users may miss what happened and what to do.

The requirement does not forbid color. It forbids color being the only means of conveying information, indicating an action, prompting a response or distinguishing an element. Text, an icon, a pattern or an extra border must carry the same information.

An icon without explicit meaning or a distant legend does not solve it either.

## Decision

- **IF** a field is invalid **THEN** write the problem as text, tied to the field, in addition to any color.
- **IF** color signals success, warning or error **THEN** add text or a meaningful icon.
- **IF** a field is required **THEN** mark it with text (e.g. "required"), not with color alone.
- **IF** charts, tables or maps distinguish categories by color **THEN** add a pattern, label, shape or nearby legend.
- **IF** a control changes state **THEN** use an additional cue (icon, underline, weight, text).
- **IF** you use an icon as reinforcement **THEN** it needs an understandable name or context.
- **IF** the information appears dynamically **THEN** associate it with the control and check how the screen reader announces it.
- **ELSE** check the screen in grayscale.

## When to use

- Validation errors.
- Success, warning, selection and required states.
- Charts, tables and maps with color-coded categories.
- Links and controls that change state.

## When to avoid

- A red border or background as the only indication → **use instead:** a text message plus an icon.
- A required field marked by color only → **use instead:** the text "required" in the label.
- A distant legend that must be memorized → **use instead:** a label directly on the element.
- An icon in place of text → **use instead:** an icon with text.

## Do

- Write out the state and identify the field.
- Associate the message with the control.
- Keep contrast in text, icons and borders.
- Test in grayscale and with color-blindness simulation.

## Avoid

- Using only red for errors.
- Marking success with green only.
- Replacing text with an unnamed icon.
- Accepting low contrast between states.
- Checking only visually.

## Accessibility

- 1.4.1 (level A): color is not the only visual means.
- 1.4.11: contrast of icons, borders and state indicators.
- 1.4.3: contrast of the message text.
- 3.3.1: error described in text; 1.3.1: programmatic field-message relationship.
- Test with people who cannot distinguish colors, with zoom, high contrast, keyboard and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Field error | "Enter the card number." |
| Password | "Create a password with at least 8 characters." |
| Required | "Full name (required)" |
| Success | "Details saved." |

## Verification checklist

- [ ] The error has a text indication.
- [ ] The affected field is identified.
- [ ] The screen still makes sense in grayscale.
- [ ] The icon reinforces the text but does not replace it.
- [ ] The message is close to the element.
- [ ] Text, icons and borders have enough contrast.
- [ ] The dynamic state is announced.
- [ ] Required status does not depend on color alone.

## Rationale

- WCAG 2.2, 1.4.1 and its "Understanding" document: color cannot be the only means.
- WCAG 2.2: 1.4.11, 1.4.3, 3.3.1 and 1.3.1.
- GOV.BR Digital Standard (Message): semantic colors as support, with a text alternative.
- AMAWeb (manual and checklist): required fields marked with text beyond red; contrast checks.
- Adobe Spectrum (writing for errors): border, icon and text message.
