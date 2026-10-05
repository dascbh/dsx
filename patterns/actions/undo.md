---
id: undo
title: When should you offer an Undo option?
category: actions
components: [toast, snackbar, undo-button]
type: recommendation
impact: medium
status: recommended
evidence: strong
wcag: ["4.1.3", "2.1.1", "2.2.1", "3.3.4", "1.4.1"]
related: [confirm-action, confirm-deletion, destructive-action, toast-duration, toast-vs-inline-alert]
---

# When should you offer an Undo option?

> **Rule:** Offer "Undo" right after a reversible action started by the person, with text that says what changed, and only if reverting restores the complete state.

## Context

"Undo" reverts an action that has already completed, without asking for confirmation before each interaction. It is not "Cancel", which stops something in progress, nor a trash or history, which offer persistent recovery.

People make mistakes, especially on small screens and in dense lists. Reversibility avoids imposing confirmation on everyone, but it only gives safety when it is real: an "Undo" that expires too soon, restores part of the state or does not reverse external effects creates a false sense of protection.

The person must understand what changed, which action will be reverted and what happens next.

## Decision

- **IF** the action is reversible, started by the person and an accidental mistake is plausible (archive, remove from list, move, mark, change status) **THEN** apply the change immediately and show a brief notification with "Undo".
- **IF** reverting restores content, position, relationships, selection and permissions **THEN** offer "Undo".
- **IF** the system cannot restore the exact state **THEN** do not offer "Undo".
- **IF** there is a financial, legal, privacy, external or third-party effect **THEN** use prior confirmation, a controlled delay or persistent recovery.
- **IF** the action is irreversible **THEN** ask for clear confirmation first.
- **IF** the action is still in progress **THEN** use "Cancel", not "Undo".
- **IF** the notification may disappear **THEN** also offer a trash, history or change log.
- **ELSE** simple feedback with no action.

## When to use

- A reversible action with a restorable previous state.
- A visible, understandable result.
- A fast, reliable reversal.
- Another recovery path exists for important cases.

## When to avoid

- Irreversible action → **use instead:** prior confirmation.
- Financial or legal effect → **use instead:** confirmation or a controlled delay.
- Sensitive data already shared → **use instead:** confirmation before sharing.
- Immediate effect on third parties → **use instead:** confirmation.
- Action in progress → **use instead:** "Cancel".

## Do

- Name what changed and the affected object.
- Use a single clear action.
- Revert atomically, without duplicating or losing data.
- Confirm the reversal with new feedback.
- Ensure keyboard support and an accessible name.

## Avoid

- A generic "Undo" without context.
- Reverting only part of the action.
- Relying on time alone to recover something important.
- Several competing notifications.
- Promising what the system cannot deliver.

## Accessibility

- Announce the result in a status region, without moving focus (4.1.3).
- "Undo" operable by keyboard, touch and assistive technology (2.1.1), with a name that mentions the object when needed.
- Do not rely on color, icon, position or the notification disappearing alone (1.4.1).
- If time is limited, give enough time or a persistent path (2.2.1).
- For relevant actions, the reversal mechanism supports error prevention (3.3.4).

## Microcopy

| Situation | Example |
|---|---|
| Archive | "Conversation archived. Undo" |
| Remove from list | "Item removed from the list. Undo" |
| Reversal completed | "Conversation restored." |
| Accessible name | "Undo archiving the conversation" |
| Persistent recovery | "You can also restore it from the Trash." |

## Verification checklist

- [ ] The action can truly be reverted.
- [ ] The reversal restores the complete state.
- [ ] The message explains what changed.
- [ ] The "Undo" label is specific.
- [ ] The change appears immediately.
- [ ] The reversal is atomic and reliable.
- [ ] The control works by keyboard.
- [ ] Focus is not moved unnecessarily.
- [ ] The status is announced to assistive technology.
- [ ] There is a persistent alternative for relevant actions.
- [ ] The pattern does not replace a needed confirmation.

## Rationale

- Nielsen Norman Group (10 heuristics, user control and freedom): allow unwanted actions to be reverted.
- Baymard Institute (accidental taps): reversibility as a lower-friction alternative to confirmation.
- WCAG 2.2, 4.1.3, and ARIA22 technique: a status message without receiving focus.
- Material Design (Snackbars): a single "Undo" action; a temporary action cannot be the only path.
- Adobe Spectrum and React Spectrum (Toast): an optional action related to the message.
- IBM Carbon (Notification usage): one contextual action per notification.
- VA.gov Design System (Snackbar): undo and dismiss with feedback on the reversal.
- Interaction Design Foundation: action history and reversal in error handling.
