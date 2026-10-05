---
id: destructive-action
title: How should destructive actions be handled?
category: actions
components: [button, modal, snackbar]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["3.3.4", "2.4.3", "1.4.1", "2.1.2"]
related: [confirm-deletion, undo, confirm-action, close-modal, button-hierarchy]
---

# How should destructive actions be handled?

> **Rule:** Match protection to impact, frequency and reversibility: prefer Undo or archiving; reserve confirmation with a specific label for rare, broad or irreversible actions.

## Context

Destructive actions delete data, remove access, discard changes or affect other people. The goal is not to confirm every click, but to dose friction by the cost of a mistake.

Confirming everything causes fatigue and automatic clicking; confirming nothing exposes people to permanent loss. The decision depends on how much damage the action causes, how often it happens and whether it can be undone.

WCAG criterion 3.3.4 requires at least one safeguard (reversal, checking or confirmation) for actions that change or delete controllable data, without imposing a universal modal.

## Decision

- **IF** the action is frequent, low-impact and reversible **THEN** execute it immediately and show feedback with "Undo".
- **IF** the item can be recovered **THEN** prefer archiving, deactivating or moving to the trash.
- **IF** the action is rare, irreversible or high-impact **THEN** confirm, explaining what will be affected and whether recovery is possible.
- **IF** the deletion is in bulk or has dependencies **THEN** show quantity, scope and effects before the decision.
- **IF** the reach is very large or permanent **THEN** consider requiring the object's name to be typed; **ELSE** do not require text.
- **IF** the confirmation uses a modal **THEN** label the final button with verb + object and give danger emphasis to it alone, without relying on color alone.
- **IF** the decision is hard to reverse **THEN** put initial focus on cancel or on the least destructive option.
- **IF** it removes a link (rather than deleting the resource) **THEN** use less friction and "remove" wording.
- **ELSE** do not interrupt the flow with a dialog.

## When to use

- Permanent deletion and discarding without recovery.
- Removing access or members.
- Bulk actions or actions that affect third parties.
- Changes that are hard to reverse.

## When to avoid

- Routine, reversible actions → **use instead:** Undo.
- A modal only to inform → **use instead:** inline message or toast.
- A generic confirmation or hidden consequence text → **use instead:** a specific title and button.
- Typing a phrase for every deletion → **use instead:** reserve it for far-reaching cases.

## Do

- Name the action and the object in the title and on the button.
- Explain the consequence visibly.
- Keep Cancel clear and easy to reach.
- Return focus to a logical destination on close.

## Avoid

- "Yes", "OK", "Confirm" labels.
- Several destructive actions competing for emphasis.
- Hiding the action's reach.
- Removing the recovery path where one existed.

## Accessibility

- A semantic dialog with an associated name and description; inert background (a real modal).
- Focus enters the dialog, Tab and Shift+Tab stay contained, Esc closes when appropriate (WCAG 2.1.2, 2.4.3).
- On close, return focus to the trigger; if it is gone, move it to a logical, stable destination.
- Risk communicated in text, not color, icon or position alone (WCAG 1.4.1).

## Microcopy

| Situation | Example |
|---|---|
| Final button | "Delete project" |
| Discard | "Discard changes" |
| Cancel | "Cancel" or "Keep editing" |
| Consequence | "This action cannot be undone. The project's 12 files will be removed." |
| Reversible | "Item deleted. Undo" |

## Verification checklist

- [ ] Were impact, reach and reversibility defined?
- [ ] Do reversible actions use Undo instead of a modal?
- [ ] Does the final button carry a verb and an object?
- [ ] Is the consequence explicit?
- [ ] Does only the destructive command have danger emphasis?
- [ ] Is Cancel clear and accessible?
- [ ] Do bulk deletions show the scope?
- [ ] Does focus enter, stay contained and return to a logical destination?
- [ ] Does the decision work without relying on color?

## Rationale

- WCAG 2.2, 3.3.4 (Error Prevention): reversal, checking or confirmation for changing or deleting data.
- W3C WAI-ARIA APG (Dialog Modal): focus, keyboard cycle, return; start on the least destructive option.
- Apple Human Interface Guidelines (Alerts): sparing use; confirm only rare, irreversible actions.
- IBM Carbon (Modal Usage): danger variant, title and button describe the action.
- GitHub Primer (Delete and ConfirmationDialog): friction proportional to the cost of error; initial focus on cancel.
- GOV.UK Design System (Button): warning button for serious consequences; do not rely on color alone.
