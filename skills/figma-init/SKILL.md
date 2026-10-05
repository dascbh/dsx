---
name: figma-init
description: "Sets up the code ↔ Figma cycle in a project: sync registry, Code Connect, first baseline, changelog and reference. Use the first time a project is going to work with Figma."
argument-hint: "[Figma link or fileKey]"
---

# figma-init — set up the Figma↔code cycle

> **DSX root:** two levels above this skill's base directory. Paths `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

Set up the Figma↔code cycle in this project. Use the `figma-cycle` skill as the
doctrine and follow its section "First setup of the cycle in a project".

## 0. Prerequisites

- **Official Figma MCP** connected, with the skills `figma-use` (mandatory
  before every `use_figma`), `figma-generate-library`, `figma-generate-design`,
  `figma-design-to-code` and `figma-create-new-file` available. With no file and
  no link, create one with `figma-create-new-file` instead of asking the user to
  create it by hand.
- **Existing registry?** If `design/figma-sync.md` already exists (or a legacy one
  with `vez:`), the cycle has already been set up: do not start over — read the
  turn (`/dsx:figma-turn`) and follow the round in the `figma-cycle` skill.

## 1. Maps before deciding

Check `.dsx/maps/project-map.md` and `.dsx/maps/ui-map.md` first. If only a
legacy one exists — `.dsx/mapas/` (`mapa-projeto.md`, `mapa-ui.md`) or
`.claude/figma-claude/` (`project-map.md`, `ui-map.md`) —
accept it and warn that it will be rewritten to `.dsx/maps/` on the next run. If
either is missing, run `/dsx:map-ux` before anything else — it is what tells
for certain which side the project was born on (the `figma_cycle` field of
`project-map.json` records whether a sync registry or baseline already exists)
instead of guessing below. If `design/as-is-to-be.md` does not exist either, offer
`/dsx:confirm-maps` before setting up the cycle — everything from here on treats the
maps as fact, and that skill is what confirms they deserve trust.

## 2. Which side the project was born on — the order changes

- **Has code, has no design file** → `/dsx:figma-push` (the full
  outbound pass: `figma-foundations`, `figma-mirror`, `figma-coverage`, from the
  project's `DESIGN.md` + tokens). The turn starts at `code`.
- **Has a design file, has no code** → `figma-first` skill. Do not
  mirror: the first pass back is implementation, not a load. The turn starts at
  `design`, and the baseline is taken after each implemented batch.
- **Has both** → do not set up from scratch; run `/dsx:figma-coverage` first
  to learn the size of the divergence and propose the path (what to re-mirror, what
  to pull, what to record as a known divergence).

## 3. Always close with the artifacts, in this order

1. **Code Connect** on the kit primitives (`figma-pull` skill, section 4) —
   makes every following round cheaper.
2. **Conventions written in the file itself** (`figma-conventions` skill) — a
   note on the canvas plus `.description` on the kit components, and the
   structural contract (numbered pages, frame names such as `Demandas · Lista (/demandas)` and
   `Diálogo · Novo produto (ProductsPage)` (pt-BR examples), `09 · Propostas` reserved for
   exploration), so that whoever opens the file without DSX knows the naming pattern
   instead of accidentally breaking the round-trip pairing.
3. **First baseline committed** — paste `tools/figma/snapshot.js` with
   `MODE = 'full'` into a `use_figma` and save the result to
   `design/figma-baseline/<file>.json`. File too large for one
   response: fall back to `MODE = 'hashes'` and note it under `## Known divergences`
   (`figma-cycle` skill, step 3 of the round).
4. **Sync registry, changelog and reference — all three are born together**,
   not in separate rounds:

   - `design/figma-sync.md` — with the turn defined and explained to the user; it is
     what the `turn-guard` hook reads to block improper writes.

     ```markdown
     # Figma sync

     file: <fileKey>  ·  https://figma.com/design/<fileKey>
     turn: code                        # code | design | applying
     since: <YYYY-MM-DD>
     baseline: design/figma-baseline/

     ## Rounds
     - r1 · <YYYY-MM-DD> · <full mirror | initial implementation> (<pages>, <N> frames) · turn → <turn>

     ## Pending (scope of this round, not built yet)
     - None

     ## Open proposals
     - None

     ## Applied in the last round
     - None

     ## Rejected (with reason, so they do not come back)
     - None

     ## Known divergences
     - None
     ```

   - `design/figma-changelog.jsonl` — the first line (append-only from here
     on), with real counts, not estimated ones:

     ```jsonl
     {"round":"r1","date":"<YYYY-MM-DD>","direction":"code->figma","author":"figma-push","summary":"full mirror, 00-08, <N> frames","frames_created":<N>,"frames_changed":0,"frames_removed":0,"tokens_changed":[],"turn_after":"code","findings":"design/figma-findings/r1.md"}
     ```

     Through the `figma-first` entry point, `direction` is `figma->code` and `author` is
     `figma-first`.

   - `design/figma-reference.json` — the current facts of the file (fileKey,
     pages → id, the `Primitivos`/`Semântico`/`Componente` collections and their modes,
     variables, text styles, icons, kit, and the `frames` list that mirrors the
     coverage matrix), so that every agent reads it with `Read` before
     rediscovering through the API. Full format and regeneration rules in the
     `figma-conventions` skill.

   Findings from the first round (measured bug, action with no effect, duplicated token)
   go to `design/figma-findings/r1.md`, with the DSX 0–4 severity (`review-ux`
   skill) — they do not stay only in the conversation.

## 4. The initial turn

- `figma-push` entry point: `turn: design` **only** if the mirror actually covered everything it
  set out to (check the coverage matrix and whether any screen/flow/state was
  deferred instead of built). Anything left over → list it under `## Pending` and keep
  `turn: code` until it is empty. A large first mirror usually runs in several
  passes with a fixed budget; one of them deferring part of the scope is normal — handing over
  the turn with that still pending is not.
- `figma-first` entry point: `turn: design` from the start; Figma is the source
  while the code does not cover the file.

Finish by telling the user, out loud, the two rules nobody reads later:
**never re-mirror while it is design's turn** and **regenerate the baseline when closing the
round**.

Argument received (Figma link or fileKey, if any): $ARGUMENTS
