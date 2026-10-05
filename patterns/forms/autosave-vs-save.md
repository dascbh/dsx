---
id: autosave-vs-save
title: Autosave or a Save button?
category: forms
components: [form, editor, button, status-indicator]
type: contextual-decision
impact: high
status: caution
evidence: moderate
wcag: ["4.1.3", "3.3.4", "2.1.1"]
related: [undo, preserve-data-after-error, retry, confirm-action]
---

# Autosave or a Save button?

> **Rule:** Use autosave only for independent, low-risk, reversible changes, always with a visible save state; use an explicit button when there is review, a transaction or an external effect.

## Context

When a field changes, the system decides whether to store it right away or wait for an explicit action. That choice defines what the person understands as done, what they can undo and what happens when they leave the screen.

Autosave and a Save button are not the modern and the old version of the same solution: they express different commitment models. The core issue is not the click count but the gap between the real state of the system and the person's mental model.

Without feedback, the person does not know whether the change was saved, is pending, or has already triggered effects elsewhere in the product.

## Decision

- **IF** the change is independent of the others, low-risk and reversible **THEN** use per-field autosave.
- **IF** the task is long or frequent and losing work is costly **THEN** use draft autosave.
- **IF** several fields need to be reviewed or applied together **THEN** use a Save button.
- **IF** the change has a financial, legal, security, privacy or publishing effect **THEN** require an explicit action (Save, Apply, Publish).
- **IF** each write can trigger a workflow, a notification or an audit entry **THEN** do not use autosave.
- **IF** there is a draft and a final version **THEN** combine them: autosave the draft and use a button for the final commitment.
- **IF** you use autosave **THEN** show "Saving", "Saved" and failure near the content, and offer undo or revert.
- **IF** you use a button **THEN** warn when leaving with pending changes, with the options save, discard or cancel leaving.
- **ELSE** use a Save button, the most predictable model.

## When to use

- Autosave: independent settings, draft editors, long forms of isolated fields.
- Save button: groups of interdependent fields, transactions, publications, sensitive data.
- Combination: an editor with automatic drafts and manual publishing.

## When to avoid

- Silent autosave → **use instead:** a visible state indicator.
- Autosave of an entire transactional form → **use instead:** a button with review.
- Autosave of a password, permission or financial data → **use instead:** an explicit step.
- A hidden Save button, or no warning when leaving → **use instead:** a visible button and exit protection.
- The same labels for Save, Apply and Publish → **use instead:** distinct verbs by consequence.

## Do

- Define what "save" means on each screen and keep it consistent across equivalent screens.
- Define a coherent submit trigger (on leaving the field or after a pause) without promising a universal interval.
- Confirm with the server before showing "Saved".
- Preserve pending changes when saving fails.

## Avoid

- A brief toast for a failure that requires action.
- Automatically applying a high-risk or hard-to-revert change.
- Saving an incomplete group of fields as the final version.
- Hiding immediate effects such as a charge, a send or a permission change.

## Accessibility

- The save state must be text, not only color or animation.
- Expose dynamic updates as a status message without moving focus (4.1.3).
- Failures that require action go in a persistent alert with "Try again".
- Save, Discard, Undo and Try again work by keyboard, with visible focus.
- Autosave does not replace the validation or confirmation the risk requires (3.3.4).

## Microcopy

| Situation | Example |
|---|---|
| In progress | "Saving…" |
| Success | "Change saved" |
| Failure | "Couldn't save. Your changes are kept." |
| Failure action | "Try again" |
| Leaving with pending changes | "You have unsaved changes. Save, discard or keep editing?" |

## Verification checklist

- [ ] The screen shows whether the change is saving, saved or pending.
- [ ] The behavior is the same on equivalent screens.
- [ ] Autosave is used only for individual, low-risk, reversible changes.
- [ ] Fields that must be applied together use a button.
- [ ] No autosave triggers a financial, security, privacy or publishing effect.
- [ ] There is undo, revert or history.
- [ ] A save failure is visible and allows trying again.
- [ ] Leaving with pending changes offers save, discard or cancel.
- [ ] "Saved" appears only after the server confirms.

## Rationale

- Nielsen Norman Group (efficiency versus expectations): removing Save reduces the sense of control; with autosave, communicate the state and allow reverting.
- Nielsen Norman Group (Cancel vs Close): distinguish close, cancel, save and discard when work is in progress.
- GitLab Pajamas (saving and feedback): per-field autosave, inline status, retry and caution with sensitive data; a contextual guideline.
- Microsoft Power Apps (autosave in model-driven apps): visible state and a warning that automations fire on every write.
- Technical documentation of autosave in a collaborative editor: server confirmation and the risk of stale versions.
- WCAG 2.2, criterion 4.1.3: status messages without stealing focus.
