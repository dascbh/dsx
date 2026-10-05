---
id: filter-structure
title: How do you structure filters in an interface?
category: search-filters
components: [filter, checkbox, radio, select, side-panel]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "3.3.2", "4.1.3", "1.4.10"]
related: [active-filters, applying-filters, no-search-results, date-range-filter]
---

# How do you structure filters in an interface?

> **Rule:** Offer only filters that answer real decisions in the task, grouped by meaning, with predictable combination logic, a visible active state and a simple way out (remove one, clear all).

## Context

Filters narrow a collection that is already shown by criteria such as category, status, price range or date. They work when the person can tell what is filterable, how the criteria add up and how to undo.

Structuring filters is not dumping every database attribute into a sidebar. It is choosing useful criteria, grouping them in the domain's vocabulary, using the right control and communicating the effect of each choice.

Numerous, vague or poorly grouped filters lead the user to ignore important criteria, apply combinations they do not understand or conclude that the item does not exist.

## Decision

- **IF** the user needs to find something that may not be in the list **THEN** use search, not a filter.
- **IF** they only need to change the order **THEN** use sorting, in a control separate from the filter.
- **IF** the list is small and easy to scan **THEN** do not offer filters.
- **IF** the criterion allows several choices **THEN** use checkboxes; **IF** only one **THEN** use radio buttons or a select; **IF** it is a numeric value **THEN** use a range; **IF** it is a period **THEN** use a date control.
- **IF** a list of options is long **THEN** add an inner search or grouping.
- **IF** several options of the same attribute are checked **THEN** treat them as alternatives (widens); **IF** they are different groups **THEN** combine them by narrowing — and confirm this in testing.
- **IF** there are secondary filters **THEN** put them under "More filters" only if they do not hide something decisive.
- **IF** the screen is narrow **THEN** open the filters in a panel or drawer, with the button showing the number of active filters.
- **IF** the combination returns no items **THEN** explain and offer to remove or relax filters.
- **ELSE** show the most used criteria first.

## When to use

- Long lists and searchable catalogs.
- Collections with attributes relevant to the decision.
- Dashboards with many records.
- Tasks that combine more than one criterion.

## When to avoid

- Short lists → **use instead:** listing everything.
- Finding content that is not in the list → **use instead:** search.
- Only reordering → **use instead:** sorting.
- Attributes with no real effect, or that nobody can explain → **use instead:** removing them.

## Do

- Start from the task's questions, not the database fields.
- Give each group a short, specific name.
- Show the active filters and the result count.
- Allow removing one filter and clearing all.
- Preserve the choices when reloading or returning to the list.

## Avoid

- Mixing search and filter in the same control.
- Exposing every available attribute.
- Resetting choices without warning.
- Relying only on color to show what is active.

## Accessibility

- Use native controls with a visible `label` (WCAG 3.3.2).
- Group related options with `fieldset` and `legend` (WCAG 1.3.1).
- In a drawer: a button with a clear name, expanded state and count; focus enters the panel, stays visible and returns to the trigger on close.
- Announce result changes in a status region (WCAG 4.1.3).
- Make sure it works at 200% and 400% zoom and on a narrow screen (WCAG 1.4.10).

## Microcopy

| Situation | Example |
|---|---|
| Panel button | "Filters (3)" |
| Clear all | "Clear filters" |
| Result | "24 results" |
| No items | "No items match these filters. Remove a filter to widen the results." |

## Verification checklist

- [ ] Does each filter answer a real task?
- [ ] Are search and sorting separate from the filters?
- [ ] Are the criteria grouped with clear names?
- [ ] Does the control type match the type of choice?
- [ ] Are the active filters visible?
- [ ] Is there individual removal and clear all?
- [ ] Is a change in results announced to screen readers?
- [ ] Do groups use `fieldset`/`legend`?
- [ ] Do filters work with the keyboard and on a narrow screen?

## Rationale

- Baymard Institute: availability, scope, logic, layout and discoverability of filters in product lists (strong in e-commerce; validate in other domains).
- IBM Carbon: choosing the selection method, applied-filters indicator, per-category and global clearing.
- GitHub Primer: the distinction between search and filter, recoverable state, communication to assistive technologies.
- W3C WAI (grouping and labeling controls): fieldset/legend and label.
- GOV.BR Digital Standard: reference for accessible selection controls.
