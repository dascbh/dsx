# Color

## When to consult

- When generating or adjusting a color ramp, or adding a brand or feedback color.
- When choosing which color token to use for text, a border, an icon, an action or an alert.
- When creating or reviewing the dark theme.
- When designing states (error, success), links, charts or any information encoded by color.

## Rules

1. **Generate ramps algorithmically, never shade by shade by hand.** Use `tools/palette.mjs`.
2. **Components use roles (`color.text.*`, `color.action.*` …), never ramp steps (`color.brand.600`).**
3. **Every color pair that carries information has a computed contrast**, not eyeballed, and is listed in `tokens/contrast-pairs.json`.
4. **Validate each pair in each theme.** Passing in light says nothing about dark.
5. **Never use color as the only cue.** Add text, icon, shape, pattern or position.
6. **At least three families**: brand, neutral and feedback (error, success, warning, info). The repo has `brand`, `neutral`, `success`, `danger`, `warning`, `info`.

## 50–950 ramp in OKLCH

Each family has 11 steps: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`. The number indicates **lightness**, not "the brand color": 50 is almost white, 950 is almost black, in any hue.

Why OKLCH: the L channel is perceptually uniform. Fixing the same L per step across all families gives `danger.600` and `success.600` similar visual weight, and makes the 100→200 jump look the same size as 700→800. In HSL, a yellow and a blue with the same "lightness" have very different perceived brightness.

How `tools/palette.mjs` works:

| Step | Target L (OKLCH) |
|---|---|
| 50 | 0.975 |
| 100 | 0.94 |
| 200 | 0.885 |
| 300 | 0.81 |
| 400 | 0.72 |
| 500 | 0.63 |
| 600 | 0.545 |
| 700 | 0.465 |
| 800 | 0.39 |
| 900 | 0.32 |
| 950 | 0.25 |

- The hue (H) comes from the base color.
- Chroma (C) peaks near the middle of the ramp and drops at the ends (down to 18% of the base chroma), to avoid "muddy" lights and oversaturated darks.
- The output shows each step's contrast against white and against black, so you can choose roles without guessing.

```bash
node tools/palette.mjs "#5754ed" --name brand              # JSON with contrast per step
node tools/palette.mjs "#5754ed" --name brand --format dtcg # block for primitives.tokens.json
```

IF → THEN:

- **IF** the brand color does not fall exactly on a step **THEN** do not force the ramp; choose the closest step for the action role and document it.
- **IF** the step chosen for action fails contrast with the label **THEN** go down one step (darker) in the light theme; do not lighten the text.
- **IF** the feedback color is yellow/orange **THEN** expect the middle steps to fail as a background for white text; use step 800 for text on `-50`, as the repo does in `color.feedback.warning-text`.

## Use by step range (starting guidance)

| Range | Typical use | Example in the repo (light theme) |
|---|---|---|
| 50–100 | Subtle backgrounds, surfaces, alert backgrounds | `color.bg.surface` → `neutral.50`; `color.feedback.info-bg` → `info.50` |
| 200–300 | Decorative dividers, discreet hover backgrounds | `color.border.default` → `neutral.200` |
| 400–500 | Control outlines, secondary icons | `color.border.strong` → `neutral.500` |
| 600–700 | Primary action, links, secondary text | `color.action.primary` → `brand.600`; `color.text.link` → `brand.700` |
| 700–800 | Hover/pressed, text on a feedback background | `color.action.primary-active` → `brand.800`; feedback `-text` → `.800` |
| 900–950 | Main text, dark surfaces | `color.text.primary` → `neutral.950` |

Step 500 is **not** automatically the button color. In the repo, `brand.500` on white gives 3.72:1: fine for a graphic element (≥ 3:1), but not for text.

## Semantic roles

| Group | Tokens | Rule |
|---|---|---|
| Background | `color.bg.canvas`, `surface`, `sunken`, `overlay`, `inverse` | `canvas` is the page; `surface` raises (card, panel); `sunken` lowers (track, input area); `overlay` is the modal scrim |
| Text | `color.text.primary`, `secondary`, `muted`, `inverse`, `link`, `on-action` | `muted` is the lightest allowed for text; nothing below it |
| Border | `color.border.default`, `strong`, `focus` | `default` only for decorative dividers; field outlines use `strong`; focus uses `focus` |
| Action | `color.action.primary[-hover/-active]`, `secondary[-hover]`, `danger[-hover]`, `disabled`, `disabled-text` | A filled action's label uses `color.text.on-action` |
| Feedback | `color.feedback.<type>-bg/-text/-icon` | Use the trio together; never `-icon` as a text color |
| AI | `color.ai.accent`, `color.ai.surface` | Discreet mark for AI-generated content; not an action color |

Pairings guaranteed by construction: `text.on-action` on `action.*`; `feedback.X-text` on `feedback.X-bg`; `text.primary|secondary|muted` on `bg.canvas|surface`. Outside these, compute.

## WCAG 2.2 contrast

Formula: `(L1 + 0.05) / (L2 + 0.05)`, with L = sRGB relative luminance (L1 the lighter). Result from 1:1 to 21:1. `tools/lib/color.mjs` implements exactly this.

| Situation | AA minimum | AAA | Criterion |
|---|---|---|---|
| Normal text | **4.5:1** | 7:1 | 1.4.3 / 1.4.6 |
| Large text (≥ 24px, or ≥ 18.66px bold) | **3:1** | 4.5:1 | 1.4.3 / 1.4.6 |
| UI component and informative graphic (field outline, informative icon, state indicator, focus ring, chart bar) | **3:1** against adjacent colors | — | 1.4.11 |
| Disabled text, logo, pure decoration | Exempt | — | — |

Practical rules:

- Treat **all interface text as "normal"** (4.5:1). Reserve 3:1 for truly large headings.
- Use 7:1 when the context calls for AAA (health, finance, public sector, older or low-vision audiences) or when the `DESIGN.md` requires it.
- 1.4.11 applies to what is **needed to identify the component or its state**: the border of an input with no background of its own, the check of a checkbox, the color that distinguishes the selected tab. A card's decorative border does not need it.
- The disabled exemption is not a license for illegibility: keep `color.action.disabled-text` clearly distinguishable and pair it with non-color cues.

Examples measured on white: `neutral.600` (4.96:1) passes as text; `neutral.500` (3.51:1) passes as an outline, fails as text; `neutral.400` (2.47:1) fails even as an outline. That last one is the typical poorly chosen placeholder shade.

### The pairs that fail most (always check)

1. Primary button label on the action color (especially saturated red, orange, yellow, green).
2. Running text on a background lightly tinted with the brand.
3. Placeholder and helper text inside a field.
4. Status icon on the card surface.
5. Link inside a paragraph (against the background and, if only color distinguishes it, against the surrounding text).
6. Focus ring against the adjacent background.

The repo already declares these pairs; run `node tools/build-tokens.mjs` and read each `OK`/`FAIL` line (the tool's output labels) for both themes.

### If a pair fails

1. Move the role to another ramp step (darker in light, lighter in dark).
2. If no step works, regenerate the ramp with another base color or adjust the chroma.
3. Never "fix" it by adding text shadow or opacity.
4. Run the build again; only publish with every pair at `OK`.

APCA can be used as a complementary legibility signal, but conformance is measured by the WCAG 2.x ratio.

## Dark theme

It is not an inversion. Rules:

- **Same ramp, different mapping.** Dark swaps the step each role points to; it does not generate new colors. In the repo: `color.bg.canvas` light → `color.white`, dark → `neutral.950`; `color.text.primary` light → `neutral.950`, dark → `neutral.50`.
- **Action gets lighter in dark.** `color.action.primary` goes from `brand.600` to `brand.300`; consequently `color.text.on-action` becomes dark (`neutral.950`). Hover in dark moves toward the lighter side (`brand.200`), not the darker one.
- **Feedback inverts the trio.** Background `.950`, text `.200`, icon `.400`.
- **Elevation by tone, not by shadow.** Higher surfaces get slightly lighter (`bg.surface` = `neutral.900` on `bg.canvas` = `neutral.950`). Heavy shadows disappear on a dark background.
- **Avoid pure black and pure white in large areas.** The repo uses `neutral.950` and `neutral.50`.
- **Reduce the chroma of vibrant colors.** Light steps (200–400) already have lower chroma in the ramp; do not use the saturated 500/600 as text or icon on a dark background.
- **Revalidate everything.** The same 4.5:1 looks weaker in dark; when there is room, prefer a margin above the minimum.
- **Alpha depends on the background.** `color.bg.overlay` has different values per theme; validate the content under the scrim manually.

## Never color alone (1.4.1)

| Case | Required redundant cue |
|---|---|
| Field error | Icon + message text + `aria-invalid`; the red border is a complement |
| Success / warning / info | Type-specific icon + text title |
| Link in a paragraph | Underline (or another non-color indicator) |
| Selected item, active tab | Weight, marker, border or icon, in addition to color |
| Status in a table (active, pending) | Text label or icon with an accessible name |
| Required | Text or an explained asterisk, not just a colored label |

About 8% of men and 0.5% of women have some color vision deficiency; red × green is the most common confusion.

## Data visualization

- Categorical series: colors distinguishable from each other **and** identified by direct label, nearby legend, marker shape or pattern.
- Data marks (bars, lines, points) need 3:1 against the chart background (1.4.11). Between adjacent series, seek a difference in lightness, not just hue.
- Sequential scales: one hue varying L (the 50–950 ramp works). Diverging: two hues with a neutral center.
- Do not reuse feedback colors (danger/success) as series colors; the reader will read them as error/success.
- Test the chart in grayscale: if reading it depends on color, add another channel.
- Offer the data table as an alternative for assistive technology.

## Anti-patterns

- Picking shades by hand and "eyeballing it".
- Approving a palette by looking at the isolated ramp, without the real component pairs.
- Assuming step 500 is the action color.
- Light gray placeholder (below 4.5:1).
- Copying the light mapping to dark.
- Testing only text and forgetting borders, icons and focus.
- State communicated only by a color change.
- Using `color.ai.accent` as a button color.

## Checklist

- [ ] Ramp generated by `tools/palette.mjs` with 11 steps.
- [ ] Components consume only semantic roles.
- [ ] Every text/icon/outline/focus pair is in `contrast-pairs.json` with the correct minimum (4.5 or 3).
- [ ] `node tools/build-tokens.mjs` with no `FAIL` in the light and dark themes.
- [ ] Dark theme remapped (action lightens, feedback inverts, elevation by tone).
- [ ] All color-coded information has a redundant cue.
- [ ] Charts with labels/patterns, 3:1 on marks and an alternative table.
