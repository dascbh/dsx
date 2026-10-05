---
name: figma-mirror
description: "Rebuilds in Figma the screens that already exist in code (one per route, plus dialogs and states), without redesigning, and records findings. Use to put the app into Figma or to re-mirror changed screens during the code's turn."
---

# figma-mirror — the code is the source, Figma is the mirror

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

Teams that built the product straight in code usually have no design file, or
have one that diverged years ago. The wrong reflex is to redesign in Figma "the
way it should be": the result is a beautiful file that **does not describe the
product**, and the first person who trusts it implements something that does
not exist.

This skill does the opposite — it derives the file from the code, piece by
piece, and ends with a proof of coverage.

**Input (optional):** `[essential|complete] [route or file, for a targeted re-mirror]` (the old values `essencial`/`completa` are still accepted).

## Before writing anything to Figma — the turn

Read the sync record (`design/figma-sync.md`, `figma-cycle` skill):

- If `turn: design`, **stop** and tell the user. Refinement is in progress;
  mirroring now overwrites it. (The `turn-guard` hook also blocks, but do not
  let the hook be the first to warn.) A legacy record with `vez: design` counts
  the same.
- If there is no record, the project has no cycle yet: offer
  `/dsx:figma-init`.

From round 2 on, **re-mirroring is incremental**: only the screens the code
changed since the last sync.

```bash
git diff --name-only <ultimo-sync>..HEAD -- src/pages src/components src/theme.ts
```

(Adjust the paths to the project's structure — `.dsx/maps/project-map.md` says
where pages, components and theme live.)

## Rule zero — it is a mirror, not a redesign

If a screen is ugly, inconsistent or broken in the code, **draw it as it is**
and record the finding on a separate board (and in the findings file — see
"Findings"). Fixing it in Figma creates a lie: someone compares the two and
concludes the implementation regressed.

This applies to odd density, color outside the tokens, no mobile treatment, a
list with no empty state. The mirror shows the product; critique is another job
(`review-ux` skill).

**The other way to break rule zero: describing instead of drawing.** A screen
with dense or dynamic content — a chat thread, a live table, a composer with
real controls — is no license to write what it would look like instead of
building it. A caption like *"Composer enabled — sends to
`POST /channels/:id/messages`"* describes behavior; it is not a mirror of the
UI, and it passes a screenshot-only check just as cleanly as the real thing
would. Build the real nodes — message bubbles with the fictional data from the
domain map, real filter chips, real buttons with their real labels and icons —
the same way every other screen is built, even if it costs more calls. If a
screen's density genuinely does not fit the track's budget, say so out loud and
record it as a scope decision under `Known divergences` in `figma-sync.md` — do
not silently substitute prose and let the coverage matrix report it as done.

## Proportional track — ask for the target before starting

| track | delivers | when |
|---|---|---|
| **Essential** | foundations + one screen per route + flows | designer onboarding, product presentation, redesign baseline |
| **Complete** | + dialogs, states/variations, responsive, coverage matrix | Figma becomes living documentation and someone will audit it against the code |

The complete track for a mid-sized app goes past a hundred frames and twenty MCP
calls. When in doubt, do the essential one and offer the complete one.

## Tooling

The official Figma MCP. **Load the `figma-use` skill before every call to
`use_figma`** and `figma-create-new-file` before `create_new_file`. Also load
**`figma-generate-design`** — Figma's own official skill for building screens
from code — for its wrapper-first build order, its reuse-before-creating
discovery and its font-family assertion; the phases below assume those
mechanics instead of re-deriving them. If the user has more than one team/plan,
ask which one to create the file in before creating it.

Called from the `figma-push` skill? It has already checked the turn and the
maps — go straight to the phases below using `.dsx/maps/ui-map.json` and
`.dsx/maps/domain.json` as the source of what gets built, not this skill's
grep inventory.

**Where to read the maps.** Look in `.dsx/maps/` first; if it does not exist,
accept the legacy `.dsx/mapas/` (Portuguese names: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; old camelCase JSON keys such as `generatedAt` or `subPages` count as the new snake_case ones; all with the warning "old name, rename to X") and `.claude/figma-claude/` (`ui-map.*`, `project-map.*`,
`user-flows.*`, `task-flows.*`, `journey-map.*`, `domain-map.*`,
`design-system.json`), and warn that it will be rewritten to the new path on
the next run of the `map-ux` skill. Before any discovery `use_figma`, read
`design/figma-reference.json` (`figma-conventions` skill) — collection ids, the
icon frame and the chrome are already there.

## Phases

