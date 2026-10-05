# UX.md — the product's experience contract

> **When to consult**
> - When creating, extracting from code or evaluating a project's `UX.md` (skill `ux-md`).
> - Before building or rearranging a screen (skills `build-ui`, `arrange-screen`): the `UX.md` says what type of screen it is, where each thing goes and how it behaves.
> - When running the UX check over captures and the flow map (`tools/ux-lint/`).
> - When scoring the `UX.md` (100-point rubric and gates), checking whether it still describes the product (drift) or declaring a deviation that silences findings.

## What it is

`UX.md` is the file, at the project root, that describes **how the product is organized and how it behaves** — for people and agents. It is the counterpart of `DESIGN.md`:

| File | Answers | Example decisions |
|---|---|---|
| `DESIGN.md` | How the interface **looks** | color by role, typography, radius, component appearance |
| `UX.md` | How the interface **is organized and behaves** | screen types and their regions, where the primary action goes, how many primaries per region, navigation model, confirmation and feedback policy, required states, form rules, vocabulary, flow limits |
| `patterns/` (DSX) | Isolated micro-decisions | modal or page, where to show the error, toast or alert |

The `UX.md` **chooses and fixes** decisions that the patterns leave open ("which of these options this product uses, always") and says **on which type of screen** each rule applies, pointing to the archetypes in the catalog (`archetypes/`). It does not repeat the patterns: it references them by id.

Two layers, as in `DESIGN.md`:
1. **YAML front matter** — machine-verifiable decisions; `tools/ux-lint/` reads the limits and selectors from here.
2. **Markdown body** — the why, the criteria, what never to do.

The `UX.md` has the same weight and the same dynamics as `DESIGN.md`: it is created and wired into the agents' context by the `init` skill, the `build-ui` skill stops without it, it has a 100-point score with gates (`lint-ux-md.mjs --score`, rubric `evals/rubrics/ux-md.yaml`) and a drift check against the product (`tools/ux-lint/ux-md-drift.mjs`). Every UI change that alters behavior updates the `UX.md` in the same commit. Inventory of where each one is handled: `docs/ux-md-parity.md`.

Format: `format: alpha`, specific to DSX. `version` is the version **of the document** (semver), not of the format.

## Front matter schema

