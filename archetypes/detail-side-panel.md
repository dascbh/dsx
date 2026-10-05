---
id: detail-side-panel
title: Detail side panel
summary: Panel that slides in from the edge over the current screen to show or edit a record without losing the list or the context the person came from.
register: [operational]
when-to-use: IF the person quickly views or adjusts a record and soon returns to the list or the originating screen THEN use a detail side panel
avoid-when: the detail is long or is where the person works for a long time (use its own page or master-detail), the task needs the full width, or it would open another panel or dialog on top
regions: [panel-header, panel-body, panel-footer]
primary-action: { region: panel-footer, position: bottom-right, max: 1 }
states: [loading, error, no-access, item-removed, editing, success]
patterns: [when-to-use-modal, when-to-avoid-modal, close-modal, keyboard-focus, tabs, action-placement, skeleton-vs-spinner, autosave-vs-save, link-vs-button, preserve-data-after-error]
variations: [overlay, push-content, read-with-page-link]
rules: [T1, T2, T3, T6, T7, F4, F5]
---

# Detail side panel

Viewing a recipient's data, checking an item's history, changing the owner of a pending item, reading a whole comment. The list stays there, at the same scroll position, with its filters intact. The panel is the answer to "I just want to look at this" without paying the cost of going and coming back.

## When to use

- **IF** the lookup is short and the person will continue through the list **THEN** use a side panel; the open row stays marked.
- **IF** the person only reads and sometimes needs the full record **THEN** use `read-with-page-link` with "Open full page".
- **IF** the person needs to interact with the list while the panel is open (open the next one, compare) **THEN** use `push-content`, which does not block the background.
- **IF** editing has more than a few fields or lasts minutes **THEN** lead to a page or to `editor-with-panel`.
- **IF** an action inside the panel needs confirmation **THEN** the confirmation replaces the panel footer or is a single dialog; never a panel over a panel.
- **ELSE** (the detail is the center of the work) **THEN** use `master-detail` or its own page.

## Region map

```
┌──────────────────────────────┬───────────────────────────────┐
│ list (originating screen,     │ panel-header                   │
│ dimmed if overlaid)           │ Record name (h2)         ✕     │
│                               │ Status · updated 2 h ago       │
│  ▌open row                    ├───────────────────────────────┤
│   row                         │ panel-body                     │
│   row                         │ [Data | History]               │
│                               │ Field: value                   │
│                               │ Field: value                   │
│                               ├───────────────────────────────┤
│                               │ panel-footer [Cancel]          │
│                               │                  [Save]        │
└──────────────────────────────┴───────────────────────────────┘
```

## What goes in each region

- **panel-header**: the record name (`h2`; the `h1` remains the originating screen's), status, close (✕) with an accessible name; optionally "previous / next" and "Open full page".
- **panel-body**: data as label: value pairs, read-only by default; editing field by field or through "Edit", which turns the block into a form; tabs when there are more than two groups. Its own scrolling.
- **panel-footer**: appears only in edit mode: "Cancel" before "Save changes"; in read mode, the panel has no footer or shows a navigation action.

## Actions

- **Primary:** one, in the `panel-footer`, bottom-right, only when editing; in read mode, no primary.
- **Close:** ✕, Esc and (in overlay mode) clicking outside; with pending edits, it asks before discarding.
- **Focus:** on opening, goes to the panel title; in overlay mode, it stays trapped in the panel; on closing, returns to the row that opened it.
- **Address:** the open record goes into the URL, so reloading and sharing opens the same panel.
- **Destructive:** under "More actions" in the header, with confirmation.

## States

- **loading**: the panel opens immediately with a skeleton; it never waits for the data before starting to slide in.
- **error**: failed to load or save: a message in the body, "Try again", typed data preserved.
- **no-access**: no permission for this record: the panel explains; the list does not offer to open what the person cannot see.
- **item-removed**: the record was deleted or moved by someone else while the panel was open: say so and offer to close; refresh the list.
- **editing**: editable fields, a footer with Cancel and Save, a pending-changes warning when trying to close.
- **success**: a brief confirmation, the panel returns to read mode with the new values, the list row updated.

## Variations

### overlay
The panel on top of the screen, the background dimmed and blocked (dialog behavior).
**Favors:** focus on the record; medium screens; short edits.
**Worsens:** the list becomes inaccessible, so opening the next one requires closing; it is modal, and every dialog rule applies.

### push-content
The panel takes a column and the list shrinks beside it, both interactive.
**Favors:** going through items with the panel open; quick comparison.
**Worsens:** the list loses columns; on medium screens it becomes too narrow, so define which columns disappear.

### read-with-page-link
A read-only panel with a summary and "Open full page" to edit and see everything.
**Favors:** quick lookups without duplicating edit forms; a single source of truth for editing.
**Worsens:** whoever only wants to adjust one field has to switch screens.

## Anti-patterns

- A panel that opens another panel or a form dialog on top.
- An `h1` inside the panel competing with the screen's.
- Closing on an outside click and discarding edits without asking.
- A panel that only starts opening after the data arrives.
- A twenty-field form inside the panel.
- Closing the panel and losing the list's scroll position and filters.

## Checklist

- [ ] An `h2` title with the record's name; the screen's `h1` preserved.
- [ ] Read-only by default; a primary only in edit mode.
- [ ] Focus on the title on opening and back on the row on closing; trapped in overlay mode.
- [ ] Closing with pending edits asks first.
- [ ] Open record reflected in the URL; list intact on closing.
- [ ] `item-removed` handled; no stacked panels or dialogs.
