# Design tokens

## When to consult

- When creating, renaming, removing or consuming any token.
- When adding a theme (dark, high contrast, brand) or a mode (density).
- When running this repository's token pipeline or interpreting one of its errors.
- When a component "does not switch themes" or a raw value shows up in the code.

## The concept in one sentence

A token is a **stable name for a design decision**. The value may change; the name and the role do not. UI code knows only names; values live in token files and arrive by reference.

## Rules

1. **Never write raw values in UI code.** Hex, `rgb()`, `oklch()`, px outside a token, magic `z-index` and utility-framework arbitrary values are forbidden outside `tokens/`.
2. **Components consume the semantic layer** (or the component layer). Primitives only feed semantic tokens.
3. **Name by function, not appearance.** `color.text.muted`, never `color.cinza-claro` (light gray).
4. **Every semantic color used as text or an essential outline needs a declared pair** in `tokens/contrast-pairs.json`.
5. **A theme changes values, never names.** The dark theme has the same keys as the light one.
6. **Do not edit `tokens/build/`.** It is generated output; the source is always `tokens/*.tokens.json`.
7. **Create a token when the value is shared or carries a decision.** A value used only once, with no reusable intent, does not justify a new token; reconsider whether it should be an existing token.

## The three layers

| Layer | Question it answers | In the repository | Who consumes it |
|---|---|---|---|
| 1. Primitive | "Which values exist?" | `tokens/primitives.tokens.json` | Only layer 2 |
| 2. Semantic | "What is this value for?" | `tokens/semantic.light.tokens.json` and `semantic.dark.tokens.json` | Components and screens |
| 3. Component (optional) | "Which decision is exclusive to this component?" | Does not exist in the repo yet | The component itself |

### Layer 1: primitives

Raw inventory, with no usage intent. In the repo:

- Color: `color.white`, `color.black`, and 11-step ramps (`50, 100, 200, …, 900, 950`) for `color.brand`, `color.neutral`, `color.success`, `color.danger`, `color.warning`, `color.info`.
- Space: `space.<multiplier>` on a 4px unit: `space.0` (0), `space.0_5` (2px), `space.1` (4px), `space.1_5` (6px), `space.2` (8px), `space.3` (12px), `space.4` (16px), `space.5` (20px), `space.6` (24px), `space.8` (32px), `space.10` (40px), `space.12` (48px), `space.16` (64px), `space.20` (80px), `space.24` (96px), `space.32` (128px).
- Radius: `radius.none` (0), `sm` (4px), `md` (8px), `lg` (12px), `xl` (16px), `full` (9999px).
- Typography: `font.family.sans`, `font.family.mono`, `font.weight.regular|medium|semibold|bold` (400–700), `font.size.12|14|16|20|25|31|39|49|61`, `font.lineHeight.tight|snug|normal` (1.1 / 1.25 / 1.5).
- Motion: `duration.instant|fast|base|slow` (0 / 120 / 200 / 320 ms), `easing.standard|enter|exit` (cubic-bezier).
- Elevation: `shadow.sm|md|lg`.

### Layer 2: semantic

They give the value a role. In the repo:

- `color.bg.*` (`canvas`, `surface`, `sunken`, `overlay`, `inverse`)
- `color.text.*` (`primary`, `secondary`, `muted`, `inverse`, `link`, `on-action`)
- `color.border.*` (`default`, `strong`, `focus`)
- `color.action.*` (`primary`, `primary-hover`, `primary-active`, `secondary`, `secondary-hover`, `danger`, `danger-hover`, `disabled`, `disabled-text`)
- `color.feedback.*` (`success|danger|warning|info` × `-bg|-text|-icon`)
- `color.ai.*` (`accent`, `surface`) to mark AI-generated content
- `space.inset-xs|sm|md|lg`, `space.stack-sm|md|lg`, `space.inline-sm|md`, `space.section`
- `size.touch-target` (44px), `size.control-sm|md|lg` (32/40/48px), `size.focus-ring` (2px), `size.measure` (68ch)
- `radius.control`, `radius.card`, `radius.pill`
- `motion.feedback`, `motion.transition`, `motion.overlay`

