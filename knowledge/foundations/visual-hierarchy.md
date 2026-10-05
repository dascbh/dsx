# Visual hierarchy

> **When to consult**
> - When laying out any screen, card, dialog or dashboard.
> - When "everything looks the same", the main action gets lost, or the screen "looks cluttered".
> - When defining an interface's type scale, spacing and density.
> - When checking whether visual order, reading order and focus order match.

Visual hierarchy is the order in which the screen is perceived: what comes first, next and last. It must reflect the **real priority of the task**, not the urge to highlight everything.

---

## 1. Process

1. **Name the screen's main task** in one sentence ("review and pay for the order").
2. **Classify the content** into three levels:
   - Essential: what the person needs to decide and act.
   - Support: what helps them decide (context, comparison, help).
   - Detail: what can stay on demand (metadata, history, settings).
3. **Build the attention path:** an entry point (title or key data) → supporting information → main action.
4. **Remove or demote** whatever competes with that path.
5. **Validate in every state:** long real content, empty, error, loading, narrow screen, 200% zoom.

---

## 2. Hierarchy levers

| Lever | How it works | Rule |
|---|---|---|
| Size and scale | The largest is seen first | Size proportional to priority; do not enlarge what is secondary |
| Contrast | Lightness, color, weight, fill | Reserve the accent color for the main action and states; do not use it for decoration |
| Font weight | Bold draws the eye before regular | At most 2 weights per block (e.g. 400 and 600) |
| Space | Space around an element isolates and elevates it | More space around the essential; less inside groups |
| Position | The top and the start of the reading line weigh more | Entry point at the top; main action close to the content that motivates it |
| Alignment | Shared axes signal belonging | Few axes (1–3 per screen); avoid centering long blocks of text |
| Color and saturation | Saturated color stands out against neutrals | Use 1 accent color; semantic states (error, success, warning) only for state |
| Depth | Shadow and elevation bring things forward | Elevation for layers (menu, modal), not to highlight ordinary content |

---

## 3. Numeric rules

**Typography**
- A scale with a constant ratio between 1.2 and 1.333 (e.g. 14 → 16 → 20 → 24 → 32).
- Up to 4 text sizes on one screen; more than that dilutes the difference.
- Minimum perceptible difference between levels: ~20% in size **or** a change in weight + size.
- Body text: 16 px on the web (minimum 14 px in dense interfaces); line height 1.4–1.6.
- Line length: 45–75 characters for continuous reading.
- Headings: line height 1.1–1.3; space above the heading larger than below (the heading belongs to what follows).

**Spacing**
- Use a base-4 or base-8 scale (4, 8, 12, 16, 24, 32, 48, 64).
- Space between groups ≥ 2× the space inside a group.
- Label close to its field (4–8 px); fields from each other 16–24 px; sections 32–48 px.

**Contrast (WCAG 2.2 AA)**
- Normal text: ≥ 4.5:1.
- Large text (≥ 24 px, or ≥ 18.66 px bold): ≥ 3:1.
- Interface components and informative graphics (field borders, icons, focus): ≥ 3:1.

**Actions**
- One primary action per visual context (screen, dialog, section card). See [button-hierarchy](../../patterns/actions/button-hierarchy.md) and [action-placement](../../patterns/actions/action-placement.md).
- Secondary actions with less weight (outline or text); destructive ones with their own treatment and set apart.

---

## 4. Scanning patterns

People rarely read everything; they scan. Organize for the likely pattern.

| Pattern | When it occurs | How to design |
|---|---|---|
| F | Text-dense pages, lists, search results | Decisive information in the first words of headings and items; frequent subheadings; the start of each line carries meaning |
| Z | Screens with little text, landing pages, simple cards | Brand/title in the top-left corner, key data at the top, main action at the end of the path (bottom right or right below the content) |
| Layer cake | Content with good subheadings | Descriptive subheadings that let people jump straight to the right section |
| Spotted | Looking for something specific (price, date, link) | Consistent formatting for the sought data: aligned numbers, dates in the same format |

**Rules**
- Start headings, labels and list items with the word that differentiates ("March invoice", not "Your invoice for the month of March").
- Right-align numbers in tables and use tabular figures.
- In left-to-right languages, the top-left corner is the default entry point; do not put something irrelevant there.

---

## 5. Density

Density is how much information fits per area. There is no "right" density; there is density suited to the use.

| Context | Density | Signals |
|---|---|---|
| Occasional use, broad audience, mobile | Comfortable | 48–56 px rows, more space, one task per screen |
| Daily use by specialists, tables, back office | Compact | 32–40 px rows, more columns, shortcuts |
| Mixed | Offer a toggle | Per-user persistent density control |

**Rules**
- IF the person needs to compare many items THEN prioritize density (table) over decorative cards ([table-vs-cards](../../patterns/data/table-vs-cards.md)).
- IF the person is learning or deciding something high-risk THEN prioritize space and focus.
- Compact must not shrink touch targets below the minimum nor text below ~12–13 px.
- High density demands even clearer hierarchy: strict alignment, light separators, zebra striping or row hover.

