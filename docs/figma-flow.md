# DSX ↔ Figma flow

DSX treats code and Figma as **two sides of a continuous cycle**. Code remains the product's source of truth; Figma is where you **see the whole, explore alternatives and refine** — what it does better than code — and what comes out of it returns to the project **through the same quality gates** as any change made by an agent.

```
                 ┌──────────────── project (source of truth) ─────────────────┐
                 │  code  ·  DESIGN.md  ·  DTCG tokens  ·  .dsx/maps/          │
                 └──────┬───────────────────────────────────────────▲─────────┘
       map-ux           │ push                                       │ pull
       confirm-maps     ▼                                            │
                 figma-push ─► figma-foundations (tokens → variables) │ figma-pull
                            └► figma-mirror (screens, states)         │  ├ DSX gates: contrast,
                                     │                                │  │ patterns, a11y, text
                                     ▼                                │  └ token → tokens skill
                 ┌──────────────── Figma file ─────────────┐          │    primitive/composition →
                 │ 00–08 mirror of the present              │          │    build-ui
                 │ 09 · Propostas  ◄── figma-proposals (A)  │──diff────┘
                 │   design refinement, alternatives        │  figma-diff
                 └──────────────────────────────────────────┘  figma-proposals (B: preflight)

   figma-turn (who holds authority) · figma-cycle (governance) · turn-guard (hook) · figma-coverage
```

## From scratch, in a project that already has code

| # | Step | Skill | Touches Figma? |
|---|---|---|---|
| 1 | Map the project: structure, UI, flows, tasks, journey, domain, real design system (with hazards) | `/dsx:map-ux` | no |
| 2 | Confirm what the maps inferred, against your specs; produces the AS-IS/TO-BE | `/dsx:confirm-maps` | no |
| 3 | Foundation in code: DESIGN.md, UX.md and tokens with verified contrast | `/dsx:init` (uses `design-md`, `ux-md` and `tokens`) | no |
| 4 | Set up the cycle: sync registry, Code Connect, first baseline | `/dsx:figma-init` | yes |
| 5 | Push to Figma: variables (3 collections, Light/Dark), styles, real icons, one screen per route, dialogs and states, sections by journey | `/dsx:figma-push` | yes |
| 6 | Conventions in the file itself, for anyone who opens it without DSX | `/dsx:figma-conventions` | yes |
| 7 | Hand the turn to design | `/dsx:figma-turn design` | — |

Steps 1–3 serve all of DSX, not just Figma: `build-ui` gets to know flows and domain, and `audit-ds` uses the hazards.

## The round (always repeats)

1. **Explore / refine in Figma.** Ask the agent for alternatives (`/dsx:figma-proposals`, explore mode) or refine it yourself. The mirror is edited in place; alternatives go to `09 · Propostas`.
2. **Preflight.** `/dsx:figma-proposals` (critique mode) runs heuristics, patterns, contrast, text and kit over what was drawn — before it becomes code.
3. **Diff.** `/dsx:figma-diff`: current snapshot × versioned baseline, already classified as `token` / `primitive` / `composition`.
4. **Pull.** `/dsx:figma-pull`: applies at the right layer (token → primitive → composition → text), with the DSX gates. A variable change becomes a DTCG diff via `tools/figma/figma-to-tokens.mjs` and only goes in if the token build passes contrast.
5. **Close.** Registry updated (applied, refused with a reason), touched screens re-mirrored, baseline regenerated, one line in `design/figma-changelog.jsonl`. The turn goes back to code.

## Files the cycle keeps in your project

| File | For whom | What |
|---|---|---|
| `design/figma-sync.md` | people | `turn:`, rounds, open proposals, applied, **refused with a reason**, known divergences |
| `design/figma-changelog.jsonl` | agents | one structured line per round (append-only) |
| `design/figma-findings/<round>.md` | both | full findings of the round, severity 0–4 |
| `design/figma-reference.json` | agents | current ids and names (collections, styles, frames) |
| `design/figma-baseline/*.json` | diff | the canonical "before" — git becomes the design file's history |
| `design/as-is-to-be.md` | both | baseline confirmed by `confirm-maps` |
| `.dsx/maps/*` | agents | project maps (structure, UI, flows, tasks, journey, domain, design system) |
| `.dsx/figma/ledger.json` | agents | resumable state of `figma-push` |

## The rule that keeps everything standing

**One authority at a time**, written in `design/figma-sync.md`:

| `turn:` | means | forbidden |
|---|---|---|
| `code` | Figma is a mirror | refining in Figma expecting it to survive |
| `design` | refinement in progress in Figma | **re-mirroring** — the `turn-guard` hook denies the write |
| `applying` | proposals becoming code | touching the same files from outside |

## Requirements

- Official Figma MCP connected in the session (the skills load `figma-use` and the other official skills before writing).
- Python 3 (the guard hook) and Node ≥ 20 (tools).

## Projects that already used the previous flow

DSX reads the old paths (`.dsx/mapas/` with Portuguese names, `.claude/figma-claude/…`), the registry with `vez:` (values `codigo`/`design`/`aplicando`) and the changelog with Portuguese keys (`rodada`, `direcao`, `vezApos`…), warning "old name, rename to X". On the next run, maps are rewritten in `.dsx/maps/`, and what DSX writes to the registry and the changelog uses only the new names (`turn: code | design | applying`, `round`, `direction`, `turn_after`…). Baseline, `figma-sync.md` and the Figma file stay valid without change.
