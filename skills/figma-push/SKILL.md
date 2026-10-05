---
name: figma-push
description: "Takes the whole project to Figma from the maps and DESIGN.md: foundation, screens, states and journey sections, with a resumable ledger. Use when mapping is done and it is time to build in Figma."
---

# figma-push — build from what is already known, not from a fresh look

> **DSX root:** two levels above this skill's base directory. Paths `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

**Input (optional):** `[essential|complete] [journey or route, for a one-off run]` (the old values `essencial`/`completa` are still accepted).

When this skill runs, the project has normally already gone through `map-ux` →
`confirm-maps`: routes, modals, navigation graph, dependencies between
tasks, personas/journey, domain model and a design system extracted with
per-framework adapters and checked against hazards already exist as files.
`figma-mirror` and `figma-foundations` predate that discovery phase —
their phase 1 still says "use the artifact if it exists, otherwise grep". This skill
turns the artifacts into a **hard prerequisite**: no artifact, no
build — fail fast and say which skill to run. That is the real leverage
discovery adds — `flows.json` gives real
from/to/trigger/condition edges instead of retraced navigation calls,
`journey.json` gives real personas instead of guessed roles, and the
`hazards[]` of `design-system.json` give a structured drift record
instead of prose findings spotted by eye.

This skill **orchestrates**, it does not duplicate. All the hard-won Plugin API doctrine
— icon path normalization, the opacity bug with read-modify-write,
componentization side effects, layout pitfalls — stays
exactly where it already lives: `figma-mirror`, `figma-foundations` and
[plugin-api.md](../figma-mirror/references/plugin-api.md). What is here is
genuinely new: the artifact gate, the state ledger,
reuse-before-create, hazard exposure and the journey layer.

## First line of the response — which project

**Before anything else, say which project this is running against**
— directory name and path — as the first line of the response. This is the
longest and most consequential step of the Figma flow (real writes to a
real Figma file, often across several sessions); do not leave the
user guessing which project is being touched.

## Before everything

Load **`figma-use`** before every `use_figma` call, and also
**`figma-generate-library`** and **`figma-generate-design`** — Figma's own
official skills for exactly this problem. They teach the mechanics this
skill assumes: wrapper-first build order, the state
ledger pattern, strictly sequential execution and reuse-before-create discovery.
Do not rederive those mechanics from scratch; follow them.

**Never call `use_figma` with a script that changes the file while it is
design's turn.** Read `design/figma-sync.md` first (`figma-cycle` skill):

- If `turn: design` (or the legacy `vez: design`), **stop** and tell the user.
  Refinement is in progress; writing now overwrites it. (The `turn-guard` hook also
  blocks, but do not let the hook be the first to warn.)
- If there is no registry, the project has no cycle yet: offer
  `/dsx:figma-init`.

**Never parallelize `use_figma` calls that change the file.** State
mutations in Figma are strictly sequential, even when the surrounding orchestration
could technically fire them in parallel. Read-only discovery calls
(screenshots, metadata, library search) may run in parallel
with each other; nothing that creates, changes or removes a node may.

## Artifact gate — without them, there is no build

Check that they exist **before writing anything**:

| artifact | produced by | without it |
|---|---|---|
| `.dsx/maps/ui-map.json` | `map-ux` skill | stop: run `map-ux` |
| `.dsx/maps/flows.json` | `map-ux` skill | stop: run `map-ux` |
| `.dsx/maps/journey.json` | `map-ux` skill | stop: run `map-ux` |
| `.dsx/maps/domain.json` | `map-ux` skill | stop: run `map-ux` |
| `.dsx/maps/design-system.json` (with `hazards[]`) | `map-ux` skill | stop: run `map-ux` |
| `DESIGN.md` | `design-md` skill (Mode A extracts from the code and from `design-system.json`) | stop: run `design-md` |
| the project's DTCG tokens (`tokens/*.tokens.json` or `*.tokens.json`) | `tokens` skill | **does not block** — without them, values come from `design-system.json` |
| `UX.md` | `ux-md` skill (Mode A extracts from the code and the maps) | **does not block** — with it, the states pushed per screen are those in `states` + those of the screen's archetype, and sections may group by archetype; without it, states come from the code and the report says so |
| `.dsx/maps/tasks.json` | `map-ux` skill | does not block — without it, the Dialogs phase counts steps from the component |
| `design/as-is-to-be.md` | `confirm-maps` skill | does not block — without it, the Coverage phase has nothing to cross-check against; say so in the report |

