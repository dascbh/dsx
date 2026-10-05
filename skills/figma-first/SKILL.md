---
name: figma-first
description: "Implements a project that is born in Figma: the foundation becomes DTCG tokens and DESIGN.md before the first screen, then the screens go through the DSX gates. Use when a design file exists and there is no code yet."
---

# figma-first — the foundation before the first screen

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

When a project is born in Figma, the mistake is to start with the prettiest
screen. Each screen implemented in isolation invents its own spacing, colors and
components; by the tenth, there are ten different buttons and no design system —
even if the Figma file had one.

The order is not negotiable: **foundation → skeleton → screens → verification**.

## Before anything else

Load the **`figma-design-to-code`** skill before `get_design_context`, and
**`figma-use`** before any `use_figma`.
Tools for this direction: `get_variable_defs` (tokens), `get_design_context`
(structure and values), `get_metadata` (shallow map), `get_screenshot` (the
visual target), `download_assets` (icons and images), `add_code_connect_map`
(the durable bridge).

## 1. Read the file before coding anything

Inventory first — how many screens exist, and how many are **real** screens:

```js
// use_figma
return figma.root.children.map(p => ({ page: p.name, frames: p.children.map(c => c.name) }));
```

Classify each frame with the user, because the file does not say:

| it is | signal | becomes code? |
|---|---|---|
| screen | its own route, its own state | yes |
| variant/state | the same screen in another situation | yes, but inside the same route |
| exploration | two or three versions of the same thing | **no** — ask which one won |
| draft | off-pattern compared to the rest, half-built | **no** |
| reference | inspiration, a competitor screenshot | **no** |

Implementing explorations and drafts as if they were screens is the most common
way to ship an app twice the size the product needs.

## 2. Extract the foundation — before the first screen

The foundation becomes the same artifacts the rest of the DSX reads: **DTCG
tokens** in three layers (`tokens` skill) and **`DESIGN.md`** (`design-md`
skill). Do not carry variables straight into a hand-written theme file — the
theme is an output of the token build, not an input.

**Variables → DTCG tokens.** Take the full snapshot of the file and convert it
through the bridge, instead of copying `get_variable_defs` value by value:

1. Paste `tools/figma/snapshot.js` into `use_figma` with `MODE = 'full'` and
   save the result, for example, to `/tmp/figma-full.json` (the snapshot
   includes the variables with their modes and aliases).
2. Compare against the tokens (in a new project, the directory can start from
   the DSX base files in `tokens/`, copied into the project):

   ```bash
   node <DSX>/tools/figma/figma-to-tokens.mjs --snapshot /tmp/figma-full.json --tokens tokens/
   ```

   It prints the changes per token — value or alias, per `Claro`/`Escuro` mode —
   between the file's variables and the `*.tokens.json` files. Review the list:
   the variable name `color/text/primary` corresponds to the token
   `color.text.primary`; the `Primitivos`, `Semântico` and `Componente`
   collections correspond to the three layers (collection and mode names are
   Figma file text and stay as they are). The output has four blocks: **Token
   changes** (tokens that already exist and changed value or alias), **New
   variables in Figma** (with no matching token), **Suggestions** (a raw value
   that should be an alias to an existing primitive, or a missing ramp step)
   and **Tokens without a Figma variable**.
3. **New variables do not become tokens on their own** — the bridge never
   creates a token: a new token is a decision. In a project born from Figma,
   almost everything lands in that block on the first pass. Create the tokens
   through the `tokens` skill (right layer, name by intent, alias instead of a
   raw value, following the Suggestions), using the block as an inventory; then
   run the bridge again until New variables reaches zero or only the ones you
   decided not to bring remain (with a reason).
4. With the reviewed list, write the changes to the existing tokens:

   ```bash
   node <DSX>/tools/figma/figma-to-tokens.mjs --snapshot /tmp/figma-full.json --tokens tokens/ --write
   ```

   With `--write`, the bridge also runs the contrast gate from
   `contrast-pairs.json` and exits with code 1 if any pair falls below the
   minimum.
