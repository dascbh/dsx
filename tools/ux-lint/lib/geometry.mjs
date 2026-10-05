// Screen geometry for the layout and hierarchy rules (L1–L9). No dependencies.
//
// jsdom and the lib/html.mjs parser do not compute layout. The geometry comes from outside: tools/ux-lint/measure.mjs
// opens the static HTML capture in a headless browser, measures the elements and writes a
// `<name>.geometry.json` file in this format. Everything below the format is pure analysis over it
// (no browser), which lets the rules be tested with hand-written geometry.
//
// ---------------------------------------------------------------- `geometry` format (version 1)
//
// {
//   "format": "dsx-geometry", "version": 1,
//   "screen": "04-order-editor",             // capture name without .html (convention <nn>-<screen-id>[.<state>])
//   "file": "04-order-editor.html",          // source capture (as passed to measure)
//   "title": "/orders/:orderId/edit",       // capture <title> (the capture skill puts the route there)
//   "viewport": { "width": 1440, "height": 900 },
//   "page_height": 2140,                     // full document height (scrollHeight)
//   "body_font_size": 15,                    // body text size (px), read from <body>
//   "dialog_open": false,                    // a visible [role=dialog] exists (UX.md selector)
//   "elements": [{
//     "id": "main > div:nth-of-type(2) > button:nth-of-type(1)", // stable path (anchored on a stable #id)
//     "tag": "button", "role": null, "classes": ["MuiButton-root", "MuiButton-contained"],
//     "kind": "interactive",                 // interactive | heading | label | field | text | region | card | block | graphic
//     "text": "Baixar PDF",                  // accessible name or text, up to 80 characters
//     "text_length": 10,                     // length of the full text (for line length)
//     "box": { "x": 1290, "y": 72, "width": 120, "height": 36 },  // getBoundingClientRect at scroll 0
//     "style": { "font_size": 14, "font_weight": 600, "line_height": 24.5, "color": "rgb(255, 255, 255)",
//                "background_color": "rgb(43, 89, 195)", "display": "inline-flex", "visibility": "visible" },
//     "is_interactive": true, "is_primary": true, "is_destructive": false, "is_inline": false, "disabled": false,
//     "label_for": null,                     // on labels: id (path) of the field the label names
//     "region": "main",                      // region by the UX.md selector; dialog = `dialog "Title"` (older files: `diálogo "…"`)
//     "heading_level": null,                 // 1–6 on headings (h1–h6 or role=heading + aria-level)
//     "parent": "main > div:nth-of-type(2)", // DOM path of the parent (action groups)
//     "form_group": "main > form",           // path of the form/fieldset/dialog/panel that groups the field
//     "archetype_region": null,              // declared archetype region (data-region or
//                                            // verification.selectors.archetype-regions in the UX.md)
//     "selected": false                      // aria-selected/aria-pressed/aria-current (tab, toggle button)
//   }]
// }
//
// Extra keys are tolerated; missing keys default to null/false. Coordinates in CSS px, relative to the top of
// the page (scroll 0), so "y > 900" means "below the first fold" in a 900 px window.

import { unionList } from './lang/index.mjs';

/** Wizard step words of every language pack ("Passo 2", "Step 2"). */
const STEP_WORD = new RegExp(`^(${unionList('stepWords').join('|')})\\b`, 'i');

export const GEOMETRY_FORMAT = 'dsx-geometry';
export const GEOMETRY_VERSION = 1;

/** Thresholds of the L rules (overridable by the `layout` key of the UX.md front matter, in kebab-case). */
export const LAYOUT_DEFAULTS = Object.freeze({
  fold: 900, // L6 and L2: height of the first fold
  'max-emphasis': 3, // L2: high-weight elements tolerated in the first fold
  'emphasis-ratio': 1.25, // L2: texto ≥ 1,25× o corpo...
  'emphasis-weight': 600, // ...and bold counts as emphasis
  'saturated-min-area': 2500, // L2: saturated color block from this area on (px²)
  'align-tolerance': 4, // L4: left edges within 4 px count as the same
  'max-left-edges': 2, // L4: distinct positions tolerated (or the number of columns, if larger)
  'label-gap': 16, // L5: maximum label-to-field distance
  'action-gap': 48, // L5: maximum distance between actions of the same group
  'max-line-chars': 90, // L7: characters per line in running text
  'min-target': 24, // L8: minimum target (WCAG 2.5.8)
  'top-band': 240, // L1: top band of the page (px below the top of the content)
});

export const LAYOUT_SEVERITY = Object.freeze({ L1: 2, L2: 2, L3: 2, L4: 1, L5: 1, L6: 2, L7: 1, L8: 2, L9: 1 });

/** Archetype regions that exist only under some conditions (selection, dangerous action): absence is not a finding. */
export const CONDITIONAL_REGIONS = new Set(['bulk-actions-bar', 'danger-zone', 'quick-view']);