```yaml
version: 1.3.0                            # version of this document (semver; see "Version and freshness")
format: alpha                             # version of the DSX UX.md format
name: <product>
description: <product type, audience, density>
owner: <team or person>
updated: <YYYY-MM-DD>
product:
  persona: <who uses it and what for>     # required
  register: operational                   # operational | consumer | editorial | brand (see knowledge/design-system/choosing-a-design-system.md)
  platform: desktop                       # desktop | mobile | both
  density: high                           # low | medium | high
navigation:
  model: <e.g. "side menu + tabs on the page">
  max-depth: 3                            # levels from the module's entry point
  back: mandatory                         # mandatory | optional — mandatory: every non-root screen has a visible way back
archetypes:                               # screen type → product routes/screens (ids from archetypes/)
  operational-list: ["/orders"]
  editor-with-panel: ["/orders/:id/edit"]
actions:
  primary-per-region: 1                   # maximum primary actions (filled button) per region
  primary-position: top-right             # top-right | bottom-right | inline
  dialog-order: cancel-action             # cancel-action (Cancel on the left) | action-cancel
  destructive-specific-label: true        # "Delete order", never "Confirm"/"OK"/"Yes"
confirmation:
  irreversible: dialog                    # dialog | type-name
  reversible: undo                        # undo | none
feedback:
  success: toast                          # toast | inline | page
  field-error: inline
  system-error: page-alert
  skeleton-after-ms: 1000
states: [loading, empty, error, no-access, success]   # every screen implements these
forms:
  label: always-visible                   # never placeholder only
  validation: on-blur                     # on-blur | on-submit | realtime
  required: mark-required                 # mark-required | mark-optional
content:
  glossary: <glossary path or "inline">   # or per module: { default: <path>, purchasing: <path or inline> }
  buttons: verb-object                    # "Create order", not "OK"
  forbidden: [snapshot, tenant, RLS]      # implementation terms that never appear on screen
  proper-nouns: [Word, Excel]             # domain proper nouns, exempt from the Title Case rule (X10)
flows:
  max-journey-steps: 12
  max-stacked-dialogs: 1
  dead-ends: 0                            # screens (not dialogs) with no exit at all
paths:                                    # where the tools find the artifacts (docs/project-paths.md); omitted = DSX default
  captures: .dsx/captures/<module>        # captures <nn>-<screen>[.<state>].html; <module> becomes the module
  code: [src]                             # folders where the text is born; without it, detected from the stack
verification:                             # how ux-lint recognizes the project's kit in the captures
  kit: auto                               # selector profile: auto | generic | mui | shadcn | chakra | antd | bootstrap (tools/ux-lint/lib/kits.mjs)
  selectors:                              # each declared key overrides the kit profile
    regions: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialog: "[role=dialog]"
    dialog-footer: ".modal-footer"        # optional: where the dialog buttons are (T2); without it, the kit's applies or ux-lint infers it
    primary: ".btn-primary"               # optional: without it, the kit's applies
    destructive: ".btn-danger"            # optional: without it, the kit's applies
    button: "button, [role=button]"
    field: "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select"
deviations:                               # accepted deviations (see "Declared deviations"); they silence the findings they cover
  - id: D3
    screens: [modelo-editor, lote-passo-1] # screen ids in the map/captures; "*" = all
    rules: [T3, L6]                       # rule ids (T, F, S, C, L, X, U); empty = documentation only
    reason: "Task inside the Library tab; the h1 is the page's"
    decided-by: "product owner"
    until: 2026-12-31                     # optional: after this date the deviation covers nothing
```

Front matter keys and values are in English; free text (persona, model, routes) and the body are in the project's language (pt-BR by default).

Unknown keys produce a warning in the linter (`tools/lint-ux-md.mjs`). Values can be omitted; omitted = the DSX default above applies.

**Name transition (2026-10, `docs/renames-2026-10.md`).** Up to version 0.4 the keys and values were in Portuguese (`produto.registro: operacional`, `acoes.posicao-primaria: topo-direita`, `estados: [carregando, …]`, archetype ids such as `lista-operacional`). The linter and `ux-lint` still **read** these names, convert them to the new ones and warn "old name, rename to X"; nothing is written with an old name. There is a single conversion table: `tools/ux-lint/lib/legacy.mjs`. Old tool flags (`--arquetipos`, `--telas`, `--falhar-em`…) work as aliases with a warning, via the table `tools/lib/legacy-cli.mjs`.

**Key convention:** the `UX.md` YAML front matter uses kebab-case (`primary-position`, `skeleton-after-ms`); the `flows-<module>.json` map and every `--json` output of `ux-lint` use snake_case (`persona_switches`, `by_rule`, `dialog_open`).

## Version and freshness

- `version` is the document's semver. **Minor** (1.2.0 → 1.3.0): new or swapped archetype, new or changed policy (`actions`, `confirmation`, `feedback`, `forms`, `navigation`, `flows`, `states`), deviation added or removed. **Patch** (1.2.0 → 1.2.1): text, example, evidence or wording fix only. **Major** (1.x → 2.0.0): a change that invalidates what agents have already built (navigation model, `product.register`, a kit switch that changes the selectors).
- `updated` (YYYY-MM-DD) changes together with `version`.
- **Same change, same commit:** a new screen, a removed screen, or an archetype, policy, state or flow changed in the code updates the `UX.md` (and the `.dsx/maps/flows-<module>.json` map) in the same commit. Drift (U5) flags an `updated` older than the last change to the map or the captures.
- Up to DSX 0.6, `version: alpha` was the format version. The linter still accepts it, with a warning: replace it with `version: 1.0.0` and `format: alpha`.

