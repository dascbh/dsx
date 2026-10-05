# Typography

## When to consult

- When defining or reviewing a project's type scale.
- When choosing size, weight or line height for any interface text.
- When creating responsive headings or fluid typography.
- When reviewing legibility: small text, overly long lines, confusing hierarchy.

## Rules

1. **One scale, one ratio.** All sizes come from `base × ratio^n`. No loose 13, 15, 17 and 18px side by side.
2. **Body never below 16px** (1rem) in running text. Supporting text may go down to 14px; 12px is the absolute floor and only for short labels with strong contrast.
3. **Use `rem`**, never fixed `px` for text: it respects the user's size preference and zoom.
4. **Every level has size + line height + weight** (and letter spacing when needed). Size alone is not a complete decision.
5. **Reading line between 45 and 75 characters.** The repo sets `size.measure` = 68ch.
6. **Semantic hierarchy is independent of visual hierarchy.** An `<h2>` is an `<h2>` because it structures the document, not because it is big.
7. **At most 2 families and 4 weights.**

## Modular scale

`size(n) = base × ratio^n`, with n = 0 for body, positive for headings, negative for smaller text.

| Ratio | Name | Character | Use when |
|---|---|---|---|
| 1.067 | Minor second | Almost flat | Rarely; very dense interfaces with little hierarchy |
| 1.125 | Major second | Subtle | Dense apps, data tools, dashboards with many levels |
| 1.2 | Minor third | Restrained | Productivity products, mobile, internal systems |
| 1.25 | Major third | Balanced | Repo default; SaaS, dashboards, forms |
| 1.333 | Perfect fourth | Clear and comfortable | Product sites, documentation, mixed content |
| 1.414 | Augmented fourth | Pronounced | Pages with few levels and strong headings |
| 1.5 | Perfect fifth | Expressive | Landing pages, marketing |
| 1.618 | Golden | Dramatic | Editorial, portfolio; overdoes it in dense UI |

IF → THEN:

- **IF** the screen has many heading levels in a small space (table, dashboard, mobile) **THEN** a ratio between 1.125 and 1.2.
- **IF** it is a daily-use product with forms and lists **THEN** 1.25 (default).
- **IF** it is a reading or documentation page **THEN** 1.25 to 1.333.
- **IF** it is marketing with few blocks **THEN** 1.333 to 1.5; consider a fluid scale (below).
- **IF** you need a large scale on desktop and a restrained one on mobile **THEN** use a fluid scale with a smaller ratio at the minimum and a larger one at the maximum.

### The repository's scale

`tokens/primitives.tokens.json` uses a 16px base and a 1.25 ratio (major third):

| Token | px | Step | Suggested role | Suggested line height |
|---|---|---|---|---|
| `font.size.12` | 12 | −2* | Caption, metadata label | `font.lineHeight.normal` (1.5) |
| `font.size.14` | 14 | −1* | Supporting text, field help, dense table | 1.5 |
| `font.size.16` | 16 | 0 | Body, inputs, buttons | 1.5 |
| `font.size.20` | 20 | 1 | Card/small section title | `font.lineHeight.snug` (1.25)–1.35 |
| `font.size.25` | 25 | 2 | Section title | 1.25 |
| `font.size.31` | 31 | 3 | Page title (app) | 1.25 |
| `font.size.39` | 39 | 4 | Page title (content) | `font.lineHeight.tight` (1.1)–1.15 |
| `font.size.49` | 49 | 5 | Display | 1.1 |
| `font.size.61` | 61 | 6 | Hero display | 1.1 |

\* Below body, the pure ratio would give 12.8px and 10.24px. The repo deliberately rounded to 14 and 12, so as not to create text below the legible floor. Do the same in any scale: negative steps are capped by the minimums, not by the math.

The semantic typography layer (roles such as "body", "card title") does not exist in the token files yet. Until it does, components may read `--font-size-16` etc., but document the role in the component. When creating the layer, add it to `semantic.light.tokens.json` (the dark theme inherits automatically) and point to the primitives.

### Generating a scale

```bash
node tools/type-scale.mjs --base 16 --ratio major-third            # JSON: px, rem, line height per step
node tools/type-scale.mjs --base 16 --ratio 1.2 --format css       # custom properties
```

Ratios accepted by name: `minor-second`, `major-second`, `minor-third`, `major-third`, `perfect-fourth`, `augmented-fourth`, `perfect-fifth`, `golden`, or a number. `--min` and `--max` control how many steps (default −1 to 6). The output names the steps `caption`, `small`, `body`, `h6` … `h1`, `display`.

## Line height

General rule: the larger the text, the smaller the relative line height.

| Size | Line height | Reason |
|---|---|---|
| ≤ 18px (body, supporting) | 1.5 (acceptable range 1.4–1.6) | Continuous reading; helps people with dyslexia |
| 19–24px | ~1.35 | Short 1–2 line headings |
| 25–32px | ~1.25 | Section headings |
| 33–48px | ~1.15 | Page headings |
| > 48px | ~1.1 | Display |
| Button label, chip, tag (single line) | 1.2–1.4, or control height set by `size.control-*` | Vertical alignment comes from the container, not the line height |

