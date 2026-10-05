---
id: confirm-deletion
title: When should you ask for confirmation before deleting?
category: actions
components: [modal, button, snackbar]
type: contextual-decision
impact: high
status: caution
evidence: strong
wcag: ["3.3.4", "2.4.3", "2.1.2", "1.4.1"]
related: [destructive-action, undo, confirm-action, close-modal]
---

# When should you ask for confirmation before deleting?

> **Rule:** Ask for confirmation only when the deletion is irreversible, broad or hard to recover from; otherwise, execute it and offer "Undo".

## Context

Deleting is not the same as disappearing from the screen. Before blocking the flow with a modal, weigh the impact, reversibility and reach of the action.

Confirmation used indiscriminately becomes noise and encourages automatic clicking. Deleting without explaining the consequence, on the other hand, causes loss of work, records or access. Protection should be proportional, without adding an extra step to every simple deletion.

The confirmation must explain the consequence, not just ask "are you sure?".

## Decision

- **IF** the deletion is easily reversible or the item can be recreated at no cost **THEN** execute it and show "Undo"; do not open a modal.
- **IF** it is irreversible, involves important data or is hard to recover from **THEN** confirm.
- **IF** several items are deleted at once **THEN** confirm, showing the quantity and the names (or a summary).
- **IF** it affects other people, records or settings **THEN** confirm, describing the effect.
- **IF** the impact is high or critical **THEN** require additional confirmation, such as typing the resource name.
- **IF** you confirm **THEN** use the title "Delete <object>", a "Delete" button and "Cancel"; never "Yes"/"No".
- **IF** the modal opens **THEN** put initial focus on "Cancel" and do not perform the deletion on Esc.
- **ELSE** show success feedback after deleting, with no extra modal.

## When to use

- A deletion that cannot be undone.
- Important or hard-to-recreate data.
- Bulk deletion.
- An action that affects third parties or settings.

## When to avoid

- Reversible action → **use instead:** "Undo".
- Small, repetitive actions → **use instead:** direct execution with feedback.
- A modal just to say it finished → **use instead:** a success toast.

## Do

- Identify the item or the quantity.
- Describe the consequence.
- Use a specific verb on the button.
- Scale the confirmation to the impact.

## Avoid

- "Are you sure?" as the only message.
- "Yes" and "No" buttons.
- Confirming every deletion.
- Hiding the consequence.
- Using color as the only warning.

## Accessibility

- Modal with an associated title and description; the title identifies the action ("Delete project").
- Initial focus on the safe option; focus contained in the modal; Esc cancels without deleting; focus returns to the trigger (WCAG 2.4.3, 2.1.2).
- Clear names, visible focus and a perceivable difference that does not rely on color alone (WCAG 1.4.1).
- Meets the protection required by WCAG 3.3.4 for deleting controllable data.

## Microcopy

| Situation | Example |
|---|---|
| Title | "Delete project Budget 2026?" |
| Consequence | "The 14 files will be deleted and cannot be recovered." |
| Buttons | "Delete" / "Cancel" |
| Strong confirmation | "Type the project name to confirm." |
| Reversible | "Task deleted. Undo" |

## Verification checklist

- [ ] Is the deletion irreversible or hard to recover from?
- [ ] Does the text identify the item or the quantity?
- [ ] Is the consequence explained?
- [ ] Does the button say "Delete" and is there a "Cancel"?
- [ ] Was "Undo" considered as an alternative?
- [ ] Does the modal appear only when the impact justifies it?
- [ ] Does Esc avoid performing the deletion?
- [ ] Does focus start on the safe option and return to the trigger?
- [ ] Is there feedback after deleting?

## Rationale

- IBM Carbon (Remove pattern, Modal Usage): impact levels, proportional confirmation, typing the name in critical cases, danger modal.
- Adobe Spectrum (Alert Dialog): destructive variant and a label consistent with the action.
- GOV.BR Digital Standard (Modal): specific titles and actions; avoid "Are you sure?" and "Yes/No".
- U.S. Web Design System (Alert): more intrusive confirmation for destructive actions.
- W3C WAI-ARIA APG (Dialog Modal): focus, keyboard, Escape, accessible name.
- AMAWeb (accessibility checklist): focus and keyboard checks.