## Declared deviations

The deviations table in section 5 (D1, D2…) explains why a screen differs from the archetype card or from a policy. The `deviations` block in the front matter is its verifiable version: each deviation says **which screens** (`screens`, ids from the flow map or the captures) and **which rules** (`rules`, T/F/S/C/L/X ids or drift U ids) it covers, the reason (`reason`), who accepted it (`decided-by`) and, optionally, until when (`until`).

- A ux-lint finding is covered when its rule is in `rules` and all of its screens are in `screens`. In the findings register it becomes `accepted-deviation`: it does not count as open, not even in the lock (`findings.mjs check`), it appears on the page with the reason, and it goes back to `open` when the deviation leaves the `UX.md` or expires (`knowledge/foundations/ux-findings.md`).
- `rules: []` makes the deviation documentation only: it explains but silences nothing.
- A screen listed in a deviation counts as "declared" for coverage (U1 and the `essential-coverage` gate).
- The linter checks that the ids in the body table and in the block are the same.
- A deviation is not disguised debt: what the product should fix goes under "Don't" (with a deadline in the backlog), not in `deviations`. Debt that needs to stay quiet for a while can be a deviation with `until`.

## Score and gates (100-point rubric)

`node tools/lint-ux-md.mjs UX.md --score [--map .dsx/maps/flows-<module>.json] [--screens <captures>] [--geometry <folder>] [--json]` computes the score deterministically, with evidence per criterion (full rubric in `evals/rubrics/ux-md.yaml`):

| Criterion | Weight | How it measures |
|---|---:|---|
| Screen coverage by archetype | 20 | screens in the map and captures with an archetype or deviation; with no inventory, at most half |
| Policies declared with evidence | 15 | the 15 policy keys declared + `file:line` references and patterns cited in the body (15 = full) |
| States declared and described | 10 | the 5 base states in `states` and described in "Feedback & States" |
| Flows with justified limits | 10 | complete `flows`, journeys in section 11 and limits cited in the text |
| Resolvable glossary | 10 | `content.glossary` declared, resolves, and has terms with "never call it" (8 = full); per module, the average |
| Concrete do's and don'ts | 10 | ≥ 3 in each block and items with a concrete anchor (screen, file, number, exact label) |
| Verification selectors | 10 | basic selectors + `dialog-footer` or `archetype-regions` |
| Freshness | 10 | semver `version`, valid and recent `updated` (≤ 90 days), no screens newer than it |
| Structured deviations | 5 | body table and `deviations` block with the same ids |

Bands: **90–100** robust · **75–89** usable with gaps · **60–74** review before it becomes an authority · **< 60** high risk (the agent will invent behavior).

Gates (any ✘ fails, regardless of the score): `lint` (0 errors), `essential-coverage` (every screen in the inventory with an archetype or deviation), `policy-fidelity` (no policy contradicted by most of the measured screens; the rest by human sampling), `connected-to-agent` (`CLAUDE.md`, `AGENTS.md` or a project tool rule cites the `UX.md`) and `no-conflict` (judge). Open criteria — the archetype fits the task, the policies are real, the items come from real problems, the instructions are actionable, the deviation is justified — go to the `eval-judge` subagent, through the rubric.

## UX.md × product drift (`tools/ux-lint/ux-md-drift.mjs`)

`node tools/ux-lint/ux-md-drift.mjs UX.md [--map <map>] [--screens <captures>] [--geometry <folder>] [--module <m> --root <project>] [--json] [--fail-at 2]` confronts the file with the product, as the front matter × code check does for `DESIGN.md`. The audit (`audit.mjs`) runs drift as a prerequisite and warns "UX.md out of date: …" in the report.

