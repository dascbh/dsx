# Figma Plugin API traps

Each item is symptom → cause → fix. All of them were paid for in production; the
Plugin API accepts almost anything without complaint and the error only shows up
rendered.

## Layout

**Collapsed column / row at minimum height.**
Two sibling columns with `layoutSizingVertical = 'FILL'` in a row that HUGs.
The height reference becomes circular and everything shrinks.
→ One column HUG (sets the height), the other FILL (stretches to match it).

**`counterAxisAlignItems = 'STRETCH'` fails.**
It only accepts `MIN | MAX | CENTER | BASELINE`.
→ To stretch, use `layoutSizingVertical = 'FILL'` on the child.

**`layoutPositioning = 'ABSOLUTE'` throws "parent has layoutMode NONE".**
It was set before `appendChild`.
→ Append first, position afterwards: `p.appendChild(n); n.layoutPositioning = 'ABSOLUTE'; n.x = …`.

**An empty auto-layout frame takes up 100×100.**
An action cell with no button, a conditional slot that did not render.
→ Do not create the frame when there is no content; or collapse it:
`n.layoutSizingVertical = 'FIXED'; n.resize(n.width, 1)`.

**A label positioned above the border disappears (clipped).**
`createAutoLayout()` creates the frame with `clipsContent = true` by default. An
absolute child with a negative `y` (the label in the notch of an MUI outlined
field) sits outside the box and is clipped — in the field's frame **and** in any
wrapper above it.
→ `clipsContent = false` on the frame **and** on the wrapper (finding
2026-08-18, Foundations phase; fixed in `field()` in `tools/figma/prelude.js`).

**The node name does not come from the props object.**
Do not rely on `createAutoLayout(dir, { name })`.
→ Name it explicitly: `n.name = 'Chip'`. The name is what lets you sweep and
repair later — it is worth the extra line.

## Text and tables

**Text leaks out of the cell / is cut in the middle.**
An auto-width text node inside a fixed-width column.
→ In this order: `t.textAutoResize = 'HEIGHT'` → `t.layoutSizingHorizontal = 'FILL'`
→ `t.maxLines = 1` → `t.textTruncation = 'ENDING'`. In reverse order it
sometimes does not apply.

**The table overflows the card.**
Always add it up before drawing:
`Σ widths + (number of columns − 1) × itemSpacing ≤ container inner width`.
On a screen with a side rail, the inner width is
`main width − padding − rail − gap − card padding`. Err on the low side.

**`createTextStyle` / `characters` fail with "unloaded font".**
→ `await figma.loadFontAsync(...)` for every family+style **before** creating
or changing any text — including when you only reposition existing text nodes.

## Color and variables

**Opacity disappears on a variable-bound paint.**
Passing `opacity` on the paint before `setBoundVariableForPaint` is ignored.
→ Read-modify-write:

```js
node.fills = [P('color/action/primary')];
const f = JSON.parse(JSON.stringify(node.fills));
f[0].opacity = 0.14;
node.fills = f;
```

**The same tint goes back to solid later.**
In instance children the override is volatile.
→ Adjust the **main component** when you can. If you cannot, do a verification
sweep at the end (look for `opacity === 1` with the expected variable) and
**check it rendered**.

**Gradients do not accept variables.**
`setBoundVariableForPaint` only binds `color` on a solid paint.
→ Use literal colors in the gradient and write in the caption that this board
does not follow dark mode.

## Vectors and arrows

**An icon turns into a solid blob.**
An unclosed subpath: SVG fill closes it implicitly, Figma does not.
→ Close each subpath with `Z` (see the `figma-foundations` skill).

**A small icon with a glyph that leaks or is offset.**
`instance.resize(16, 16)` only changes the instance's box; the inner vector only
follows if its constraint is `SCALE` — and the Plugin API accepts `MIN/MIN`
without complaint (an entire foundation of 51 icons once shipped that way).
→ On the instance, use `i.rescale(size / 24)` instead of `resize` (it is what
`icon()` in `tools/figma/prelude.js` does). On the component, `constraints: SCALE`
on **every** child vector. Check by instantiating at ≤ 16px and looking
(`figma-conventions` skill, backwards compatibility).

**`vectorPaths` rejects the `d`.**
The parser only understands absolute `M/L/C/Q/Z` — `H`, `V`, `S`, `T`, `A` fail.
→ Normalize first: `node <DSX>/tools/figma/normalize-svg-path.cjs "<d>"`
(or `require` the same file — it converts to absolute commands and closes every
subpath with `Z`; an `A` arc throws, so use the icon variant without arcs).

**An arrow with a head on both ends.**
`strokeCap` on a `LINE` applies to both ends.
→ `strokeCap = 'NONE'` and draw the head as a 3-point `createPolygon()`,
rotated according to the direction (0 up, 90 left, 180 down, 270 right).

**Spinner.** `createEllipse()` + `arcData: { startingAngle: 0, endingAngle: 4.6,
innerRadius: 0.82 }`, no fill and with a stroke.

## Components and instances — the expensive trap

**The MCP componentizes repeated structures on its own.** After a few scripts,
components you did not create show up (`UI/Chip`, `UI/Botão · …`) and the pieces
already drawn become instances of them. That **flattens variations**:

- outlined chips lose their border;
- filled chips end up with the label in the background color (it disappears);
- buttons lose the left icon and the secondary level's border.

→ After each big round, check it rendered. A mechanical, safe repair:

```js
// outline: the label's own color preserves the tone
if (!filled && chip.strokes.length === 0) {
  chip.strokes = [JSON.parse(JSON.stringify(label.fills))[0]];
  chip.strokeWeight = 1;
}
// filled chip label: force the contrast token
if (filled) label.fills = [P('color/text/on-action')];
// button icon: an instance does not accept a new child — detach first
const frame = botao.detachInstance();
frame.insertChild(0, icone);
```

**Never delete a node by a size heuristic.** "A small loose frame on the page"
may be the **main component** of Chip or Button — deleting it breaks the whole
file. Inspect `type` and `name` first.

**If you deleted a component:** `figma.getNodeByIdAsync(id)` may still resolve
it with `removed === false` and `parent === null` — in that case
`page.appendChild(n)` is enough to restore it, and the instances come back on
their own.

**An instance child's id** (`I123:4;5:6`) does not always resolve in
`getNodeByIdAsync`. → Reach it with `findOne`/`findAll` from the instance.

## Verification

`node.screenshot({ scale })` returns the image inline — good for checking 1–3
nodes per script. `get_screenshot` returns a URL (much cheaper in tokens) — good
for detailed inspection.

Scale matters: a 14% tint rendered at 0.4× reads as solid. When checking a
tint, contrast or a 1px border, use scale ≥ 1 on the specific node, not on the
whole screen.
