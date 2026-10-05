---
id: library
title: Library
summary: Collection of reusable items (templates, catalog items, reference documents) organized into collections, with search, quick view and curation.
register: [operational, editorial]
when-to-use: IF the person looks for an item to reuse or consult, choosing by category, name or content THEN use a library
avoid-when: the items are work cases with status and deadline (use operational list) or the collection has fewer than ~10 items (a simple list is enough)
regions: [page-header, collection-navigation, search-bar, content, quick-view]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, empty, empty-filtered, error, no-access, success]
patterns: [filter-structure, no-search-results, active-filters, table-vs-cards, empty-state, file-upload, pagination-vs-scroll, confirm-deletion, disabled-button]
variations: [card-grid, dense-list, collection-tree, with-quick-view]
rules: [T1, T3, T5, T6, T7, F1]
---

# Library

Approved catalog items with alternatives, order templates, technical specifications, reference price lists. The difference from the operational list: here the item does not "move along"; it is chosen, copied, applied. The person arrives with a vague idea ("that 8 mm stainless screw") and needs to recognize the right item by its content, not by its code.

## When to use

- **IF** the items are reused as a starting point **THEN** use a library, with "Use this template" as the item's central action.
- **IF** the choice depends on seeing the content **THEN** use `with-quick-view`; opening and going back item by item is slow.
- **IF** the collection has a natural hierarchy (area → type → item) **THEN** use `collection-tree`; with flat categories, filters are enough.
- **IF** there is curation (who may create, approve, lock) **THEN** curation actions appear only for whoever has the role, and the item's state (draft, approved, obsolete) is visible.
- **IF** the items have a deadline, an owner or a work status **THEN** it is an `operational-list`.
- **ELSE** (small collection) **THEN** a simple list in a settings section is enough.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Library (h1)                   [New template]     │
├──────────────────┬───────────────────────────────────────────┤
│ collection-      │ search-bar [Search titles and text…]       │
│ navigation       │ Type ▾  Status ▾   active chips ×          │
│ ▸ Templates (34) ├──────────────────────────┬────────────────┤
│ ▾ Items (120)    │ content                  │ quick-view     │
│   · Venue        │ ┌──────┐ ┌──────┐        │                │
│   · Payment      │ │Templ.│ │Templ.│        │ Text preview   │
│ ▸ Specs (12)     │ └──────┘ └──────┘        │ [Use template] │
└──────────────────┴──────────────────────────┴────────────────┘
```

## What goes in each region

- **page-header**: the `h1`, a create/import primary for curators; for non-curators, no primary.
- **collection-navigation**: collections with a count; the current collection marked with `aria-current`; "All" at the top.
- **search-bar**: a search over the title and the content, highlighting the matching passage; filters by type and status; chips for active filters.
- **content**: cards or rows with name, opening passage or description, status (approved, draft, obsolete) and review date; obsolete items low-key but findable.
- **quick-view**: a preview of the selected item, metadata (who approved, when, where it is used) and the use action; no editing here.

## Actions

- **Page primary:** one, in the `page-header`, top-right: create or import, only for curators.
- **Item action:** "Use this template" / "Add to order" in the quick view or on the card; it is the goal of most visits.
- **Curation:** edit, approve, mark obsolete, delete, under "More actions"; deleting an item in use warns where it is used and prefers "mark as obsolete".
- **File upload:** import accepts drag and drop, states formats and the limit beforehand, shows progress per file.

## States

- **loading**: a skeleton of the cards; collections already navigable.
- **empty**: a library with no items: for curators, explain and offer create/import; for everyone else, say who feeds the library.
- **empty-filtered**: nothing found: show the term and the filters, suggest searching all collections and "Clear filters".
- **error**: failed to load: an alert in the content with "Try again"; the search preserved.
- **no-access**: a restricted collection: it does not appear for whoever cannot see it; direct access by address explains the restriction.
- **success**: item created or used: confirmation with a link to the result ("Order created from Template X. Open").

## Variations

### card-grid
Cards with name, passage and status.
**Favors:** visual recognition, medium collections, first exploration.
**Worsens:** fewer items per screen; comparing dates and statuses becomes hard.

### dense-list
Rows with columns (name, type, status, review), sortable.
**Favors:** large collections, curation, people who know the name of what they are looking for.
**Worsens:** recognition by content drops without the preview.

### collection-tree
Hierarchical navigation on the left with a count per node.
**Favors:** a stable taxonomy known to the team.
**Worsens:** items that belong to two categories; a deep tree (more than 3 levels) disorients.

### with-quick-view
A preview column to the right of the content.
**Favors:** choosing by the text without opening and going back.
**Worsens:** takes width; on a narrow screen it becomes an overlay panel.

## Anti-patterns

- Searching only the title when the person remembers the content.
- A curation button visible (and disabled) for someone who will never have the role.
- Deleting a template in use without saying where it is used.
- Obsolete items mixed with approved ones without marking.
- Opening the item on a new page for every peek.

## Checklist

- [ ] Search over title and content, with the passage highlighted.
- [ ] Item status visible (approved, draft, obsolete).
- [ ] Use action one click away from the preview.
- [ ] Curation only for whoever has the role; deletion with a usage warning and the "obsolete" alternative.
- [ ] `empty` differs for curators and non-curators; `empty-filtered` with "Clear filters".
- [ ] Current collection marked; counts per collection.