If any mandatory one is missing, **stop and say which skill to run first** — do not
silently fall back to rediscovering from the code. Everything from here on treats these
files as fact.

**Compatibility with the previous flow:** look in `.dsx/maps/` first;
if it does not exist, accept the legacy `.dsx/mapas/` (Portuguese names: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; old camelCase JSON keys, such as `generatedAt` or `subPages`, count as the new snake_case ones; all with the warning "old name, rename to X") and `.claude/figma-claude/` (`ui-map.json`,
`user-flows.json`, `task-flows.json`, `journey-map.json`, `domain-map.json`,
`design-system.json`, `figma-harness.md` in `design/`) and warn that it will be
rewritten to the new path on the next run of `map-ux`. The maps' JSON keys
stay in English (`entities`, `uncertain`, `hazards`, `edges`…) — they are a
machine contract.

**Stale map?** If `design-system.json` is older than the last change to the
project's theme/tokens, run `map-ux` again before the Foundations phase.

## Orchestration order

This skill calls the existing ones, each reading its own part of the artifacts instead
of rediscovering, in this order:

1. `map-ux` — only if `design-system.json` (or another map) is stale;
2. `figma-foundations` — tokens → variables, text styles, icons;
3. `figma-mirror` — screens, dialogs, flows, states;
4. `figma-coverage` — closing verification.

Before any discovery `use_figma`, read `design/figma-reference.json`
(`figma-conventions` skill) — already known ids and names are there.

## Source of truth for the foundations — DESIGN.md + tokens

Lookup order for values: DTCG tokens (`tokens/*.tokens.json` or
`*.tokens.json`) → `.dsx/maps/design-system.json` → `ui-map` → theme
detected in the code.

With DTCG tokens, generate the variable plan with the DSX bridge instead of
assembling variable by variable:

```bash
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens <tokens-folder>           # plan (JSON) — read it first
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens <tokens-folder> --script > /tmp/vars.js
```

Paste the generated script (`/tmp/vars.js`) into `use_figma`. It is idempotent: it reuses
collection, mode and variable by name and only creates what is missing. Resulting scheme:
`Primitivos` (mode `Valor`), `Semântico` (modes `Claro`/`Escuro`, aliases to
Primitivos), `Componente` (aliases to Semântico); names = DTCG path with
`/` instead of `.` (`color/text/primary`, `color/action/primary`,
`space/stack-md`, `radius/control`). Details in the `figma-foundations` skill.

The usage rules for each color come from the "Colors" table in `DESIGN.md` — they become
the variable's `description` in Figma and the caption of the swatches in
`00 · Fundamentos`. A variable with no usage rule in `DESIGN.md` is a gap: record it
as a finding, do not invent the rule.

## The state ledger — mandatory for anything beyond a handful of calls

Write `.dsx/figma/ledger.json` after **every** call that changes the
file, not only at the end. Format (keys in English — machine contract):

```json
{
  "run_id": "levar-2026-08-18",
  "phase": "screens",
  "step": "route:/demandas",
  "entities": {
    "collections": { "Primitivos": "id:...", "Semântico": "id:...", "Componente": "id:..." },
    "variables": { "color/action/primary": "id:..." },
    "text_styles": { "Título/Página (h4)": "id:..." },
    "components": { "Chip": "key:...", "Botão": "key:..." },
    "pages": { "00 · Fundamentos": "id:...", "02 · Demandas": "id:..." },
    "wrappers": { "/demandas": "id:..." }
  },
  "pending_validations": ["/demandas:screenshot"],
  "completed_steps": ["foundations", "chrome"]
}
```

