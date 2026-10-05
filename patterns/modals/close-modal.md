---
id: close-modal
title: How should a modal be closed correctly?
category: modals
components: [modal, button]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["2.1.2", "2.4.3", "2.4.7", "4.1.2"]
related: [when-to-use-modal, when-to-avoid-modal, confirm-action, keyboard-focus]
---

# How should a modal be closed correctly?

> **Rule:** Every modal has a visible, named exit, discards data only after confirmation and returns focus to the element that opened it.

## Context

Closing a modal is more than removing a layer from the screen. The person needs to know which action ends the dialog, what happens to what they typed and where focus will land.

Without a clear exit, people get stuck, lose data or cannot tell whether the task finished. For keyboard and screen reader users, losing the return point is completely disorienting.

Close, cancel, save and discard are different actions and must have different labels.

## Decision

- **IF** the modal is opened by a control **THEN** return focus to that control on close.
- **IF** the task can be abandoned **THEN** offer "Cancel" next to a primary action with a specific verb.
- **IF** the modal has an icon-only close button **THEN** give it the accessible name "Close".
- **IF** there is unsaved data **THEN** keep it or ask for explicit confirmation before discarding.
- **IF** Escape can close without loss **THEN** enable Escape; **IF** it would erase work **THEN** trigger a confirmation.
- **IF** the modal is transactional **THEN** favor "Cancel" and the primary action rather than relying on the X alone.
- **ELSE** keep the X visible in the corner of the dialog.

## When to use

- Modals with a visible, understandable exit.
- Cases where closing, cancelling and saving have different effects.
- Dialogs where focus can return to the trigger.

## When to avoid

- An X with no accessible name as the only exit → **use instead:** a button with `aria-label="Close"` plus a text action.
- Ambiguous "Yes", "No" or "OK" → **use instead:** specific verbs.
- A long, scrolling flow inside the modal → **use instead:** its own page.

## Do

- Name the close button.
- Distinguish close, cancel and save in the labels.
- Confirm before discarding data.
- Remove the background lock on close.
- Return focus to the trigger.

## Avoid

- Silently discarding data.
- Letting focus escape behind the modal.
- Using "Yes"/"No" on their own.
- Losing the context of the originating screen.

## Accessibility

- Use `role="dialog"`, a title via `aria-labelledby` and `aria-modal="true"` only if the background is truly inert.
- On open, move focus to a suitable control; Tab and Shift+Tab stay inside the modal (WCAG 2.1.2, 2.4.3).
- Visible focus on every control (WCAG 2.4.7).
- An icon without text needs an accessible name (WCAG 4.1.2).
- Test with keyboard, zoom and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Icon button | "Close" |
| Abandon task | "Cancel" |
| Save | "Save changes" |
| Confirm discard | "Discard changes" / "Keep editing" |

## Verification checklist

- [ ] Is there a visible close button?
- [ ] Does the button have an accessible name?
- [ ] Do close, cancel and save have distinct labels?
- [ ] Does Escape close when no data would be lost?
- [ ] Does focus stay inside the modal while it is open?
- [ ] Does focus return to the trigger on close?
- [ ] Is unsaved data preserved or confirmed?
- [ ] Does the background become interactive again?

## Rationale

- W3C WAI-ARIA APG (Dialog Modal): initial focus, containment, Escape, return to trigger, accessible name.
- IBM Carbon (Modal, accessibility and usage): Tab cycle, Escape, X, difference between passive and transactional modals.
- GOV.BR Digital Standard (Modal): distinct, well-bounded actions.
- U.S. Web Design System (Modal): interaction behaviors.
- AMAWeb (accessibility checklist): keyboard, focus and identification checks.
