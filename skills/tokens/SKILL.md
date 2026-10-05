---
name: tokens
description: "Creates and fixes DTCG design tokens in 3 layers: OKLCH palette, type and spacing scales, light/dark themes and contrast verified at build time. Use when setting up the foundation, changing the brand, adding dark mode or finding raw values."
---

# Design tokens

> **DSX root:** two levels above this skill's base directory. The `knowledge/`, `tokens/` and `tools/` paths are relative to it.

References: `knowledge/design-system/tokens.md`, `color.md`, `typography.md`, `spacing-and-layout.md`.

## Mandatory architecture

| Layer | File (in DSX) | Names | Consumed by |
|---|---|---|---|
| 1. Primitives | `tokens/primitives.tokens.json` | the **value** (`color.brand.600`, `space.4`) | layer 2 only |
| 2. Semantic | `tokens/semantic.light.tokens.json`, `semantic.dark.tokens.json` | the **intent** (`color.text.primary`, `color.action.danger`, `space.stack-md`) | components and screens |
| 3. Component (optional) | `tokens/component.tokens.json` | the **part** (`button.primary.bg`) | one component |

Rules:
- Components **never** consume primitives. Screens **never** consume raw values.
- Themes are semantic files with **the same keys**; only the values change. The build fails if the dark theme has a key the light one does not.
- Every text/background and UI/background pair that exists in the interface is declared in `tokens/contrast-pairs.json` with the required minimum (4.5 text, 3 non-text UI).

If the user's project uses another system (Tailwind, MUI, loose CSS vars), **keep its format** and apply the same three layers and rules; use the DSX tools only to generate and verify values.

## Recipes

**New brand color / color ramp**
```bash
node tools/palette.mjs "#3d5afe" --name brand            # JSON with the contrast of each step
node tools/palette.mjs "#3d5afe" --name brand --format dtcg
```
- 50–950 ramp in OKLCH (perceptually uniform steps). In practice, with white text step **600** is usually the first ≥ 4.5:1 — confirm in the output.
- Primary action in the light theme: the first step with `contrast_white ≥ 4.5`. Link text: one step darker than the action.
- Dark theme: **do not invert the ramp**. Use light steps (200–300) for actions with dark text, and 900–950 surfaces.

**Type scale**
```bash
node tools/type-scale.mjs --base 16 --ratio major-third --format css
node tools/type-scale.mjs --base 16 --ratio minor-third --fluid --max-ratio perfect-fourth --format css
```
Ratio: 1.125–1.2 for dense products; 1.25 for general products; 1.333+ for editorial/marketing. Body text never < 16px for reading; absolute minimum 12px for captions.

**Spacing scale**
```bash
node tools/spacing-scale.mjs --base 4 --format dtcg
```

**Compile and verify**
```bash
node tools/build-tokens.mjs           # generates tokens/build/tokens.css (+ resolved JSON per theme) and checks contrast
node tools/build-tokens.mjs --check   # verify only (CI)
node tools/contrast.mjs "#4f5a6b" "#ffffff"
```

**A project's tokens (not DSX's)**
```bash
node tools/build-tokens.mjs --tokens <project>/tokens          # generates <project>/tokens/build/ and checks contrast
```

**Figma bridge**
```bash
node tools/figma/tokens-to-figma.mjs --tokens <folder> --script > /tmp/vars.js   # paste into use_figma (skill figma-foundations)
node tools/figma/figma-to-tokens.mjs --snapshot <snapshot-full.json> --tokens <folder> [--write]
```
The return trip (`--write`) only changes existing tokens and runs the contrast gate; a new variable in Figma is this skill's decision, never an automatic creation.

## Flow for changing tokens

1. Change the **primitive** if the value changes everywhere; change the **semantic** token if the intent now points to another value.
2. When creating a new semantic token: name = `<category>.<role>[-<variant>][-<state>]` (e.g. `color.action.primary-hover`). Add a `$description` saying where to use it.
3. Add the pair to `contrast-pairs.json` if it is a text/UI color.
4. Run the build. **A contrast failure blocks** — adjust the ramp step, not the minimum.
5. Run `node tools/lint-raw-values.mjs <src>` on the project to find raw values that now have a token.
6. Update the front matter and the Colors section of `DESIGN.md` (skill `design-md`).

## Output

```
Tokens created/changed: <list with layer>
Contrast pairs: N verified, all ≥ minimum (worst: <pair> = X:1)
Generated files: …
Impact: <affected components/screens>
```