// ---------------------------------------------------------------- geometry utilities

export const right = (b) => b.x + b.width;
export const bottom = (b) => b.y + b.height;
export const centerX = (b) => b.x + b.width / 2;
export const centerY = (b) => b.y + b.height / 2;
export const area = (b) => Math.max(0, b.width) * Math.max(0, b.height);

/** `a` contains `b` (with `tol` px of slack). */
export function containsBox(a, b, tol = 1) {
  return b.x >= a.x - tol && b.y >= a.y - tol && right(b) <= right(a) + tol && bottom(b) <= bottom(a) + tol;
}

/** Distance between rectangles (0 when they touch or overlap). */
export function boxDistance(a, b) {
  const dx = Math.max(0, a.x - right(b), b.x - right(a));
  const dy = Math.max(0, a.y - bottom(b), b.y - bottom(a));
  return Math.hypot(dx, dy);
}

/** Clusters close values (difference ≤ tol from the first of the group). Returns the representatives. */
export function clusterValues(values, tol = 4) {
  const sorted = [...values].sort((a, b) => a - b);
  const out = [];
  for (const v of sorted) if (!out.length || v - out.at(-1).start > tol) out.push({ start: v, values: [v] }); else out.at(-1).values.push(v);
  return out.map((c) => c.values[0]);
}