Read this file at the start of **every phase**, not just once at the beginning of the
run — a run resumed in a new conversation has no memory of anything
beyond this file and what is actually in the Figma file. Never
hallucinate an id from earlier in the conversation; if it is not in this file,
rederive it with a read-only query (by the deterministic name) before
using it. This is the mechanism that makes a run of 50–100+ calls
resumable instead of an all-or-nothing script.

Compatibility: a legacy ledger at `.claude/figma-claude/figma-registry.json`
is read as the starting point and rewritten to `.dsx/figma/ledger.json`; a ledger with camelCase keys (`runId`, `textStyles`, `pendingValidations`, `completedSteps`) is read with the warning "old name, rename to X" and rewritten in snake_case.

**Never take `completed_steps`/`phase`/`step` at face value on a
resume.** The last ledger write of an interrupted run is
often stale — a real run of this skill was resumed from a
ledger that said 2 of 34 screens built when a live sweep of the
file found 22 already there (the process had died on an API error and then
on a machine sleep before either write landed). Before
continuing any resumed run — new conversation, retry after
a failure, or after any interruption — run a read-only `use_figma` call
that sweeps the live file (page/frame names, by the same
deterministic convention used to create them) and reconcile it with the ledger
first. Where they disagree, the live file wins: fix the ledger to
match before writing anything new, and only then resume. This
reconciliation is mandatory on every resume, not a resource for when something
looks wrong.

## Reuse before create

Before building any component or screen, check whether the target
file — or a library already linked to it — already has it:

1. `get_libraries` on the target file, **before** `search_design_system`.
   An empty result does not prove there is no library — it is paginated; paginate
   before concluding there is nothing to search.
2. `search_design_system`, one term per call, never a compound query
   ("button" and "input" in two calls, not one "button input").
3. `getLocalVariableCollectionsAsync()` only sees **local** variables. The
   variables of a published library are invisible to it. If the file
   uses a library, `search_design_system` with `includeVariables: true` is the
   only way to find them — do not conclude "there are no variables" from the
   local call alone.

Reuse if the property API and the token binding model match; wrap
a nested instance if the visual matches but the API does not; rebuild only when
neither works. This is what stops a new run from creating a
second, slightly different `Botão` next to one that already exists. The
full criterion for evolving vs. creating a kit piece is in the
`figma-conventions` skill.

## Hazard exposure — never normalize silently

The `hazards[]` of `design-system.json` (`duplicated-hex`, `off-palette-hex`,
`duplicated-radius`, `duplicated-shadow`, `mode-conditional-color-logic`,
`canvas-font-mismatch`, `unloaded-font`, `near-zero-yield-adapter`) are drift
findings, not defects to fix quietly while mirroring. In
`00 · Fundamentos`, next to the swatch or style each hazard affects,
add a small, visually distinct alert frame (dashed border,
token `color/feedback/warning-icon`) with the hazard's `detail` and `evidence`
(file:line) as its caption. It is rule zero — mirror what exists,
do not redesign — applied to tokens the same way it already applies to ugly screens
in `figma-mirror`. Each hazard also becomes a block in
`design/figma-findings/<round>.md`, with 0–4 severity (format in the
`figma-mirror` skill, "Findings" section).

## Journey sections — as a layer on top, not in place

Keep the page scheme from `figma-mirror` (`02 · <main app>`,
`03 · <other profile>`, numbered by route/feature) — a persona-based page
taxonomy clashes with the way people look for things in a
file ("find the settings page"), and the existing scheme already separates
by role. Put the journeys on top with native Figma **Sections**, one
per named flow from `flows.json`, wrapping the frames that belong to it.
Use `devStatus` (`READY_FOR_DEV` / `COMPLETED`) on each section as a
real, adjustable build-progress marker — **not** as a drift detector:
the Plugin API does not track whether a node changed after the status was set (it is a
Figma-app-only signal, visible to humans). Round-to-round drift
detection remains what it already is — the content hash from
`tools/figma/diff-baseline.cjs`.

