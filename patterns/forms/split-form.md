---
id: split-form
title: When should you split a form into several steps?
category: forms
components: [form, step-indicator, back-button, continue-button]
type: contextual-decision
impact: high
status: caution
evidence: strong
wcag: ["2.4.6", "2.4.3", "1.4.1", "3.3.7", "2.2.1", "1.3.1"]
related: [form-steps, field-order, autosave-vs-save, preserve-data-after-error]
---

# When should you split a form into several steps?

> **Rule:** Cut fields before splitting screens; create steps only when there are groups with a clear goal, and then preserve the data, show progress and allow going back and reviewing.

## Context

Splitting does not simplify a form by itself. The decision comes from the task: which data form understandable groups, which sequence makes sense and how much effort reviewing, correcting and resuming will cost.

Cutting screens without cutting effort just pushes the complexity elsewhere. What weighs is the total number of fields the person reads and fills in, not only the number of screens. Each step adds navigation, load and uncertainty, and a short form can get worse when it is sliced.

Well-chosen steps provide structure, progress and recovery, and help on mobile.

## Decision

- **IF** the form has few fields **THEN** keep it on a single page.
- **IF** there are unnecessary fields **THEN** remove them before splitting; consider progressive disclosure and test a single page.
- **IF** the fields form groups with distinct goals (personal data, address, payment, review) **THEN** split by those groups.
- **IF** the order matters **THEN** use a linear sequence.
- **IF** the flow has three or more linear steps **THEN** use a step indicator.
- **IF** conditional logic changes the number of steps **THEN** do not promise a fixed total; use an indication that does not claim an inexact total.
- **IF** the person needs to compare sections at the same time **THEN** do not split.
- **IF** the person can leave and resume **THEN** save progress and preserve the data.
- **ELSE** one step per goal, never one per field.

## When to use

- Groups of fields with distinct goals.
- A natural sequence of decisions.
- A single screen that is hard to understand or use on mobile.
- A need to save, leave and resume.
- Steps that can be reviewed before completion.

## When to avoid

- A short form → **use instead:** a single page.
- Comparing sections at the same time → **use instead:** a single page with sections.
- One step per field → **use instead:** grouping by goal.
- A split that only hides unnecessary fields → **use instead:** cutting the fields.
- Data that cannot be preserved → **use instead:** a single page.

## Do

- Group related fields and give each step a clear title.
- Show the current step and the total when the number is stable.
- Offer "Back" and "Continue" separately from the indicator.
- Allow reviewing completed steps.
- Show only relevant steps and allow skipping optional ones.

## Avoid

- Too many steps that drag out progress.
- Separating dependent fields.
- Removing "Back" or erasing data when going back.
- Using the indicator as navigation.
- Splitting without testing.

## Accessibility

- A clear title and heading hierarchy per step (2.4.6, 1.3.1).
- "Step X of Y" in the title when the total is known.
- The current step marked with `aria-current`, not relying only on color (1.4.1).
- When changing step, move focus to the title or main content (2.4.3).
- Do not ask again for data already given in the same session (3.3.7); no time limit without adjustment (2.2.1).

## Microcopy

| Situation | Example |
|---|---|
| Title | "Step 2 of 4: Address" |
| Forward | "Continue" |
| Back | "Back" |
| Last step | "Review and submit" |
| Save | "Save and continue later" |

## Verification checklist

- [ ] The split represents clear goals or groups.
- [ ] A single page was considered and tested.
- [ ] Unnecessary fields were removed first.
- [ ] Each step has a clear title.
- [ ] The indicator represents the real process.
- [ ] The displayed total is reliable.
- [ ] "Back" and "Continue" have clear labels.
- [ ] Data is preserved when moving forward and back.
- [ ] The person can review completed steps.
- [ ] Focus goes to the new step.
- [ ] Tested with keyboard, screen reader, zoom and mobile.

## Rationale

- Baymard Institute (checkout): the number of fields considered weighs more than the number of steps; indicator with a 1:1 match.
- Nielsen Norman Group (form usability): short forms, logical sequence, organization by task.
- W3C WAI (Multi-page Forms): logical steps, progress, preserved data.
- USWDS (Step indicator): indicator for three or more linear steps; caution with conditional logic.
- IBM Carbon (Forms pattern): linear relationship, progress and review.
- GOV.UK Service Manual (Structuring forms): one thing per page and branching.