| Id | Sev | Flags |
|---|---|---|
| U1 | 2 | A screen in the map or captures with no archetype and outside every deviation |
| U2 | 2 | An `archetypes` entry that names no screen in the map (screen removed or renamed) |
| U3 | 2 | A policy that the majority (more than half, at least 2 screens) of an archetype's screens no longer follow: `primary-per-region` (T1), `dialog-order` (T2), `destructive-specific-label` (T5) and, with geometry, `primary-position` (L1). Screens covered by a deviation for the rule do not count |
| U4 | 2 | A state in `states` that no capture has (`<nn>-<screen>.<state>.html`) |
| U5 | 1 | `updated` earlier than the last change to the map or captures (last commit; without git, the file date) |
| U6 | 1 | An expired deviation (`until` in the past) or one that cites a screen outside the map |

Drift does not enter the findings register: it says the **document** is stale, not that the screen is wrong. The fix is to update the `UX.md` (skill `ux-md`, Mode C) and bump `version`/`updated`.

## Glossary per module

`content.glossary` accepts a path (an `.md` with a table whose columns are "Termo" and "Nunca chamar de"/"Evitar" — the column names the tools read), `inline` (a table in the `UX.md` body), a term → synonyms map, or a **per-module map**: `{ default: design/product.md, purchasing: inline }`. The map is per module when it has `default` or when every value is an `.md` path, `inline` or a map. `consistency.mjs` (C3) and `text.mjs` pick the entry by `--module` (the audit passes its own); a module with no entry uses `default`. In `text.mjs`, canonical terms with a capital in the middle (pt-BR example: "Ordem de Compra") count as proper nouns for X10.

## Body sections (in this order)

| # | Section (`##`) | pt-BR alternative | Must answer |
|---|---|---|---|
| 1 | Overview | Visão geral | For whom, what for, in which context of use; what the experience never does |
| 2 | Personas & Tasks | Personas e tarefas | Main tasks per persona, frequency, what is critical to get wrong |
| 3 | Information Architecture | Arquitetura da informação | Where each thing lives; names of the areas; what is entry, what is detail |
| 4 | Navigation | Navegação | Model, depth, how to go back, how to know where you are |
| 5 | Screen Archetypes | Arquétipos de tela | What type each screen is (link to `archetypes/<id>.md`) and declared deviations (table D1… mirrored in the `deviations` block) |
| 6 | Layout & Regions | Layout e regiões | The product's fixed regions (header, menu, content, panel), what goes in each |
| 7 | Actions | Ações | Hierarchy, position, how many primaries, destructive ones, disabled × hidden |
| 8 | Feedback & States | Feedback e estados | Feedback policy; the five states and how each screen type shows them |
| 9 | Forms | Formulários | Labels, validation, required fields, long × short (dialog × page) |
| 10 | Content & Microcopy | Conteúdo e microcopy | Glossary, verbs, tone, forbidden terms, error/empty/confirmation formulas |
| 11 | Flows | Fluxos | Main journeys, limits, where the person switches (e.g. a link to a third party) |
| 12 | Do's and Don'ts | Faça e não faça | ≥ 3 each, derived from real problems |
| 13 | Agent Instructions | Instruções para agentes | When to consult, what to preserve, how to validate |

The English titles (above) are canonical. The linter also accepts the pt-BR titles in the second column, and the variants "Personas and Tasks", "Layout and Regions", "Feedback and States", "Content and Microcopy" and "Dos and Donts".

## Screen archetypes (`archetypes/`)

The DSX catalog of **screen types** — the level above patterns. Each card `archetypes/<id>.md` has:

```yaml
---
id: operational-list
title: Operational list
summary: <one sentence>
register: [operational]
when-to-use: <IF→THEN sentence>
avoid-when: <sentence>
regions: [page-header, filter-bar, content, list-footer]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, empty, empty-filtered, error, no-access]
patterns: [filter-structure, active-filters, table-pagination, table-sorting, empty-state]   # ids from patterns/
variations: [with-bulk-actions, cards-on-mobile]
rules: [T1, T3, T4]                       # ux-lint rules that apply
---
```

