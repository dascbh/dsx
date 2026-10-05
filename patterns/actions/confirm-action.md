---
id: confirm-action
title: When should you ask for confirmation before an action?
category: actions
components: [confirmation-modal, toast, review-step]
type: contextual-decision
impact: critical
status: caution
evidence: strong
wcag: ["3.3.4", "2.1.1", "2.4.3", "1.4.1"]
related: [undo, confirm-deletion, destructive-action, when-to-use-modal]
---

# When should you ask for confirmation before an action?

> **Rule:** Ask for confirmation only for irreversible or high-cost actions; for routine, recoverable actions, execute and offer "Undo".

## Context

Each confirmation inserts a pause between intent and result. The pause prevents serious errors, but it gets in the way of the task and, if frequent, teaches people to click without reading.

The name of the action decides nothing: "delete", "send" and "change" may be trivial or serious. What decides is reversibility, reach, how predictable the consequence is and the cost of a mistake.

Effort should follow risk. A ritual applied to every deletion spends the person's attention precisely when they need it most.

## Decision

- **IF** the action is routine and reversible **THEN** execute it immediately and offer "Undo" for long enough.
- **IF** the action is simple, immediate and high-risk (permanent deletion, removing access) **THEN** use a short confirmation dialog.
- **IF** the action involves a purchase, contract, transfer or submission with several important details **THEN** use a review step that allows correction before finishing.
- **IF** the action is irreversible and far-reaching (many items, many people, a critical resource) **THEN** use reinforced confirmation, such as typing the resource name.
- **IF** the consequence is already obvious and recoverable **THEN** do not confirm.
- **IF** the button label is ambiguous **THEN** fix the label instead of compensating with a dialog.
- **ELSE** do not add confirmation; saving and editing should never require one.

Before deciding, weigh four factors: whether it can be undone, whether the potential damage is high, whether the consequence is expected and how much data or how many people will be affected.

## When to use

- Before an irreversible action or one with significant loss.
- For legal or financial commitments.
- When deleting many items or users.
- When removing access, ownership or permissions.
- Before publishing or sending to many people.
- When the consequence is not evident from the context.

## When to avoid

- Routine, reversible actions → **use instead:** immediate execution with "Undo".
- After every save or small edit → **use instead:** save without interruption and confirm the result.
- Repeating a decision the person already reviewed → **use instead:** proceed directly.
- A merely informative notice → **use instead:** inline message or toast.

## Do

- Name the action and the object in the title ("Delete project?").
- Explain the consequence and say whether recovery is possible.
- Show the quantity, destination or reach when it changes the decision.
- Repeat the specific verb on the confirm button.
- Keep "Cancel" visible as the safe exit.
- Confirm the result after the action.

## Avoid

- Asking "Are you sure?".
- Using "Yes", "No" or "OK" as labels.
- Stacking dialogs in sequence.
- Relying on red alone to signal risk.
- Requiring typing when the risk does not justify it.
- Removing the safe exit.

## Accessibility

- Implement it as a modal dialog with a programmatic name and description (aria-labelledby and aria-describedby).
- On open, move focus inside, make the background inert and keep the keyboard in the modal.
- For dangerous actions, put initial focus on the safe option and do not make the destructive button the Enter default.
- Escape equals cancel.
- On close, return focus to the originating control, or to another logical point if it no longer exists.
- Do not use color, icon or position alone as a risk signal (1.4.1).
- Financial and legal transactions and data changes must be reversible, checked or confirmable (3.3.4).
- Test with keyboard, screen reader, zoom and different text sizes.

## Microcopy

| Situation | Example |
|---|---|
| Deletion title | "Delete the project Budget 2026?" |
| Consequence | "The 14 files will be deleted and cannot be recovered." |
| Destructive button | "Delete project" |
| Safe exit | "Cancel" |
| Reversible action | "Task archived. Undo" |
| Removing access | "Remove Ana Lima's access?" |

## Verification checklist

- [ ] The action cannot be handled with "Undo" alone.
- [ ] The title names the action and the object.
- [ ] The message describes the consequence and says whether recovery is possible.
- [ ] The confirm button repeats the action's verb.
- [ ] "Cancel" is visible.
- [ ] Initial focus is on the safe option.
- [ ] Escape cancels the dialog.
- [ ] Focus returns to a logical point on close.
- [ ] Risk is not conveyed by color alone.
- [ ] Saving and editing do not trigger confirmation.

## Rationale

- Nielsen Norman Group, error prevention: eliminate error-prone conditions or confirm before commitment, prioritizing high-cost errors.
- Nielsen Norman Group, user control and freedom: clear exits, cancellation and undo.
- WCAG 2.2, criterion 3.3.4 and technique G168: reversal, checking or confirmation for important transactions, without requiring confirmation on every save.
- Apple Human Interface Guidelines, alerts: reserve alerts for critical actions and use specific titles and buttons.
- GitHub Primer, deletion pattern and confirmation dialog: friction proportional to cost, safe initial focus, focus return.
- IBM Carbon, danger modal: destructive confirmation with the resource identified.
- Atlassian Design System and PatternFly, modal guidelines: confirmation that names the record and describes what will be lost.