---

## 6. Squint test

1. Squint, or apply a ~5–8 px blur to the screenshot.
2. Note the first 3 elements that still stand out.
3. Compare them with the essential/support/detail classification.

- IF the first perceived element is neither the entry point nor the main action THEN the hierarchy is inverted.
- IF nothing stands out THEN scale or weight contrast is missing.
- IF more than 3 things compete for first place THEN there is too much emphasis; demote.
- Repeat in grayscale: if the hierarchy disappears without color, it depends too much on color.

---

## 7. Hierarchy and accessibility

- Semantic heading levels (h1 → h2 → h3) must match the visual hierarchy; do not pick the tag by size.
- A single h1 per page, describing the task or the content.
- DOM order = reading order = focus order = visual order. Reordering with CSS alone creates a mismatch for keyboard and screen reader users.
- Hierarchy cannot depend on color alone or size alone.
- The hierarchy must survive 200% zoom and reflow at 320 px width.

---

## 8. What the machine measures (rules L1–L9)

Part of this page becomes rules measured on the rendered screen. The static capture is opened in a headless browser (`tools/ux-lint/measure.mjs`, the project's Playwright), which records the box, font, color and region of each element; `tools/ux-lint/layout.mjs` applies the rules to that geometry, without a browser. Details of each measurement, configurable limits (the `layout` key of UX.md) and known false positives: [ux-md.md](ux-md.md), section "Verification".

| Rule | What fails | How it is measured | Sev. |
|---|---|---|---|
| L1 | Primary action outside the declared position | Center of the primary action against the content or dialog box, at the position of the screen's archetype (`primary-action.position`) or of UX.md | 2 |
| L2 | Competing emphases (automated squint test) | Above the fold: filled buttons, bold text ≥ 1.25× body size and saturated color blocks; more than 3 (default) fails | 2 |
| L3 | Broken heading scale | `h1` smaller than other text on the screen, or a lower level with a larger font than a higher one | 2 |
| L4 | Misalignment | Left edges of a form's fields and labels (or of sibling cards) at more than 2 positions, 4 px tolerance, or more positions than grid columns | 1 |
| L5 | Proximity | Label more than 16 px from its field; buttons in the same group more than 48 px apart; element closer to the neighboring group than to its own | 1 |
| L6 | Above the fold | Title or primary action below 900 px (in a dialog, measured from its top) | 2 |
| L7 | Long line | Running text with more than 90 characters per line, counted on the rendered lines | 1 |
| L8 | Small target | Clickable element smaller than 24×24 px without free space around it (WCAG 2.5.8) | 2 |
| L9 | Missing archetype region | Region from the archetype card not found, either by `data-region` markup or by geometric heuristic | 1 |

- IF an L finding contradicts a deviation declared in UX.md THEN check the capture and record the decision; the rule measures geometry, not the reason.
- IF L2 fails THEN demote what is neither the entry point nor the main action (filled button becomes outlined, saturated block becomes a soft tint) before touching the title.
- IF L3 points to an overline heading (small all-caps text above cards) THEN decide between changing the semantic level or enlarging the heading — the visual order and the screen reader order must match.
- What geometry cannot decide — whether the first perceived element is the right one for the task — stays with the squint test in section 6.

---

## 9. Anti-patterns

- **Highlighting everything:** several elements in bold, accent color and large size; the priority disappears.
- **Hidden main action:** below the fold, with the same weight as secondary actions, or far from the content.
- **Hierarchy only on the landing page:** internal screens become flat lists.
- **Short dummy data in the design:** 5-letter names and round values hide real breakage.
- **Divergent semantics:** the visuals say one order, the HTML structure says another.
- **Accent color as decoration:** when the action color appears on icons and ornaments, the main button stops standing out.
- **Too many containers:** cards inside cards, borders everywhere, instead of space.

---

## Audit checklist

- [ ] The screen's main task fits in one sentence and the layout reflects it.
- [ ] In the squint test, the first perceived element is the entry point or the main action.
- [ ] There is a single primary action per visual context.
- [ ] At most 4 text sizes and 2 weights per block; scale with a constant ratio.
- [ ] Space between groups ≥ 2× the internal space; 4/8 px scale respected.
- [ ] Text contrast ≥ 4.5:1 (large ≥ 3:1) and component contrast ≥ 3:1.
- [ ] Headings, labels and items start with the word that differentiates.
- [ ] Density suited to the use (comparing vs. learning), without shrinking targets or text below the minimum.
- [ ] Hierarchy validated with long real content, empty/error/loading states, 320 px and 200% zoom.
- [ ] Semantic headings, reading order and focus order match the visual order.
- [ ] The hierarchy remains readable in grayscale.
- [ ] `measure.mjs` + `layout.mjs` run on the captures; severity-2 L findings checked against the capture.
