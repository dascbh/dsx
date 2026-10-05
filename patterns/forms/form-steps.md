---
id: form-steps
title: How do you structure steps in long forms?
category: forms
components: [step-indicator, form, button, review-summary]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["1.3.1", "2.4.6", "3.3.1", "3.3.4", "2.2.1"]
related: [split-form, preserve-data-after-error, field-order, autosave-vs-save, validation-timing]
---

# How do you structure steps in long forms?

> **Rule:** Organize each step by goal, show position and progress separately from navigation, and preserve, allow reviewing and recover data when moving forward, going back or resuming.

## Context

Once it is decided that the form needs steps, the structure determines whether the person knows where they are, what is left and how to fix what they entered. A step is not a visual slice of the page: it is a goal or a set of decisions, linked to the others, that allows moving forward, going back, reviewing and resuming without losses.

Whether to split at all is covered by the related pattern; this one is about how to structure.

Steps reduce what is visible at a time, but add navigation, waiting and uncertainty. A controlled study with healthcare professionals found a single page better for that task; in checkout, perceived effort and the number of fields weigh more than the number of steps alone. So each step must organize a real part of the task, not hide fields.

## Decision

- **IF** the split is by number of fields **THEN** redo it by goal or group of decisions.
- **IF** fields depend on one another **THEN** keep them in the same step.
- **IF** the flow is linear with 3 or more high-level steps **THEN** show an indicator with the current, completed and remaining steps.
- **IF** the total number of steps changes by condition **THEN** do not promise a fixed "Step X of Y".
- **IF** the total is reliable **THEN** show "Step X of Y" in the step header.
- **IF** there is an indicator **THEN** keep it separate from the buttons; the indicator orients and the buttons act.
- **IF** the person goes back or forward **THEN** preserve every answer.
- **IF** the task has an important consequence **THEN** show a summary for review before submitting and allow editing completed steps.
- **IF** there is an error **THEN** tie it to the field and keep the valid answers.
- **ELSE** label the last action specifically ("Review and submit", "Finish").

## When to use

- Three or more high-level groups in an understandable sequence.
- Each step with its own goal and a short title.
- Dependencies between decisions that make the order matter.
- A product able to preserve, review and recover data.

## When to avoid

- A short form → **use instead:** a single page.
- Comparing fields from different groups → **use instead:** the same page.
- Splitting just to hide fields → **use instead:** cutting unnecessary fields.
- Answers that cannot be preserved → **use instead:** a single page.
- The indicator as the only means of navigation → **use instead:** Back and Continue buttons.

## Do

- Give each step a title that states its outcome.
- Keep Back and Continue in a predictable position and behavior.
- Test the complete task with people.

## Avoid

- Many tiny steps.
- Fragmenting a single decision.
- Erasing data when going back.
- Using the indicator as a menu.

## Accessibility

- A semantic heading per step; the current step identifiable by text and structure, not only color (1.3.1, 2.4.6).
- Indicator as an ordered list with `aria-current="step"` on the current item (an implementation technique, not a standalone requirement).
- Necessary instructions repeated on every step; optional steps identified.
- Avoid a hard time limit; if indispensable, allow extending it (2.2.1).
- Review before a critical submit (3.3.4); errors associated with the fields (3.3.1).
- Everything operable by keyboard, zoom and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Position | "Step 2 of 4: Delivery address" |
| Forward | "Continue" |
| Back | "Back" |
| Last | "Review and submit" |
| Resuming | "We picked up where you left off." |

## Verification checklist

- [ ] Each step represents a goal or a group of decisions.
- [ ] Related fields stay together.
- [ ] The step title says what to do.
- [ ] The current step can be identified without relying on color.
- [ ] Progress shows what is done and what remains.
- [ ] The indicator is separate from the navigation buttons.
- [ ] Going back does not erase data.
- [ ] There is a review before submitting when there is an important consequence.
- [ ] Errors stay associated with the fields.
- [ ] The flow was tested with screen reader, keyboard and zoom.

## Rationale

- W3C WAI (multi-page forms): logical groups, repeated instructions and progress communication.
- W3C WAI, technique ARIA26: `aria-current` to identify the current item.
- U.S. Web Design System (Step indicator): linear flows with three or more steps, indicator separate from navigation.
- IBM Carbon (forms pattern): group related tasks, save, go back and review; no single solution.
- GOV.UK Design System (structuring forms): one question or decision per page as a starting point, validated by research.
- Controlled healthcare study (JMIR Human Factors, 2021) comparing single-page, multi-step and conversational forms: a warning against fragmentation; specific sample and context.
- Baymard Institute (checkout flow and fields): effort and number of fields weigh more than the number of steps.
- Brazilian Government Digital Standard (GOV.BR), Step and Wizard: progress, conditional steps and the risk of data loss.
