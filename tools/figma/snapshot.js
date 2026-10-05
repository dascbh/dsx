/**
 * Canonical snapshot of a Figma file, for diffs between rounds.
 * Paste the body into a `use_figma` call (load the `figma-use` skill first).
 * Does NOT run in Node, only inside the Plugin API sandbox.
 *
 * Two modes, set at the top:
 *   MODE = 'hashes' → 1 hash per top-level frame (small response)
 *   MODE = 'full'   → projection of every node of the frames listed in TARGETS
 *
 * Keeps design decisions; drops what auto-layout recomputes on its own
 * (child x/y, HUG/FILL axis sizes, bounding box). See
 * skills/figma-cycle/references/diff.md. The report comes from
 * tools/figma/diff-baseline.cjs.
 */

const MODE = 'hashes';          // 'hashes' | 'full'
const PAGES = [];               // empty = all; otherwise, exact page names
const TARGETS = [];             // in 'full': names of frames to detail

// ── name maps (tokens and styles appear by NAME, never by id) ───────────────
const vs = await figma.variables.getLocalVariablesAsync();
const VN = {}; vs.forEach(v => VN[v.id] = v.name);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const MODES = {}; cols.forEach(c => c.modes.forEach(m => MODES[m.modeId] = c.name + '/' + m.name));
const tstyles = await figma.getLocalTextStylesAsync();
const SN = {}; tstyles.forEach(s => SN[s.id] = s.name);

const r2 = n => (n == null ? null : Math.round(n * 100) / 100);
const hx = c => '#' + [c.r, c.g, c.b].map(v => ('0' + Math.round(v * 255).toString(16)).slice(-2)).join('');

function paint(p) {
  if (!p) return null;
  if (p.visible === false) return 'hidden';
  if (p.type !== 'SOLID') return p.type;                       // gradient/image: type only
  const bv = p.boundVariables && p.boundVariables.color;
  const base = bv ? '@' + (VN[bv.id] || bv.id) : hx(p.color);  // a token wins over a raw value
  const o = p.opacity == null ? 1 : r2(p.opacity);
  return o === 1 ? base : base + '/' + o;
}
const paints = arr => (!arr || arr.length === 0 ? null : arr.map(paint).join(','));

/** Canonical projection of a node: only what is a decision, rounded. */
function proj(n) {
  const o = { n: n.name, t: n.type };
  if (n.visible === false) o.hidden = 1;
  if (n.opacity != null && n.opacity !== 1) o.op = r2(n.opacity);

  const auto = 'layoutMode' in n && n.layoutMode !== 'NONE';
  if (auto) {
    o.l = [n.layoutMode, n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft,
      n.itemSpacing, n.primaryAxisAlignItems, n.counterAxisAlignItems,
      n.layoutWrap || 'NO_WRAP', n.counterAxisSpacing == null ? '' : n.counterAxisSpacing].join('|');
  }
  if ('layoutSizingHorizontal' in n) {
    o.s = n.layoutSizingHorizontal + '/' + n.layoutSizingVertical;
    // size counts only on a FIXED axis; on the others it is derived and becomes noise
    if (n.layoutSizingHorizontal === 'FIXED') o.w = Math.round(n.width);
    if (n.layoutSizingVertical === 'FIXED') o.h = Math.round(n.height);
  } else if (n.type !== 'TEXT') {
    o.w = Math.round(n.width); o.h = Math.round(n.height);
  }
  if ('layoutPositioning' in n && n.layoutPositioning === 'ABSOLUTE') {
    o.abs = [Math.round(n.x), Math.round(n.y)].join(',');
  }
  if ('cornerRadius' in n && typeof n.cornerRadius === 'number' && n.cornerRadius !== 0) o.r = n.cornerRadius;
  if ('fills' in n && Array.isArray(n.fills)) { const f = paints(n.fills); if (f) o.f = f; }
  if ('strokes' in n && Array.isArray(n.strokes) && n.strokes.length) {
    o.st = paints(n.strokes);
    // per-side weights exist only on nodes that support them (FRAME, RECTANGLE…);
    // ELLIPSE, VECTOR and LINE throw when the property is accessed.
    o.sw = ('strokeTopWeight' in n)
      ? [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight]
          .map(v => (v == null ? n.strokeWeight : v)).join('|')
      : String(n.strokeWeight);
  }
  if (n.type === 'TEXT') {
    o.txt = n.characters;
    o.fs = r2(n.fontSize);
    o.fw = n.fontName && n.fontName.style;
    o.ff = n.fontName && n.fontName.family;
    o.lh = n.lineHeight && (n.lineHeight.unit === 'AUTO' ? 'AUTO' : n.lineHeight.value + n.lineHeight.unit[0]);
    o.ls = n.letterSpacing && (n.letterSpacing.value + n.letterSpacing.unit[0]);
    if (n.textCase && n.textCase !== 'ORIGINAL') o.tc = n.textCase;
    o.ta = n.textAlignHorizontal;
    if (n.maxLines) o.ml = n.maxLines;
    if (n.textTruncation && n.textTruncation !== 'DISABLED') o.tt = n.textTruncation;
    if (n.textStyleId && SN[n.textStyleId]) o.ts = SN[n.textStyleId];
  }
  if (n.type === 'VECTOR' && n.vectorPaths && n.vectorPaths[0]) {
    o.d = n.vectorPaths.map(p => p.data.length).join(',');     // the length is enough to detect a swap
  }
  return o;
}

