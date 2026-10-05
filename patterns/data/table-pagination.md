---
id: table-pagination
title: When should you use pagination in tables and lists, and how do you set it up?
category: data
components: [pagination, table, list]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["2.4.3", "1.4.1", "2.4.7", "4.1.3", "2.5.8"]
related: [pagination-vs-scroll, table-sorting, responsive-table, active-filters]
---

# When should you use pagination in tables and lists, and how do you set it up?

> **Rule:** Paginate large collections with a stable order, showing the current page, keeping page, filters and sorting recoverable, and naming every control.

## Context

Pagination splits a collection into pages by number of items. It improves orientation, returning and performance, but makes navigation more costly and can interrupt comparison. It is not the same as steps, tabs, carousels, infinite scroll or "Load more".

The choice depends on the task: finding a result, exploring, comparing, looking up history or moving through phases. Misapplied, pagination hides the size of the content, breaks filters and sorting, loses the reading position or forces people to retrace their path.

In product listings there are contexts where "Load more" helps comparison; that finding comes from e-commerce and is not a universal rule.

## Decision

- **IF** the collection is extensive (search results, archives, admin tables, histories) **THEN** use pagination.
- **IF** loading everything hurts performance or reading and the order is stable **THEN** use pagination.
- **IF** the person may need to go back, share a URL or jump to a specific page **THEN** use pagination with the page in the URL.
- **IF** the total size is known and reliable **THEN** show the current page, relevant pages and the total.
- **IF** the last result is unknown **THEN** do not invent a last page.
- **IF** the list is short or the order changes on every load **THEN** do not paginate.
- **IF** items need to be compared continuously on the same screen **THEN** consider "Load more" or a single listing.
- **IF** the content is divided by topic or by mandatory steps **THEN** use tabs or steps, not pagination.
- **ELSE** set the number per page by task, item type, device and performance, and test it.

## When to use

- Extensive search results and archives.
- Large admin tables and lists.
- Ordered histories and logs.
- Collections whose pages have a URL.

## When to avoid

- Short collections → **use instead:** the full list.
- Narrative content by topic → **use instead:** sections, tabs or pages by topic.
- Mandatory processes → **use instead:** a step indicator.
- Continuous comparison between items → **use instead:** "Load more".
- Paginating only to increase page views → **use instead:** the full list or functional pagination.

## Do

- Highlight the current page.
- Offer "Previous" and "Next".
- Use an ellipsis only to omit intermediate pages, with an accessible name.
- Keep navigation on one line; on mobile, reduce controls without hiding the position.
- Preserve the reading position when coming back from an item.

## Avoid

- Clearing filters when changing pages.
- Reordering items without warning.
- Unnamed controls.
- Confusing pages with steps.
- Two rows of pagination.

## Accessibility

- A `<nav aria-label="Pagination">` region; links when the control leads to another URL, buttons when it updates in the same context.
- The current page with `aria-current="page"`; names such as "Page 2", "Previous page", "Next page".
- State not conveyed only by color or weight (1.4.1); visible focus (2.4.7); an adequate touch target (2.5.8).
- Update the URL or title when the page changes and announce changes without moving focus (4.1.3, 2.4.3).
- Test keyboard, screen reader, zoom, mobile and the Back button.

## Microcopy

| Situation | Example |
|---|---|
| Region label | "Pagination" |
| Current page | "Page 3 of 12" |
| Previous | "Previous page" |
| Next | "Next page" |
| Summary | "Showing 21–40 of 240 results" |

## Verification checklist

- [ ] The collection is large enough to split.
- [ ] The split follows quantity, not topic or step.
- [ ] Page and filters are recoverable from the URL.
- [ ] The item order is stable.
- [ ] The current page is identified.
- [ ] "Previous" and "Next" have clear names.
- [ ] The total appears only when it is reliable.
- [ ] The number per page was tested.
- [ ] It works with keyboard, screen reader, zoom and mobile.

## Rationale

- USWDS (Pagination): pagination by quantity, current page, previous/next, known or unknown total.
- Brazilian Government Digital Standard GOV.BR (Pagination): component variations for long lists.
- W3C technique ARIA26: identifying the current item with aria-current.
- Baymard Institute (Product List UX): quantity, device and task influence the choice; e-commerce-specific findings.
- WCAG 2.2: focus order, status messages and non-exclusive use of color.
