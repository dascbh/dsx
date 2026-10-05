---
id: responsive-table
title: How do you make tables responsive on mobile?
category: data
components: [table, list, card]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["1.4.10", "1.3.1", "2.1.1", "2.4.7"]
related: [table-vs-cards, table-sorting, table-pagination, touch-target]
---

# How do you make tables responsive on mobile?

> **Rule:** Choose the adaptation by task: IF people compare columns, keep the grid in a container with its own horizontal scroll; IF they look up isolated records, stack or use a list, always preserving the header-cell relationship.

## Context

Tables depend on the relationship between rows and columns. Shrinking the width cuts off values, squeezes text and makes comparison harder. There is no single transformation: the task decides.

On narrow screens, the adaptation has to preserve the meaning of the data, not just make it fit. People who use zoom, enlarged text or assistive technology rely on that structure.

In digital commerce tests, dense tables worked on desktop but lost efficiency on mobile when they required scrolling on both axes; this evidence is specific to e-commerce.

## Decision

- **IF** comparison across columns is essential (dense numeric data, matrices) **THEN** keep the grid in a container with its own horizontal scroll.
- **IF** each row is an independent record (directory, contacts) **THEN** stack, repeating the column label next to each value.
- **IF** a few attributes are enough to decide **THEN** use a list and move secondary data to expandable details or a page of its own.
- **IF** there are many columns **THEN** reduce columns (remove redundancy, shorten labels) before compressing content.
- **IF** the table is long or wide **THEN** consider a fixed header or first column.
- **IF** there is horizontal scrolling **THEN** signal off-screen content and make the container keyboard-focusable.
- **IF** there is selection, sorting or actions **THEN** keep them available on mobile.
- **ELSE** test with real data before choosing.

## When to use

- Local scroll: multi-column comparison, dense data.
- Stacked rows: independent records.
- List: a few essential attributes.
- Fixed header: long tables.

## When to avoid

- Compressing every column → **use instead:** prioritize columns.
- Horizontal scroll on the whole page → **use instead:** scroll inside the container.
- Stacking without labels → **use instead:** a label repeated per value.
- Duplicating desktop and mobile versions → **use instead:** a single adaptable structure.
- Comparative data turned into disconnected cards.

## Do

- Identify the main task first.
- Prioritize the essential columns.
- Limit scrolling to the table.
- Keep row actions visible on touch.
- Test with zoom, long text and real data.

## Avoid

- Cutting off important values.
- Relying only on the horizontal gesture without a hint.
- Removing the scrollbar without an alternative.
- Breaking the reading order.

## Accessibility

- Keep `<table>`, `<caption>`, `<th>` and `<td>`; use `scope` or `id`/`headers` in complex structures (WCAG 1.3.1).
- Reflow at 320 CSS px: two-dimensional tables are an exception, but the scroll stays in the container (WCAG 1.4.10); the exception does not cover filters, search or pagination.
- A keyboard-focusable scroll container with visible focus (WCAG 2.1.1, 2.4.7).
- In the stacked layout, keep the programmatic value-header relationship.
- Do not duplicate tables that would both be read by a screen reader.
- Test at 320 px and 400% zoom.

## Microcopy

| Situation | Example |
|---|---|
| Scroll hint | "Scroll sideways to see more columns" |
| Stacked | "Status: Active" |
| Expandable detail | "See more details" |

## Verification checklist

- [ ] Was the main task identified?
- [ ] Were the essential columns prioritized?
- [ ] Is comparison still possible when needed?
- [ ] Is horizontal scrolling restricted to the table?
- [ ] Is there a hint of off-screen content?
- [ ] Are headers and cells still associated?
- [ ] Are sorting, selection and actions still accessible?
- [ ] Does the rest of the page avoid horizontal scrolling at 320 px?
- [ ] Does it work with keyboard and screen reader?

## Rationale

- W3C WAI (Tables Tutorial): preserve structural relationships on small screens and with zoom.
- WCAG 2.2, 1.4.10 (Reflow): 320 CSS px and the exception for two-dimensional data.
- WCAG 2.2, 1.3.1 (Info and Relationships): programmatic header-cell relationships.
- Baymard Institute: product tables lose efficiency on mobile with two-axis scrolling (e-commerce context).
- U.S. Web Design System (Table): scrollable tables for dense data, stacked for directories.
- VTEX Shoreline (Table): fixed header and first column.
- IBM Carbon (Data Table): room for dense data, row actions visible on touch.
