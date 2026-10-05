---
name: map-ux
description: "Maps the project into .dsx/maps/: structure, UI, flows, tasks, journey, domain and the real design system with hazards, without touching the code or Figma. Use when inheriting or starting a project and before building, auditing or pushing to Figma."
argument-hint: "[project | full | design-system] [path to limit the scan, optional — defaults to the whole project]"
---

# map-ux — the first act, in silence

> **DSX root:** two levels above this skill's base directory. Paths `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; unprefixed paths (`design/`, `.dsx/`, `src/`) belong to the user's project.

This skill scans the project — the physical structure, the UI, the business
reality underneath it and the declared design system — and writes maps to
`.dsx/maps/`. It is a first act, not a report: the product is the files on
disk, not a message in this conversation.

## Who the maps are for (all of DSX, not just Figma)

The maps exist so that no other skill has to rediscover the project from
scratch. Who reads what:

| map | who reads it |
|---|---|
| `project-map.{md,json}` | every agent in this skill (they reuse the stack detection), `spec-analyzer` (list of docs), any skill that needs to know where routes, components, theme, tests and docs live |
| `ui-map.{md,json}` | `figma-mirror`, `figma-foundations`, `figma-coverage`, `figma-pull`; `build-ui` (inventory of pages, modals and kit before writing JSX) |
| `flows.{md,json}`, `tasks.{md,json}` | `build-ui` (where the screen leads, which steps and side effects the task has), the Flows phase of `figma-mirror`, `figma-pull` |
| `domain.{md,json}` | `build-ui` (real data shape, business and validation rules), `figma-pull`, `figma-first`, `figma-mirror` (realistic sample data instead of invented data) |
| `journey.{md,json}` | `review-ux` (personas, stages and touchpoints for the persona lenses and the cognitive walkthrough), `figma-mirror` (organizing screens by role, drawing flow diagrams) |
| `design-system.{json,md}` | `design-md` Mode A (real inventory instead of grep), `audit-ds` (`hazards[]` as the starting point for drift), `figma-foundations` (variables, styles and icons), `figma-mirror` |

`ui-map.json` (from `ui-mapper`) already carries a lighter `design_system`
block — theme file, icon package, a few colors and spacings found in
passing. It remains the cheap signal for when step 3 has not run yet. When
`design-system.json` exists, it **replaces** the `design_system` block of
`ui-map.json` for everything that needs real fidelity — the richer map
wins, the same rule that already holds between `project-map.md` and
`ui-map.md`.

Facts a person has confirmed (flow names, dependencies between tasks,
relationships between entities) do **not** live in the maps: they live in
`.dsx/maps/confirmations.json`, which only the `confirm-maps` skill reads
and writes. This skill never touches that file — and since it regenerates
`flows.json`, `tasks.json` and `domain.json` from scratch, only
`confirm-maps` restores the confirmations to them.

## Modes

| mode | what runs | when |
|---|---|---|
| `project` | step 1 only | the project changed structure (folders, docs, stack) and only the physical map needs refreshing |
| `full` (default) | steps 1, 2 and 3, in that order | first act on a project, or when the UI and domain changed enough that the other skills would rediscover everything |
| `design-system` | step 3 only | the theme/config changed and `design-md`, `audit-ds`, `figma-foundations` or `figma-mirror` would otherwise redo the extraction on their own |

The old mode names (`projeto`, `completo`) are still accepted, with the warning "old name, rename to X".

The remaining argument, if any, is the **scope**: a path that limits the
scan (defaults to the whole project). Pass it on to every agent.

## Step 1 — physical structure (`project-mapper`)

Run the `project-mapper` agent (`agents/project-mapper.md`). It writes
`.dsx/maps/project-map.md` and `.dsx/maps/project-map.json`.

Run it whenever the project has changed since the last map, or as the very
first step on a project that has never run DSX: the agent always
regenerates both files from scratch and overwrites what was there, so the
map never drifts from what changed since the last read.

In `full` and `design-system` modes, if `.dsx/maps/project-map.md` does not
exist yet, this step is a prerequisite: every agent in steps 2 and 3 reuses
its stack detection instead of re-deriving it. In `full` mode it always
runs, fresh.

## Step 2 — UI and business reality (five agents in parallel)

Run five agents **in parallel, in a single message with five tool calls**:

