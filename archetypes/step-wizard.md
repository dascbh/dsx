---
id: step-wizard
title: Step wizard
summary: Guided flow that splits a long or rare task into ordered steps, with one decision at a time and a review before finishing.
register: [operational, consumer]
when-to-use: IF the task is long, infrequent or has steps that depend on earlier answers THEN use a step wizard
avoid-when: the person does the task every day and knows the fields (use a page form), there are fewer than ~6 fields (use form dialog), or the steps have no natural order (use settings)
regions: [page-header, step-trail, step-body, navigation-footer]
primary-action: { region: navigation-footer, position: bottom-right, max: 1 }
states: [loading, field-error, error, submitting, success, draft-restored]
patterns: [split-form, form-steps, validation-timing, form-errors, error-placement, preserve-data-after-error, required-fields, label-vs-placeholder, double-submit, success-confirmation, action-placement, file-upload]
variations: [horizontal-trail, vertical-side-trail, final-review-step, wizard-in-dialog]
rules: [T1, T3, T4, T6, T7, F3, F5]
---

# Step wizard

Creating a new project with parties and owners, importing a spreadsheet and mapping columns, building a batch of orders from approved requests. Tasks the person does only a few times, with decisions that depend on each other. The wizard reduces the load to one question at a time and always shows where the person is and how much is left.

## When to use

- **IF** the task has decision groups with a natural order (data → parties → documents → review) **THEN** each group becomes a step; 3 to 6 steps.
- **IF** an answer changes the following steps **THEN** the trail updates in plain sight, never skipping steps silently.
- **IF** finishing creates something expensive to undo (sends, charges, publishes) **THEN** include the `final-review-step` with everything editable.
- **IF** the task takes more than a few minutes **THEN** keep a draft and allow leaving and resuming.
- **IF** the person repeats the task daily **THEN** replace it with a single page form, with sections; the wizard becomes friction.
- **ELSE** (few fields, one decision) **THEN** use `form-dialog`.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  New project (h1)           Save and exit         │
├──────────────────────────────────────────────────────────────┤
│ step-trail  ✓ Data ── ● Parties ── ○ Documents ── ○ Review    │
│                   Step 2 of 4                                 │
├──────────────────────────────────────────────────────────────┤
│ step-body   Step title (h2) + 1 guidance sentence             │
│                  Field  [__________]                          │
│                  Field  [__________]  help text               │
├──────────────────────────────────────────────────────────────┤
│ navigation-footer  [Back]                      [Continue]     │
└──────────────────────────────────────────────────────────────┘
```

## What goes in each region

- **page-header**: an `h1` with the goal ("New project"), and the exit: "Save draft and exit" or "Cancel" with a warning if there is data. Nothing else.
- **step-trail**: steps with a short name and status (done, current, pending, with error), plus "Step X of Y" as text. Completed steps are clickable for review; pending ones are not.
- **step-body**: the step title (`h2`), one sentence saying why we ask for this, fields with a visible label and help. One column. Errors next to the field and a summary at the top when trying to move forward.
- **navigation-footer**: "Back" on the left (secondary), "Continue" on the right (primary); on the last step, the primary says what happens ("Create project", "Send 12 orders").

## Actions

- **Primary:** one, in the `navigation-footer`, bottom-right: "Continue" on intermediate steps and verb + object on the final one.
- **Back:** always available from step 2 on, without losing what was filled in.
- **Exit:** saves a draft or asks for confirmation when discarding loses data.
- **Final submission:** blocks double clicks, shows progress and only finishes after the server's response.

## States

- **loading**: initial data (option lists, draft) arriving: a skeleton in the body; the trail already visible.
- **field-error**: validation on leaving the field; when clicking "Continue" with errors, a summary at the top with links to each field and focus on the summary; the step is marked with an error in the trail.
- **error**: a system failure when moving forward or finishing: an alert in the step, data preserved, "Try again".
- **submitting**: the primary with an indicator and disabled; other controls blocked; for batches, progress per item.
- **success**: a completion page: what was created, where to find it, the likely next step; never goes back to an empty step.
- **draft-restored**: on reopening, say that a draft was recovered, from when, and offer to discard it and start over.

## Variations

### horizontal-trail
Steps in a row above the body.
**Favors:** 3–5 steps with short names; wide screens.
**Worsens:** long names or more than 5 steps do not fit; on a phone it becomes just "Step X of Y".

### vertical-side-trail
Steps in a left column, with possible sub-steps.
**Favors:** long flows, steps with descriptive names, frequent returns to earlier steps.
**Worsens:** takes width; looks like a settings form if the steps have no clear order.

### final-review-step
The last step shows a summary of all answers, with "Change" per block.
**Favors:** a finish that is expensive to undo; confidence before sending.
**Worsens:** one more step; if the summary is not editable in place, the person navigates back and gets lost.

### wizard-in-dialog
Steps inside a large dialog (2–3 short steps).
**Favors:** a short task that starts on another screen and returns to it.
**Worsens:** little space; loses the per-step URL; not suitable for long drafts or more than 3 steps.

## Anti-patterns

- A trail that allows jumping to a step not yet filled in and then fails.
- "Back" that erases what was typed.
- Validation that only appears at final submission, pointing to three steps back.
- A "Next" label on the last step that actually submits.
- A wizard for a daily three-field task.
- Success as a toast that disappears, leaving the person on an empty screen.

## Checklist

- [ ] 3–6 steps, short names, "Step X of Y" as text.
- [ ] One primary in the footer on the right; "Back" on the left without data loss.
- [ ] The last primary's label describes the result.
- [ ] Errors next to the field and a summary at the top when moving forward.
- [ ] Draft saved and resumed with a notice.
- [ ] Final submission protected against double clicks.
- [ ] Success page with the next step; journey within the product's step limit.
