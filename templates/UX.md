---
# version is the version of THIS document (semver). Bump it in the same commit as the UI change:
#   new or replaced archetype, policy (actions, confirmation, feedback, forms, navigation, flows, states) or deviation → minor (1.2.0 → 1.3.0)
#   text, example, evidence or wording fix only → patch (1.2.0 → 1.2.1)
#   change that invalidates what agents already built (new navigation model, new register) → major (1.x → 2.0.0)
# and update `updated`. format is the version of the DSX UX.md format.
version: 1.0.0
format: alpha
name: <Product name>
description: <Product type, audience and density. E.g. "Web app for purchase orders used by the procurement team, desktop, high density.">
owner: <team or person who maintains this file>
updated: <YYYY-MM-DD>
# Who uses it and in which register. persona and register are required. Keys and values in English; free text in the project language.
product:
  persona: <who uses it and what for, in one sentence>
  register: <operational | consumer | editorial | brand>
  platform: <desktop | mobile | both>
  density: <low | medium | high>
navigation:
  model: <e.g. "side menu + tabs on the page">
  max-depth: 3                    # levels from the module entry point
  back: mandatory                 # every non-root screen has a visible way back (mandatory | optional)
# Screen type → product routes/screens. Valid ids: the cards in archetypes/.
archetypes:
  operational-list: ["<route>"]
  master-detail: ["<route>"]
  confirmation-dialog: ["<dialog name>"]
actions:
  primary-per-region: 1           # maximum filled buttons per region
  primary-position: <top-right | bottom-right | inline>
  dialog-order: <cancel-action | action-cancel>
  destructive-specific-label: true
confirmation:
  irreversible: <dialog | type-name>
  reversible: <undo | none>
feedback:
  success: <toast | inline | page>
  field-error: inline
  system-error: page-alert
  skeleton-after-ms: 1000
states: [loading, empty, error, no-access, success]
forms:
  label: always-visible
  validation: <on-blur | on-submit | realtime>
  required: <mark-required | mark-optional>
content:
  language: pt-BR                 # language of the product's own text, the one the text detectors judge (pt-BR | en; omitted = pt-BR)
  glossary: <glossary path or "inline">   # per module: { default: <path>, <module>: <path or inline> }
  buttons: verb-object
  forbidden: [<implementation term>, <another term>]   # never appear on screen
  proper-nouns: []                # domain proper nouns that may carry a capital in the middle (X10)
flows:
  max-journey-steps: 12
  max-stacked-dialogs: 1
  dead-ends: 0
# Where the tools find captures, map and code (docs/project-paths.md). Delete whatever is the DSX default.
paths:
  captures: .dsx/captures/<module>
  code: [<front-end folder where the text is born>]
# How ux-lint recognizes the project's kit in the captures. Adjust to your kit (MUI, shadcn, in-house).
verification:
  kit: <auto | generic | mui | shadcn | chakra | antd | bootstrap>   # selector profile of the component kit
  selectors:
    regions: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialog: "[role=dialog]"
    primary: "<primary button selector; delete to use the kit's>"
    destructive: "<destructive button selector; delete to use the kit's>"
    button: "button, [role=button]"
    field: "input:not([type=hidden]), textarea, select"
# Accepted deviations: what differs from the archetype card or from a policy, with reason and owner. A finding of a rule
# listed in `rules` on a screen in `screens` (ids from the flow map/captures) becomes an "accepted deviation" in the
# findings register and does not count as open. Delete the block if there is no deviation.
deviations:
  - id: D1
    screens: [<screen id>]
    rules: [<rule id, e.g. L9>]
    reason: "<why the product differs here>"
    decided-by: "<who accepted it>"
    until: <YYYY-MM-DD, optional>
---

# <Product name> — UX

<!-- Say where the decisions came from (code, maps in .dsx/maps/, research) and what wins in a conflict.
     Mark with "(inferred)" whatever was deduced without explicit evidence. Delete every comment when filling in. -->

## Overview

<!-- For whom, what for, in which context of use (device, frequency, time pressure). End with what the
     experience NEVER does (e.g. "never applies a decision without human confirmation"). -->

<Overview paragraph>

## Personas & Tasks

<!-- Table: persona | main task | frequency | what is critical to get wrong. Tasks, not screens. -->

| Persona | Task | Frequency | Critical error |
|---|---|---|---|
| <persona> | <task> | <daily/weekly/rare> | <what is expensive to get wrong> |

## Information Architecture

<!-- Product areas with the names that appear on screen; what is an entry point (list, dashboard) and what is detail. -->

<Areas and where each thing lives>

## Navigation

<!-- Model (side menu, tabs, breadcrumbs), maximum depth, how to go back, how people know where they are. -->

<Navigation model>

## Screen Archetypes

<!-- Table: screen/route | archetype (link archetypes/<id>.md) | chosen variation | declared deviation (or "—").
     Every screen in the front matter appears here. Deviation = what differs from the card and why. -->

| Screen | Archetype | Variation | Deviation |
|---|---|---|---|
| <route> | <archetype id> | <variation> | <deviation id (D1) or —> |

### Declared deviations

<!-- One row per deviation, with the same id as the `deviations` block in the front matter (the linter checks both). -->

| # | Screen | Deviation | Reason |
|---|---|---|---|
| D1 | <screen id> | <what differs from the card or the policy> | <reason and cost> |

## Layout & Regions

<!-- The product's fixed regions (header, menu, content, panel) and what goes in each one. -->

<Regions>

## Actions

<!-- Hierarchy (primary, secondary, tertiary), position, how many primaries, destructive actions, disabled vs. hidden. -->

<Action policy>

## Feedback & States

<!-- Feedback policy (toast, inline, alert) and how each screen type shows the five states. -->

<Feedback and states>

## Forms

<!-- Labels, validation, required fields; when a form goes in a dialog and when it becomes a page. -->

<Form rules>

## Content & Microcopy

<!-- Glossary (screen term ↔ concept), button verbs, tone, forbidden terms, formulas for error/empty/confirmation. -->

<Content and microcopy>

## Flows

<!-- Main journeys (start → end, number of steps), limits, where the person switches channel (third-party link, e-mail). -->

<Flows>

## Do's and Don'ts

<!-- At least 3 in each block, each coming from a real problem (screen, finding, complaint). Observable criterion. -->

### Do

- <concrete rule>
- <concrete rule>
- <concrete rule>

### Don't

- <concrete prohibition>
- <concrete prohibition>
- <concrete prohibition>

## Agent Instructions

<!-- When to consult this file, what to preserve, how to validate (commands). -->

- Consult it before creating or rearranging any screen; identify the archetype in section 5.
- Every UI change that alters behavior (new screen, archetype, policy, flow, state) updates this file in the same commit, with `version` and `updated`.
- Validate with `node <DSX>/tools/lint-ux-md.mjs UX.md --score --map <map> --screens <captures>`, with the drift check (`node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <m> --root .`) and with the screen and flow ux-lint.