- `ui-mapper` (`agents/ui-mapper.md`) — pages and subpages, modals, design
  system, typography, iconography, component kit, states →
  `.dsx/maps/ui-map.{md,json}`
- `flow-mapper` (`agents/flow-mapper.md`) — how the user moves between
  screens to reach a goal: the navigation graph, detours, entry and exit
  points → `.dsx/maps/flows.{md,json}`
- `task-mapper` (`agents/task-mapper.md`) — the steps inside a task, and
  which tasks depend on which → `.dsx/maps/tasks.{md,json}`
- `journey-mapper` (`agents/journey-mapper.md`) — the staged experience
  over time, per persona/role, tied to the platform's mission →
  `.dsx/maps/journey.{md,json}`
- `domain-mapper` (`agents/domain-mapper.md`) — business logic, data
  modeling, entities and their relationships → `.dsx/maps/domain.{md,json}`

Three of them (`flow-mapper`, `task-mapper`, `journey-mapper`)
opportunistically reuse a sibling's output *if it already exists*, to save
a re-derivation — but each one was written to fall back to its own grep
when that file is not there yet, which is exactly what happens with
siblings that have not finished within the same parallel batch. That
fallback is what makes it safe to launch all five at once, not the absence
of any relationship between them.

All five read code only (and, in the case of `journey-mapper`, docs) —
**none of them calls `use_figma` or creates anything in Figma.** That comes
later, in `figma-mirror`.

Every agent always regenerates its own files and overwrites what was there
before.

## Step 3 — declared design system (`design-system-extractor`)

Run the `design-system-extractor` agent
(`agents/design-system-extractor.md`). It writes
`.dsx/maps/design-system.json` and `.dsx/maps/design-system.md`.

This step reads code only — **no calls to `use_figma`**, nothing created in
Figma. That comes later, in `figma-foundations`, which reads this output
instead of looking for a theme file on its own.

Before extracting anything, read the ceiling statement below and stay
within it: the product is the **declared** token layer with mechanically
detected drift hazards, not a check against the rendered app, and
canvas/WebGL content (`react-force-graph-2d`, Three.js/`react-three-fiber`,
Phaser) has no native representation in Figma — it comes in as reference
data, clearly separated from the real tokens, never declared as one.

### Why it is a separate step

It is not part of step 2's parallel batch. The five mappers are cheap,
code-only greps that finish together; the extractor may execute the
project's own `createTheme()` call or run a real Tailwind v4 build, which
is heavier — that is why it runs alone, after the batch, and why the
`design-system` mode exists to redo it without paying for the rest (and
the `project` mode and step 2 never pay for it).

### Before promising anything to a designer or user

Static extraction delivers the **declared** token layer — what `theme.ts`,
the resolved Tailwind config or a `:root { --x }` block actually say. It
does **not** verify whether the **rendered** app matches those values.
Point-of-use overrides (`sx={{...}}` on an MUI component, a conditional
Tailwind class built with `clsx`/`cva`, an inline `style={{...}}`) are the
most common way real components diverge from the theme, and nothing here
catches that systematically — only the mechanical hazard checks below
catch specific, named patterns of it.

UI rendered in canvas and WebGL (`react-force-graph-2d`, `three.js` /
`react-three-fiber`, Phaser, or raw `getContext('2d')`) **has no native
representation in Figma, period.** Figma has no JS runtime and no WebGL
context. A node color computed from data at render time, a lit Three.js
material, a Phaser particle effect — none of that exists as a value until
the app actually runs, and Figma does not run the app. Capturing the
literal constants a canvas script was built from (a fixed palette, a fixed
font) is useful reference material. Declaring them as an interchangeable
design token, from which the rest of the pipeline can build a Figma
variable, is not — do not do it, and do not let a downstream skill do it.

**If asked "can it be 100% faithful, losing nothing": no.** DOM styling
(MUI/Tailwind/Emotion/CSS variables) gets high-fidelity extraction of what
is *declared*. Canvas/WebGL gets a documented reference snapshot, not a
token. Say so in plain words instead of letting an impressively detailed
artifact suggest more than it delivers.

### Several adapters, almost always