The five states in the UX.md `states` are the **minimum**; an archetype can require its own states (`expired-link`, `nothing-selected`, `conflict`…). `primary-action` describes the main action region; if the archetype has another one (e.g. master-detail: create in the header, resolve in the detail), describe it in the body, under **Actions** — the T1 limit applies per region either way.

Body: **When to use** (IF → THEN), **Region map** (ASCII diagram), **What goes in each region**, **Actions**, **States**, **Variations** (each with what it favors and what it worsens — these are the "arrangements" offered by the `arrange-screen` skill), **Anti-patterns**, **Checklist**.

## Verification (`tools/ux-lint/`)

| Id | Level | Rule | Source of the limit |
|---|---|---|---|
| T1 | screen | At most `actions.primary-per-region` primary actions per region (a dialog counts as its own region; the page behind a dialog does not count) | `actions`, `verification.selectors` |
| T2 | screen | In a dialog, the cancel action comes before (to the left of) the main action, per `actions.dialog-order` | `actions.dialog-order` |
| T3 | screen | Exactly one main heading (`h1`) per screen; not evaluated in a capture with an open dialog (the underlying screen is evaluated in its own capture) | — |
| T4 | screen | Every field has a visible label or accessible name; a placeholder alone fails | `forms.label` |
| T5 | screen | A destructive action with a generic label (pt-BR example: "Confirmar", "OK", "Sim", "Continuar") fails | `actions.destructive-specific-label` |
| T6 | screen | A `content.forbidden` term in the visible text fails | `content.forbidden` |
| T7 | screen | A button whose label is not verb + object (pt-BR example: "OK", "Sim", a bare "Enviar" in an ambiguous context) produces a warning | `content.buttons` |
| F1 | flow | A screen (not a dialog) with no outgoing transition | `flows.dead-ends` |
| F2 | flow | A screen outside every journey (journey orphan) — warning, not error | — |
| F3 | flow | A journey with more steps than `flows.max-journey-steps` | `flows` |
| F4 | flow | A dialog opened from another dialog beyond `flows.max-stacked-dialogs` | `flows` |
| F5 | flow | A non-root screen with no back transition (to the screen it is reached from or to its parent) | `navigation.back` |
| S1 | states | A required state of the screen with no `<nn>-<screen>.<state>.html` capture (what is required is in "States", below) | `states`, `archetypes` + the archetype's `states` |
| S2 | states | An empty or error capture with no exit button or link in the state's region | — |
| S3 | states | An error message with no guidance: only "error", "failed", a code, or an explanation with no verb saying what to do and no action alongside | — |
| C1 | consistency | The same action with different labels across screens (verb groups; criterion in "Consistency", below) | — |
| C2 | consistency | The same button label with different visual variants (filled × outlined × text) in the same context | — |
| C3 | consistency | The same concept with different names in titles and tabs | `content.glossary` |
| L1 | layout | Primary action outside the declared position (sev 2) | the screen archetype's `primary-action.position`; without an archetype, `actions.primary-position` |
| L2 | hierarchy | More than N high-visual-weight elements above the fold: filled button, bold text ≥ 1.25× the body, saturated color block (sev 2) | `layout.max-emphasis` (default 3) |
| L3 | hierarchy | Broken heading scale: `h1` is not the largest text on the screen, or a lower level is larger than a higher one (sev 2) | — |
| L4 | layout | Fields/labels of a form or sibling cards with left edges at more than 2 positions (or more than the grid columns), 4 px tolerance (sev 1) | `layout.align-tolerance`, `layout.max-left-edges` |
| L5 | layout | Proximity: label more than 16 px from its field; buttons of the same group more than 48 px apart; an element closer to the neighboring group than to its own (sev 1) | `layout.label-gap`, `layout.action-gap` |
| L6 | hierarchy | Title or primary action outside the first 900 px (sev 2) | `layout.fold` |
| L7 | layout | Running text with more than 90 characters per line (sev 1) | `layout.max-line-chars` |
| L8 | layout | Clickable target smaller than 24×24 px without free space around it (WCAG 2.5.8) (sev 2) | `layout.min-target` |
| L9 | layout | A region of the declared archetype missing from the screen (sev 1) | `archetypes` + the archetype's `regions` |

