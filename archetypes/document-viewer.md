---
id: document-viewer
title: Document viewer
summary: Reading screen for a finished document (issued order, invoice, uploaded PDF) with metadata and actions alongside, without editing the content.
register: [operational, editorial]
when-to-use: IF the person needs to read, check or dispatch a document they do not edit on this screen THEN use a document viewer
avoid-when: the person will change the text (use editor with panel), the document is short enough to fit in a side panel, or the task is comparing many documents at once
regions: [page-header, viewer-toolbar, viewer, info-panel]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, processing, error, no-access, unavailable, success]
patterns: [breadcrumbs, tabs, long-loading, skeleton-screen, link-in-new-tab, icon-only-button, temporary-failure, retry, disabled-button]
variations: [viewer-with-right-panel, fullscreen-viewer, side-by-side-comparison]
rules: [T1, T3, T6, T7, F5]
---

# Document viewer

The document is the protagonist: the issued purchase order, the invoice sent by the supplier, a final report. The person reads, checks data against metadata, downloads, forwards or records a decision. The screen does not edit the text, and makes that clear so nobody goes looking for the cursor.

## When to use

- **IF** the content is a closed file or version (issued, sent, frozen) **THEN** use a document viewer, and say in the header that it is read-only and why.
- **IF** the person checks the document against structured data (parties, amounts, dates) **THEN** that data sits in the `info-panel`, side by side with the text.
- **IF** the document has several versions **THEN** the displayed version appears in the header, and switching versions is an explicit action in the panel, never a viewer that changes on its own.
- **IF** the person needs to change the text **THEN** offer "Edit" leading to `editor-with-panel` (or "Create new version" when the current one is frozen).
- **IF** the task is comparing two versions **THEN** use the `side-by-side-comparison` variation.
- **ELSE** (short document, quick lookup from a list) **THEN** `detail-side-panel` is enough.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  ‹ Orders / Document title (h1)                    │
│   Version 3 · issued on 03/12 · read-only    [Primary act.]  │
├───────────────────────────────────────────┬──────────────────┤
│ viewer-toolbar  ‹ 2/14 › · − 100% + · ⌕   │ info-panel       │
├───────────────────────────────────────────┤                  │
│ viewer                                    │ Parties          │
│  ┌─────────────────────────────────┐      │ Amount · Term    │
│  │  document page                  │      │ Versions         │
│  │                                 │      │ History          │
│  └─────────────────────────────────┘      │                  │
└───────────────────────────────────────────┴──────────────────┘
```

## What goes in each region

- **page-header**: the way back (breadcrumbs or "‹ Back to …"), the document title as the `h1`, a status line (version, situation, date, "read-only"), the primary action and up to two secondary ones (download, share).
- **viewer-toolbar**: page navigation with "page X of Y", zoom, text search, full-screen toggle. Icon-only controls need an accessible name and a tooltip.
- **viewer**: the document at a comfortable reading width; its own scrolling; selectable text when the format allows. Search highlights visible, with a count.
- **info-panel**: structured data for checking, the list of versions with the current one marked, the event history. If it has more than three blocks, use tabs in the panel ("Data", "Versions", "History").

## Actions

- **Primary:** one, in the `page-header`, top-right: the next step in the document's lifecycle ("Send for signature", "Record receipt"). If there is no next step, the primary can be "Download".
- **Secondary:** download, print, copy link, with less emphasis; "open in new tab" warns that it opens in a new tab.
- **Unavailable:** an action that depends on state ("Send" on a document still processing) appears disabled with the reason visible.
- **Editing:** never editable in the viewer; "Edit" or "Create new version" leads to another screen.

## States

- **loading**: a page skeleton in the viewer and in the panel; the header with the title already visible.
- **processing**: an uploaded file still being converted or analyzed: say what is happening, for how long, and whether the person can leave and come back; no silent spinner for minutes.
- **error**: failed to open: an alert in the viewer with "Try again" and "Download original file" when possible; the panel stays useful.
- **no-access**: no permission for this document: the screen explains and says whom to ask; no part of the content leaks into the title.
- **unavailable**: the document existed and was removed, replaced or expired: say which, when, and lead to the current version if there is one.
- **success**: after an action (sent, recorded): brief confirmation and the header's status line updated.

## Variations

### viewer-with-right-panel
The viewer takes ~70% and the info panel stays fixed on the right.
**Favors:** checking data against the text; fast dispatch.
**Worsens:** wide documents (spreadsheets, floor plans) become small; on medium screens the panel has to collapse.

### fullscreen-viewer
Panel collapsed; the viewer takes the screen; the header reduced to the title and "Exit full screen".
**Favors:** long, attentive reading, presenting in a meeting.
**Worsens:** context disappears (version, data); the primary is one click away.

### side-by-side-comparison
Two synchronized viewers (previous × current version), with differences highlighted and "next difference" navigation.
**Favors:** reviewing changes between versions, checking invoices against the order.
**Worsens:** needs width; differences shown only by color fail, so also mark insertions/removals in the text; synchronized scrolling must be possible to turn off.

## Anti-patterns

- A viewer that looks editable (text cursor, formatting bar) on a frozen document.
- Switching the displayed version without the person asking.
- An indefinite spinner during long processing.
- Icon-only zoom and page controls with no accessible name.
- A generic title ("Document") instead of the document's name.
- No way back to the list the person came from.

## Checklist

- [ ] `h1` with the document's name; version and situation visible in the header.
- [ ] "Read-only" stated explicitly when applicable, with a path to edit or create a new version.
- [ ] One primary in the header; viewer actions with an accessible name.
- [ ] Long processing with a message, elapsed time and the option to leave.
- [ ] A viewer error does not bring down the panel; offer to download the original.
- [ ] Visible way back.
