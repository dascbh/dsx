---
id: field-order
title: How do you decide the order of fields in a form?
category: forms
components: [form, fieldset, legend, conditional-field]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["2.4.3", "1.3.2", "1.3.1", "3.3.2"]
related: [form-steps, split-form, required-fields, label-vs-placeholder, dropdown]
---

# How do you decide the order of fields in a form?

> **Rule:** Order fields by the person's task, not by the database, and make visual order, HTML order and Tab order follow the same logic.

## Context

The field order drives the dialogue between the person and the service. If it mirrors the database, the company's internal structure or a two-column layout, the person has to decode the form instead of answering the questions.

Start from the task and the decisions it involves. Drop data you do not need, group related fields and ask first the questions that decide eligibility, route or the following fields.

There is no universal order. The best sequence depends on the task, what the person knows, the dependencies between answers and what the service really needs.

## Decision

- **IF** the field is not needed for the task **THEN** remove it before ordering.
- **IF** an answer decides eligibility or path **THEN** ask it first.
- **IF** fields are related **THEN** group them with `fieldset` and `legend`.
- **IF** there is a dependency **THEN** ask for the cause before the effect: type before details, country before state, start date before end date.
- **IF** a field is relevant only to part of the audience **THEN** show it conditionally right after the choice that triggers it.
- **IF** the form is long and has distinct goals **THEN** split it into logical steps.
- **IF** the layout uses two columns **THEN** confirm that reading does not cross the screen; prefer one column.
- **IF** CSS reorders fields or there is a positive `tabindex` **THEN** remove it and reorder in the HTML.
- **ELSE** test the most common path and the detours before fixing the final order.

## When to use

- Two or more related fields.
- An answer that decides eligibility or the next path.
- Conditional fields or steps.
- Different subjects that need grouping.
- A current order that causes doubt, errors or abandonment.

## When to avoid

- An order copied from the database → **use instead:** the task's order.
- Irrelevant conditional fields visible to everyone → **use instead:** conditional display.
- Mixed subjects without groups → **use instead:** named groups.
- CSS or a positive `tabindex` creating another order → **use instead:** order in the HTML.
- A fixed rule applied without observing the task → **use instead:** testing with people.

## Do

- Start from the task's goal.
- Ask about eligibility early.
- Show only what matters.
- Test the common and alternative paths.

## Avoid

- Mixing subjects.
- Revealing irrelevant fields.
- Columns with no reading logic.
- Hiding dependencies.
- Starting with the hardest field without research.

## Accessibility

- Focus order preserves meaning and operability (2.4.3); a meaningful reading sequence (1.3.2).
- Keep the HTML order the same as the visual order; do not rearrange fields with CSS.
- `fieldset` and `legend` for groups, visible labels and associated instructions (1.3.1, 3.3.2).
- Conditional fields appear at the expected point in the sequence, with no focus jumps.
- Test with keyboard, screen reader, zoom, voice and a small screen.

## Microcopy

Not applicable.

## Verification checklist

- [ ] The order follows the person's task.
- [ ] Eligibility questions come before long filling-in.
- [ ] Related fields are grouped.
- [ ] Dependencies appear in the right order.
- [ ] Irrelevant fields stay hidden.
- [ ] The visual order matches the HTML order.
- [ ] Tab navigation preserves the meaning.
- [ ] Groups use `fieldset` and `legend`.
- [ ] The common and alternative paths were tested.

## Rationale

- WCAG 2.2, criterion 2.4.3 (Focus Order): focus order preserves meaning; relationship between DOM and visual order.
- W3C WAI (forms tutorial): ask only for what is needed, group controls and split long forms.
- U.S. Web Design System (Form): same order in the HTML and on screen, simple vertical layout.
- GOV.UK Service Manual (structuring forms): justify each question, start with eligibility and use branching.
- IBM Carbon (forms pattern): Tab, visible labels and instructions before filling in.
- Nielsen Norman Group (form usability and grouping with white space): logical sequence, one column and grouping; the order depends on context.
- Adobe Spectrum (inclusive design): example of a structure in logical order versus out of order.
