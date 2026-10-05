---
id: dropdown
title: When should you use a dropdown, and when should you avoid it?
category: forms
components: [dropdown, select, combobox, radio, autocomplete]
type: contextual-decision
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "4.1.2", "2.1.1", "2.4.7", "1.4.10", "3.3.2"]
related: [autofill, label-vs-placeholder, filter-structure, field-order]
---

# When should you use a dropdown, and when should you avoid it?

> **Rule:** Use a dropdown only for a single choice among predefined values; few options call for visible options and long lists call for search.

## Context

Dropdown, select and combo box solve different problems, even though many interfaces treat them as one control. The choice depends on the size of the list, the need to compare, the likelihood that the person already knows the value, and whether the selection is single or multiple.

A dropdown hides its options until it is opened: it saves space but adds an interaction and reduces comparison. In a short list, the person opens it just to discover what exists; in a long list, they scroll through rows with no overview and no search.

Choose the control by the task, not only by the available space. Numeric item limits are heuristics, not hard rules.

## Decision

- **IF** the choice is single, the values are predefined and exclusive, and compactness brings a real gain **THEN** use a select or dropdown.
- **IF** the list is short and comparing helps decide **THEN** use radio buttons, cards or an open list.
- **IF** the list is long or the person knows part of the value **THEN** use autocomplete or a combo box and make clear whether custom values are accepted.
- **IF** more than one value can be chosen **THEN** use checkboxes or a multiple-choice list with a summary.
- **IF** the selection triggers a command **THEN** use a menu button, not a form dropdown.
- **IF** the control is navigation **THEN** use a navigation structure.
- **IF** there is no sensible, neutral default **THEN** avoid a dropdown or include an explicit "Select" option.
- **IF** the native select serves the task **THEN** use the native one.
- **IF** the custom component lacks full semantics, focus and keyboard support **THEN** discard it.
- **ELSE** prefer visible options.

## When to use

- Exactly one option must be chosen.
- Predefined, mutually exclusive values.
- A predictable order or a sensible default.
- The alternatives do not need to stay visible for comparison.
- Limited space and input restricted to valid values.
- A medium-length list that can be scanned without effort.

## When to avoid

- Few comparable options → **use instead:** radio buttons or cards.
- A long list → **use instead:** autocomplete.
- A value the person already knows → **use instead:** a field with suggestions.
- Multiple selection → **use instead:** checkboxes.
- An action or command → **use instead:** a menu button.
- Main navigation → **use instead:** a navigation menu.

## Do

- Decide whether the choice is single or multiple.
- Check whether the options need to be compared.
- Keep the label persistent and separate from the selected value.
- Group related options in long lists.
- Show the selected value.
- Validate with keyboard, screen reader, zoom and narrow screens.

## Avoid

- Choosing a dropdown only to save space.
- Hiding simple alternatives.
- A long list with no search or grouping.
- Multiple selection with no summary.
- Mixing a form field with a command menu.
- A placeholder as the only label.
- A custom combobox without full keyboard support.
- Treating numeric limits as a hard rule.

## Accessibility

- Use a visible label associated with the field (1.3.1, 3.3.2); do not use a placeholder as the only label.
- Prefer the native select; if you customize, follow the WAI-ARIA APG combobox pattern: accessible name, expanded state, link to the popup, active option and listbox role (4.1.2).
- Check Tab, Enter or Space, arrow keys, Escape, typing and filtering (2.1.1).
- Visible focus, a selection that does not change silently, and focus returned to the trigger on close (2.4.7).
- Check contrast, 200% and 400% zoom, touch areas and menus that do not leave the viewport (1.4.10).

## Microcopy

| Situation | Example |
|---|---|
| Label | "State" |
| Initial option | "Select a state" |
| Search in a long list | "Type the city name" |
| No result | "No city found. Check the spelling." |
| Multiple-selection summary | "3 categories selected" |

## Verification checklist

- [ ] The choice is single.
- [ ] Short, comparable lists use visible options.
- [ ] Long lists have search or grouping.
- [ ] The label is visible and persists after the selection.
- [ ] The selected value stays visible.
- [ ] The control does not trigger a command or navigation.
- [ ] It works with the keyboard: Tab, arrows, Enter, Space and Escape.
- [ ] The custom component exposes name, expanded state and active option.
- [ ] It works at 400% zoom and on a narrow screen.

## Rationale

- Baymard Institute, dropdown usability: unnecessary opening in short lists, difficulty in long ones, alternatives such as radio buttons and autocomplete; numeric limits as an e-commerce heuristic.
- Nielsen Norman Group, dropdown and listbox lists: the balance between saving space and hiding options.
- W3C WAI-ARIA Authoring Practices, combobox pattern: popup, focus, selection and keyboard.
- IBM Carbon, dropdown: the difference between dropdown, filterable, multiselect and combo box.
- Adobe Spectrum, combo box: suggestions to find values.
- GOV.BR Design System, select: states, behavior and accessibility.
