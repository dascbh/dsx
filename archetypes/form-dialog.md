---
id: form-dialog
title: Form dialog
summary: Short modal window that collects a little data to create or change something without taking the person away from the screen they are on.
register: [operational, consumer]
when-to-use: IF the task asks for few fields, starts from a screen and should return to it when done THEN use a form dialog
avoid-when: there are more than ~6 fields or sections, the person needs to consult the screen behind to fill it in, filling it takes minutes, or it would open another dialog on top
regions: [dialog-header, dialog-body, dialog-footer]
primary-action: { region: dialog-footer, position: bottom-right, max: 1 }
states: [open, field-error, submitting, error, success]
patterns: [when-to-use-modal, when-to-avoid-modal, close-modal, label-vs-placeholder, required-fields, validation-timing, error-placement, preserve-data-after-error, double-submit, action-placement, keyboard-focus, field-order]
variations: [short-dialog, sectioned-dialog, promote-to-page]
rules: [T1, T2, T4, T6, T7, F4]
---

# Form dialog

"New member", "Rename document", "Add recipient", "Record shipment": one-minute tasks that start in a list or a detail and should bring the person back to the same place, with the result in view. The dialog holds attention on the short task; when the task grows, it becomes a trap.

## When to use

- **IF** the task has up to ~6 fields and one decision **THEN** use a form dialog.
- **IF** the person needs to look at data on the screen behind to fill it in **THEN** use `detail-side-panel` (it does not block the background) or a page form.
- **IF** the form needs to open another dialog (pick an item, create something auxiliary) **THEN** solve it inside the same dialog (search field, content swap with "back") or promote it to a page; never stack dialogs.
- **IF** filling it in may take minutes or needs a draft **THEN** use `promote-to-page` or `step-wizard`.
- **ELSE** (only confirming an action, with no data) **THEN** it is a `confirmation-dialog`.

## Region map

```
┌──────────────────────────────────────────┐
│ dialog-header  New member (h2)   ✕        │
├──────────────────────────────────────────┤
│ dialog-body                               │
│  Short context sentence (optional)        │
│  Name *        [____________________]     │
│  Email *       [____________________]     │
│  Role          [Member            ▾]      │
│                help text                  │
├──────────────────────────────────────────┤
│ dialog-footer   [Cancel] [Add member]     │
└──────────────────────────────────────────┘
```

## What goes in each region

- **dialog-header**: a title with verb + object ("Add member"), tied to the dialog as its accessible name; a close button (✕) with an accessible name.
- **dialog-body**: at most one sentence of context; fields in one column, a visible label above each field, required fields marked according to the product's policy, short help below. A system error appears at the top of the body, not in a toast.
- **dialog-footer**: "Cancel" (secondary) before the primary, in the order the product declares; the primary repeats the title's verb.

## Actions

- **Primary:** one, in the `dialog-footer`, bottom-right, labeled verb + object; Enter in a single-line field submits.
- **Cancel / close / Esc / click outside:** close with no effect; if data was typed, they ask before discarding (or clicking outside does not close).
- **Focus:** on opening, goes to the first field; trapped in the dialog while open; on closing, returns to the control that opened it.
- **Submission:** blocks double clicks; the dialog only closes after a success response.

## States

- **open**: fields empty or with current values (editing); primary enabled (validate on submit and on leaving the field; do not disable without a visible reason).
- **field-error**: a message next to the field, as text; focus on the first field with an error; the dialog stays open.
- **submitting**: the primary with an indicator, fields and closing locked.
- **error**: a system failure: an alert at the top of the body, data preserved, the primary available to try again.
- **success**: the dialog closes, a brief confirmation on the originating screen and the created/changed item highlighted on it.

## Variations

### short-dialog
Up to 3 fields, small width.
**Favors:** renaming, adding an item, one-off adjustments; a task done in seconds.
**Worsens:** nothing, as long as the task fits; the temptation is to keep adding fields.

### sectioned-dialog
4–6 fields grouped under subtitles, medium width, a body with its own scrolling and a fixed footer.
**Favors:** creating a record with basic data without leaving the list.
**Worsens:** gets close to the limit; scrolling inside a dialog hides fields and errors, so make sure the error scrolls to the field.

### promote-to-page
The same form becomes its own page with a way back to the originating screen.
**Favors:** long forms, consulting other screens, drafts, a shareable URL.
**Worsens:** loses the visual context of the originating screen; requires a way back and highlighting the result on return.

## Anti-patterns

- A dialog that opens another dialog.
- A title "Attention" or "Form" and a primary "OK".
- A placeholder instead of a label.
- Closing the dialog before the server's response and showing the error afterwards, with the data already gone.
- A click outside that discards a filled-in form without asking.
- A system error in a toast behind the dialog.

## Checklist

- [ ] A title with verb + object, tied as the dialog's accessible name.
- [ ] Up to ~6 fields, visible labels, one column.
- [ ] One primary; "Cancel" before it in the product's order.
- [ ] Initial focus on the first field, trapped in the dialog, returned on closing.
- [ ] Closing with data asks before discarding.
- [ ] Errors at the field; system errors in the body; data preserved.
- [ ] No stacked dialogs.
