---
id: table-vs-cards
title: When should you use a table instead of cards?
category: data
components: [table, card, list]
type: contextual-decision
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "1.3.2", "1.4.10", "2.4.6", "2.4.7"]
related: [responsive-table, table-sorting, table-pagination, filter-structure]
---

# When should you use a table instead of cards?

> **Rule:** Use a table when people need to compare attributes across items; use cards for independent summaries and heterogeneous content.

## Context

Tables and cards structure information in different ways. A table highlights the relationships between rows and columns, for looking up, comparing and operating on data. A card groups an independent summary and leads to more detail.

The choice starts from the task, the content and the device, not from appearance. A table is not less modern, and a card is not automatically friendlier. Cards tend to be less scannable and worse for search and comparison; a table loses strength when each item has a very different structure.

For truly tabular data, headers, rows and cells carry meaning that must also be preserved in responsive versions.

## Decision

- **IF** the items share the same attributes and the person compares rows or columns **THEN** use a table.
- **IF** the task involves search, sorting, filters, selection or bulk actions **THEN** use a table.
- **IF** each item is an independent unit, with a summary, image or invitation to see details **THEN** use cards.
- **IF** the content is heterogeneous (variable media, text and actions) **THEN** use cards.
- **IF** the items are homogeneous and do not require comparing attributes **THEN** use a simple list.
- **IF** the person needs to find a specific item quickly **THEN** do not use cards.
- **IF** the table becomes cards on mobile **THEN** preserve the value-header link, the reading order and the actions.
- **ELSE** test both with real content and measure the time to find, compare and open items.

## When to use

- Table: the same attributes on every item.
- Table: comparing prices, statuses, dates, quantities or metrics.
- Table: search, sorting, filters, selection and bulk actions.
- Cards: articles, products or resources as independent units.
- Cards: image, summary and an action to open details.
- Cards: heterogeneous collections.

## When to avoid

- Cards instead of tabular data → **use instead:** a table.
- A table for narratives or content with no relationship between columns → **use instead:** a list or text.
- Cards for finding a specific item → **use instead:** a table or list with search.
- A table for items with very different structures → **use instead:** cards.
- Choosing by visual trend → **use instead:** a decision based on the task.

## Do

- Identify the main task before choosing.
- Align the same attributes in columns when there is comparison.
- Consider a list for homogeneous content.
- Test with real data, not dummy data.
- Preserve the task and actions on mobile.

## Avoid

- Using cards as table rows.
- Forcing a single structure for everything.
- Choosing by appearance.
- Hiding important attributes when the screen shrinks.
- Breaking the header-value relationship on mobile.
- Testing only with dummy content.

## Accessibility

- Semantic table: caption, th with scope="col" or scope="row" and td; in complex tables, id and headers (1.3.1).
- In the stacked or responsive version, keep the value-header link, the reading order and the actions (1.3.2); do not hide essential information.
- Cards in a collection use a semantic list (ul and li) and headings in the correct hierarchy (1.3.1, 2.4.6).
- Give links and buttons accessible names; visible focus (2.4.7).
- Avoid making the whole card a link when it contains other controls.
- Test keyboard, screen reader, 400% zoom and different widths (1.4.10).

## Microcopy

| Situation | Example |
|---|---|
| Table caption | "Invoices from the last 12 months" |
| Card link | "See details of the March invoice" |
| No results | "No invoices found for this filter." |
| Stacked column label | "Due date: 04/10/2026" |

## Verification checklist

- [ ] The main task is identified.
- [ ] Comparable data with the same attributes uses a table.
- [ ] Cards only appear for independent summaries or heterogeneous content.
- [ ] The table uses a caption and th with scope.
- [ ] In the mobile version, each value stays linked to its header.
- [ ] Actions remain available on mobile.
- [ ] Card collections use a semantic list.
- [ ] The format was validated with real content and tasks.

## Rationale

- Nielsen Norman Group, definition of cards: good for summarizing and exploring, less scannable and less suited to comparison.
- Baymard Institute, product lists and filters: the layout should follow the item type and task; e-commerce evidence.
- W3C WAI, tables tutorial and accessible table tips: semantic markup and relationships in responsive versions.
- U.S. Web Design System, table and card: columns for comparison; a card does not replace a table row.
- VTEX Shoreline, table: columns for scanning, sorting and comparing in admin contexts.
