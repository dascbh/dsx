# Spacing and layout

## When to consult

- When defining padding, margin or gap for any component or screen.
- When building a page grid, breakpoints or responsive behavior.
- When creating a density mode (compact/comfortable) or adapting a dense table.
- When migrating legacy spacing to the scale.

## Rules

1. **All space comes from the scale.** No `13px`, `18px` or `25px` in UI code. The linter (`tools/lint-raw-values.mjs`) flags any px ≥ 2 outside a token.
2. **Prefer the semantic token** (`space.inset-*`, `space.stack-*`, `space.inline-*`, `space.section`) over the primitive (`space.<n>`). The semantic one carries intent and is what changes in a density mode.
3. **Space between siblings is the parent's responsibility** (`gap` or a stack selector), not a `margin` on the child. Components have no external margin of their own.
4. **Proximity communicates relationship.** Related items sit closer to each other than to unrelated items. Inner space ≤ outer space.
5. **Control size and touch target are also scale**: `size.control-*` and `size.touch-target`.
6. **Components grow with content.** Avoid fixed width/height on text containers.

## The 4/8 grid

- The repo uses a **4px unit** with names by multiplier: `space.4` = 4 × 4 = 16px.
- In practice, use mostly multiples of 8 (`space.2`, `space.4`, `space.6`, `space.8` …) and reserve the 4 steps (`space.1`, `space.3`, `space.5`) for fine adjustments in compact components: icon + label, chip, table cell, badge.
- The half steps `space.0_5` (2px) and `space.1_5` (6px) exist for fine optics (e.g. icon offset, badge padding). Do not use them for layout.

| Token | px | rem | Typical use |
|---|---|---|---|
| `space.0` | 0 | 0 | Reset |
| `space.0_5` | 2 | 0.125 | Optical adjustment |
| `space.1` | 4 | 0.25 | Icon ↔ text in a chip, badge padding |
| `space.1_5` | 6 | 0.375 | Fine adjustment in a compact control |
| `space.2` | 8 | 0.5 | Label ↔ field, compact list items |
| `space.3` | 12 | 0.75 | Gap between icon and button label, compact padding |
| `space.4` | 16 | 1 | Default card padding, gap between fields |
| `space.5` | 20 | 1.25 | Rare; horizontal padding of a large control |
| `space.6` | 24 | 1.5 | Spacious card padding, gutter |
| `space.8` | 32 | 2 | Between content groups |
| `space.10` | 40 | 2.5 | Between blocks |
| `space.12` | 48 | 3 | Between large blocks |
| `space.16` | 64 | 4 | Between page sections |
| `space.20` / `24` / `32` | 80 / 96 / 128 | 5 / 6 / 8 | Marketing sections, heroes |

Generating the scale (for another project or base 8):

```bash
node tools/spacing-scale.mjs --base 4 --format css    # --space-4: 1rem; /* 16px */
node tools/spacing-scale.mjs --base 8 --format dtcg   # block for primitives.tokens.json
```

The multipliers are fixed (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32): dense at the start, sparse at the end, because the difference between 4 and 8px matters inside a button, and the difference between 120 and 128px does not matter between sections. Keep the scale used in production lean; 6 to 10 values cover almost everything.

## Semantics: inset, stack, inline, section

| Semantic token | Points to | Meaning |
|---|---|---|
| `space.inset-xs` | `space.1` (4px) | Minimum inner padding: badge, tag |
| `space.inset-sm` | `space.2` (8px) | Compact control padding, dense cell |
| `space.inset-md` | `space.4` (16px) | Default padding for card, panel, modal |
| `space.inset-lg` | `space.6` (24px) | Padding for a spacious content area |
| `space.stack-sm` | `space.2` (8px) | Vertical between label and field, title and subtitle |
| `space.stack-md` | `space.4` (16px) | Vertical between fields, items of a list with breathing room |
| `space.stack-lg` | `space.8` (32px) | Vertical between groups (fieldsets, card blocks) |
| `space.section` | `space.16` (64px) | Vertical between page sections |
| `space.inline-sm` | `space.2` (8px) | Horizontal between icon and text, side-by-side chips |
| `space.inline-md` | `space.3` (12px) | Horizontal between buttons in a group |

- **Inset** = space inside a box, on all sides (may be asymmetric: horizontal larger than vertical in buttons).
- **Stack** = vertical space between stacked siblings.
- **Inline** = horizontal space between side-by-side siblings.
- **Section** = high-level separation on the page.

```css
.form { display: grid; gap: var(--space-stack-md); }
.field { display: grid; gap: var(--space-stack-sm); }
.actions { display: flex; gap: var(--space-inline-md); margin-block-start: var(--space-stack-lg); }
.panel { padding: var(--space-inset-md); border-radius: var(--radius-card); }
```

IF → THEN:

- **IF** two elements belong to the same item (label + field, title + meta) **THEN** `stack-sm`.
- **IF** they are sibling items at the same level (fields of a form) **THEN** `stack-md`.
- **IF** they are different groups **THEN** `stack-lg`; **IF** they are page sections **THEN** `section`.
- **IF** you need a value no semantic token covers **THEN** use the primitive and assess whether the case deserves a new semantic token (does it repeat in 3+ places? then yes).

## Control and target sizes