Real projects mix stacks. Of the four projects this doctrine was built on:
two needed MUI **and** Tailwind v4 together (Tailwind installed and
building, contributing almost zero real tokens — that combination is
itself a hazard worth naming, not a reason to pick one and ignore the
other); one needed Tailwind v3 **and** generic CSS variables **and** a
canvas adapter (Three.js) at the same time; only a pure Phaser game needed
exactly one adapter. Detect every adapter that applies and run them all —
never stop at the first one that matches.

### Hazards are signals, not verdicts

Every hazard the extractor reports (duplicate hex, off-palette color,
duplicate radius or shadow, mode-conditioned color logic, unloaded font,
canvas text in a font that does not match the real theme, near-zero-yield
adapter) comes from a named, repeatable, grep-based check — not from
reading the code and forming an opinion. It is a deliberate scope limit: a
signal always computed the same way is trustworthy in a way that "the
agent thought this looked wrong" is not. Treat a hazard as "look here",
not as "this is broken" — the same stance `uncertain[]` has in the other
maps. That is why `audit-ds` starts from `hazards[]` and still measures
drift on its own, and why `design-md` Mode A uses `design-system.json` as
an inventory without promoting a hazard to a decision.

### Icon and font fidelity, by source

- `@mui/icons-material` / `lucide-react`: read the path data from the
  package itself directly (the same mechanism `figma-foundations` already
  used — it moved, unchanged).
- Hand-made icon sets (a local `Icon.tsx` with a `PATHS` map): extract as a
  private icon package, with the same shape as a real package.
- `next/font`: read the resolved `.fontFamily` from the loader call's
  result, or the `@font-face` emitted in the build output — never assume
  it matches the npm package name (a `Variable` suffix mismatch was once a
  real, shipped bug in at least one project this doctrine was built on).
- `@fontsource*`: read the family the package itself registers, for the
  same reason.
- A font cited in a typography token with no loading mechanism found
  anywhere: that is the `unloaded-font` hazard, not a fact to drop
  silently.

## Silence

Do not paste, summarize or forward to the user what the agents found —
they will not return more than a line either. When the chosen mode
finishes, confirm in a single short line that the maps were refreshed,
naming the project (the `root` of `project-map.json`) so there is no
ambiguity in a session that switches between more than one, and including
the hazard count when step 3 ran. Then move on — nothing beyond that.

Example: `Maps refreshed in /path/to/project (full mode) — design system with 7 hazards.`

## Rules

- **Never calls `use_figma`.** This skill is code and docs only; it does
  not need the turn and is safe at any turn of the cycle (`code`, `design`
  or `applying` in `design/figma-sync.md`), without reading or changing the
  log.
- **Always overwrites.** Each agent regenerates its own files completely;
  it never merges with or patches the previous version.
- **Project with no code yet.** If the project was born in Figma and has
  not been implemented yet, most maps come back empty, and that is correct:
  do not invent content to fill them. Run `map-ux` again after the first
  batch of screens is implemented (`figma-first` already says to do so).
- **Compatibility with the previous flow.** When looking for a map, read
  `.dsx/maps/` first; if it does not exist, accept the legacy `.dsx/mapas/` (Portuguese names: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; old camelCase JSON keys such as `generatedAt` or `subPages` count as the new snake_case ones; all with the warning "old name, rename to X") and `.claude/figma-claude/` (`project-map.*`, `ui-map.*`, `user-flows.*`,
  `task-flows.*`, `journey-map.*`, `domain-map.*`, `design-system.*`) and
  warn that it will be rewritten at the new path on the next run. This
  skill always **writes** only to `.dsx/maps/` — which is exactly that next
  run.
- **JSON keys in English.** The map fields (`entities`, `uncertain`,
  `hazards`, `edges`, `design_system`…) are machine contract and stay as
  they are; the prose of the `.md` files is in English as well, like the
  rest of DSX.

## Setting up on a project for the first time

1. `/dsx:map-ux` (`full` mode) — the three steps.
2. If accuracy matters more than speed, `/dsx:confirm-maps` — confirms with
   the user what the maps flagged as inferred and writes
   `design/as-is-to-be.md`.
3. From then on, each skill reads the map that concerns it: `design-md`
   Mode A and `audit-ds` start from `design-system.json`; `build-ui` from
   `flows`/`tasks`/`domain`; `review-ux` from `journey`;
   `figma-foundations` builds Figma variables, styles and icon components
   from `design-system.json` instead of re-deriving them.
