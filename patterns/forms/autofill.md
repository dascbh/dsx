---
id: autofill
title: When should you use autofill?
category: forms
components: [text-field, autocomplete, combobox, address]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["1.3.5", "3.3.7", "2.1.1", "1.4.1", "4.1.2"]
related: [dropdown, address-by-postal-code, required-fields, preserve-data-after-error]
---

# When should you use autofill?

> **Rule:** Use autofill to reduce typing, but keep every field visible, editable and confirmable by the person.

## Context

Filling in forms takes memory, typing and checking. Autofill eases that work, but the term covers different behaviors: the browser offers saved data (autofill), the field proposes options while the person types (list autocomplete), or the system completes related fields after a selection.

None of them should hide what was filled in or turn a suggestion into an irreversible decision. The person needs to know where the value came from, check it, correct it and carry on by hand if the suggestion is missing or wrong.

Mixing browser autofill with search autocomplete produces an interface that is hard to announce, navigate and correct.

## Decision

- **IF** the field collects the person's own recurring data (name, email, phone, address, postal code, username, card) **THEN** declare the autocomplete attribute with the matching standard token and keep the label visible.
- **IF** the person needs to find a value in a large list **THEN** use short, relevant suggestions, navigable by keyboard, that accept continuous typing.
- **IF** nothing in the list matches **THEN** let the person enter the value manually.
- **IF** it is an address **THEN** use lookup as support, fill the related fields after the selection and keep them visible and editable, with the option to type manually.
- **IF** a selection fills other fields **THEN** show what changed and keep them editable.
- **IF** the value may belong to someone else **THEN** do not enable autofill, or require confirmation.
- **IF** the suggestion changes an important decision **THEN** ask for explicit confirmation.
- **ELSE** do not block the browser's autofill.

## When to use

- A known, recurring piece of the person's own data.
- The field's purpose is identifiable by a standard token.
- A long list where relevant suggestions help.
- The result can be reviewed before submitting.
- A manual alternative is available.

## When to avoid

- A value that may belong to someone else → **use instead:** an empty field with a clear label.
- A suggestion that changes an important decision without confirmation → **use instead:** a confirmation step.
- A system that does not show every filled field → **use instead:** visible conventional fields.
- A long, irrelevant list, or one that covers fields and labels → **use instead:** a short list positioned without overlap.
- Erasing what the person typed without warning → **use instead:** preserve it and warn.

## Do

- Identify the field's real purpose with the correct token.
- Keep the label visible.
- Show short, relevant suggestions.
- Preserve manual editing.
- Let the person review the filled values.
- Test with no saved data, with mismatched data and with an address that is not found.

## Avoid

- Filling in without explaining.
- Hiding related fields.
- Forcing a suggestion.
- Blocking manual entry.
- Submitting the form automatically.
- Erasing data without warning.
- Depending on a specific browser.

## Accessibility

- Use autocomplete with valid values that match the field's real purpose (1.3.5); the token follows the data the label asks for, not the internal name in the code.
- For suggestions, use aria-autocomplete according to the real behavior: list, inline or both; announce opening, the active item and the selection (4.1.2).
- Keep focus in the field while the list is shown; the keyboard navigates and selects; offer a clear way to reject (2.1.1).
- Do not rely only on color, position or a visual change to show the chosen value (1.4.1).
- Do not remove labels, instructions or conventional fields after the suggestion.
- Avoid asking again for data already given in the same session (3.3.7).
- Test screen reader, keyboard, zoom, touch and voice.

## Microcopy

| Situation | Example |
|---|---|
| No result | "We couldn't find that address. Fill in the fields manually." |
| Autofill notice | "We filled in street, neighborhood and city. Please check them." |
| Manual alternative | "Enter address manually" |
| Label | "Postal code" |

## Verification checklist

- [ ] Personal data fields have autocomplete with the correct standard token.
- [ ] The label stays visible after filling.
- [ ] Filled related fields stay visible and editable.
- [ ] There is a manual typing alternative when there is no suggestion.
- [ ] The suggestion list works with the keyboard and does not cover the form.
- [ ] The form is not submitted automatically after the selection.
- [ ] Nothing typed is erased without warning.
- [ ] Tested with no saved data and with mismatched data.

## Rationale

- W3C WAI, technique H98 and criterion 1.3.5: standard autocomplete tokens and their benefits for people with motor, memory and language difficulties.
- W3C, autocomplete attribute validation rule: valid token structure.
- W3C WAI-ARIA 1.2, aria-autocomplete: inline, list or combined suggestions.
- Baymard Institute, automatic address lookup and autocomplete: reduces errors, but visible conventional fields and manual entry are necessary; e-commerce evidence.
- Baymard Institute, automatic city and state detection: less typing on mobile devices.
- GOV.UK Design System, text input: autocomplete to speed up filling.
- Adobe Spectrum, IBM Carbon and U.S. Web Design System, combo box: suggestions that keep the field editable.
