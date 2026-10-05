---
id: master-detail
title: Master-detail
summary: Two columns on the same screen, the list on the left and the selected record on the right, to go through items in sequence without changing pages.
register: [operational]
when-to-use: IF the person goes through records one after another and needs to see each one's content with the list always at hand THEN use master-detail
avoid-when: comparing rows across several columns is the main task, the detail is too long for half a screen, or use is mostly on a phone
regions: [page-header, master-column, detail-column]
primary-action: { region: detail-column, position: top-right, max: 1 }
states: [loading, empty, nothing-selected, empty-filtered, error, no-access, success]
patterns: [pagination-vs-scroll, empty-state, no-search-results, active-filters, tabs, skeleton-vs-spinner, keyboard-focus, breadcrumbs]
variations: [two-fixed-columns, collapsible-master, stacked-detail-on-mobile]
rules: [T1, T3, T6, T7, F1, F5]
---

# Master-detail

An inbox of pending items, a queue of documents to review, the list of comments on an order: the person opens one, resolves it, moves to the next. The list gives orientation ("where am I, how much is left"); the detail gives the content. Both live on the same screen, and the selection is the thread that ties them.

## When to use

- **IF** the task is processing items in sequence (read, decide, move on) **THEN** use master-detail; offer "next" and "previous" in the detail.
- **IF** the list identifies each item with 2–3 pieces of information (title, status, date) **THEN** the master-column is a compact list, not a table.
- **IF** the detail needs more than ~60% of the width to be useful (document, editor) **THEN** switch to `document-viewer` or `editor-with-panel`, with the list as collapsible navigation.
- **IF** the person compares rows across many columns **THEN** use `operational-list`; master-detail hides columns.
- **IF** looking at the detail is occasional and short, starting from a table **THEN** use `detail-side-panel` over the list.
- **ELSE** prefer separate pages (list → record page) with a visible way back.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Title (h1) · [Search…] [Filter ▾]                │
├───────────────────────┬──────────────────────────────────────┤
│ master-column         │ detail-column                         │
│ ▌Item A    Pending    │ Item title (h2)      [Primary action] │
│  Item B    In review  │ ‹ previous · 3 of 41 · next ›         │
│  Item C    Done       │ ───────────────────────────────────── │
│  Item D    Pending    │ Content of the selected item          │
│  …                    │ Metadata · history                    │
│ 41 items              │                                       │
└───────────────────────┴──────────────────────────────────────┘
```

## What goes in each region

- **page-header**: the set's `h1`, search and at most two filters that affect the master-column; a create action, if any, as secondary (the screen's primary is the action on the open item).
- **master-column**: a compact list: item title, status as text, date or owner. The selected item has a strong visual mark and `aria-current`. Its own scrolling, independent of the detail. Count at the bottom ("41 items") and progressive loading or simple pagination.
- **detail-column**: the item title (`h2`, not `h1`), the primary action on it at top-right, "previous / next" navigation with position ("3 of 41"), content and metadata. If the content has parts, use tabs inside the detail, never a second list.

## Actions

- **Primary:** only one, in the `detail-column`, top-right: the action that resolves the item ("Approve", "Mark as reviewed"). When done, offer to go to the next pending item automatically, with a notice.
- **Secondary:** next to the primary, with less emphasis; destructive actions in a "More actions" menu.
- **Selection:** clicking the list swaps the detail without reloading the screen; arrow keys move through the list when it has focus; the URL keeps the open item.
- **Unsaved changes in the detail:** switching items asks before discarding, or saves a draft automatically. Pick one policy and apply it across the product.

## States

- **loading**: a skeleton in the list; in the detail, a skeleton only after an item is chosen. Switching items shows an indicator in the detail without clearing the list.
- **empty**: there are no items: the master-column explains, the detail-column disappears or shows the create action.
- **nothing-selected**: there are items but none is open: the detail guides ("Choose an item on the left") or opens the first pending one. Decide and document.
- **empty-filtered**: the search returned nothing: a message in the list with "Clear filters"; the detail keeps the last open item only if it still belongs to the result.
- **error**: a list failure blocks the whole screen with "Try again"; a detail failure stays in the detail-column, and the list remains navigable.
- **no-access**: a specific item is restricted: the detail explains, the list continues; the whole set is restricted: a no-access screen.
- **success**: action completed: the item's status changes in the list immediately, brief confirmation, focus goes to the next item or stays, according to the policy.

## Variations

### two-fixed-columns
A fixed-width list (~320 px) and the detail taking the rest.
**Favors:** continuous processing on desktop; constant orientation.
**Worsens:** on medium screens the detail gets cramped; wide documents become unreadable.

### collapsible-master
The list collapses into a narrow strip (or disappears) with a toggle button; the detail gains the width.
**Favors:** a rich detail (document, long form) without losing "next".
**Worsens:** orientation disappears when collapsed; the button needs an accessible name and state (`aria-expanded`).

### stacked-detail-on-mobile
On a narrow screen, list and detail become two screens, with "back" at the top of the detail.
**Favors:** phones; each screen at full width.
**Worsens:** loses the simultaneous view; requires preserving the list's scroll position when coming back.

## Anti-patterns

- Two `h1` (one in each column).
- A detail with no indication of which list item is open.
- Switching items and discarding changes without warning.
- A single page scroll dragging list and detail together.
- An eight-column table squeezed into the master-column.
- After approving, going back to the top of the list instead of moving to the next item.

## Checklist

- [ ] A single `h1`; the item title is an `h2`.
- [ ] Open item marked in the list (visually and with `aria-current`) and reflected in the URL.
- [ ] One primary per region, at the top-right of the detail.
- [ ] "Previous / next" with the position in the set.
- [ ] A single policy for unsaved changes when switching items.
- [ ] A detail error does not bring down the list.
- [ ] On a narrow screen, the detail becomes its own screen with a visible way back.
