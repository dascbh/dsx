---
id: pagination-vs-scroll
title: Pagination, "Load more" or infinite scroll?
category: navigation
components: [pagination, load-more-button, infinite-scroll, list]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["2.1.1", "2.4.3", "4.1.3", "1.4.10", "2.4.8"]
related: [table-pagination, long-loading, skeleton-vs-spinner, active-filters]
---

# Pagination, "Load more" or infinite scroll?

> **Rule:** If finding and returning matter more, use pagination; if exploring and comparing matter more, use "Load more"; leave infinite scroll for feeds where scrolling on is the task itself.

## Context

The three patterns slice a collection, but produce different experiences. Pagination creates pages and return points. "Load more" keeps everything in the same context through an explicit action. Infinite scroll adds content on its own as the person scrolls.

The decision starts from the task (find, compare, explore, revisit, reach the end), the volume, the stability of the results, performance and the need for orientation. Studies with product lists suggest situations where "Load more" favors comparison, but that is a design hypothesis, not a general rule.

The cost goes beyond the visual: automatic loading affects history, focus, assistive reading, access to the footer and recovery after opening an item.

## Decision

- **IF** the person needs to find, cite, share or revisit a specific page **THEN** use pagination.
- **IF** position, total or URL matter **THEN** use pagination.
- **IF** results, tables and histories need predictable return points **THEN** use pagination.
- **IF** the person explores and compares items in a continuous list and decides when to see more **THEN** use "Load more".
- **IF** the content is a discovery or sequential feed and continuing is the task **THEN** consider infinite scroll, as long as position, history, footer, keyboard and assistive technology keep working.
- **IF** you need continuity but also control **THEN** use a hybrid: automatic blocks plus a manual button.
- **IF** the list is short **THEN** do not paginate.
- **ELSE** start with pagination and validate with real content and tasks.

## When to use

- Pagination: searches, tables, histories, archives.
- "Load more": catalogs and exploration lists.
- Infinite scroll: news feeds and sequential content.
- Blocks: large collections that are heavy if loaded all at once.

## When to avoid

- Infinite scroll in searches or lookup tables → **use instead:** pagination.
- Pagination on a short list → **use instead:** the full list.
- "Load more" when the person needs to jump to the last page → **use instead:** pagination.
- Any pattern that loses filters, sorting, position or items already seen → **use instead:** keeping the state in the URL or the session.
- Choosing because a competitor uses it → **use instead:** testing the main task.

## Do

- Preserve position, filters, sorting and items already loaded.
- Define a clear end of the collection.
- Show waiting, error and end.
- Say what was added.
- Measure finding items, returning and the sense of control.

## Avoid

- Hiding the footer.
- Duplicating items when loading.
- Moving focus without warning.
- Preventing a return to the previous point.
- Firing simultaneous requests that change the order.

## Accessibility

- Pagination inside a `<nav>` with a unique label, clearly named links and `aria-current="page"`.
- "Load more" is a real `<button>`; announce start, result and end through a status message without stealing focus (4.1.3).
- Keep a predictable focus order after the update (2.4.3).
- Infinite scroll as a feed follows the WAI-ARIA feed pattern: identifiable articles, position, set size and `aria-busy`.
- Test keyboard (2.1.1), 200% and 400% zoom (1.4.10), a slow connection and the Back button.

## Microcopy

| Situation | Example |
|---|---|
| Button | "Load 20 more results" |
| Status | "20 items added. Showing 60 of 140." |
| End | "You've reached the end of the list." |
| Error | "Couldn't load more items. Try again" |
| Pagination | "Page 3 of 12" |

## Verification checklist

- [ ] The main task (find, compare, explore) was defined.
- [ ] The need for a specific page or URL was assessed.
- [ ] Position and items seen are preserved.
- [ ] Filters, sorting and search stay active.
- [ ] The pattern works by keyboard.
- [ ] Loading and result are announced.
- [ ] Error, repetition and end of the collection are handled.
- [ ] The Back button restores the context.
- [ ] The decision was tested with real content.

## Rationale

- USWDS (Pagination): navigation in `nav`, label and current page.
- GOV.BR Digital Standard (Pagination): variants with a button and automatic scrolling.
- W3C WAI-ARIA APG (Feed Pattern): feed structure, position, focus and aria-busy.
- W3C (Status Messages, Focus Order): announcement without moving focus, and focus order.
- Baymard Institute (Product List UX): pagination versus additional loading depends on task, volume and device; e-commerce-specific findings.