/** Reads a computed CSS color (rgb/rgba/#hex) → { r, g, b, a } or null. */
export function parseColor(s) {
  if (!s || typeof s !== 'string') return null;
  const t = s.trim().toLowerCase();
  if (t === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  let m = t.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    let a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  m = t.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  return null;
}

/** HSL of a color (s and l from 0 to 1). */
export function toHsl({ r, g, b }) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

/** A color saturated enough to draw the eye (solid fill, not a pastel tint or gray). */
export function isSaturated(color) {
  const c = typeof color === 'string' ? parseColor(color) : color;
  if (!c || c.a < 0.5) return false;
  const { s, l } = toHsl(c);
  return s >= 0.45 && l >= 0.2 && l <= 0.7;
}

/** Screen id from the capture name: `04-order-editor.empty` → `order-editor`. */
export function screenIdOf(name) {
  return String(name).replace(/^.*[\\/]/, '').replace(/\.geometry\.json$|\.html?$/, '').replace(/^\d+[-_]/, '').replace(/\..*$/, '');
}

// ---------------------------------------------------------------- reading the geometry

const EL_DEFAULTS = {
  tag: 'div', role: null, classes: [], kind: 'block', text: '', text_length: 0, is_interactive: false, is_primary: false,
  is_destructive: false, is_inline: false, label_for: null, region: '(outside any region)', heading_level: null, parent: null,
  form_group: null, archetype_region: null, selected: false, disabled: false,
};

/** Fills the geometry with defaults (missing keys) and validates the minimum. */
export function normalizeGeometry(g) {
  if (!g || typeof g !== 'object' || !Array.isArray(g.elements)) throw new Error('invalid geometry: "elements" is missing');
  return {
    format: g.format ?? GEOMETRY_FORMAT, version: g.version ?? GEOMETRY_VERSION, screen: g.screen ?? 'screen', file: g.file ?? `${g.screen ?? 'screen'}.html`,
    title: g.title ?? '', viewport: { width: 1440, height: 900, ...(g.viewport || {}) }, page_height: g.page_height ?? null,
    body_font_size: g.body_font_size ?? 16, dialog_open: !!g.dialog_open,
    elements: g.elements.map((e, i) => {
      const el = { ...EL_DEFAULTS, ...e, id: e.id ?? `#${i}` };
      el.style = { font_size: null, font_weight: 400, line_height: null, color: null, background_color: null, display: 'block', visibility: 'visible', ...(e.style || {}) };
      el.box = { x: 0, y: 0, width: 0, height: 0, ...(e.box || {}) };
      if (el.heading_level != null) el.heading_level = Number(el.heading_level);
      return el;
    }),
  };
}

/** Dialog region label: `dialog "Title"` (and `diálogo "…"` in geometry measured before the round-4 rename, 2026-10). */
const isDialogRegion = (r) => /^(dialog|diálogo)\b/.test(String(r ?? ''));
/** Shell region (product header and menu): outside the content rules. */
export const isShellRegion = (r) => /^(header|nav)(\b|#|\[)|\[role=(banner|navigation)\]/.test(String(r ?? ''));

/**
 * Elements in focus: with a dialog open, only the dialog (what the person sees); without one, everything outside
 * the product header and menu. Returns { elements, ref, regionLabel }: `ref` is the reference box
 * (the dialog or the content area).
 */
export function focusScope(geom) {
  const els = geom.elements;
  let inFocus, refEl;
  if (geom.dialog_open && els.some((e) => isDialogRegion(e.region))) {
    const dialogs = els.filter((e) => e.kind === 'region' && isDialogRegion(e.region));
    refEl = dialogs.sort((a, b) => area(b.box) - area(a.box))[0];
    const label = refEl ? refEl.region : els.find((e) => isDialogRegion(e.region)).region;
    inFocus = els.filter((e) => e.region === label);
  } else {
    inFocus = els.filter((e) => !isShellRegion(e.region) && !isDialogRegion(e.region));
    refEl = els.filter((e) => e.kind === 'region' && /^main/.test(e.region)).sort((a, b) => area(b.box) - area(a.box))[0];
  }
  const content = inFocus.filter((e) => e.kind !== 'region');
  let ref = refEl?.box;
  if (!ref) {
    const xs = content.map((e) => e.box);
    ref = xs.length
      ? { x: Math.min(...xs.map((b) => b.x)), y: Math.min(...xs.map((b) => b.y)), width: 0, height: 0 }
      : { x: 0, y: 0, width: geom.viewport.width, height: geom.viewport.height };
    if (xs.length) { ref.width = Math.max(...xs.map(right)) - ref.x; ref.height = Math.max(...xs.map(bottom)) - ref.y; }
  }
  return { elements: content, ref, regionLabel: refEl?.region ?? content[0]?.region ?? '(screen)' };
}

const label = (e) => (e.text ? `"${String(e.text).slice(0, 50)}"` : `<${e.tag}>`);
const r1 = (n) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------- archetype region detection

const HEADER_REGIONS = new Set(['page-header', 'dialog-header', 'panel-header', 'public-header']);
const BODY_REGIONS = new Set(['dialog-body', 'panel-body', 'editing-area', 'viewer', 'content', 'step-body', 'section-body', 'document-or-detail', 'request-summary']);
const FOOTER_REGIONS = new Set(['dialog-footer', 'panel-footer', 'navigation-footer', 'section-footer', 'list-footer', 'status-bar', 'public-footer']);
const TOOLBAR_REGIONS = new Set(['toolbar', 'viewer-toolbar', 'filter-bar', 'search-bar', 'period-bar', 'bulk-actions-bar']);
const SIDE_REGIONS = new Set(['side-panel', 'info-panel', 'quick-view', 'detail-column']);
const LEFT_REGIONS = new Set(['collection-navigation', 'section-menu', 'master-column']);

const CONTAINER = new Set(['block', 'card', 'region', 'graphic']);
const withinRef = (e, ref) => containsBox(ref, e.box, 2);

function sideColumns(els, ref, side) {
  return els.filter((e) => {
    if (!CONTAINER.has(e.kind) && e.tag !== 'aside') return false;
    const w = e.box.width / (ref.width || 1);
    if (e.tag === 'aside' || e.role === 'complementary') return side === 'right' ? centerX(e.box) > centerX(ref) : centerX(e.box) <= centerX(ref);
    if (w < 0.12 || w > 0.5 || e.box.height < 200) return false;
    return side === 'right' ? e.box.x >= ref.x + ref.width * 0.5 : e.box.x <= ref.x + ref.width * 0.12 && right(e.box) <= ref.x + ref.width * 0.5;
  });
}

/** Same row: centers within `tol` px or vertical overlap of at least half the smaller height. */
export function sameRow(a, b, tol = 8) {
  if (Math.abs(centerY(a) - centerY(b)) <= tol) return true;
  const overlap = Math.min(bottom(a), bottom(b)) - Math.max(a.y, b.y);
  return overlap >= Math.min(a.height, b.height) / 2;
}

function rows(items, tol = 8) {
  const out = [];
  for (const e of [...items].sort((a, b) => centerY(a.box) - centerY(b.box))) {
    const row = out.find((r) => sameRow(r[0].box, e.box, tol));
    if (row) row.push(e); else out.push([e]);
  }
  return out;
}

/**
 * Does the screen have archetype region `id`? First by the declared markup (`archetype_region`), then by a
 * geometric heuristic. Returns { present, how }; `how`: 'declared' | 'heuristic' | 'conditional' | 'no-detector'.
 */
export function detectArchetypeRegion(id, scope, geom) {
  const { elements: els, ref } = scope;
  if (els.some((e) => e.archetype_region === id) || geom.elements.some((e) => e.archetype_region === id && e.kind === 'region')) return { present: true, how: 'declared' };
  if (CONDITIONAL_REGIONS.has(id)) return { present: true, how: 'conditional' };
  const inRef = els.filter((e) => withinRef(e, ref) || !geom.dialog_open);
  const dialog = geom.dialog_open;
  const topLimit = dialog ? ref.y + Math.max(80, ref.height * 0.3) : ref.y + 320;
  const contentBottom = Math.max(ref.y, ...inRef.map((e) => bottom(e.box)));
  const heads = inRef.filter((e) => e.kind === 'heading');
  const buttons = inRef.filter((e) => e.is_interactive);
  let present = false;
  if (HEADER_REGIONS.has(id)) {
    present = heads.some((h) => h.box.y <= topLimit && (dialog || id === 'public-header' || id === 'panel-header' || h.heading_level <= 2))
      // an in-place editable title (field with large text) is also a header
      || (!dialog && inRef.some((e) => e.box.y <= topLimit && e.text && e.style.font_size >= (geom.body_font_size || 16) * 1.25 && e.kind !== 'region'));
    if (!present && id === 'public-header') present = inRef.some((e) => e.kind === 'graphic' && e.box.y <= topLimit);
  } else if (BODY_REGIONS.has(id)) {
    const minH = dialog ? 32 : 120;
    present = inRef.some((e) => e.kind !== 'heading' && !e.is_interactive && e.box.width >= ref.width * 0.3 && e.box.height >= minH && e.box.y >= ref.y + 8);
    if (!present) {
      // Body without its own container: the set of texts and fields below the first heading, wide and tall enough.
      const firstHead = Math.min(...heads.map((h) => h.box.y), Infinity);
      const parts = inRef.filter((e) => (e.kind === 'text' || e.kind === 'field' || e.kind === 'card' || e.kind === 'graphic') && e.box.y > (Number.isFinite(firstHead) ? firstHead : ref.y));
      if (parts.length >= 2) {
        const x0 = Math.min(...parts.map((e) => e.box.x)), x1 = Math.max(...parts.map((e) => right(e.box)));
        const y0 = Math.min(...parts.map((e) => e.box.y)), y1 = Math.max(...parts.map((e) => bottom(e.box)));
        present = x1 - x0 >= ref.width * 0.3 && y1 - y0 >= minH * 0.5;
      }
    }
    if (!present && id === 'request-summary') present = inRef.some((e) => e.kind === 'text' && e.box.y <= ref.y + ref.height * 0.5);
  } else if (FOOTER_REGIONS.has(id)) {
    const band = dialog ? ref.y + ref.height * 0.65 : contentBottom - Math.max(160, (contentBottom - ref.y) * 0.2);
    const pool = id === 'status-bar' || id === 'public-footer' || id === 'list-footer' ? inRef.filter((e) => e.is_interactive || e.kind === 'text') : buttons;
    present = pool.some((e) => centerY(e.box) >= band);
  } else if (TOOLBAR_REGIONS.has(id)) {
    if (inRef.some((e) => e.role === 'toolbar')) present = true;
    else if (id === 'search-bar') present = inRef.some((e) => e.kind === 'field');
    else present = rows(inRef.filter((e) => (e.is_interactive || e.kind === 'field') && e.box.height <= 64)).some((r) => r.length >= 2);
  } else if (SIDE_REGIONS.has(id)) {
    present = sideColumns(els, ref, 'right').length > 0;
  } else if (LEFT_REGIONS.has(id)) {
    present = sideColumns(els, ref, 'left').length > 0 || inRef.some((e) => e.role === 'tablist' || e.role === 'tab')
      || rows(buttons.filter((b) => b.box.y <= ref.y + 400)).some((r) => r.length >= 2 && r.some((b) => b.selected));
  } else if (id === 'step-trail') {
    present = inRef.some((e) => /stepper/i.test((e.classes || []).join(' ')))
      || rows(inRef.filter((e) => (STEP_WORD.test(e.text || '') || /^\d+\s*[.)–-]?\s*\S/.test(e.text || '')) && e.box.height <= 64)).some((r) => r.length >= 3);
  } else if (id === 'kpi-strip') {
    present = rows(inRef.filter((e) => (e.kind === 'card' || e.kind === 'block') && e.box.width < ref.width * 0.4 && e.box.height >= 48), 12)
      .some((r) => r.length >= 3);
  } else if (id === 'charts-area') {
    present = inRef.some((e) => (e.kind === 'graphic' && e.box.width >= 150 && e.box.height >= 100) || e.tag === 'table' || e.role === 'grid');
  } else if (id === 'pending-list') {
    present = inRef.some((e) => e.tag === 'table' || e.role === 'grid' || e.role === 'list' || e.tag === 'ul' || e.tag === 'ol');
  } else if (id === 'decision-area') {
    present = buttons.some((b) => b.is_primary) || rows(buttons).some((r) => r.length >= 2);
  } else {
    return { present: true, how: 'no-detector' };
  }
  return { present, how: 'heuristic' };
}

// ---------------------------------------------------------------- rules

/** Is the position satisfied? `pos`: top-right | bottom-right | top-left | bottom-left | inline (and combinations). */
export function positionOk(box, pos, ref, { dialog = false, contentBottom = null, topBand = 240 } = {}) {
  if (!pos || pos === 'inline') return true;
  const [v, h] = String(pos).split('-');
  const cx = centerX(box), cy = centerY(box);
  let okH = true, okV = true;
  if (h === 'right') okH = cx >= ref.x + ref.width * 0.6;
  else if (h === 'left') okH = cx <= ref.x + ref.width * 0.4;
  else if (h === 'center') okH = Math.abs(cx - centerX(ref)) <= ref.width * 0.2;
  const cb = contentBottom ?? bottom(ref);
  if (v === 'top') okV = dialog ? cy <= ref.y + ref.height * 0.34 : box.y - ref.y <= topBand;
  else if (v === 'bottom') okV = dialog ? cy >= ref.y + ref.height * 0.66 : cy >= cb - Math.max(200, (cb - ref.y) * 0.25);
  return okH && okV;
}

/**
 * Row-level primary, not the region's (outside L1): on the same row as a field of its own form ("New
 * category" + Add) or as a heading with the same parent (section header with "New signer"). Its position
 * counts relative to the row; L1 measures the primary that concludes the region (dialog footer, page top).
 */
export function inlinePrimary(p, els) {
  const sameRow = (e) => { const top = Math.max(e.box.y, p.box.y), bot = Math.min(bottom(e.box), bottom(p.box)); return bot - top >= Math.min(e.box.height, p.box.height) * 0.5; };
  const inForm = (e) => e.kind === 'field' && p.parent && (e.form_group === p.parent || String(e.id).startsWith(`${p.parent} >`));
  const headingMate = (e) => e.kind === 'heading' && e.parent && e.parent === p.parent;
  return els.some((e) => e !== p && sameRow(e) && (inForm(e) || headingMate(e)));
}

/**
 * Applies L1–L9 to a geometry. `ctx`:
 *   { archetype: { id, regions: [], primary_action: { region, position } } | null,
 *     primary_position (from the UX.md), limits (LAYOUT_DEFAULTS overridden) }
 * Returns { file, screen, archetype, dialog_open, findings: [{ rule, severity, region, message, anchor, evidence, elements, measure }] }.
 */
export function analyzeLayout(input, ctx = {}) {
  const geom = normalizeGeometry(input);
  const lim = { ...LAYOUT_DEFAULTS, ...(ctx.limits || {}) };
  const arch = ctx.archetype ?? null;
  const findings = [];
  const file = geom.file;
  const ev = (els) => els.map((e) => `${file} › ${e.id}`).join(', ');
  const add = (rule, region, message, anchor, els, measure) =>
    findings.push({ rule, severity: LAYOUT_SEVERITY[rule], region, message, anchor, evidence: ev(els), elements: els.map((e) => e.id), measure });
  const scope = focusScope(geom);
  const { elements: els, ref } = scope;
  const dialog = geom.dialog_open;
  const body = geom.body_font_size || 16;
  const contentBottom = Math.max(ref.y, ...els.map((e) => bottom(e.box)));
  const fold = lim.fold;
  // A dialog is fixed to the window: the fold counts from the top of the dialog (the static capture may have shifted it).
  const foldTop = dialog ? ref.y : 0;
  const belowFold = (b) => bottom(b) - foldTop > fold;

  // Candidate primaries: in focus; with the primary expected in the page header, the primaries of a side panel
  // (one per block, declared in several UX.md files) are left out.
  const primaries = els.filter((e) => e.is_primary && e.is_interactive !== false);
  const expectedRegion = arch?.primary_action?.region ?? null;
  const panels = sideColumns(els, ref, 'right');
  const regionLevel = primaries.filter((p) => !inlinePrimary(p, els));
  const candidates = !dialog && (!expectedRegion || /header/.test(expectedRegion))
    ? regionLevel.filter((p) => !panels.some((pn) => containsBox(pn.box, p.box)))
    : regionLevel;

  // L1: position of the primary action.
  const position = arch?.primary_action?.position ?? ctx.primary_position ?? null;
  if (position && position !== 'inline' && candidates.length) {
    const opts = { dialog, contentBottom, topBand: lim['top-band'] };
    if (!candidates.some((p) => positionOk(p.box, position, ref, opts))) {
      const p = candidates[0];
      const fx = Math.round(((centerX(p.box) - ref.x) / (ref.width || 1)) * 100);
      const fy = dialog ? Math.round(((centerY(p.box) - ref.y) / (ref.height || 1)) * 100) : Math.round(p.box.y - ref.y);
      add('L1', p.region, `primary action ${label(p)} outside the declared position (${position}${arch ? `, archetype ${arch.id}` : ', UX.md'}): center at ${fx}% of the width${dialog ? ` and ${fy}% of the dialog height` : `, top ${fy} px below the start of the content`}`,
        `primary ${label(p)}`, [p], { position_expected: position, center_x_pct: fx, [dialog ? 'center_y_pct' : 'top_offset_px']: fy });
    }
  }

  // L2: competing emphasis in the first fold.
  const heavy = [];
  for (const e of els) {
    if (e.box.y - foldTop >= fold || e.box.width <= 0) continue;
    const bg = e.style.background_color;
    let why = null;
    if (e.is_interactive && (e.is_primary || isSaturated(bg))) why = 'filled button';
    else if (!e.is_interactive && e.kind !== 'region' && e.style.font_size >= body * lim['emphasis-ratio'] && Number(e.style.font_weight) >= lim['emphasis-weight'] && e.text) why = `bold text at ${r1(e.style.font_size)} px`;
    else if (!e.is_interactive && e.kind !== 'region' && isSaturated(bg) && area(e.box) >= lim['saturated-min-area']) why = 'saturated color block';
    if (why) heavy.push({ e, why });
  }
  // Merges what sits inside an element already counted, and neighboring saturated blocks (e.g. cells of a table header).
  const merged = [];
  for (const h of heavy.sort((a, b) => area(b.e.box) - area(a.e.box))) {
    const host = merged.find((m) => m.boxes.some((b) => containsBox(b, h.e.box)) || (h.why === 'saturated color block' && m.why === h.why && m.boxes.some((b) => boxDistance(b, h.e.box) <= 2)));
    if (host) host.boxes.push(h.e.box); else merged.push({ ...h, boxes: [h.e.box] });
  }
  if (merged.length > lim['max-emphasis']) {
    const top = merged.sort((a, b) => a.e.box.y - b.e.box.y || a.e.box.x - b.e.box.x);
    add('L2', scope.regionLabel, `${merged.length} elements of high visual weight in the first fold (max. ${lim['max-emphasis']}): ${top.map((h) => `${label(h.e)} (${h.why})`).join(', ')}`,
      `emphasis in the first fold`, top.map((h) => h.e), { count: merged.length, max: lim['max-emphasis'] });
  }

  // L3: heading scale.
  const heads = els.filter((e) => e.kind === 'heading' && e.heading_level && e.style.font_size);
  const h1 = heads.filter((h) => h.heading_level === 1);
  if (h1.length) {
    const h1size = Math.max(...h1.map((h) => h.style.font_size));
    const numeric = (t) => /^[\s\d.,%R$€+\-–/:()]+$/.test(t || '');
    const bigger = els.filter((e) => e.heading_level !== 1 && e.text && e.style.font_size > h1size + 0.5 && !numeric(e.text) && e.kind !== 'region')
      .sort((a, b) => b.style.font_size - a.style.font_size);
    if (bigger.length) {
      const b = bigger[0];
      add('L3', b.region, `main title ${label(h1[0])} (${r1(h1size)} px) is not the largest text: ${label(b)} is ${r1(b.style.font_size)} px${bigger.length > 1 ? ` (+${bigger.length - 1})` : ''}`,
        `h1 smaller than ${label(b)}`, [h1[0], b], { h1_px: r1(h1size), larger_px: r1(b.style.font_size) });
    }
  }
  const levels = [...new Set(heads.map((h) => h.heading_level))].sort();
  for (let i = 0; i < levels.length; i++) for (let j = i + 1; j < levels.length; j++) {
    const up = heads.filter((h) => h.heading_level === levels[i]);
    const down = heads.filter((h) => h.heading_level === levels[j]);
    const minUp = Math.min(...up.map((h) => h.style.font_size));
    const big = down.filter((h) => h.style.font_size > minUp + 0.5).sort((a, b) => b.style.font_size - a.style.font_size)[0];
    if (big) {
      const u = up.find((h) => h.style.font_size === minUp);
      add('L3', big.region, `h${levels[j]} ${label(big)} (${r1(big.style.font_size)} px) larger than h${levels[i]} ${label(u)} (${r1(minUp)} px)`,
        `h${levels[j]} larger than h${levels[i]}`, [u, big], { upper_level: levels[i], upper_px: r1(minUp), lower_level: levels[j], lower_px: r1(big.style.font_size) });
    }
  }

  // L4: alignment of a form's fields/labels and of sibling cards.
  const tol = lim['align-tolerance'];
  const alignCheck = (items, what, groupKey) => {
    const groups = new Map();
    for (const e of items) { const k = groupKey(e); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); }
    for (const [k, g] of groups) {
      if (g.length < 3) continue;
      const edges = clusterValues(g.map((e) => e.box.x), tol);
      const perRow = Math.max(...rows(g, 8).map((r) => clusterValues(r.map((e) => e.box.x), tol).length));
      const allowed = Math.max(lim['max-left-edges'], perRow);
      if (edges.length > allowed) {
        add('L4', g[0].region, `${g.length} ${what} with left edges at ${edges.length} distinct positions (tolerance ${tol} px; expected up to ${allowed}): x = ${edges.map(Math.round).join(', ')}`,
          `${what} in ${k ?? '(no group)'}`, g.slice(0, 8), { edges: edges.map(Math.round), allowed });
      }
    }
  };
  const fieldLike = els.filter((e) => e.kind === 'field' || (e.kind === 'label' && !els.some((f) => f.kind === 'field' && f.id === e.label_for && containsBox(f.box, e.box, 2))));
  // A floating label (inside the field box) is not an edge of its own.
  alignCheck(fieldLike.filter((e) => e.kind === 'field' || !els.some((f) => f.kind === 'field' && containsBox({ ...f.box, y: f.box.y - 12, height: f.box.height + 12 }, e.box, 2))),
    'fields and labels', (e) => e.form_group ?? e.region);
  alignCheck(els.filter((e) => e.kind === 'card'), 'cards', (e) => e.parent ?? e.region);

  // L5 — proximidade.
  const byId = new Map(geom.elements.map((e) => [e.id, e]));
  const fields = els.filter((e) => e.kind === 'field');
  for (const l of els.filter((e) => e.kind === 'label' && e.label_for)) {
    const f = byId.get(l.label_for);
    if (!f) continue;
    const d = boxDistance(l.box, f.box);
    if (d > lim['label-gap']) {
      add('L5', l.region, `label ${label(l)} ${Math.round(d)} px from its field (max. ${lim['label-gap']} px)`, `label ${label(l)} far from its field`, [l, f], { distance_px: Math.round(d), max: lim['label-gap'] });
      continue;
    }
    const other = fields.filter((o) => o.id !== f.id).map((o) => ({ o, d: boxDistance(l.box, o.box) })).sort((a, b) => a.d - b.d)[0];
    if (other && other.d + 2 < d) {
      add('L5', l.region, `label ${label(l)} closer to another field (${Math.round(other.d)} px) than to its own (${Math.round(d)} px)`, `label ${label(l)} close to the neighboring field`, [l, f, other.o], { own_px: Math.round(d), other_px: Math.round(other.d) });
    }
  }
  // Action group = sibling buttons (same DOM parent). Links are navigation and do not count.
  const isButton = (e) => e.tag === 'button' || e.role === 'button';
  const actions = els.filter((e) => e.is_interactive && e.kind === 'interactive' && e.parent && !e.is_inline && isButton(e));
  const between = (a, b) => els.some((x) => x !== a && x !== b && !CONTAINER.has(x.kind) && x.box.x >= right(a.box) - 1 && right(x.box) <= b.box.x + 1
    && sameRow(x.box, a.box) && x.box.width > 0);
  // Groups by DOM parent, merged when the buttons touch on the same row (wrappers such as a tooltip's change
  // the parent without changing the visual group).
  const root = new Map(actions.map((a) => [a.parent, a.parent]));
  const find = (k) => { while (root.get(k) !== k) k = root.get(k); return k; };
  for (const a of actions) for (const b of actions) {
    if (a === b || a.region !== b.region || find(a.parent) === find(b.parent) || !sameRow(a.box, b.box)) continue;
    const gap = Math.max(b.box.x - right(a.box), a.box.x - right(b.box));
    if (gap <= 8) root.set(find(a.parent), find(b.parent));
  }
  const groupOf = (a) => find(a.parent);
  const groups = new Map();
  for (const a of actions) { const k = groupOf(a); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(a); }
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    let reported = false;
    for (const row of rows(g, 8)) {
      const sorted = row.sort((a, b) => a.box.x - b.box.x);
      for (let i = 1; i < sorted.length; i++) {
        const [a, b] = [sorted[i - 1], sorted[i]];
        if (a.is_destructive !== b.is_destructive) continue; // destructive action kept apart on purpose
        if (between(a, b)) continue; // there is content between them (e.g. "page 1 of 3" between previous and next)
        const gap = b.box.x - right(a.box);
        if (gap > lim['action-gap']) {
          add('L5', a.region, `actions of the same group ${label(a)} and ${label(b)} ${Math.round(gap)} px apart (max. ${lim['action-gap']} px)`, `actions ${label(a)} × ${label(b)} far apart`, [a, b], { gap_px: Math.round(gap), max: lim['action-gap'] });
          reported = true;
        }
      }
    }
    if (reported) continue;
    // Relative proximity only in a cohesive group: one row, gaps within the limit.
    if (rows(g, 8).length > 1) continue;
    const ordered = [...g].sort((a, b) => a.box.x - b.box.x);
    if (ordered.some((b, i) => i > 0 && b.box.x - right(ordered[i - 1].box) > lim['action-gap'])) continue;
    for (const a of g) {
      const own = Math.min(...g.filter((x) => x !== a).map((x) => boxDistance(a.box, x.box)));
      const near = actions.filter((x) => groupOf(x) !== groupOf(a) && x.region === a.region).map((x) => ({ x, d: boxDistance(a.box, x.box) })).sort((p, q) => p.d - q.d)[0];
      if (near && near.d + 2 < own && own > 8) {
        add('L5', a.region, `action ${label(a)} closer to ${label(near.x)}, of another group (${Math.round(near.d)} px), than to its own group (${Math.round(own)} px)`, `action ${label(a)} close to the neighboring group`, [a, near.x], { own_px: Math.round(own), other_px: Math.round(near.d) });
        break;
      }
    }
  }

  // L6: first fold: title and primary action.
  const title = dialog ? els.find((e) => e.kind === 'heading') : els.find((e) => e.kind === 'heading' && e.heading_level === 1);
  const where = dialog ? 'from the top of the dialog' : 'from the top of the page';
  // In a dialog, title and footer are fixed and only the body scrolls; the static capture does not limit the
  // dialog height to the window, so an element inside dialog-header/dialog-footer does not fail.
  const pinned = (e) => dialog && geom.elements.some((x) => (x.archetype_region === 'dialog-footer' || x.archetype_region === 'dialog-header') && containsBox(x.box, e.box, 1));
  if (title && belowFold(title.box) && !pinned(title)) {
    const y = Math.round(bottom(title.box) - foldTop);
    add('L6', title.region, `title ${label(title)} outside the first fold (ends ${y} px ${where}; fold at ${fold} px)`, `title ${label(title)} below the fold`, [title], { bottom_px: y, fold });
  }
  if (candidates.length && candidates.every((p) => belowFold(p.box) && !pinned(p))) {
    const p = candidates[0];
    const y = Math.round(bottom(p.box) - foldTop);
    add('L6', p.region, `primary action ${label(p)} outside the first fold (ends ${y} px ${where}; fold at ${fold} px)`, `primary ${label(p)} below the fold`, [p], { bottom_px: y, fold });
  }

  // L7: line length in running text.
  for (const t of els.filter((e) => e.kind === 'text' && e.text_length > lim['max-line-chars'])) {
    const fs = t.style.font_size || body;
    const lh = t.style.line_height || fs * 1.4;
    const lines = Math.max(1, Math.round(t.box.height / lh));
    const cpl = lines > 1 ? t.text_length / lines : Math.min(t.text_length, t.box.width / (0.5 * fs));
    // Running text: two lines or more, or one line well above the limit (a short sentence just over it does not count).
    if (lines === 1 && t.text_length < lim['max-line-chars'] * 1.33) continue;
    if (cpl > lim['max-line-chars']) {
      add('L7', t.region, `running text with ~${Math.round(cpl)} characters per line (max. ${lim['max-line-chars']}; width ${Math.round(t.box.width)} px, ${r1(fs)} px, ${lines} line(s))`,
        `long line in ${label(t)}`, [t], { chars_per_line: Math.round(cpl), width_px: Math.round(t.box.width), lines, max: lim['max-line-chars'] });
    }
  }

  // L8: clickable target smaller than 24×24 (exceptions: inline target in text and enough spacing, WCAG 2.5.8).
  const min = lim['min-target'];
  const targets = els.filter((e) => e.is_interactive && !e.disabled && e.box.width > 0 && e.box.height > 0);
  const small = targets.filter((e) => (e.box.width < min || e.box.height < min) && !e.is_inline);
  const r = min / 2;
  const failing = small.filter((t) => {
    const c = { x: centerX(t.box), y: centerY(t.box) };
    return targets.some((o) => o !== t && !containsBox(o.box, t.box) && !containsBox(t.box, o.box)
      && (distPointBox(c, o.box) < r || (small.includes(o) && Math.hypot(centerX(o.box) - c.x, centerY(o.box) - c.y) < min)));
  });
  const byLabel = new Map();
  for (const t of failing) {
    const k = `${t.region}|${t.text || t.tag}`;
    if (!byLabel.has(k)) byLabel.set(k, []);
    byLabel.get(k).push(t);
  }
  for (const ts of byLabel.values()) {
    const t = ts[0];
    add('L8', t.region, `clickable target ${label(t)} at ${Math.round(t.box.width)}×${Math.round(t.box.height)} px (min. ${min}×${min}, no free space around it)${ts.length > 1 ? ` (${ts.length}×)` : ''}`,
      `small target ${label(t)}`, ts.slice(0, 5), { width_px: Math.round(t.box.width), height_px: Math.round(t.box.height), count: ts.length, min });
  }

  // L9: regions of the declared archetype.
  const unchecked = [];
  if (arch?.regions?.length) {
    for (const id of arch.regions) {
      const d = detectArchetypeRegion(id, scope, geom);
      if (d.how === 'no-detector') unchecked.push(id);
      if (!d.present) {
        add('L9', scope.regionLabel, `region "${id}" of archetype ${arch.id} not found on the screen (mark it with data-region="${id}" or declare verification.selectors.archetype-regions)`,
          `region ${id} missing`, [], { archetype: arch.id, region: id });
      }
    }
  }

  return { file, screen: geom.screen, archetype: arch?.id ?? null, dialog_open: dialog, findings, ...(unchecked.length ? { unchecked_regions: unchecked } : {}) };
}

function distPointBox(p, b) {
  const dx = Math.max(b.x - p.x, 0, p.x - right(b));
  const dy = Math.max(b.y - p.y, 0, p.y - bottom(b));
  return Math.hypot(dx, dy);
}
