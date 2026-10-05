# How the diff is made

> **DSX root:** three levels above this file. `tools/` paths are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

Figma does not give you a diff for free: the MCP does not expose version
history, and `setPluginData` — which could stamp a state inside the file — is a
forbidden API there. So the diff is made **against a canonical snapshot
versioned in the repository**, and git is what gives the design file its
history.

```
round N    ┌── snapshot ──▶ design/figma-baseline/*.json  (commit)
           │
   refinement in Figma
           │
round N+1  └── snapshot ──▶ compare with the baseline ──▶ change report
```

## Why not a visual diff

Comparing screenshots finds *that* something changed, never *what* changed: it
cannot tell "padding 16→12" from "font 14→13", does not know whether the color
came from a token, and fails on any reflow. It works as a human check at the
end — never as the mechanism.

## The canonical snapshot

The real problem of a structural diff is **noise**. A raw property dump changes
with every auto-layout recalculation and produces thousands of irrelevant
lines. The canonical projection ([tools/figma/snapshot.js](../../../tools/figma/snapshot.js),
pasted inside `use_figma` — it does not run in Node) keeps only what is a design
decision:

| keeps | discards |
|---|---|
| auto-layout: mode, paddings, gap, alignments, wrap | `x`/`y` of a child in auto-layout (derived) |
| sizing (`FIXED`/`HUG`/`FILL`) per axis | `width`/`height` when the axis is HUG or FILL (derived) |
| width/height **only** on the `FIXED` axis | `absoluteBoundingBox`, `absoluteTransform` |
| radius, stroke weight and border sides | style ids (keeps the **name**) |
| fill/stroke as the **token name** (`@color/action/primary`) or hex + opacity | rotation of 0, opacity of 1, `visible: true` |
| text: content, style, family/weight, size, line height, case, alignment, truncation | everything auto-layout recalculates on its own |
| child order | |

A fill bound to a variable becomes `@variable/name` — not the value. That is
what separates "someone changed this button's color" from "someone changed the
token and the whole app changed".

## Two phases — because the file is large

A 130-frame file has tens of thousands of nodes. Pulling everything every round
is expensive and unnecessary.

**Phase 1 — fingerprint.** A `use_figma` with `MODE = 'hashes'` returns, per
top-level frame, a hash of the canonical subtree and the node count. Small
response. Compare with the baseline: only frames whose hash changed go into
phase 2.

**Phase 2 — detail.** A second `use_figma`, with `MODE = 'full'` and `TARGETS`
restricted to the changed frames, returns the full projection of the nodes.
That is where the cost shows up — and only for what actually changed.

## Node identity across rounds

Primary key: **node `id`**. Editing in place preserves the id, and pairing is
exact.

Secondary key: **path** (`page/frame/name[ordinal]/name[ordinal]`). It helps
when the designer duplicates a frame or recreates a block — the id is new, but
the path matches. The diff matches by id, then tries the path for what is left,
and only then classifies as added/removed.

That is why the mirror's naming discipline (`SectionCard · Título`, `Chip`,
`Botão · primária`) is not aesthetics: without it, path pairing fails and every
recreated block becomes "removed + added".

## What the diff classifies on its own

Here the mechanism gives back more than saved work. Grouping identical
changes — same node name, same property, same from→to — yields the
classification the `figma-pull` skill asks for:

```
paddingTop 16 → 12   in `SectionCard · *`   · 7 frames   → PRIMITIVE
fontSize 13.5 → 13   in `linha › texto`     · 23 frames  → TOKEN (scale)
child order                                 · 1 frame    → COMPOSITION
```

The rule becomes arithmetic: **the same change in ≥ 2 frames is a primitive or
a token; in 1 frame it is composition**. What used to be judgment becomes
counting — and the classic mistake (applying it on the screen where it showed
up) becomes hard to make.

Grouping only works if the naming discipline above was actually followed — it
uses the name prefix before `' · '` as the key. When the same property change
appears in ≥ 2 frames, but under names that do not share a prefix, the report
says so explicitly, in a `## Possible naming problem` section, instead of
silently reporting N loose composition tweaks. That section is the diff
mechanism itself catching a violation of the naming convention — not something
someone has to spot by eye.

## Variables and styles are handled separately

The frame snapshot keeps the token *name*, so changing a variable's **value**
does not change any frame. That is why the snapshot also captures the variable
collection (name → value per mode, e.g. `Semântico/Claro`, `Semântico/Escuro`)
and the text styles.

A difference there is always `token` class, with app-wide effect: it enters the
report with a warning and requires a regression sweep in both themes. In the
DSX, it is not applied by hand in CSS: `node tools/figma/figma-to-tokens.mjs`
converts the snapshot into a DTCG diff, and the `tokens` skill applies it and
runs `tools/build-tokens.mjs` (which checks the contrast of every declared
pair — a failure blocks).

## The report

[tools/figma/diff-baseline.cjs](../../../tools/figma/diff-baseline.cjs) compares
two baselines and emits markdown ready for review:

```bash
node <DSX>/tools/figma/diff-baseline.cjs design/figma-baseline/app.json /tmp/atual.json
```

```markdown
## Tokens and styles — `token` class, affects the whole app
- `space/stack-md` {"Primitivos/Valor":16} → {"Primitivos/Valor":12}  ⚠

## Grouped (≥ 2 frames) — `primitive` class
- `SectionCard` · auto-layout · padTop 16 → 12 · **7 frames**
  <sub>02 · Demandas › Lista · 02 · Demanda › Detalhe · …</sub>

## Possible naming problem
- radius · 8 → 6 · **3 frames in total**, spread across: `CardResumo`, `Card de resumo`

## Per frame — `composition` class
### 02 · Demandas › Lista
- `ManagerBar` · child order: 4 children → 5 children
- + `Chip` "Em risco" in `02 · Demandas/Lista[1]/linha[3]/Fase[1]`
- − `Botão · terciária` "Resolver" in `02 · Demandas/Lista[1]/Precisa de você hoje[1]/linha[2]`

## New frames in Figma
- + 09 · Propostas › Demandas · lista densa
```

The `.cjs` is required: the DSX `package.json` is `"type": "module"`. The script
also accepts baselines from the previous flow with pt-BR keys (`variaveis`,
`estilos`, `nos`, `oculto`) — compatible with projects that already had a
committed baseline.

Attach a screenshot of the changed frame next to the report: the text says what
changed, the image says whether it looks good.

## When duplicating the frame is still worth it

The diff makes the `09 · Propostas` page **optional**, not useless. Duplicate
when the intent is to **explore alternatives** (two or three versions side by
side to choose from) — then you want both to coexist, and the diff of the chosen
one comes afterwards. For incremental refinement of a screen, editing in place
is better: id pairing stays exact and the baseline keeps the "before".

## Limits — say them out loud

- **The baseline is the "before" of record.** There is no image of the previous
  state unless someone saved one; the report describes, it does not illustrate.
- **The MCP's automatic componentization touches the snapshot.** When the
  server converts repeated structures into components, many nodes become
  `INSTANCE` and the diff flags a mass change. Recognize the pattern (identical
  change in dozens of frames, `FRAME`→`INSTANCE` type) and treat it as tool
  noise, not as a design decision.
- **Deep reordering** shows up as removal + addition when name and id change
  together. It is rare, and the report shows both sides for inspection.
- **File too large for `MODE = 'full'` in one go.** The `use_figma` response has
  a size ceiling; a full sweep of dozens of routes can truncate in the middle of
  the JSON. Fall back to `MODE = 'hashes'` and detail with `TARGETS` only what
  the hash flags (see the `figma-cycle` skill, step 3 of the round).
