---
id: action-placement
title: Where should primary and secondary actions be placed?
category: actions
components: [button, button-group, form, modal, side-panel]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["2.4.3", "2.4.7", "1.4.1", "2.5.8", "1.3.2"]
related: [button-hierarchy, button-text, close-modal, keyboard-focus]
---

# Where should primary and secondary actions be placed?

> **Rule:** Pick a single primary action from the task's goal, group the alternatives next to it with less emphasis and keep the same position across equivalent screens.

## Context

When there is more than one action, the person must quickly know which path is the goal and which are alternatives, support or cancellation. This pattern covers position, alignment and order, and complements the visual hierarchy between buttons.

There is no universal position. Page forms, modals, side panels and step flows call for different arrangements; what matters is deciding the logic once and repeating it.

The primary action comes from the task's goal, not from color or position.

## Decision

- **IF** there are several actions **THEN** choose only one high-emphasis action per context.
- **IF** it is a page form **THEN** place the action group at the end of the content, aligned with the start of the form, if that is the product's convention.
- **IF** it is a modal, side panel or progressive flow **THEN** the primary action may sit on the right (horizontal group).
- **IF** the buttons are stacked (mobile included) **THEN** the primary action takes the last position in the group.
- **IF** there is a secondary action (cancel, back, review) **THEN** place it near the primary one, with less emphasis.
- **IF** several screens are similar **THEN** repeat exactly the same order.
- **IF** the action is destructive **THEN** treat it as a role of its own, never as the primary by default.
- **ELSE** follow the product design system's convention and apply it uniformly.

## When to use

- One primary action with one or more alternatives.
- Tasks that advance, save or finish.
- Step flows, modals, panels and forms.

## When to avoid

- Two buttons with the same high emphasis → **use instead:** one primary and one secondary.
- Primary emphasis on cancel or back → **use instead:** secondary or text style.
- Unrelated actions in the same group → **use instead:** separate groups.
- Buttons pinned to the top of a long form, detached from the content → **use instead:** at the end of the content.

## Do

- Write clear labels for each action.
- Keep the visual order the same as the task order.
- Ensure spacing and touch area between actions.
- Keep the primary action easy to reach on mobile.

## Avoid

- Moving the primary button for no reason.
- Mixing unrelated actions.
- Conveying priority by color, size or position alone.
- Hiding actions far from the content.

## Accessibility

- Use a native `<button>` with a label that describes the result.
- The visual order must not contradict the reading and focus order (1.3.2, 2.4.3).
- Visible, predictable focus (2.4.7).
- The hierarchy does not depend on color alone (1.4.1).
- Adequate spacing and touch area (2.5.8); visible focus, pressed, disabled and loading states.

## Microcopy

| Situation | Example |
|---|---|
| Primary | "Save changes" |
| Secondary | "Cancel" |
| Step | "Continue" and "Back" |
| Destructive | "Delete account" |

## Verification checklist

- [ ] There is a single high-emphasis action.
- [ ] The primary action represents the task's goal.
- [ ] Secondary actions have less emphasis.
- [ ] The buttons in the group are related.
- [ ] The position is the same on equivalent screens.
- [ ] Cancel and back do not look like primary actions.
- [ ] In a form, the group comes after the content.
- [ ] When stacked, the primary action is last.
- [ ] The hierarchy works without relying on color.
- [ ] Focus is visible and the tab order follows the visual order.

## Rationale

- IBM Carbon (Button usage; Forms pattern): one high-emphasis action per context and position by interface type.
- GOV.BR Digital Standard (Button): emphasis levels and a contextual position convention.
- Apple Human Interface Guidelines (Buttons): the most likely action emphasized, and primary, cancel and destructive roles.
- Baymard Institute: emphasis, consistent position and descriptive microcopy in e-commerce, with a transferability caveat.
- W3C (Focus Order): focus order preserves meaning and operability.
