---
id: settings
title: Settings
summary: Screen of persistent account, module or organization adjustments, grouped into sections, with predictable saving and a separate zone for risky actions.
register: [operational, consumer]
when-to-use: IF the person adjusts preferences or parameters that apply from now on, with no required order among them THEN use settings
avoid-when: the adjustments have order and dependencies (use step wizard), are part of the daily work on a record (use the record's detail), or are a single switch (put it next to what it affects)
regions: [page-header, section-menu, section-body, section-footer, danger-zone]
primary-action: { region: section-footer, position: bottom-right, max: 1 }
states: [loading, unsaved-changes, saving, field-error, error, no-access, success]
patterns: [autosave-vs-save, required-fields, validation-timing, form-errors, destructive-action, confirm-action, disabled-button, success-confirmation, tabs, preserve-data-after-error, label-vs-placeholder]
variations: [save-per-section, save-on-change, top-tabs]
rules: [T1, T3, T4, T5, T6, T7, F5]
---

# Settings

Organization details, members and roles, integrations, payment reminder schedule, notification preferences. The person visits rarely, with a specific goal, and needs to find the section quickly, understand the effect of each adjustment and be sure they saved. Irreversible actions (delete organization, revoke integration) live far from the common adjustments.

## When to use

- **IF** there are more than ~3 groups of adjustments **THEN** use a `section-menu` on the left (or `top-tabs` with up to 5 groups); one section at a time.
- **IF** the section's adjustments form a set that must be applied together **THEN** use `save-per-section` with a footer and an unsaved-changes notice.
- **IF** each adjustment is independent, with an immediate and reversible effect (preference switches) **THEN** use `save-on-change` with a discreet confirmation per control.
- **IF** an adjustment has a broad effect or affects others (turning on automatic billing, changing someone's role) **THEN** explain the effect next to the control and confirm before applying.
- **IF** the action is destructive or irreversible **THEN** it goes to the `danger-zone`, at the end of the section, with proportional confirmation.
- **ELSE** (a single adjustment) **THEN** put it next to what it affects, without its own screen.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Settings (h1)                                     │
├──────────────────┬───────────────────────────────────────────┤
│ section-menu     │ section-body  Organization (h2)            │
│ ▌Organization    │ Name         [______________]              │
│  Members         │ Tax ID       [______________]              │
│  Integrations    │ Time zone    [America/Sao_Paulo ▾]         │
│  Notifications   │ ───────────────────────────────────────── │
│                  │ section-footer  Unsaved changes            │
│                  │                   [Discard] [Save changes] │
│                  │ ───────────────────────────────────────── │
│                  │ danger-zone  Delete organization […]       │
└──────────────────┴───────────────────────────────────────────┘
```

## What goes in each region

- **page-header**: the `h1` "Settings" (or "<Module> settings"); no actions.
- **section-menu**: the list of sections with the current one marked (`aria-current`); each section has its own address so it can be linked. Sections without permission do not appear.
- **section-body**: the section title (`h2`), one sentence of context, fields with a visible label and help text that describes the effect ("Reminders go out at 8 a.m. in the chosen time zone"). Groups with a subtitle when the section is long.
- **section-footer**: in the save-per-section model: an indication of pending changes, "Discard changes" and the primary "Save changes". Sticks when scrolling if the section is long.
- **danger-zone**: a visually separate block at the end, with a clear title, an explanation of the consequence and a destructive button with a specific label ("Delete organization").

## Actions

- **Primary:** one, in the `section-footer`, bottom-right: "Save changes", disabled while nothing changed (the reason is implicit in the absence of pending changes) or while there is a field error.
- **Discard:** secondary, goes back to the saved values.
- **Destructive:** only in the `danger-zone`; irreversible actions ask for a confirmation that names the target, typing the name for high-impact targets.
- **Leaving with pending changes:** switching sections or pages with unsaved changes asks first ("Leave without saving?").

## States

- **loading**: a skeleton of the fields; the menu already navigable.
- **unsaved-changes**: a notice in the footer ("You have unsaved changes") and the primary enabled; when trying to leave, a confirmation.
- **saving**: the primary with an indicator, fields locked.
- **field-error**: the error next to the field, as text; focus on the first field with an error when trying to save.
- **error**: save failed: an alert in the section, typed values preserved, "Try again".
- **no-access**: no role to change it: fields read-only with an explanation ("Only administrators change this data"); a fully restricted section does not appear in the menu.
- **success**: a brief "Changes saved"; the footer goes back to the no-pending state.

## Variations

### save-per-section
A footer with "Save changes" per section.
**Favors:** interdependent adjustments, joint validation, a controlled effect.
**Worsens:** the risk of leaving without saving, so it requires a pending-changes notice and a confirmation on leaving.

### save-on-change
Each control applies immediately, with a confirmation per control ("Saved").
**Favors:** independent, reversible preferences; fewer steps.
**Worsens:** unsuitable for text fields that pass through invalid states; without undo, a mistaken tap becomes a real change.

### top-tabs
Sections as horizontal tabs below the header.
**Favors:** up to 5 short sections; screens without side space.
**Worsens:** does not scale; long names wrap; a tab with unsaved changes needs a marker.

## Anti-patterns

- Mixing fields that save on their own with fields that require "Save" in the same section.
- "Delete organization" next to "Save changes".
- Help text that repeats the label instead of stating the effect.
- Losing changes when switching sections without warning.
- A switch that triggers an irreversible action with no confirmation.
- A restricted section visible and fully disabled with no explanation.

## Checklist

- [ ] One save model per section, declared and consistent.
- [ ] One primary in the section footer; destructive actions only in the danger zone, with a specific label.
- [ ] Visible labels and help that describes the effect.
- [ ] A notice and a confirmation when leaving with pending changes.
- [ ] Current section marked and with its own address.
- [ ] A save error preserves what was typed.