/** djb2: there is no crypto in the sandbox; a collision here is irrelevant. */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Walks the subtree building { id: {…proj, p: path, c: [child ids]} }. */
function walk(node, path, output, ordinals) {
  const key = node.name || node.type;
  const seen = ordinals[path] || (ordinals[path] = {});
  seen[key] = (seen[key] || 0) + 1;
  const p = path + '/' + key + '[' + seen[key] + ']';
  const o = proj(node);
  o.p = p;
  if ('children' in node && node.children.length) {
    o.c = node.children.map(ch => ch.id);
    output[node.id] = o;
    for (const ch of node.children) walk(ch, p, output, ordinals);
  } else {
    output[node.id] = o;
  }
  return p;
}

// ── variables and styles: a VALUE change does not show in the frames ────────
const variables = {};
for (const v of vs) {
  const val = {};
  for (const [modeId, raw] of Object.entries(v.valuesByMode)) {
    const name = MODES[modeId] || modeId;
    val[name] = (raw && raw.type === 'VARIABLE_ALIAS') ? '→' + (VN[raw.id] || raw.id)
      : (raw && raw.r != null) ? paint({ type: 'SOLID', color: raw, opacity: raw.a })
      : raw;
  }
  variables[v.name] = val;
}
const styles = {};
for (const s of tstyles) {
  styles[s.name] = [s.fontName.family, s.fontName.style, r2(s.fontSize),
    s.lineHeight.unit === 'AUTO' ? 'AUTO' : s.lineHeight.value + s.lineHeight.unit[0],
    s.letterSpacing.value + s.letterSpacing.unit[0], s.textCase].join('|');
}

// ── scan ─────────────────────────────────────────────────────────────────────
const pages = figma.root.children.filter(p => PAGES.length === 0 || PAGES.indexOf(p.name) > -1);
const frames = {};
for (const pg of pages) {
  await figma.setCurrentPageAsync(pg);
  for (const fr of pg.children) {
    const key = pg.name + ' › ' + fr.name;
    if (MODE === 'full' && TARGETS.length && TARGETS.indexOf(key) < 0 && TARGETS.indexOf(fr.name) < 0) continue;
    const nodes = {};
    walk(fr, pg.name, nodes, {});
    const canon = Object.keys(nodes).sort().map(id => nodes[id].p + JSON.stringify(nodes[id])).join('\n');
    frames[key] = MODE === 'full'
      ? { hash: hash(canon), n: Object.keys(nodes).length, nodes }
      : { hash: hash(canon), n: Object.keys(nodes).length };
  }
}

return {
  fileKey: figma.fileKey,
  mode: MODE,
  variables: MODE === 'hashes' ? hash(JSON.stringify(variables)) : variables,
  styles: MODE === 'hashes' ? hash(JSON.stringify(styles)) : styles,
  frames,
};