This is exactly the `lineHeight()` function in `tools/type-scale.mjs`.

- Use **unitless** line height (`1.5`, not `24px`) so it follows the size.
- Text must support the user raising line height to 1.5×, paragraph spacing to 2×, letter spacing to 0.12em and word spacing to 0.16em without clipping content (1.4.12). Hence: **no fixed height on text containers**.

## Measure (line length)

- Body: **45 to 75 characters per line**; ~66 is the sweet spot. Use `max-inline-size: var(--size-measure)` (68ch) on running text blocks.
- Mobile: 30–50 characters is acceptable given the physical limit.
- Text in narrow columns (cards, sidebars) may fall below 45, but avoid long paragraphs there.
- Never let a paragraph span the full width of a wide screen.

## Minimum sizes

| Use | Minimum | Note |
|---|---|---|
| Running text | 16px | 17–18px improves reading on mobile and long content |
| Inputs | 16px | Below that, some mobile browsers auto-zoom on focus |
| Supporting text, help, dense table | 14px | With contrast ≥ 4.5:1 |
| Caption, short metadata | 12px | Never for instructions, errors or essential content |
| Informative text | never < 12px | — |

## Weights

- Repo: `font.weight.regular` (400), `medium` (500), `semibold` (600), `bold` (700).
- Body at 400. Inline emphasis at 600. Headings 600–700. Button labels 500–600.
- Do not use weights below 400 in interface text; thin strokes lose effective contrast, especially in the dark theme.
- Hierarchy comes from combining size, weight, color (`color.text.primary` vs `secondary`) and space. Do not rely on size alone.

## Families

- Repo: `font.family.sans` (Inter with system fallbacks) and `font.family.mono` (for code, tabular data and identifiers).
- Prefer families with a high x-height for small sizes.
- Always declare a system fallback and use `font-display: swap` (or `optional`) so text is not hidden while the font loads; adjust the fallback's metrics to avoid layout shift.
- Numbers in tables: use tabular figures (`font-variant-numeric: tabular-nums`).

## Letter spacing

- Display and large headings: slightly negative (≈ −0.01 to −0.02em).
- Body: 0.
- Small uppercase (overline, tag): slightly positive (≈ +0.02 to +0.06em).
- Avoid uppercase in long phrases; avoid italics and justified text in blocks.

## Fluid typography with `clamp()`

Use it for headings and content pages; keep body stable at 16px.

```bash
node tools/type-scale.mjs --base 16 --ratio minor-third --fluid \
  --max-ratio perfect-fourth --min-vw 360 --max-vw 1440 --format css
```

Output (real excerpt):

```css
--font-size-body: clamp(1rem, 1rem + 0vw, 1rem);
--font-size-h1: clamp(2.986rem, 2.1112rem + 3.8878vw, 5.6102rem);
```

Rules:

- The preferred term **always** adds `rem` + `vw`. `vw` alone does not respond to browser zoom and violates 1.4.4.
- Keep `maximum ÷ minimum ≤ 2.5` at each step; above that, 200% zoom may not actually double the text.
- Body minimum ≥ 1rem; the minimum size of any step must be legible at 320px width.
- Line height computed from the step's maximum size; reassess on mobile if the heading wraps onto many lines.
- Test: 200% zoom and 320 CSS px width without horizontal scrolling (1.4.10).

## Typographic accessibility

- Contrast depends on size: 4.5:1 normal; 3:1 only for ≥ 24px or ≥ 18.66px bold.
- Never block zoom (`user-scalable=no`, `maximum-scale=1`).
- One `<h1>` per page; no skipping levels for aesthetics.
- Text in images only for logos.
- Truncating with an ellipsis requires a way to read the full text (keyboard-accessible tooltip, expand, or a detail page).

## Anti-patterns

- Loose, unrelated sizes (13, 15, 17px).
- Styles with subjective names ("Special title", "tiny little text").
- Body at 14px "because more fits".
- Line height in fixed px.
- A button with fixed height that clips translated or enlarged text.
- A paragraph at full desktop width.
- A fluid heading using only `vw`.
- More than two families, or 300 weights in interface text.

## Checklist

- [ ] Base ≥ 16px and a single ratio, justified by the product type.
- [ ] Each level with size, line height (unitless) and weight.
- [ ] Body with line height 1.4–1.6 and `max-inline-size` ≤ 75ch (`size.measure`).
- [ ] Nothing below 12px; inputs ≥ 16px.
- [ ] Units in `rem`; fluid uses `rem + vw` and maximum/minimum ≤ 2.5.
- [ ] Correct heading hierarchy in the HTML.
- [ ] Tested with 200% zoom, 320px width and increased text spacing.