**1. Inventory.** Enumerate the surfaces from the code, not from memory: router
routes, dialogs, panels, overlays, states. Use the `figma-coverage` skill — it
produces the checklist that becomes the matrix at the end. Skipping this phase
is what makes the mirror look complete when it is not. If
`.dsx/maps/ui-map.md` exists, start from it — it already has the hierarchy of
pages, modals and states worked out; fall back to `.dsx/maps/project-map.md`
for the overall structure, and run the `map-ux` skill again first if the
project has changed since either of them was written.

**2. Foundations.** Variables with light/dark modes, numeric scale, text styles
and the project's real icons. Use the `figma-foundations` skill. The source of
truth is `DESIGN.md` + the project's tokens: DTCG tokens
(`tokens/*.tokens.json`) when they exist; otherwise
`.dsx/maps/design-system.json` — if it does not exist yet, run the `map-ux`
skill first (it extracts tokens with per-framework adapters — MUI, Tailwind,
CSS variables — instead of grep heuristics, and points out where the code
diverges from its own declared theme).

**3. Chrome as a component.** AppBar, side menu (open and collapsed) — whatever
repeats on every screen becomes a `COMPONENT`, and the screens use instances.
It cuts the cost of the following phases in half.

**4. Screens.** One per route, built with the `tools/figma/prelude.js` helper
library (pasted at the top of each `use_figma` script; fill in the CONFIGURE
block with the ids from `design/figma-reference.json`) instead of loose nodes —
it comes out with real auto-layout, not absolute positioning. Traps in
[references/plugin-api.md](references/plugin-api.md). Before composing
something that seems to repeat a pattern from another screen, correlate it with
the kit instead of recreating it — `figma-conventions` skill, section 3 (and
section 5 if the kit does not have the piece yet).

A route whose entry in `ui-map.json` lists `sub_pages` with
`nav_visible: true` needs **one frame per sub-page**, not one for the parent —
even if they share the source component. Build each one with that sub-page's
filter/state actually applied (real data for that filter, from `domain.json`),
not a copy of the parent's content. A shared component serving three visible
navigation destinations is three frames, never one.

**5. Dialogs and states.** One frame per dialog over a scrim; one per relevant
variation: empty, loading, error, each outcome of a flow with more than one
ending, menus and toasts. Use a block DSL (`['field', label, value]`,
`['alert', tone, text]`) — without it, thirty dialogs become thirty
unrepeatable scripts. If `.dsx/maps/tasks.md` exists, use its step lists to
know how many frames a multi-step task really needs, instead of re-deriving
from the component.

**6. Flows.** Swimlanes per actor, boxes with title + subtitle, elbow
connectors with **one** arrowhead. Add the route map: it is the most consulted
diagram and the cheapest. If `.dsx/maps/flows.md` exists, start from its named
flows and entry/exit points instead of retracing navigation calls;
`.dsx/maps/journey.md` gives the lanes their actors (personas/roles) and the
stages worth showing.

**7. Responsive.** Draw mobile **only where the code has a real breakpoint**.
Where it does not, draw the real result of the narrow viewport and record it as
a finding — it is information, not omission.

**8. Coverage.** Close with the matrix (`figma-coverage` skill), checking the
phase 1 checklist against what exists in the file.

## Sample data

Realistic and fictional, from the product's domain, with **visible risk
states**: something late, something returned, something awaiting a decision, a
field not filled in. A list where everything is green does not show the design
system — it shows the happy path, which is exactly what the design does not
need to prove. If `.dsx/maps/domain.md` exists, take the fields, enums and
business rules from it instead of inventing some that look plausible.

Never `Lorem ipsum`, never "Item 1 / Item 2", never the name of a real company
other than the user's own. State on the cover that the data is fictional.

## File organization

Numbered pages — the numbering is the index (page names are Figma file text and
stay as they are):

```
00 · Fundamentos      cover + color + typography/shape
01 · Componentes      icons, chrome, primitives kit
02 · <app principal>  one screen per route
03 · <outro perfil>   another role's portal + public screens
04 · Fluxos
05 · Diálogos
06 · Estados e variações
07 · Responsivo
08 · Cobertura
09 · Propostas        reserved for design exploration (figma-proposals skill), never product content
```

If `.dsx/maps/journey.md` found more than one persona/role, use it to decide the
`02`/`03`/… split — do not guess from the route paths.

The frame name carries its origin in the code — without it the coverage matrix
becomes guesswork (pt-BR examples):

```
Demandas · Lista (/demandas)
Diálogo · Novo produto (ProductsPage)
Overlay · menu de notificações (NotificationBell)
```