| Token | Value | Use |
|---|---|---|
| `size.control-sm` | 32px | Controls in a table or dense bar, fine pointer only |
| `size.control-md` | 40px | Default for buttons, inputs, selects |
| `size.control-lg` | 48px | Mobile, main actions, public-facing forms |
| `size.touch-target` | 44px | The system's minimum touch area |
| `size.focus-ring` | 2px | Focus ring thickness |
| `size.measure` | 68ch | Maximum width of running text |

Pointer target: WCAG 2.5.8 (AA) requires **24 × 24 CSS px** or equivalent spacing; the system default is **44px**. A 32px visual control can have a 44px touch area through padding or a pseudo-element. Details in `accessibility.md`.

## Density

Density is a **mode** that remaps the semantic tokens, not a parallel set of components.

| Semantic | Compact | Comfortable (repo default) | Spacious |
|---|---|---|---|
| `space.inset-md` | `space.3` (12px) | `space.4` (16px) | `space.6` (24px) |
| `space.stack-md` | `space.3` (12px) | `space.4` (16px) | `space.6` (24px) |
| `size.control-md` | 32px | 40px | 48px |

(The compact and spacious modes are a proposal: they do not exist as files in the repo. Implementing = a new semantic file with the same keys and a selector such as `[data-density="compact"]`.)

IF → THEN:

- **IF** the screen is a data screen (tables, logs, operations dashboards) used by experts with a mouse **THEN** compact is acceptable.
- **IF** the audience is broad, or use is on mobile or touch **THEN** comfortable or spacious; never compact by default.
- **IF** you offer compact **THEN** keep `size.touch-target` and the 24px floor; density reduces breathing room, not target area.
- **IF** compact would put body text below 14px **THEN** do not reduce typography; reduce only space.

## Page grid

| Width range | Columns | Gutter | Side margin |
|---|---|---|---|
| Small (phone) | 4 | `space.4` (16px) | `space.4` (16px) |
| Medium (tablet, narrow window) | 8 | `space.6` (24px) | `space.6` (24px) |
| Large (desktop) | 12 | `space.6` (24px) | `space.8`+ or centered with a max width |

- Gutters and margins come from the spacing scale.
- Define a **maximum content width** for wide screens; running text stays limited by `size.measure` even inside it.
- Use CSS Grid for page structure and Flexbox to align items in one dimension.

## Breakpoints

- **Driven by content, not by device models.** Put a breakpoint where the layout breaks: the navigation no longer fits, the table loses legibility, the form gets too wide.
- Mobile first: write the base style for the smallest width and add rules with `min-width`.
- Common starting points (adjust to content): ~600px, ~900px, ~1200px. The repo has no breakpoint tokens yet; if you create them, name them by function (`breakpoint.nav-collapse`) or size (`breakpoint.md`), never by device (`breakpoint.ipad`).
- **Container queries** for components that live at different widths (card in the sidebar vs in the main area): the component reacts to the space it has, not to the screen.

## Responsive rules

1. Works at **320 CSS px** width without horizontal scrolling (1.4.10), except content that requires 2D (data table, map).
2. **Visual order = DOM order = focus order.** Do not reorder with `order` or grid-area in a way that makes Tab jump.
3. Wide tables: horizontal scrolling **inside** the table container, with the header preserved, or transformation into a list that keeps the label-value association.
4. Navigation: a fixed side nav on desktop can become a bottom bar or menu on mobile; document the rule in the handoff.
5. Images with declared dimensions (`width`/`height` or `aspect-ratio`) so the layout does not shift; `srcset`/`sizes` for resolution.
6. Fixed elements (header, action bar) cannot cover the focused element (2.4.11); reserve `scroll-padding` equal to their height.
7. Test with the virtual keyboard open on mobile: the focused field and the submit button must stay visible.

## Radius and elevation (layout-related)

- Radius: `radius.control` (8px) for controls, `radius.card` (12px) for cards and panels, `radius.pill` for chips and badges. Nested elements use inner radius ≤ outer radius minus the padding.
- Elevation: `shadow.sm|md|lg` in the light theme; in dark, prefer distinguishing layers by `color.bg.*` (see `color.md`).

## Legacy migration

1. List all spacing values in use (the linter helps: `node tools/lint-raw-values.mjs src --json`).
2. Group close values (14/15/16 → 16).
3. Map each group to a scale token.
4. Replace first in the most used components; then in screens.
5. Track drift each round; do not swap everything at once.

## Anti-patterns

- Odd or off-scale values (7, 13, 18px).
- `margin` on the component to compensate for missing `gap` on the parent.
- Fixed height on a card or button that contains text.
- Semantic tokens with vague names ("medium") and no definition.
- Compact mode that reduces touch area.
- Breakpoint named after a device.
- Reordering visually without reordering the DOM.

## Checklist

- [ ] No off-scale px in the code (`lint-raw-values` clean).
- [ ] Padding by `space.inset-*`; vertical distances by `space.stack-*`; horizontal by `space.inline-*`.
- [ ] Space between siblings via the parent's `gap`.
- [ ] Controls with `size.control-*`; touch area ≥ 24px, default 44px.
- [ ] 4/8/12 grid with gutters from the scale and a defined max width.
- [ ] Breakpoints by content; container queries where the component changes context.
- [ ] Works at 320px, with 200% zoom, and focus order follows visual order.