Inputs: HTML captures of the screens (e.g. a capture skill working from the project's code) and the flow map `.dsx/maps/flows-<module>.json`:

```json
{ "screens": [{ "id": "lista", "name": "Pedidos", "type": "page", "route": "/orders", "parent": null, "persona": "analista" }],
  "transitions": [{ "id": "t1", "from": "lista", "to": "detalhe", "trigger": { "type": "button", "label": "Abrir" }, "evidence": "src/Lista.tsx:42" }],
  "journeys": [{ "id": "j1", "name": "Aprovar pedido", "steps": ["t1", "t2"], "persona_switches": [] }] }
```

Screen `type`: `page`, `dialog`, `tab`, `panel` or `drawer` (`dialog` and `modal` count as dialogs for rules F1/F4). The old format (`telas`, `transicoes` with `de`/`para`, `gatilho {tipo, rotulo}`, `evidencia`, `jornadas` with `passos` and `trocas_persona`, type `dialogo`) is read with a warning.

Output (`--json`): findings with `rule`, `severity` (0–4, the scale from `nielsen-heuristics.md`), `message`, `evidence` and the screen (`screen`, in the flow) or region (`region`, on the screen); `--fail-at <n>` sets the severity that makes the command exit with 1 (default 3).

**Regions.** T1 counts primaries per region recognized by the selectors. If the product puts the action bar, content and side panel inside a single `main`, T1 treats it all as one region: mark `aside`/`section` with a name in the code or declare finer region selectors in `verification.selectors.regions`. A T1 finding on a large `main` may be missing semantics, not too many primaries — check the capture.

**States (`tools/ux-lint/states.mjs`).** `node tools/ux-lint/states.mjs <captures-folder> [--ux UX.md] [--archetypes <folder>] [--json]`. Capture convention: `<nn>-<screen>.html` is the main state (with data; for a dialog, the open dialog) and `<nn>-<screen>.<state>.html` is each other state, with the same `nn` and the same screen id (`02-acervo.empty.html`, `03-documento.error.html`); the state uses the ids from `states` (`loading`, `empty`, `empty-filtered`, `error`, `no-access`, or one from the archetype). The type and parent of each screen come from the folder's `capture-order.json` (or the folder above), when it exists; without it, every screen that is not a dialog is a page. What is required, by screen type:

- **Page** — the UX.md `states` ∪ the archetype's `states` (the UX.md `archetypes` says which one), minus the main one (`success`) and the momentary ones (`running`, `submitting`, `saving`). The UX.md `empty` and `empty-filtered` apply only when the archetype has some empty state (list, library, monitoring dashboard) or when the screen has no archetype: detail and editor screens have no empty list.
- **Child** — a tab, panel or step with a captured parent: only what the parent does not already require; loading, error and no-access belong to the parent.
- **Dialog** — `error` when the dialog has an action that calls the server (primary or destructive), and `field-error` when the archetype declares it and there is a required field. A dialog has no `loading`, `empty` or `no-access`; the main one is `open`.
- **Panel with no archetype and no parent** (e.g. the menu) — nothing; declare the archetype to require states.

S2 looks for the state's message (an error alert; in an empty state, the pt-BR text "Nenhum…", "Ainda não…") and inspects its region (`verification.selectors.regions`, or the dialog): tabs, sorting, fields and disabled buttons do not count as an exit. S3 reads each error alert (in the error capture, any `role=alert`) and accepts a message that has a next-step verb (pt-BR examples: "tente", "verifique", "peça", "de novo"…) or an action inside the alert itself, unless the text is only a failure or a code.

**Consistency (`tools/ux-lint/consistency.mjs`).** `node tools/ux-lint/consistency.mjs <captures-folder> [--ux UX.md] [--json]`. Compares the inventory of buttons, titles and tabs across all captures (the same inventory as the text checker). Criterion for "same action" in C1: same verb group — pt-BR groups excluir/remover/apagar; salvar/gravar; criar/novo/adicionar; editar/alterar; baixar/exportar/download — on the same object (the first content word after the verb, without plural; "Adicionar à proposta" has a destination, not an object). A verb-only label takes its object from the accessible name or the dialog title; with no object at all, it is left out. Cancel/back/close only counts inside a dialog and with the same role: "dismiss" when the footer has a main action, "close" when it does not; the ✕ icon is left out. C2 compares the same label only in the same context: the trigger on the page (pt-BR example: "Remover", text) and the confirmation in the dialog ("Remover", filled) have different roles. C3 uses the glossary (`content.glossary`: the path of an `.md` with a table whose columns are "Termo" and "Nunca chamar de"/"Evitar", a term → synonyms map, or `inline` for the table in the UX.md itself) and a short list of known pairs (pt-BR examples: configurações × preferências, modelo × template…); an avoid-term that is the canonical term of another row does not count. A glossary from another domain of the product (e.g. the Finance one applied to Purchasing) produces false positives: declare the module's glossary (`content.glossary: { default: …, contratos: … }`, see "Glossary per module") and run with `--module`.

Both write `--json` in `snake_case`, which the findings register reads (`findings.mjs register --states st.json --consistency c.json`; families `states` and `consistency`, ids `st-` and `c-`).

**Layout and hierarchy (`tools/ux-lint/measure.mjs` + `tools/ux-lint/layout.mjs`).** The HTML parser does not compute layout; geometry comes from a browser. Two steps:

1. `node tools/ux-lint/measure.mjs <captures-folder> --out <geometry-folder> [--ux UX.md] [--width 1440]` opens each static capture (`file://`, no server) in a 1440×900 window, waits for fonts and network, and writes `<name>.geometry.json` with the box, font, color, region and role of each relevant element (format documented at the top of `tools/ux-lint/lib/geometry.mjs`). Playwright belongs to the project, not to DSX: the command looks for it (`playwright` or `@playwright/test`) from the current directory and, without it, explains how to install it — the L analysis is unavailable.
2. `node tools/ux-lint/layout.mjs <geometry-folder> [--ux UX.md] [--archetypes <folder>] [--json] [--fail-at 3]` applies L1–L9 without a browser. A screen links to its archetype by the id in the capture name (`<nn>-<screen>`), compared with the ids and routes in `archetypes` (the route is compared with the capture's `<title>`); from the card come `regions` (L9) and `primary-action.position` (L1). L9 runs only on the main state (capture with no state suffix).

How each rule measures: **L1** compares the center of the primary with the reference box (the dialog, or `main`): *top-right* = right half (center beyond 60% of the width) and top within 240 px of the start of the content; *bottom-right* = 60% to the right and in the last quarter (in a dialog, the last third); *inline* is not checked. One primary in focus in the position is enough; the primary of a side panel does not count when the archetype asks for the primary in the header, and neither does a **row primary**: one on the same row as a field of its own form (pt-BR example: "Nova categoria" + Adicionar) or next to its section title (pt-BR example: "Signatários" + Novo signatário) has a position relative to the row, not to the region. **L2** counts, only above the fold and outside the product's header and menu, filled buttons (`primary` selector or saturated background), texts ≥ 1.25× the body with weight ≥ 600, and saturated background blocks of ≥ 2,500 px²; anything inside another counted element, and touching saturated blocks (the cells of a table header), count once. **L3** compares computed font sizes (bare numbers, such as an indicator's value, do not count as "larger text"). **L4** groups fields by the nearest form, fieldset, dialog, panel or card and measures the left edge of the field's outline (not of the inner `<input>`); a floating label inside the field is not an edge. **L5** forms button groups by DOM parent, merging touching buttons (≤ 8 px) on the same row; links do not form a group, and a destructive action set apart on purpose and a gap filled by content (the pt-BR "pág. 1 de 3" between previous and next) do not fail. **L6** measures from the top of the page — or from the top of the dialog, because the dialog is fixed in the window and the static capture does not limit its height; a title and primary inside the dialog header/footer do not fail. **L7** only looks at running text (two lines or more, or a single line with ≥ 120 characters) and computes characters per line from the number of rendered lines (height ÷ line height). **L8** applies the WCAG spacing exception (a 24 px circle around the target that touches no other target) and the in-sentence link exception; repeated targets with the same label in the same region become one finding. **L9** looks for the region by the declared markup (`data-region="<id>"` in the code or `verification.selectors.archetype-regions: { side-panel: "aside.painel" }` in the UX.md; MUI dialog title, content and actions, stepper and pagination are recognized out of the box) and, without it, by geometric heuristics (a right-hand column for a panel, a strip of controls for a toolbar, a wide block for the content area); `bulk-actions-bar`, `danger-zone` and `quick-view` only appear under certain conditions and are not checked.

Limits change through the optional `layout` key in the front matter (kebab-case: `fold`, `max-emphasis`, `emphasis-ratio`, `align-tolerance`, `max-left-edges`, `label-gap`, `action-gap`, `max-line-chars`, `min-target`, `top-band`). The `--json` in `snake_case` carries, per finding, `rule`, `severity`, `region`, `message` (with the measurement), `anchor` (the element's label or selector, no coordinates), `evidence` (`capture.html › element path`), `elements` and `measure`; the findings register reads it with `findings.mjs register --layout l.json` (family `layout`, ids `l-`, anchor screen + rule + region + element — the measurement can change without changing the id). False-positive signals to check in the capture: a deviation already declared in section 5 (declare it in `deviations` too, with the rule, so the register marks it `accepted-deviation`) (a pt-BR "Adicionar" primary inside a management dialog, an editor without a panel), a screen that is actually a state of the archetype (an "already answered" page with no decision area), and overline titles (small all-caps text above cards) in L3.

What the machine does not measure — clarity of the hierarchy, fit of the archetype to the task, cognitive load, whether the text is understood — goes to judgment review (skill `review-ux`, a cognitive walkthrough of the journey over the captures).

## Checklist

- [ ] `version` in semver and `updated` set to the day of the last change; bumped in the same commit as the UI change.
- [ ] Section 5 deviations also in the `deviations` block (with `rules` when they silence a finding).
- [ ] `node tools/lint-ux-md.mjs UX.md --score --map … --screens …` with every code gate ✔ and the score recorded; `ux-md-drift.mjs` with no finding.
- [ ] Front matter with `product`, `navigation`, `archetypes`, `actions`, `confirmation`, `feedback`, `states`, `forms`, `content`, `flows` and `verification.selectors`, in English (the linter accepts the old names with a warning).
- [ ] Every product screen mapped to an archetype (or a deviation declared in section 5).
- [ ] 13 sections, in order; Do's and Don'ts with ≥ 3 items each, drawn from real problems.
- [ ] `node tools/lint-ux-md.mjs UX.md` with no error.
- [ ] `node tools/ux-lint/flow.mjs` and `node tools/ux-lint/screen.mjs` run; findings of severity ≥ 3 recorded as debt.
- [ ] Geometry measured (`measure.mjs`) and `layout.mjs` run; L findings of severity 2 checked in the capture before becoming debt.
- [ ] States captured (`<nn>-<screen>.<state>.html`) and `node tools/ux-lint/states.mjs` and `consistency.mjs` run over the captures folder.
