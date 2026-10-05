---
id: button-hierarchy
title: How do you set the hierarchy between primary and secondary buttons?
category: actions
components: [button, button-group]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["1.4.1", "1.4.3", "2.4.7", "2.4.3"]
related: [action-placement, button-text, disabled-button, link-vs-button]
---

# How do you set the hierarchy between primary and secondary buttons?

> **Rule:** In each action group, give the most emphasis to a single primary action and treat the alternatives with less emphasis, always visible and never distinguished by color alone.

## Context

A screen usually brings together several actions: save and cancel, continue and back, publish and save draft. The look of the buttons should signal relative priority without hiding alternatives or choosing for the person.

When every button has the same weight, the person compares options before acting. When several look primary, the priority signal is lost and hesitation or mis-clicks increase.

Hierarchy applies per area: a page may have more than one action group, but each group needs an understandable priority.

## Decision

- **IF** the group has an action that fulfills the task's goal **THEN** mark that action as primary (one per group).
- **IF** there are related alternatives (cancel, back, save draft) **THEN** use secondary emphasis and keep them visible.
- **IF** there is a third, low-priority action **THEN** use tertiary (text) emphasis instead of a second filled button.
- **IF** two actions are equally important **THEN** give both the same weight and do not force emphasis.
- **IF** the emphasis would push the person toward an option that is not clearly better **THEN** balance the weights.
- **IF** the difference between levels depends on color alone **THEN** add fill versus outline, text and position.
- **ELSE** follow the product's order convention, validated in testing, including on small screens.

## When to use

- An action that serves the goal of the screen or step.
- A group with one primary action and related alternatives.
- Pairs such as save versus cancel or continue versus back.
- A product with a consistent convention of emphasis levels.

## When to avoid

- Actions of equal priority → **use instead:** buttons with the same weight.
- An important action hidden as secondary → **use instead:** promote it to visible.
- Hierarchy by color alone → **use instead:** shape, fill, label and position.
- Emphasis used to pressure → **use instead:** balanced weights.

## Do

- Name the primary action before designing the group.
- Limit primary emphasis to one occurrence per area.
- Use labels with a verb that describe the result.
- Test the group on mobile, with zoom and in high contrast.

## Avoid

- Emphasizing every button.
- Treating the secondary as irrelevant or hiding it.
- Copying another product's positions without testing.
- Ambiguous labels such as "OK".

## Accessibility

- Do not convey priority by color alone (1.4.1).
- Ensure contrast of text and component boundaries (1.4.3, 1.4.11).
- Keep focus visible (2.4.7) and the focus order the same as the logical order of the actions (2.4.3).
- Use the native button element with an accessible name equal to the visible label.
- Validate with keyboard, zoom, screen reader and high contrast.

## Microcopy

| Situation | Example |
|---|---|
| Primary | "Publish page" |
| Secondary | "Save draft" |
| Alternative | "Cancel" |
| Step | "Continue" / "Back" |

## Verification checklist

- [ ] Each action group has at most one primary button.
- [ ] The primary button matches the task's goal.
- [ ] The alternatives stay visible and readable.
- [ ] The difference between levels does not depend on color alone.
- [ ] Labels describe the action with a verb.
- [ ] Focus order follows the logical order.
- [ ] The hierarchy holds on mobile and with zoom.

## Rationale

- Brazilian Government Digital Standard (GOV.BR), Button component: emphasis levels and limiting primary emphasis to strategic actions; position is a system convention.
- U.S. Web Design System (Button and Button group): a distinct style for the important action, short verb labels and few buttons per group.
- Atlassian Design System (Button): primary for the most important action in the area, with limited occurrence.
- Adobe Spectrum (Button and Cards): emphasis levels and hierarchy applied in context.
- WCAG 2.2, criterion 1.4.1: information must not depend on color alone.