### Layer 3: component

Use it **only** when a component needs a decision that is not a general system role (e.g. a sub-brand that changes only the button radius). Too many component tokens become a second, parallel system. If you create one, always point to a semantic token:

```json
{
  "button": {
    "primary": {
      "bg":      { "$type": "color",     "$value": "{color.action.primary}" },
      "bg-hover":{ "$type": "color",     "$value": "{color.action.primary-hover}" },
      "radius":  { "$type": "dimension", "$value": "{radius.control}" },
      "height":  { "$type": "dimension", "$value": "{size.control-md}" }
    }
  }
}
```

(Illustrative example: `button.*` does not exist in the repository today.)

## Naming grammar

General form: `category.role.variant-state`.

| Segment | Values used in the repo | Note |
|---|---|---|
| category | `color`, `space`, `size`, `radius`, `font`, `duration`, `easing`, `shadow`, `motion` | The first word is always the decision type |
| role | `bg`, `text`, `border`, `action`, `feedback`, `ai`; `inset`, `stack`, `inline`, `section` | Describes function |
| variant | `primary`, `secondary`, `muted`, `danger`, `success`, `sm`, `md`, `lg` | Importance, type or size |
| state | `hover`, `active`, `disabled`, `focus` | Hyphenated suffix: `primary-hover` |

Naming rules:

- The group delimiter is the **dot** in JSON; in CSS it becomes a hyphen: `color.text.primary` → `--color-text-primary`; `space.inset-md` → `--space-inset-md`.
- Numeric primitives use the **ramp step** (`brand.600`) or the **grid multiplier** (`space.4` = 4 × 4px). Decimals use an underscore: `space.0_5`.
- The name must be deducible: whoever knows `color.feedback.danger-text` should guess `color.feedback.warning-text`.
- Same vocabulary in design, code and documentation. The design tool variable `color/text/primary` corresponds to `color.text.primary`.
- Forbidden: appearance names (`azul-escuro`, dark blue), undefined relative names (`maior`, bigger), origin names (`frame-231`), versions (`card-final-v2`).

## W3C DTCG format

The repo follows the Design Tokens Community Group format:

- Every token has `$value`; `$type` is mandatory in the repo (it may be inherited from the parent group; the build already handles that inheritance).
- `$description` is optional, but **use it on every semantic token whose use is not obvious**. It becomes documentation for people and agents.
- Groups are nested objects; keys starting with `$` are metadata, not tokens.
- Types used: `color`, `dimension`, `fontFamily`, `fontWeight`, `number`, `duration`, `cubicBezier`, `shadow`.

```json
{
  "color": {
    "text": {
      "muted": {
        "$type": "color",
        "$value": "{color.neutral.600}",
        "$description": "Minimum allowed for text: >= 4.5:1 on canvas"
      }
    }
  }
}
```