5. Follow the `tokens` skill from there: declare the pairs in
   `contrast-pairs.json` and run the build (`node <DSX>/tools/build-tokens.mjs --tokens tokens/` or the
   project's own). **A pair that fails contrast blocks** — the Figma file is not
   proof of accessibility; send it back to the designer with the pair and the
   measured ratio (`node <DSX>/tools/contrast.mjs "#fg" "#bg"`).

`get_variable_defs` is still useful to check a single frame (which variables it
actually uses), not as the source of the conversion.

If the file does not follow the three-collection scheme (a single collection
with raw colors per mode, appearance names like `blue-500` in the semantic
role), the bridge will show it in the diff: propose the missing layer
(primitives or semantics) in the `tokens` skill and send the naming proposal
back to the designer — do not rename silently in the code only.

**Text styles → type scale.** Same thing: name, family, weight, size, line
height — into `font.*` in the primitives and into the `typography:` block of
`DESIGN.md`. Odd sizes (13.5) are preserved.

**Rules → `DESIGN.md`.** Generate it with the `design-md` skill in **Mode B
(define)**, but with the values coming from the file, not from an interview or
from `palette.mjs`: the colors, the scale and the radii are the ones the bridge
has just written. Mode B's interview is kept for what Figma does not say —
product type, audience, density, tone of voice. The **Colors** table (Role |
Token | Where it appears | Where it NEVER appears) comes from the variable
descriptions and the swatch captions in the file; whatever is not written
there, ask the designer.

**Screens → `UX.md`.** Before the first screen, generate `UX.md` with the `ux-md` skill in **Mode B (define)**, starting from the file's screens: each screen frame gets an archetype from `archetypes/` based on the task it solves, and the policies (primary action position, dialog button order, confirmation, feedback, states) come from what the file's screens do — whatever diverges between screens of the same type is a question for the designer, not a silent choice. Without `UX.md`, the `build-ui` skill stops.

**Components → kit primitives.** The file's components say which pieces the
design assumes exist. Implement the ones that repeat in ≥ 2 screens, following
the `build-ui` skill's rules (semantic tokens only, all states).

### If the file has no variables

It is common: a file built with raw colors and hand-typed spacing. Do not move
on silently — the first delivery becomes **proposing the tokens**: collect the
repeated values, group them by role, build the proposal in DTCG (`tokens`
skill) and send it back to the designer so they bind the variables in the file
— preferably with `node <DSX>/tools/figma/tokens-to-figma.mjs --tokens tokens/ --script`,
which generates the `use_figma` script with the three collections already in
the format the way back expects (`figma-foundations` skill).

Without that, the code is born with hex scattered around and the cycle with
Figma never closes.

## 3. Skeleton before screens

Check `.dsx/maps/project-map.md` first — if the `map-ux` skill has already run,
it tells you what, if anything, already exists on the code side before you
decide the skeleton from scratch (compatibility: if it is missing, accept the
legacy `.claude/figma-claude/project-map.md` and warn that it will be rewritten
to the new path on the next run). Decide and confirm with the user before
implementing the second screen:

- **routes** — the navigation map (Figma rarely has one; sometimes there is a flow);
- **shell** — what is fixed (top bar, menu) and what changes;
- **roles** — who sees what; two similar screens are usually two profiles;
- **data source** — what comes from an API, what is local, what does not exist yet.

Information architecture (routes, names, hierarchy) can go through the `ux-ia`
skill when the file has no navigation map.

## 4. Implement screen by screen, from the kit outwards

Follow the `build-ui` skill. Tokens only, never raw values
(`tools/lint-raw-values.mjs` checks). Reuse the primitive; a pattern that does
not exist in the kit is a product decision, not an improvisation in the middle
of a screen — check in `patterns/index.json` whether the drawn interaction
pattern has an entry in the catalog and whether it is a pattern to avoid.

### What Figma does not carry — ask, do not invent

For each screen, before closing it:

- **states**: empty, loading, error, no permission. The file shows the happy
  path with six perfect items; the code needs the other four.
- **volume**: what happens with 4,000 rows, 200-character text, a name that
  does not fit.
- **data**: where each field comes from; what is computed; what is optional.
- **behavior**: what each action does, what requires confirmation, what is
  irreversible.
- **navigation**: how you get there and where you go back to.
- **responsive**: a 1440 frame is not a responsiveness decision — it is the
  only size anyone drew.
- **accessibility**: focus, tab order, labels for text-less icons, contrast
  (check it, do not trust the file) — `accessibility` skill.

Record the answers next to the code. They are half of the specification and they
are not in Figma. Run the `map-ux` skill again after implementing a batch of
screens — `.dsx/maps/domain.md` and `.dsx/maps/tasks.md` start capturing those
answers, since there is now real code to derive them from, and the next screen
does not re-ask what the previous one already settled.

### Translation traps

- **Text is a placeholder until proven otherwise.** Names, values and dates in
  the file are rarely the final copy — confirm labels and messages (`ux-writing`
  skill for glossary and formulas).
- **A Figma component ≠ a code component.** The designer's grouping is visual;
  the right boundary in code is the one of state and reuse.
- **Auto-layout is not CSS.** `HUG`/`FILL` map well to flex, but Figma has no
  breakpoints, no media queries and no dynamic content.
- **Icons: extract or map, do not redraw.** `download_assets` for the file's
  own; if the project adopts a library, map each one to its equivalent and show
  the list to the designer.

## 5. Code Connect from the start

When you create each primitive in code, map it to the Figma component
(`add_code_connect_map`). It is cheap now and transforms every following round:
`get_design_context` starts returning the code component's name instead of a
frame tree.

## 6. Verify by re-mirroring

Implemented a screen? Run `figma-mirror` **on that screen only** and compare it
with the original frame. A divergence you cannot explain is an implementation
bug or an unrecorded decision — both need handling now, not at delivery.

## 7. Matrix in both directions

Here coverage reads the opposite way from a project born in code: **Figma frame
→ implemented route**, with a status. Use `figma-coverage`, inversion section.
It is the matrix that answers "how much of the design has become product"
without anyone having to open both sides.

## When the first batch is done — set up the cycle

From then on the project has both sides, and the question "who is in charge
now?" starts to exist. Set up the sync record and the baseline (`figma-cycle`
skill, or `/dsx:figma-init`): in a project born in Figma, the turn usually
starts at `design`, and the baseline is taken **at the moment you implement** —
it is what defines the "before" of the first diff round. Along with the record
come the first line of `design/figma-changelog.jsonl`
(`direction: "figma->code"`) and the first `design/figma-reference.json`
(`figma-conventions` skill) — all three together, not in separate rounds.