The full naming contract, when a new page is justified, and how to edit a kit
component without breaking instances: `figma-conventions` skill.

## Verification — at every phase, no exceptions

Take a **screenshot of each frame** and look at it. The Plugin API accepts
impossible layouts without complaint: a column collapsed to 10px, a table
overflowing the card, white text on a white background, an icon flipped inside
out. You only find out by looking.

Never declare a phase done without having seen the rendered result.

A screenshot catches broken layout; it does not catch content substitution — a
frame with tidy auto-layout and an explanatory paragraph passes a layout glance
as easily as one with real UI. Before closing the Screens phase, pick the 2–3
densest or most dynamic screens (chat, live tables, composers with several
fields) and compare the frame's real node tree with the source component's
JSX/render, element by element — not just the screenshot. That check is what
catches an agent taking the "describe it in a text node instead of building it"
shortcut under time pressure; a `figma-sync.md` full of correctly recorded
divergences does not prove that did not happen — it only proves what was looked
for.

## Findings — data, not narrative

A mirror round often discovers real things about the product (a measured
responsive bug, a button that does nothing, a duplicated token, a list with no
empty state). Two records, always both:

1. **In Figma**, a finding board next to the frame (dashed border,
   `color/feedback/warning-icon` token), with the short text of the finding —
   it is what a designer sees.
2. **In the repository**, in `design/figma-findings/<round>.md` (e.g.
   `design/figma-findings/r3.md`) — if the finding only exists in the chat reply
   that produced the round, it disappears as soon as the conversation is
   archived.

One block per finding, with the DSX 0–4 severity scale (defined in the
`review-ux` skill: 0 not a problem · 1 cosmetic · 2 minor · 3 major ·
4 catastrophe; severity = frequency × impact × persistence; an accessibility
barrier that blocks the task is always 4):

Same format as the findings file of the `figma-cycle` skill (one `###` per
finding, id `A-<round>-<nn>`):

```markdown
### A-r3-02 · Demands table overflows at 1024px
- where: `src/pages/DemandsPage.tsx:142` · frame `02 · Demandas › Demandas · Lista (/demandas)`
- what happens: below 1100px the "Prazo" column leaves the card; there is no horizontal scroll
- why it is a problem: the person loses the deadline, which is the list's risk information
- severity: 3
- evidence: screenshot of the frame at 1024px; Σ widths 1180 > inner width 1008
- mirrored as: drawn as it is (rule zero), finding board next to the frame
- destination: fix in code (`build-ui` skill) — not in Figma
```

Adversarial-review precision: measured, with file:line, never "looks odd".
Sort by severity. A finding of severity ≥ 3 is also cited in one line in the
final report to the user.

## Definition of done

- [ ] Every router route has a frame — or is declared out of scope, with a reason
- [ ] Every dialog in the code has a frame (complete track)
- [ ] Variables with both modes + a proof frame in dark mode
- [ ] Icons are the project's own, not approximations
- [ ] No table overflows its container; no text leaves its frame
- [ ] Coverage matrix linking each UI file to its frames
- [ ] Findings recorded as findings (board in Figma + `design/figma-findings/<round>.md`, with 0–4 severity), not fixed in the drawing
- [ ] Every frame was seen rendered
- [ ] No screen replaces with descriptive text the interactive elements it
      actually contains (message bubbles, chips, buttons, form fields) —
      checked against the code on the densest screens, not just by screenshot

## Closing the round

Without these steps, the next diff round presents everything as new:

1. **Regenerate the baseline** (`tools/figma/snapshot.js` pasted into
   `use_figma`; mechanism in the `figma-cycle` skill,
   [references/diff.md](../figma-cycle/references/diff.md)).
2. **Update the record** `design/figma-sync.md` (round, frames touched,
   `Known divergences`, who gets the turn next).
3. **Append** one line to `design/figma-changelog.jsonl`
   (`"direction": "code->figma"`, real counts of frames
   created/changed/removed, `"findings": "design/figma-findings/<round>.md"`).
4. **Regenerate** `design/figma-reference.json` if the foundation or structure
   changed (`figma-conventions` skill).

## This is the outbound leg of a cycle

The mirror is step 1 of a continuous round trip: code → Figma → refinement →
code. Before mirroring **a file that already exists**, read the project's sync
record (`figma-cycle` skill) — re-mirroring while it is design's turn erases the
refinement done there.

From round 2 on, re-mirror only the screens the code changed since the last
sync. The way back is the `figma-pull` skill.
