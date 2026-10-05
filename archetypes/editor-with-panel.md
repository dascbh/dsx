---
id: editor-with-panel
title: Editor with panel
summary: Production screen for a document or complex object, with the editing area in the center and a supporting side panel (comments, variables, suggestions, checks).
register: [operational, editorial]
when-to-use: IF the person builds or changes long content and needs contextual support without leaving it THEN use an editor with panel
avoid-when: the content is a form with few fields (use form dialog or settings), the document is frozen (use document viewer), or there is no side support that justifies the panel
regions: [page-header, toolbar, editing-area, side-panel, status-bar]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, saving, saved, conflict, error, no-access, read-only, success]
patterns: [autosave-vs-save, undo, preserve-data-after-error, tabs, review-ai-output, label-ai-content, ai-sources, session-expired, icon-only-button, disabled-button, success-confirmation]
variations: [fixed-right-panel, collapsible-panel, tabbed-panel, focus-without-panel]
rules: [T1, T3, T4, T6, T7, F5]
---

# Editor with panel

A purchase order with many lines, a technical specification, a document template, a complex rule: the person spends hours here. The editing area needs calm and width; the panel brings what helps to write it right: comments, fields to fill, approved alternatives, checks, AI suggestions. The header says what state the work is in and what the next step of the lifecycle is.

## When to use

- **IF** the content is long and edited across several sessions **THEN** use an editor with panel with autosave and an always-visible status indicator.
- **IF** there is contextual support the person consults while writing (comments, variables, catalog items, checks) **THEN** that support goes in the `side-panel`, never in a dialog that covers the text.
- **IF** the panel has more than one kind of support **THEN** use the `tabbed-panel` variation; do not stack everything in one scrolling panel.
- **IF** parts of the content are generated or suggested by AI **THEN** mark the origin, show the basis and require explicit acceptance before it enters the text.
- **IF** something blocks the next step (pending item, required field, deviation to approve) **THEN** the primary stays disabled with the reason, and the panel lists the pending items with a link to each point in the text.
- **ELSE** (short content, no support) **THEN** a page form or `form-dialog` is enough.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header ‹ Orders / Title (h1)      Draft     [Primary]     │
├──────────────────────────────────────────────────────────────┤
│ toolbar  B I U · Heading ▾ · Insert ▾ · ↶ ↷                  │
├──────────────────────────────────────────┬───────────────────┤
│ editing-area                             │ side-panel         │
│                                          │ [Comm.|Fields|✓]   │
│   Text at reading width                  │ • Pending item 1 → │
│   (60–80 characters per line)            │ • Comment by Ana   │
│                                          │ • Suggestion (AI)  │
├──────────────────────────────────────────┴───────────────────┤
│ status-bar  Saved 10 s ago · 2 pending items · 3,412 words     │
└──────────────────────────────────────────────────────────────┘
```

## What goes in each region

- **page-header**: the way back, the document title (`h1`, editable in place if it makes sense), a status label (Draft, In review, Approved), the lifecycle's primary action and a "More actions" menu (duplicate, export, history, delete).
- **toolbar**: formatting and insertion grouped by function, undo/redo; icon-only buttons have an accessible name and a tooltip with the shortcut. Sticks to the top when scrolling.
- **editing-area**: the content, at reading width; passages with a special status (locked, AI-suggested, commented) marked with more than one signal (color + icon or underline + label).
- **side-panel**: contextual support tied to the point in the text: clicking a panel item goes to the passage, and selecting a passage filters the panel. AI items carry an origin label and "Accept", "Edit", "Discard" actions.
- **status-bar**: save status with a timestamp, the count of pending items (link to the panel), content metrics. Messages here are polite `aria-live`.

## Actions

- **Primary:** one, in the `page-header`, top-right: move the lifecycle forward ("Send for approval", "Export order"). Save is not the primary when there is autosave.
- **Blocking:** the primary is disabled while there is a blocking pending item, with the reason next to it ("2 pending items prevent sending") and a path to resolve them.
- **Undo:** undo/redo always available for editing; an action that cannot be undone (send, freeze version) asks for confirmation.
- **Destructive:** deleting the document only in the "More actions" menu, with a confirmation that names the document.

## States

- **loading**: a skeleton of the text and the panel; the toolbar appears disabled until the content arrives.
- **saving**: a discreet indicator in the status bar ("Saving…"); never blocks typing.
- **saved**: "Saved at 14:32" or "10 s ago"; the person knows they can close.
- **conflict**: another person or session changed the same content: warn before overwriting, show who and when, and offer to compare, keep mine or reload theirs.
- **error**: save failed: a persistent alert (not a toast that disappears) with "Try again"; the typed text stays in the editor and, if possible, in a local copy.
- **no-access**: no permission to edit or view: the screen explains; if they can view but not edit, go to `read-only`.
- **read-only**: frozen document or no edit permission: the toolbar disappears, a banner explains the reason and the path ("Create new version").
- **success**: lifecycle step completed (sent, exported): confirmation with what happens now and the situation updated in the header.

## Variations

### fixed-right-panel
Panel always open at ~320–380 px.
**Favors:** work with many comments or pending items; review.
**Worsens:** a narrower editing area; on medium screens the text gets cramped.

### collapsible-panel
The panel opens and closes with a button (with `aria-expanded`) and remembers the person's choice.
**Favors:** focused writing with support on demand; medium screens.
**Worsens:** hidden pending items can go unnoticed, so show the count on the open button.

### tabbed-panel
One panel, several tabs (Comments, Fields, Checks, Suggestions).
**Favors:** several kinds of support without multiplying panels.
**Worsens:** the closed tab's information disappears; a tab with pending items needs a visible counter.

### focus-without-panel
Writing mode: panel and toolbar collapsed, only the text and the status bar.
**Favors:** long writing without distraction.
**Worsens:** support and pending items are out of sight; the way out of the mode must be obvious.

## Anti-patterns

- A "Save" button as the primary next to autosave (two models at once).
- A save failure communicated by a toast that disappears.
- An AI suggestion inserted straight into the text, with no label and no acceptance.
- Comments in a modal dialog that covers the commented passage.
- A disabled primary that does not say what is missing.
- Locked passages indicated only by background color.
- Leaving the screen without warning when there are unsaved changes.

## Checklist

- [ ] `h1` with the document's name; situation visible in the header.
- [ ] A single save model, with status and time visible.
- [ ] One primary; disabled with a reason and a path when blocked.
- [ ] Panel tied to the text both ways (clicking goes to the passage).
- [ ] AI content labeled, with its basis and explicit acceptance.
- [ ] Conflict and save errors handled without losing text.
- [ ] Toolbar icons with an accessible name; special statuses with more than one signal.
- [ ] Visible way back and a warning when leaving with pending changes.
