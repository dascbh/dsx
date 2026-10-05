---
name: figma-foundations
description: "Brings the code's foundation into Figma: DTCG tokens become variables in 3 collections with Claro/Escuro (light/dark) modes, typography becomes text styles and the real icons become components. Use to put the design system or the tokens into Figma."
---

# figma-foundations — the code's tokens, not a new palette

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

A design system in Figma that did not come from the code becomes fiction in two
weeks. This skill carries the foundation **from the tokens and the theme into
Figma variables**, with both themes bound by mode, so that switching a frame's
mode reproduces the whole app's dark theme.

## Before anything else

Load the **`figma-use`** skill before every call to `use_figma`, and
**`figma-create-new-file`** before `create_new_file`. Also load
**`figma-generate-library`** — Figma's own official skill for building a design
system from code — before creating any variable or component. Its "reuse
before creating" discovery matters specifically here:
`getLocalVariableCollectionsAsync()` only sees local variables and will wrongly
say "nothing exists" when the file actually uses a published library. Skipping
any of these causes failures that are hard to diagnose.

If the user has more than one team/plan in Figma, ask which one to create the
file in — moving it later is manual work for them.

## 1. Find the source of truth

The source of truth for this direction is **`DESIGN.md` + the project's
tokens**. Look in this order and stop at the first one that exists:

1. **DTCG tokens** — `tokens/*.tokens.json` or `*.tokens.json` at the root (the
   three layers of the `tokens` skill: `primitives`, `semantic.light`,
   `semantic.dark`, `component`). With them, the path is the bridge in section
   2A — no reinterpreting the theme by hand.
2. **`.dsx/maps/design-system.json`** — the `map-ux` skill has already done the
   framework-aware extraction (MUI / Tailwind v3/v4 / CSS variables, not grep
   heuristics) plus the mechanical detection of drift *hazards* between the
   declared tokens and what the code actually uses.
3. **`.dsx/maps/ui-map.json`** — the lighter `design_system` block from the UI
   mapping (color tokens, spacing scale, font sizes, icons in use): workable,
   but less deep.
4. **`.dsx/maps/project-map.json`** — at least the theme file and the icon
   package.
5. **Detected theme** — search and stop at the first one that exists:

```bash
# theme/tokens
ls tokens/*.tokens.json *.tokens.json src/theme.ts src/theme/* tailwind.config.* tokens.json design-tokens.* 2>/dev/null
# foundation document (sometimes it exists and is worth more than the code)
ls DESIGN.md design/foundation.md docs/design-system.md .claude/*/design.md 2>/dev/null
# icon package
grep -m1 -o '"@[^"]*icons[^"]*"' package.json
```

**Compatibility:** when looking for a map, read `.dsx/maps/` first; if it does
not exist, accept the legacy `.dsx/mapas/` (Portuguese names: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; old camelCase JSON keys such as `generatedAt` or `subPages` count as the new snake_case ones; all with the warning "old name, rename to X") and `.claude/figma-claude/` (`design-system.json`,
`ui-map.json`, `project-map.json`), and warn that it will be rewritten to the
new path on the next `map-ux` run.

Read **`DESIGN.md`** (or the foundation document, if that is what exists) even
when the tokens exist: it carries **the rules** (which token may carry text,
which density, button hierarchy) that the code alone does not tell. The
**Colors** table in `DESIGN.md` (Role | Token | Where it appears | Where it
NEVER appears) is the source of the variable descriptions and the swatch
captions — it is what turns a color chart into a design system. If there is no
`DESIGN.md`, suggest generating one with the `design-md` skill (Mode A) before
or after this phase; do not invent rules to fill the caption.

## 2. Color and dimension variables

The scheme is always the same, in three collections (collection and mode names
are text in the Figma file and the bridge expects them literally):

| Collection | Modes | Values |
|---|---|---|
| `Primitivos` | `Valor` (single mode) | raw ramp values (`color/brand/600`, `space/4`) |
| `Semântico` | `Claro`, `Escuro` | **aliases** to Primitivos (`color/text/primary` → `color/neutral/950` in Claro) |
| `Componente` | `Valor` (single mode) | **aliases** to Semântico (`button/primary/bg` → `color/action/primary`) — they resolve according to the mode applied to the frame |

Variable name = DTCG token path with `/` instead of `.`:
`color.text.primary` → `color/text/primary`, `color.feedback.danger-icon` →
`color/feedback/danger-icon`, `space.stack-md` → `space/stack-md`,
`radius.control` → `radius/control`.

### 2A. With DTCG tokens — the bridge

Do not translate the JSON by hand. The DSX bridge reads the three layers and
generates an idempotent script to paste into `use_figma`:

```bash
# plan (to review what will be created: collections, modes, variables, aliases, scopes)
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens tokens/ --json
# script for use_figma
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens tokens/ --script > /tmp/vars.js
```

`--tokens` points to the directory with `primitives.tokens.json`,
`semantic.light.tokens.json`, `semantic.dark.tokens.json` and
`component.tokens.json`. The script creates (or reuses, by name) the
`Primitivos`, `Semântico` and `Componente` collections, the modes (`Valor`;
`Claro`/`Escuro` in Semântico), each
variable with the right type (`COLOR`, `FLOAT`), the **aliases** between layers
(`createVariableAlias`) and the `scopes`. Running it again duplicates nothing —
it reuses collection and variable by name and only updates values. Paste the
contents of `/tmp/vars.js` into `use_figma` (with `figma-use` loaded) and check
the result.

After the script, **enrich the descriptions** with the Colors table from
`DESIGN.md`: for each row, `variable.description = "<Where it appears>. Never:
<Where it NEVER appears>."` — it is what the designer sees when hovering over
the variable in the panel. If the token already has a `$description` in DTCG,
keep it; the `DESIGN.md` rule complements it, it does not replace it.

Review the plan before pasting: a semantic token with a raw value (no alias) in
DTCG is debt for the `tokens` skill, not something to "fix" in Figma — record
it as a finding.

### 2B. Without DTCG tokens — the project's theme

Keep the semantic names from their theme, but with the same three-collection
scheme when possible (raw colors in `Primitivos`, roles in `Semântico` with
`Claro` and `Escuro` modes). One variable per semantic token — **not** per raw
color. Name by role, grouping with `/`:

```
color/bg/canvas · color/bg/surface · color/bg/hover
color/border/default · color/border/card
color/text/primary · color/text/secondary · color/text/disabled
color/brand/primary-main · color/brand/primary-dark · color/brand/primary-contrast
color/feedback/success · color/feedback/warning · color/feedback/danger
```

If the theme has no primitives layer (only direct values per mode), create only
`Semântico` with direct values and record that as a finding — do not invent a
ramp.

### Scopes and colors outside the semantics

Set `scopes` per variable (`FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`,
`STROKE_COLOR`; `GAP`, `WIDTH_HEIGHT`, `CORNER_RADIUS` for numbers) — it is
what makes Figma suggest the right variable in the right place later.
Primitives get `scopes = []` (hidden from the pickers): nobody should paint a
frame with `color/brand/600` directly, only with the semantic one. Check the
scopes in the bridge's plan (`--json`); on path 2B, set them yourself.

If the theme has identity colors outside the semantic range (avatar per record
type, categorical chart palette), create a group of its own (`entity/…`) and
say in the swatch that it is deliberately outside the state semantics.

## 3. Numeric scale and typography

**Spacing, radius and sizes.** With DTCG tokens, the spacing scale
(`space.*`), the radii (`radius.*`) and the sizes (`size.touch-target`,
`size.control-md`…) already come out of the bridge as `FLOAT` variables —
primitives in `Primitivos`, roles (`space/stack-md`, `space/inset-lg`,
`radius/control`) in `Semântico`. Without DTCG, create the numeric variables
yourself with the radius, spacing, heights and fixed widths the app actually
uses (the `DESIGN.md` scale, Layout section, or
`.dsx/maps/design-system.json`).

**Text styles.** The DSX type scale (`font.size.*`, `font.lineHeight.*`,
`font.weight.*`, `font.family.*` in the primitives, and the `typography:` block
of the `DESIGN.md` front matter — `h1`, `body`…) becomes one text style per
level, with the **real sizes** — including odd ones: if the app uses `13.5px`
for body text, the style is 13.5. A file that "rounds to 14" is no longer a
mirror. If `DESIGN.md` and the tokens diverge on a size, the code (compiled
tokens) wins, and the divergence becomes a finding.