A section can only carry `devStatus` if it sits directly under a page
(or under another section that has no status) — do not nest a section
with a status inside another.

Some MCP bridges block `SectionNode.devStatus`. Check what the live
API actually allows before promising the status was set; if it refuses,
record it in the report and in the ledger, do not pretend.

`04 · Fluxos` is built from the edges of `flows.json` cross-referenced with the
personas/stages of `journey.json` — swimlanes per actor, synthesized stage
transitions with hazard/pain-point markers, not a literal dump of
one box per node of the raw graph.

## Wireframes

There is no separate lo-fi artifact. "Wireframes" here means the existing Essential
track of `figma-mirror` (foundations + one screen per route + flows, structure
only) — the uncertainty that normally justifies a deliberate lo-fi
pass does not apply when structure, text and hierarchy are already
resolved in running code. `04 · Fluxos` stays schematic
(boxes/diamonds/arrows) whatever the track; it is a genre distinction already
correctly separated in the page scheme, not a fidelity
downgrade.

## Real images

If the source is a web app and a screen contains real images (photos, illustrations,
anything that is not a solid fill or an icon), run
`generate_figma_design` against the same file in parallel with the component-based
build — it captures a pixel-by-pixel screenshot of the running app,
including images the Plugin API itself cannot fetch by URL.
Transfer the `imageHash` values of the capture's image fills
to the component-bound build and then delete the capture. Skipping this
when there are images leaves blank image frames.

## Execution plan

| Phase | Reads | Writes |
|---|---|---|
| 0. Gate | `design/figma-sync.md`, the mandatory artifacts | nothing — fails fast if any is missing |
| 1. Foundations | DTCG tokens (via `tokens-to-figma.mjs`) or `design-system.json`; `DESIGN.md` (usage rules); `hazards[]` | variables, text styles, icon components (`figma-foundations`) + hazard frames in `00` |
| 2. Chrome | shared layout from `ui-map.json` | chrome `COMPONENT`s, one call |
| 3. Screens | pages/sub-pages from `ui-map.json`, `domain.json` for sample data | `02`/`03` frames, wrapped in Sections by flow membership — one frame per `nav_visible` sub-page too, never folded into the parent (`figma-mirror` phase 4) |
| 4. Dialogs | modals from `ui-map.json`, step count from `tasks.json` | `05 · Diálogos` |
| 5. States | missing-state data from `ui-map.json` | `06 · Estados e variações` — placeholders marked as such, never fabricated |
| 6. Flows | `flows.json`, `journey.json` | `04 · Fluxos` swimlanes + route map |
| 7. Responsive | only real breakpoints found in the code | `07 · Responsivo` |
| 8. Coverage | `figma-coverage` matrix, cross-checked with `design/as-is-to-be.md` | `08 · Cobertura` |

Update the ledger after each phase, not only after each call. Screenshot
every frame and look — the `figma-mirror` verification applies here without exception.

## Closing

Without these steps, the next diff round presents everything as new:

1. **Regenerate the baseline** and **update the registry** `design/figma-sync.md`
   exactly as `figma-mirror` already does.
2. **Append** one line to `design/figma-changelog.jsonl`:

   ```jsonl
   {"round":"r1","date":"2026-08-18","direction":"code->figma","author":"figma-push","summary":"foundations + 34 screens + flows, essential track","frames_created":41,"frames_changed":0,"frames_removed":0,"tokens_changed":[],"turn_after":"design","findings":"design/figma-findings/r1.md"}
   ```

   Real counts (from the ledger reconciled with the live file), never
   estimated.
3. **Findings** (hazards, screens that did not fit the budget, refused
   `devStatus`) in `design/figma-findings/<round>.md`, with 0–4 severity.
4. **Regenerate** `design/figma-reference.json` (`figma-conventions` skill) — this
   skill always changes foundation and structure.
5. If this is the first build of the file, close with the conventions note in the
   file itself (`figma-conventions` skill, Part B).
