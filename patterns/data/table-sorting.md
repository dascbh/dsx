---
id: table-sorting
title: How do you sort data in tables?
category: data
components: [table, column-header, button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "4.1.2", "4.1.3", "2.1.1", "2.4.7"]
related: [table-pagination, responsive-table, table-vs-cards, filter-structure]
---

# How do you sort data in tables?

> **Rule:** Offer sorting only on columns with a meaningful order, always show the active column and direction, sort by the real value and expose the state through a button and `aria-sort`.

## Context

Sorting rearranges rows to compare them by a criterion (name, date, quantity, value). It only helps when the column has an order that makes sense for the task and the interface shows which criterion is in effect.

Sorting does not replace filtering: it repositions rows, it does not remove them. Without an obvious active state, people do not understand why the rows are in that sequence; without an accessible control, the change is invisible to some users.

## Decision

- **IF** the person needs to compare items by a criterion **THEN** allow sorting by it.
- **IF** the column is free text, a long description or a combination of information **THEN** do not make it sortable.
- **IF** the table loads **THEN** apply a useful initial sort (e.g., most recent date) and indicate it.
- **IF** there is an active column **THEN** show the name + an ascending/descending indicator, on only one column when sorting is single.
- **IF** the user activates the same column **THEN** toggle ascending and descending; if a third unsorted state exists, make it recognizable.
- **IF** the column holds dates, numbers, currencies or sizes **THEN** sort by the raw value, not by the formatted text ("$9.00" before "$10.00").
- **IF** sorting is remote **THEN** show loading and announce the new criterion and page.
- **IF** the table becomes cards on mobile **THEN** offer an equivalent criterion selector or remove the control.
- **IF** the order is the user's manual priority **THEN** do not offer column sorting.

## When to use

- Long tables with comparable data.
- Reports, dashboards, catalogs and admin lists.
- Tasks of finding extremes or prioritizing.

## When to avoid

- A single natural order → **use instead:** keep it fixed.
- Merged rows or hierarchical groups → **use instead:** no sorting.
- Stacked mobile without an equivalent → **use instead:** a criterion selector.

## Do

- Use a button inside `<th scope="col">`.
- Show the active column and direction.
- Toggle the direction predictably.
- Announce the update.

## Avoid

- Making every column sortable.
- Relying only on color or an unnamed arrow.
- Sorting formatted text.
- Changing direction without feedback.

## Accessibility

- Semantic table markup with `<th scope="col">` (WCAG 1.3.1).
- A sortable header contains a focusable button operable by keyboard, with visible focus (WCAG 2.1.1, 2.4.7).
- `aria-sort="ascending"` or `"descending"` on the active header (WCAG 4.1.2).
- Announce the change in `aria-live="polite"`, without moving focus (WCAG 4.1.3).
- Programmatic values consistent with what is displayed.

## Microcopy

| Situation | Example |
|---|---|
| Announcement | "Table sorted by date, most recent first" |
| Button name | "Sort by amount" |
| Mobile | "Sort by" |

## Verification checklist

- [ ] Does sorting serve a comparison task?
- [ ] Are only columns with a clear order sortable?
- [ ] Is the active column identified?
- [ ] Is the direction visible without relying on color?
- [ ] Does the control work by keyboard?
- [ ] Do numbers, dates and currencies sort by raw value?
- [ ] Is `aria-sort` on a single column?
- [ ] Is the change announced without moving focus?
- [ ] Does mobile keep an equivalent way to sort?

## Rationale

- Baymard Institute (sorting in product lists): sort by relevant attributes with a visible criterion; evidence specific to e-commerce.
- W3C WAI-ARIA APG (Sortable Table): buttons in headers and `aria-sort`.
- W3C WAI (tables module): a button as the control and state beyond the visual.
- Material Design (Data tables): sorted column, direction reversal.
- U.S. Web Design System (Table): sortable columns, raw values, status region, limit on stacked mobile.
- IBM Carbon (Data table): states and interaction.