(The `$description` is quoted verbatim from the repo's token file.)

### Aliases

- A reference is `{path.to.token}`; the build resolves it recursively and **fails** on a nonexistent or circular reference.
- An alias can be whole (`"{space.4}"`) or embedded in a string; prefer the whole alias.
- Semantic → primitive alias is the normal case (`radius.control` → `radius.md`; `motion.feedback` → `duration.fast`). Semantic → semantic alias is allowed when one role derives from another, and it is what a component token does (`button.primary.bg` → `color.action.primary`).
- A literal value in the semantic layer only when there is no equivalent primitive and creating one would be noise (in the repo: `color.bg.overlay` with alpha and `size.*`). Document why in the `$description`.

## Themes and modes

- Light theme = `semantic.light.tokens.json` (full base).
- Dark theme = `semantic.dark.tokens.json`, which **redefines only what changes** (in the repo, only `color.*`). Missing keys inherit from light; that is why `space.*` and `size.*` are not repeated.
- The build **rejects** a key in dark that does not exist in light. This guarantees name parity.
- Components never ask "which theme am I in?". They read `var(--color-bg-surface)` and the theme decides.

IF → THEN:

- **IF** you need high contrast or another brand **THEN** create another semantic file with the same keys and its own selector in the build; do not create new tokens for it.
- **IF** you need compact density **THEN** it is a mode that remaps `space.inset-*`/`size.control-*`; see `spacing-and-layout.md`.
- **IF** a value is identical in both themes **THEN** do not repeat it in dark (it inherits).
- **IF** a color uses the same primitive in both themes **THEN** be suspicious: dark almost always needs a different ramp step. See `color.md`.

### Generated CSS output

`tokens/build/tokens.css` contains:

1. `:root { … }` with all primitives + light theme semantic tokens.
2. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` with the dark semantic tokens: the user's system decides, unless the page forces light.
3. `:root[data-theme="dark"] { … }` to force dark regardless of preference.

## Repository pipeline

| Command | Does |
|---|---|
| `node tools/build-tokens.mjs` | Flattens the three files, resolves aliases, validates theme parity, checks each pair in `contrast-pairs.json` in both themes, writes `tokens/build/tokens.css`, `tokens.light.json`, `tokens.dark.json`. Exits with code 1 if any pair fails |
| `node tools/build-tokens.mjs --check` | Same validations, without writing files. Use in CI |
| `node tools/palette.mjs "#5754ed" --name brand --format dtcg` | Generates a 50–950 OKLCH ramp ready to paste into `primitives.tokens.json` (formats: `json`, `css`, `dtcg`) |
| `node tools/type-scale.mjs --base 16 --ratio major-third` | Generates a type scale; `--fluid` generates `clamp()` |
| `node tools/spacing-scale.mjs --base 4 --format dtcg` | Generates the spacing scale |
| `node tools/contrast.mjs "#627187" "#ffffff"` | Contrast of one pair, with AA/AAA levels |
| `node tools/contrast.mjs --pairs tokens/contrast-pairs.json --tokens tokens/build/tokens.light.json` | Validates pairs against a resolved theme |
| `node tools/lint-raw-values.mjs src/` | Lists raw values and shows drift per 1000 lines; `--json` for machines |

Format of a pair in `contrast-pairs.json` (as in the repo file):

```json
{ "fg": "color.text.muted", "bg": "color.bg.surface", "min": 4.5, "use": "supporting text on card" }
```

Colors with alpha (8-digit hex, such as `color.bg.overlay`) are skipped in the check, since contrast depends on what is behind them; validate them manually over the real content.

### Flow for adding a token

1. Decide the layer. New role → semantic. New value with no role → primitive.
2. Edit `tokens/primitives.tokens.json` and/or `semantic.light.tokens.json`.
3. If it is a color, add the dark value in `semantic.dark.tokens.json` and the pair in `contrast-pairs.json`.
4. Run `node tools/build-tokens.mjs`. Fix every `FAIL` (the tool's failure label).
5. Consume it in code as `var(--<hyphenated-path>)`.
6. Run `node tools/lint-raw-values.mjs` on the changed code.

## Consumption in code

```css
.card {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  padding: var(--space-inset-md);
}
.card > * + * { margin-block-start: var(--space-stack-md); }
.card a { color: var(--color-text-link); }
```

A `1px` border is accepted by the linter (only values of 2px and up are flagged). If a raw value is truly unavoidable, mark the line with the `dsx-ignore` comment and justify it; the escape is auditable by search.

## Anti-patterns

- A component reading `--color-brand-600` directly: breaks the dark theme and rebranding.
- A semantic token with a color name (`color.bg.blue`).
- Repeating in the dark theme the same primitive as light "because it works".
- Tokens without `$description` in ambiguous roles.
- A single file mixing layers.
- Editing `tokens/build/*` by hand.
- Creating a component token for every property of every component.
- Treating the build as optional: unvalidated contrast pairs become silent debt.

## Checklist

- [ ] The new token is in the right layer and has a deducible functional name.
- [ ] `$type` and `$value` present; `$description` when the use is not obvious.
- [ ] Alias points to an existing token; no cycles.
- [ ] A new color has a dark theme value and a pair in `contrast-pairs.json`.
- [ ] `node tools/build-tokens.mjs` passed with no `FAIL`.
- [ ] No file in `tokens/build/` was edited manually.
- [ ] UI code consumes only semantic `var(--…)`; `lint-raw-values` with no new occurrences.
