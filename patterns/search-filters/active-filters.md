---
id: active-filters
title: How do you show active filters?
category: search-filters
components: [filter, chip, list]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["4.1.2", "4.1.3", "1.4.1", "2.1.1"]
related: [filter-structure, applying-filters, no-search-results, date-range-filter]
---

# How do you show active filters?

> **Rule:** After applying filters, show a visible summary with the name and value of each criterion, individual removal and a "Clear filters" action, outside any closed panel.

## Context

Applying a filter changes the results, but the task goes on: the person needs to understand why the list shrank, which criteria restrict it and how to widen it again.

A counter such as "3 filters" proves there is a cut, but does not reveal which one. The summary must show the applied values next to the list or the filter control.

Without that summary, a reduced list can look like the whole catalog, and removing criteria means reopening the panel and hunting for each control.

## Decision

- **IF** one or more filters are applied **THEN** show the summary next to the results.
- **IF** the filter panel is closed or in a drawer **THEN** the summary and the count stay visible outside it.
- **IF** you show each item **THEN** use "Attribute: value" ("Brand: Nike", "Price: up to $300"); a counter only complements it.
- **IF** the user wants to undo a criterion **THEN** each item has its own remove action, without reopening the panel.
- **IF** there are two or more filters **THEN** offer an explicit "Clear filters", not hidden in menus.
- **IF** the panel uses an "Apply" button **THEN** pending choices do not appear as applied until confirmed.
- **IF** the user comes back from a detail page **THEN** keep the filters (state in the URL or the history).
- **IF** there is no result **THEN** explain and offer to relax or clear the cut.
- **ELSE** on mobile use a horizontal or stacked list that signals items beyond the visible area.

## When to use

- Lists with more than one filter.
- Catalogs and search results.
- Filters hidden in a drawer or menu.
- Flows that go back and forth to detail pages.

## When to avoid

- A list with no filters applied → **use instead:** do not show the summary.
- Chips with no remove action → **use instead:** removable chips or plain text.
- A counter with no name or value → **use instead:** "Attribute: value".

## Do

- Say how many results remain and update on every change.
- Keep summary, controls, count and URL in sync.
- Place the summary in a predictable spot above the list.
- Preserve the state when using Back.

## Avoid

- Showing only a counter.
- Forcing the panel to be reopened to remove a filter.
- Clearing filters without warning.
- Losing the cut while navigating.

## Accessibility

- Each removal is a named action, such as "Remove filter Brand: Nike", with visible focus and usable by keyboard and touch (WCAG 4.1.2, 2.1.1).
- Group the summary with a heading or an accessible name.
- Announce the new number of results in a status region without moving focus (WCAG 4.1.3).
- After removing, keep focus at a predictable point if the control disappears.
- Do not rely only on color (WCAG 1.4.1); a horizontal list must be keyboard-navigable.

## Microcopy

| Situation | Example |
|---|---|
| Removable item | "Brand: Nike" with the action "Remove filter Brand: Nike" |
| Clear all | "Clear filters" |
| Count | "12 results" |
| Closed panel | "Filters (3)" |

## Verification checklist

- [ ] Does the summary show the attribute and value of each filter?
- [ ] Can each filter be removed individually?
- [ ] Is there a visible "Clear filters"?
- [ ] Does the summary appear with the panel closed?
- [ ] Does the result count follow the state?
- [ ] Do the filters persist when using Back?
- [ ] Does removal work by keyboard, touch and screen reader?
- [ ] Do unconfirmed choices stay out of the applied state?

## Rationale

- Baymard Institute (applied filters overview and list best practices): confirmation, removal and context problems without a summary; solutions for desktop and mobile.
- IBM Carbon (Filtering): a quantity indicator and clearing without reopening the container.
- Red Hat PatternFly (Filters): removable chips, clear all, count.
- WCAG 2.2, 4.1.2 (Name, Role, Value): name and state of the remove controls.
- WCAG 2.2, 4.1.3 and technique ARIA22: status announcements without moving focus.
