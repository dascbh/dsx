---
id: operational-list
title: Operational list
summary: Everyday work screen that shows many records of the same type so the person can find, compare and act on them.
register: [operational]
when-to-use: IF the main task is finding, triaging or tracking many records of the same type THEN use an operational list
avoid-when: the set has few heterogeneous items, the person needs to read each item's full content, or the task is editing a single item
regions: [page-header, filter-bar, bulk-actions-bar, content, list-footer]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, empty, empty-filtered, error, no-access, success]
patterns: [filter-structure, active-filters, applying-filters, table-pagination, table-sorting, empty-state, no-search-results, table-vs-cards, responsive-table, skeleton-screen, destructive-action]
variations: [with-bulk-actions, cards-on-mobile, filters-in-side-panel, grouped-by-status]
rules: [T1, T3, T5, T6, T7, F1]
---

# Operational list

The screen where the person spends the day: orders in progress, requests to approve, pending documents, items to classify. Its value lies in **finding fast, comparing rows side by side and dispatching**, not in reading each record in full. Density and predictability beat decoration.

## When to use

- **IF** the person works on many records of the same type (dozens to thousands) **THEN** use an operational list with a table.
- **IF** records are compared by attributes (status, date, amount, owner) **THEN** each attribute becomes a sortable column; do not hide a comparison attribute inside the detail.
- **IF** the most frequent task is "find a specific record" **THEN** text search stays visible in the filter bar, not behind an icon.
- **IF** the person needs to read or edit the record without losing their place in the list **THEN** combine it with `detail-side-panel` or switch to `master-detail`.
- **IF** the items are reusable (templates, catalog items) and the person picks by visual similarity or by category **THEN** prefer `library`.
- **IF** the person only needs to know "how things are" without acting item by item **THEN** prefer `monitoring-dashboard`.
- **ELSE** (fewer than ~7 heterogeneous items) **THEN** a simple list inside another screen is enough; do not build the full archetype.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header   Title (h1) · count            [Primary action]   │
├──────────────────────────────────────────────────────────────┤
│ filter-bar  [Search…] [Status ▾] [Period ▾]  Clear             │
│                   chips: Status: Pending ×  Owner: Ana ×       │
├──────────────────────────────────────────────────────────────┤
│ bulk-actions-bar (only with a selection) 3 selected [Action]  │
├──────────────────────────────────────────────────────────────┤
│ content   ☐ Name ▲      Status      Owner         Updated     │
│            ☐ ……………      ● Pending   Ana           2 h ago    │
│            ☐ ……………      ● Done      Bruno         yesterday  │
├──────────────────────────────────────────────────────────────┤
│ list-footer  1–50 of 1,284     [‹] 1 2 3 … 26 [›]  50/page    │
└──────────────────────────────────────────────────────────────┘
```

## What goes in each region

- **page-header**: the screen's single title (the `h1`, naming the set in the plural: "Orders"), an optional total count, the primary create action ("New order") and at most two secondary page actions (export, import). No filters here.
- **filter-bar**: text search first, on the left; then the 3–5 most used filters as visible controls; the rest under "More filters". Below, the active filters as removable chips and "Clear filters". The bar mirrors its state in the URL so the list can be shared and restored when coming back.
- **bulk-actions-bar**: appears only when there is a selection; says how many items are selected, offers "Select all N results" when the selection covers only the page, and the actions that apply to the batch. It visually replaces the filter bar or stays fixed right above the table.
- **content**: the table. The first column identifies the record and is the link to the detail; status with text and color (never color alone); numbers right-aligned; relative dates with the absolute date in the title attribute. Row actions at the end of the row, at most two visible and the rest in a "More actions" menu.
- **list-footer**: displayed range and total, pagination and page size. In a short list (a single page) the footer shows only the count.

## Actions

- **Primary:** only one, in the `page-header`, top-right, usually creating a record of the listed type. If the screen creates nothing, do not invent a primary; leave the region without a filled button.
- **Per row:** open (the first column's link) and at most two frequent actions as text buttons or icons with an accessible name; destructive actions go into the "More actions" menu, never as a loose icon next to "Edit".
- **Bulk:** only appear with a selection; the bulk destructive action states how many items it affects in its label ("Archive 12 orders") and asks for proportional confirmation (see `confirmation-dialog`).
- **Disabled vs hidden:** an action the person can never use (lack of permission) disappears; an action that depends on the record's state is disabled with the reason in the help text.

## States

- **loading**: a skeleton with the columns and the height of ~10 rows; header and filters already interactive. When paginating or filtering, keep the old rows dimmed with a discreet indicator instead of flashing the screen.
- **empty**: no record exists yet: explain what shows up here and offer the primary action ("No orders yet. Create the first one or import a spreadsheet.").
- **empty-filtered**: records exist, but the filter returned none: say so, show the active filters and offer "Clear filters". Never reuse the initial empty message.
- **error**: loading failed: an alert in the content region itself with what happened and "Try again"; filters stay visible and preserved.
- **no-access**: the person cannot see this set: the title stays, the content explains whom to ask for access; no primary action.
- **success**: after creating, editing or acting in bulk: brief confirmation (toast) and the affected row highlighted for a few seconds, in the position it ended up.

## Variations

### with-bulk-actions
Checkboxes in the first column and a `bulk-actions-bar` on selection.
**Favors:** high-volume triage (archiving, assigning, changing the status of dozens of items at once); reduces repeated clicks.
**Worsens:** adds a column and a selection mode that confuses people who only want to open items; raises the risk of mass destructive actions, so it requires confirmation with a count and, if possible, undo.

### cards-on-mobile
Below a breakpoint, each row becomes a card with title, status and two key attributes; the rest moves to the detail.
**Favors:** use on narrow screens without horizontal scrolling; comfortable touch.
**Worsens:** loses side-by-side comparison and column sorting; needs an explicit sort selector at the top.

### filters-in-side-panel
Filters in a left column, always open, instead of a horizontal bar.
**Favors:** sets with many combinable criteria (8+), count per option, exploratory refinement.
**Worsens:** takes width from the table; on medium screens forces horizontal scrolling; overkill for someone who only searches by name.

### grouped-by-status
Rows grouped by status (or stage), with a collapsible group header and count.
**Favors:** flows with clear stages, where the question is "what is stuck in each phase".
**Worsens:** pagination becomes ambiguous (per group or global); sorting by another column breaks the grouping, so declare which one wins.

## Anti-patterns

- The same message for "nothing created yet" and "no result for the filter".
- Filters lost when opening the detail and coming back.
- Status conveyed only by the dot's color.
- Three filled buttons in the header (create, import, export) competing for primary.
- A loose trash icon on every row, next to edit, with no confirmation.
- Pagination that goes back to page 1 after any row action.
- A table that shrinks columns until the record identifier is truncated.
- A bulk action that only acts on the visible page when the person believed they had selected everything.

## Checklist

- [ ] A single `h1` with the set's name; at most one primary action in the header.
- [ ] Visible text search; active filters shown as chips with "Clear filters".
- [ ] Filter, sort and page state preserved when returning from the detail (URL).
- [ ] `empty` and `empty-filtered` have different texts and actions.
- [ ] Status with text besides color; numbers right-aligned.
- [ ] Destructive actions in the row menu or in bulk, with a specific label and confirmation with a count.
- [ ] Skeleton on first load; no screen flashing when paginating.
- [ ] On a narrow screen, no horizontal page scrolling (cards or priority columns).