Name the styles by role + source component, so the designer knows where each
one lives (style names follow the project's language; pt-BR examples):
`Título/Página (h4)`, `Rótulo/Cabeçalho de tabela`, `Número/StatStrip 21`. When
the size comes from a variable, bind it (`setBoundVariable('fontSize', …)`)
instead of typing the number.

## 4. Real icons

Extract the `d` attributes from the project's package and create one component
per icon. An approximate icon is the fastest way for the file to stop
describing the product.

```bash
# example with @mui/icons-material — adapt the regex to the package
grep -o 'd: "[^"]*"' node_modules/@pkg/icons/Nome.js | sed 's/^d: "//; s/"$//'
```

Figma **does not accept the raw `d`**: the `vectorPaths` parser only
understands absolute `M/L/C/Q/Z`. Run `tools/figma/normalize-svg-path.cjs`
first (`node <DSX>/tools/figma/normalize-svg-path.cjs "<d>"`) — it converts
`H/V/S/T` and, most importantly, **closes each subpath with `Z`**. Without
that, every icon with a hole (a ring, a document with lines) renders as a blob.

Create each icon as a 24×24 `COMPONENT` with the vector at `(0,0)` and
`constraints: SCALE` — that way the instance resizes along with it. When
instantiating at another size, use `i.rescale((size||18)/24)`, not `resize`
(the `tools/figma/prelude.js` prelude already does this): `resize` changes the
box and leaves the glyph behind.

## 5. Swatches that teach

Two boards, not one: **Color** (swatch + variable name + values in both modes +
the house rule) and **Typography, shape and buttons** (a specimen with real
product text, not "The quick brown fox", + the button hierarchy with the rule
for each level).

The caption is half the value. `color/action/primary nunca carrega texto
(2,9:1)` (pt-BR example: "never carries text") is worth more than the swatch
alone. The caption of each color swatch comes, in this order, from:

1. the row of the `DESIGN.md` **Colors** table for that token (Where it
   appears / Where it NEVER appears);
2. the contrast measured with `tools/contrast.mjs` against the background the
   app actually uses it on;
3. if `.dsx/maps/design-system.json` exists, the relevant `hazards[]` — "used
   as a raw hex in 3 places instead of this token" is a better caption than any
   improvised one.

## Plugin API traps

**Variable names do not accept dots.** `space/0.5` fails with "invalid variable
name". Use `space/4`, `space/8` (the px value). DTCG tokens with a dot in a
segment (e.g. `space.0.5`) need a rename in the `tokens` skill — check the
bridge's plan; do not work around it in Figma only.

**Opacity on a variable-bound paint does not persist at creation.** Passing
`opacity` on the paint before `setBoundVariableForPaint` is ignored. Always do
read-modify-write:

```js
node.fills = [P('color/action/primary')];
const f = JSON.parse(JSON.stringify(node.fills));
f[0].opacity = 0.14;
node.fills = f;
```

**In instance children this is volatile.** Fill overrides on nodes inside
instances may revert to the component's value. Prefer adjusting the **main
component**; if you need an override, do a verification sweep at the end and
look at the rendered result.

**Font style names vary by family.** Plus Jakarta Sans uses `SemiBold` and
`ExtraBold` (no space); Inter uses `Semi Bold` and `Extra Bold` (with a space).
Confirm with `figma.listAvailableFontsAsync()` before assuming.

**`createTextStyle` requires the font to be loaded.** `figma.loadFontAsync` for
each style you will use, before any `characters` or `setTextStyleIdAsync`.

**An alias across collections requires the target variable to exist already.**
`createVariableAlias` needs the target variable object; create all of
`Primitivos` before `Semântico`, and `Semântico` before `Componente`.

## Verification

Screenshot both boards and the icon grid, and **look**. A broken icon, a swatch
with the wrong contrast and a style with an absurd line height only show up
rendered. For contrast, do not trust the swatch by eye: check the real pair the
app renders text on.

```bash
node <DSX>/tools/contrast.mjs "#767676" "#ffffff"   # prints AA/AAA for text, large text and UI
```

With DTCG tokens, also run `node <DSX>/tools/build-tokens.mjs --tokens tokens/ --check` (or the
project's build): if the pairs in `contrast-pairs.json` fail in the code, the
foundation in Figma will carry the same failure — record it as a finding, do
not "fix" it in Figma only.

Then create any frame with the `Escuro` mode applied to prove that both modes
work — check the contrast there too, because a pair that passes in light mode
easily fails when the background flips. Confirm the icons' constraint for real,
not just that you set it: instantiate an icon at a small size (≤16px) and see
whether the glyph shrinks along with it (`figma-conventions` skill, icon and
kit component rules).

Findings from this phase (raw hex outside the palette, divergence between
`DESIGN.md` and the tokens, a failing pair) use the 0–4 severity scale from the
`review-ux` skill and go to `design/figma-findings/<round>.md`.

## Wrap-up

Regenerate `design/figma-reference.json` (`figma-conventions` skill) with the
ids of the variable collections, text styles, icon frame and chrome created in
this phase — it is what the following phases (screens, dialogs) read instead of
rediscovering. If this phase was a round of its own (not the first phase of a
mirror), add a line to `design/figma-changelog.jsonl` (`figma-cycle` skill)
with `tokens_changed` listing the variables created or changed.
