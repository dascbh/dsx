---
id: confirmation-dialog
title: Confirmation dialog
summary: Short interruption that asks for an explicit decision before an action with serious consequences, saying what will happen and to what.
register: [operational, consumer]
when-to-use: IF the action is irreversible, affects other people or has a high cost and cannot be undone afterwards THEN use a confirmation dialog
avoid-when: the action is reversible (offer undo), is frequent and low-risk, or the confirmation would just be a habit of clicking yes
regions: [dialog-header, dialog-body, dialog-footer]
primary-action: { region: dialog-footer, position: bottom-right, max: 1 }
states: [open, running, error, success]
patterns: [confirm-action, confirm-deletion, destructive-action, undo, button-text, close-modal, keyboard-focus, button-hierarchy, double-submit, confirm-ai-action, when-to-use-modal]
variations: [simple-confirmation, type-to-confirm, undo-instead-of-confirm, confirmation-with-consequences]
rules: [T1, T2, T5, T6, T7, F4]
---

# Confirmation dialog

"Delete project", "Send 12 orders to suppliers", "Revoke Ana's access", "Apply the agent's suggestions to 300 items". Confirmation exists to give one last conscious chance, and it only works if it is rare. Confirming everything trains the person to click without reading, and the confirmation that mattered slips by.

## When to use

- **IF** the action cannot be undone (permanent deletion, sending to third parties, charging) **THEN** use a confirmation dialog.
- **IF** the action can be undone **THEN** do not confirm: run it and offer undo (`undo-instead-of-confirm` variation).
- **IF** the target has a large impact (a whole organization, a project with many people's data) **THEN** use `type-to-confirm`.
- **IF** the action affects several items or has side effects **THEN** use `confirmation-with-consequences`, with a count and examples.
- **IF** the action was proposed by an AI agent **THEN** the confirmation shows exactly what will be done and to which items, and the person decides; never run it by default.
- **ELSE** (a common, low-risk action) **THEN** run it directly with feedback.

## Region map

```
┌──────────────────────────────────────────┐
│ dialog-header                             │
│  Delete the project "Acquisition Beta"?   │
│  (h2)                                     │
├──────────────────────────────────────────┤
│ dialog-body                               │
│  The 48 documents and the checklist will  │
│  be deleted. This action cannot be        │
│  undone.                                  │
├──────────────────────────────────────────┤
│ dialog-footer  [Cancel] [Delete project]  │
└──────────────────────────────────────────┘
```

## What goes in each region

- **dialog-header**: a question with the verb and the named target ("Delete the project Acquisition Beta?"), never "Are you sure?" or "Attention".
- **dialog-body**: the concrete consequence in one or two sentences: what disappears, who is affected, whether it can be undone; when there is one, the type-the-name field, with a visible label.
- **dialog-footer**: "Cancel" before the action, in the product's order; the action repeats the verb and object ("Delete project") and uses the destructive style when it erases or revokes.

## Actions

- **Primary:** one, in the `dialog-footer`, bottom-right: the action's own verb with an object; destructive with the danger style. Never "Confirm", "Yes" or "OK".
- **Initial focus:** on "Cancel" (or on the type field) when the action is destructive; Enter must not run the destructive action by accident.
- **Cancel / Esc / ✕:** close with no effect and return focus to the originating control.
- **Execution:** blocks double clicks; the dialog only closes after the result.

## States

- **open**: question, consequence and actions; in the type variation, the action stays disabled until the text matches, with the rule stated in the label.
- **running**: the action with an indicator, both buttons locked; for long batches, progress.
- **error**: failure: a message in the body saying what did not happen (and, in a batch, how many items went through and how many did not), an option to try again.
- **success**: the dialog closes, a brief confirmation on the originating screen with the result ("Project deleted"); in a batch, a summary with a count.

## Variations

### simple-confirmation
Question, consequence, Cancel and the action.
**Favors:** irreversible actions on a single target with moderate impact.
**Worsens:** if used for everything, it becomes an automatic click.

### type-to-confirm
The person types the target's name to enable the action.
**Favors:** high-impact targets; prevents reflex confirmation.
**Worsens:** high friction; used on common actions, it annoys and gets bypassed with copy and paste.

### undo-instead-of-confirm
No dialog: the action runs and a notification offers "Undo" for a few seconds.
**Favors:** reversible, frequent actions (archive, move); a flow without interruption.
**Worsens:** requires that the system can truly undo; the notification must last long enough and be reachable by keyboard.

### confirmation-with-consequences
A body with a count, a short list of the affected items (the first ones and "N more") and side effects.
**Favors:** bulk actions and agent proposals; the person sees the real reach.
**Worsens:** a larger dialog; a long list needs its own scrolling and a summary at the top.

## Anti-patterns

- "Are you sure?" with "Yes" and "No" buttons.
- Confirmation for a reversible, frequent action.
- Initial focus on the destructive button.
- A destructive button styled like a common primary.
- A confirmation that does not say what will be lost.
- A confirmation opened over another dialog.
- An agent action run before the person sees its reach.

## Checklist

- [ ] Used only for irreversible, high-cost actions or ones that affect others.
- [ ] A title with the verb and the named target; a body with the concrete consequence.
- [ ] An action with verb + object, destructive style when it erases; never a generic label.
- [ ] "Cancel" before the action; a safe initial focus.
- [ ] Execution protected against double clicks; the dialog closes only with the result.
- [ ] In a batch, a count before and a summary after.
- [ ] No stacked dialogs.
