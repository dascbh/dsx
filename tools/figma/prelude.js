/**
 * Helper prelude for `use_figma`: paste it at the top of every script.
 *
 * Does NOT run in Node: it is Figma Plugin API code, pasted inside a
 * `use_figma` call (hence the top-level `await` and the global `figma`
 * object). `node --check` would complain about the bare `await`; that is expected.
 *
 * Each `use_figma` call runs in a fresh context: no imports, no state between
 * calls. This prelude is the fixed cost per script, and it pays off:
 * without it, building a screen takes dozens of lines of raw `createFrame` and
 * the layout ends up hand-positioned instead of auto-layout.
 *
 * Depends on: color variables (collections `Primitivos` / `Semântico` /
 * `Componente`) and text styles already created (skill `figma-foundations`), and
 * the icon frame with the `Ícone/<Name>` components. Variable names follow the
 * DSX convention: the DTCG token with `/` instead of `.`
 * (`color.text.primary` → `color/text/primary`). Collection, style and component
 * names are text of the Figma file and stay in pt-BR (existing files carry them).
 *
 * Before pasting, fill in the CONFIGURE block below with the project facts.
 * They live in `design/figma-reference.json` (skill `figma-conventions`):
 * read them from there instead of rediscovering them through the API.
 */

// ═════════════════════════════════════════════════════════════════════════════
// CONFIGURE: project-specific facts. Everything that changes from one Figma
// file to another lives here; the rest of the prelude should need no editing.
// ═════════════════════════════════════════════════════════════════════════════

/** Id of the frame that groups the icon components (Foundations phase).
 *  Source: `design/figma-reference.json` → `foundation.icons.frameId`. */
const ICON_FRAME_ID = 'ID_DO_FRAME_DE_ICONES';

/** Name prefix of the icon components: `Ícone/Add`, `Ícone/Cancel`… */
const ICON_PREFIX = 'Ícone/';

/** Native size of the icon components (MUI, Lucide etc. use 24). */
const ICON_NATIVE_SIZE = 24;

/** The project's real font family, the same one the code loads. */
const FONT_FAMILY = 'Plus Jakarta Sans';
const FONT_WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold'];

/** Names of the text styles the helpers use (created in figma-foundations). */
const TEXT_STYLE = {
  sectionTitle: 'Título/Seção (SectionCard)',
  tableHeader: 'Rótulo/Cabeçalho de tabela',
};

/** Roles → Figma variable. Defaults = DSX semantic tokens.
 *  If the project does not use DSX-format tokens, swap in its theme's semantic
 *  names (keeping the keys on the left, which is what the helpers read). */
const TK = {
  pageBg: 'color/bg/canvas',
  surfaceBg: 'color/bg/surface',
  textPrimary: 'color/text/primary',
  textSecondary: 'color/text/secondary',
  textTableHeader: 'color/text/secondary',
  textOnAction: 'color/text/on-action',
  cardBorder: 'color/border/default',
  dividerBorder: 'color/border/default',
  actionPrimary: 'color/action/primary',
  actionDanger: 'color/action/danger',
  success: 'color/feedback/success-icon',
  warning: 'color/feedback/warning-icon',
  danger: 'color/feedback/danger-icon',
  info: 'color/feedback/info-icon',
};

/** Icon per Verdict/alert tone. Adjusted 2026-08-18: WarningAmber/ErrorOutline
 *  no longer exist in the source project; use ReportProblem/Cancel. No entry
 *  for `neutral` on purpose: it has no icon of its own and falls back to
 *  InfoOutlined in verdict() below; that fallback is a design decision, not a
 *  forgotten case (the tone itself is still validated by `oneOf`).
 *  Swap in the names exported by YOUR project's icon package. */
const TONE_ICON = {
  safe: 'CheckCircle', warn: 'ReportProblem', danger: 'Cancel', info: 'InfoOutlined',
};

/** Screen chrome (shell). AppBar and side menu widths/heights. */
const SCREEN_WIDTH = 1440;
const APPBAR_HEIGHT = 48;

// ═════════════════════════════════════════════════════════════════════════════
// end of CONFIGURE
// ═════════════════════════════════════════════════════════════════════════════

// ── base ─────────────────────────────────────────────────────────────────────
const vs = await figma.variables.getLocalVariablesAsync();
const V = {}; vs.forEach(v => V[v.name] = v);
const tsl = await figma.getLocalTextStylesAsync();
const TS = {}; tsl.forEach(s => TS[s.name] = s);

const FA = s => ({ family: FONT_FAMILY, style: s });
await Promise.all(FONT_WEIGHTS.map(s => figma.loadFontAsync(FA(s))));

/** Solid paint bound to variable `n`. Fails loudly when the variable does not
 *  exist: a missing variable means stop and propose, never invent inline. */
const P = n => {
  if (!V[n]) throw new Error(`variable "${n}" does not exist in the file: check TK in CONFIGURE or run figma-foundations`);
  return figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]);
};
const fill = (nd, n) => { nd.fills = [P(n)]; };
const bord = (nd, n, w) => { nd.strokes = [P(n)]; nd.strokeWeight = w == null ? 1 : w; };
/** Translucent paint: needs read-modify-write
 *  (see skills/figma-mirror/references/plugin-api.md, "Color and variables"). */
const tint = (nd, n, a) => {
  nd.fills = [P(n)];
  const f = JSON.parse(JSON.stringify(nd.fills));
  f[0].opacity = a;
  nd.fills = f;
};

const AL = (dir, props) => figma.createAutoLayout(dir, props);
/** Text with a file style. */
const T = async (chars, style, color) => {
  if (!TS[style]) throw new Error(`text style "${style}" does not exist in the file: check TEXT_STYLE in CONFIGURE`);
  const t = figma.createText();
  t.fontName = FA('Regular');
  t.characters = chars;
  await t.setTextStyleIdAsync(TS[style].id);
  fill(t, color);
  return t;
};
/** Loose text (sizes without a style of their own). */
const RAW = (chars, weight, size, color) => {
  const t = figma.createText();
  t.fontName = FA(weight);
  t.characters = chars;
  t.fontSize = size;
  t.lineHeight = { unit: 'PERCENT', value: 145 };
  fill(t, color);
  return t;
};

// ── icons (components created by the figma-foundations skill) ───────────────
const ICO = {};
for (const c of (await figma.getNodeByIdAsync(ICON_FRAME_ID)).children) {
  ICO[c.name.replace(ICON_PREFIX, '')] = c;
}
/** Icon instance at the requested size.
 *  `rescale`, not `resize`: `resize` only changes the instance box and leaves the
 *  inner vector at native size when the vector constraint is not SCALE, so the
 *  glyph overflows or shifts. `rescale` scales the whole instance, vector
 *  included, regardless of the constraint (see figma-conventions, section on
 *  creating or evolving a kit component, backward-compatibility item). */
const icon = (name, color, size) => {
  if (!ICO[name]) throw new Error(`icon "${name}" does not exist in ${ICON_PREFIX}*: check the icon frame`);
  const i = ICO[name].createInstance();
  i.rescale((size || 18) / ICON_NATIVE_SIZE);
  i.children[0].fills = [P(color)];
  return i;
};

const TONE = {
  safe: TK.success, warn: TK.warning, danger: TK.danger,
  neutral: TK.textPrimary, info: TK.info,
};

/** Closed-set guard: an unrecognized type/tone must fail loudly, not degrade
 *  silently into whichever branch happens to be the fallback. A silent fallback
 *  here is how a typo in a helper call becomes a wrong color with nothing in
 *  the report to catch it (same doctrine as the maps' `uncertain`, applied to
 *  the code itself). */
const oneOf = (value, allowed, label) => {
  if (!allowed.includes(value)) {
    throw new Error(`${label} "${value}" is not one of: ${allowed.join(', ')}`);
  }
  return value;
};

// ── screen shell ─────────────────────────────────────────────────────────────
/** Screen with AppBar + side menu by instance; returns the content container. */
function screen(page, name, x, y, h, APPBAR, DRAWER, menuWidth) {
  const s = figma.createFrame();
  s.name = name; s.resize(SCREEN_WIDTH, h); s.x = x; s.y = y;
  s.clipsContent = true; fill(s, TK.pageBg);
  page.appendChild(s);

  const bar = APPBAR.createInstance(); bar.x = 0; bar.y = 0; s.appendChild(bar);
  const dr = DRAWER.createInstance(); dr.x = 0; dr.y = APPBAR_HEIGHT;
  dr.resize(menuWidth, h - APPBAR_HEIGHT); s.appendChild(dr);

  const main = AL('VERTICAL', {
    itemSpacing: 0, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24,
  });
  main.name = 'main'; main.fills = [];
  s.appendChild(main); main.x = menuWidth; main.y = APPBAR_HEIGHT;
  main.resize(SCREEN_WIDTH - menuWidth, 10);
  main.layoutSizingHorizontal = 'FIXED';
  main.layoutSizingVertical = 'HUG';
  return { s, main, dr };
}
/** After building: fits the screen height to the real content. */
function finish(s, main, dr) {
  s.resize(SCREEN_WIDTH, main.height + APPBAR_HEIGHT + 20);
  if (dr) dr.resize(dr.width, s.height - APPBAR_HEIGHT);
}

// ── primitives ───────────────────────────────────────────────────────────────
const BUTTON_TYPES = ['primary', 'secondary', 'destructive', 'neutral'];
// Frame name in Figma (file text, in pt-BR) and old values accepted in the call.
const BUTTON_LABEL = { primary: 'primária', secondary: 'secundária', destructive: 'destrutiva', neutral: 'neutra' };
const LEGACY_BUTTON_TYPE = { 'primária': 'primary', 'secundária': 'secondary', destrutiva: 'destructive', neutra: 'neutral' };
function btn(label, type, iconName, small) {
  type = LEGACY_BUTTON_TYPE[type] || type;
  oneOf(type, BUTTON_TYPES, 'button type');
  const b = AL('HORIZONTAL', {
    itemSpacing: 7,
    paddingLeft: small ? 10 : 16, paddingRight: small ? 10 : 16,
    paddingTop: small ? 5 : 7, paddingBottom: small ? 5 : 7,
  });
  b.name = 'Botão · ' + BUTTON_LABEL[type];
  b.counterAxisAlignItems = 'CENTER'; b.primaryAxisAlignItems = 'CENTER';
  b.cornerRadius = 999;
  const color = type === 'primary' ? TK.textOnAction
    : type === 'destructive' ? TK.actionDanger
    : type === 'neutral' ? TK.textSecondary
    : TK.actionPrimary;
  if (type === 'primary') fill(b, TK.actionPrimary);
  else { b.fills = []; if (type === 'secondary') bord(b, TK.actionPrimary); }
  if (iconName) b.appendChild(icon(iconName, color, small ? 15 : 17));
  b.appendChild(RAW(label, 'SemiBold', small ? 12.5 : 13.5, color));
  return b;
}

function chip(label, tone, filled) {
  oneOf(tone, Object.keys(TONE), 'chip tone');
  const c = AL('HORIZONTAL', { paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2 });
  c.name = 'Chip'; c.counterAxisAlignItems = 'CENTER'; c.cornerRadius = 999;
  const t = TONE[tone];
  if (filled) { fill(c, t); c.appendChild(RAW(label, 'Medium', 11, TK.textOnAction)); }
  else { c.fills = []; bord(c, t); c.appendChild(RAW(label, 'Medium', 11, t)); }
  return c;
}

async function card(parent, title, count, action) {
  const c = AL('VERTICAL', {
    itemSpacing: 14, paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 16,
  });
  c.name = 'SectionCard · ' + title;
  fill(c, TK.surfaceBg); bord(c, TK.cardBorder); c.cornerRadius = 10;
  parent.appendChild(c); c.layoutSizingHorizontal = 'FILL';

  const head = AL('HORIZONTAL', { itemSpacing: 10 });
  head.counterAxisAlignItems = 'CENTER'; head.fills = [];
  c.appendChild(head); head.layoutSizingHorizontal = 'FILL';
  head.appendChild(await T(title, TEXT_STYLE.sectionTitle, TK.textPrimary));
  // count accepts a string OR a node (chip); real code uses both
  if (count) head.appendChild(
    typeof count === 'string' ? RAW(count, 'Regular', 13, TK.textSecondary) : count);
  const sp = figma.createFrame(); sp.fills = []; sp.resize(4, 4);
  head.appendChild(sp); sp.layoutSizingHorizontal = 'FILL';
  if (action) head.appendChild(action);
  return c;
}

/** Status strip with a 2px left border: the border is an in-flow child,
 *  not an absolute node (absolute does not accept layoutSizingVertical FILL). */
function verdict(parent, tone, title, body) {
  oneOf(tone, Object.keys(TONE), 'verdict tone');
  const v = AL('HORIZONTAL', { itemSpacing: 0 }); v.name = 'Verdict';
  fill(v, TK.surfaceBg); bord(v, TK.dividerBorder); v.clipsContent = true;
  parent.appendChild(v); v.layoutSizingHorizontal = 'FILL';

  const bar = figma.createFrame(); bar.strokes = []; fill(bar, TONE[tone]);
  v.appendChild(bar); bar.resize(2, 10);
  bar.layoutSizingHorizontal = 'FIXED'; bar.layoutSizingVertical = 'FILL';

  const inner = AL('HORIZONTAL', {
    itemSpacing: 10, paddingLeft: 14, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
  });
  inner.fills = []; v.appendChild(inner); inner.layoutSizingHorizontal = 'FILL';
  inner.appendChild(icon(TONE_ICON[tone] || 'InfoOutlined', TONE[tone], 17));
  const c = AL('VERTICAL', { itemSpacing: 2 }); c.fills = [];
  inner.appendChild(c); c.layoutSizingHorizontal = 'FILL';
  c.appendChild(RAW(title, 'Bold', 13.5, TK.textPrimary));
  if (body) {
    const b = RAW(body, 'Regular', 12.5, TK.textSecondary);
    c.appendChild(b); b.layoutSizingHorizontal = 'FILL'; b.textAutoResize = 'HEIGHT';
  }
  return v;
}

/** Form field with the label in the border notch (MUI outlined).
 *  value === null → empty field: the label sits inside, as MUI does. */
function field(parent, label, value, width, help, multiline) {
  const wrap = AL('VERTICAL', { itemSpacing: 4 }); wrap.fills = [];
  parent.appendChild(wrap);
  if (width) {
    wrap.resize(width, 10);
    wrap.layoutSizingHorizontal = 'FIXED'; wrap.layoutSizingVertical = 'HUG';
  } else wrap.layoutSizingHorizontal = 'FILL';

  const f = AL('HORIZONTAL', {
    paddingLeft: 12, paddingRight: 12, paddingTop: 9, paddingBottom: multiline ? 30 : 9,
  });
  f.name = 'TextField · ' + label; f.counterAxisAlignItems = 'MIN';
  f.cornerRadius = 4; f.clipsContent = false; f.fills = []; bord(f, TK.cardBorder);
  /** createAutoLayout() comes with clipsContent=true by default; the notch
   *  label sits ABOVE the frame's own top border (negative y), so the wrapper
   *  needs clipsContent=false too, or the label is clipped (finding
   *  2026-08-18, Foundations phase). */
  wrap.clipsContent = false;
  wrap.appendChild(f); f.layoutSizingHorizontal = 'FILL';

  const inner = RAW(value == null ? label : value, 'Regular', 13,
    value == null ? TK.textSecondary : TK.textPrimary);
  f.appendChild(inner); inner.layoutSizingHorizontal = 'FILL'; inner.textAutoResize = 'HEIGHT';

  if (value != null) {                       // notch: covers the border behind the label
    const bg = figma.createFrame(); bg.name = 'notch'; bg.strokes = [];
    fill(bg, TK.surfaceBg); bg.resize(10, 3);
    f.appendChild(bg); bg.layoutPositioning = 'ABSOLUTE';   // after appendChild
    const lb = RAW(label, 'Regular', 10.5, TK.textSecondary);
    f.appendChild(lb); lb.layoutPositioning = 'ABSOLUTE'; lb.x = 9; lb.y = -7;
    bg.resize(lb.width + 6, 3); bg.x = 7; bg.y = -1.5;
  }
  if (help) {
    const h = RAW(help, 'Regular', 11.5, TK.textSecondary);
    wrap.appendChild(h); h.layoutSizingHorizontal = 'FILL'; h.textAutoResize = 'HEIGHT';
  }
  return wrap;
}

/** Dense table. cols = [[label, width, alignment?]]; rows = matrix of nodes.
 *  CHECK: Σ widths + (n−1)×12 ≤ the container's inner width. */
async function table(parent, cols, rows) {
  const wrap = AL('VERTICAL', { itemSpacing: 0 }); wrap.name = 'Tabela'; wrap.fills = [];
  parent.appendChild(wrap); wrap.layoutSizingHorizontal = 'FILL';

  const hd = AL('HORIZONTAL', { itemSpacing: 12, paddingTop: 8, paddingBottom: 8 });
  hd.fills = []; bord(hd, TK.dividerBorder);
  hd.strokeTopWeight = 0; hd.strokeLeftWeight = 0; hd.strokeRightWeight = 0; hd.strokeBottomWeight = 1;
  wrap.appendChild(hd); hd.layoutSizingHorizontal = 'FILL';
  for (const c of cols) {
    const t = await T(c[0], TEXT_STYLE.tableHeader, TK.textTableHeader);
    hd.appendChild(t);
    t.layoutSizingHorizontal = 'FIXED'; t.resize(c[1], t.height); t.textAutoResize = 'HEIGHT';
    t.textAlignHorizontal = c[2] === 'right' ? 'RIGHT' : 'LEFT';
  }
  for (let ri = 0; ri < rows.length; ri++) {
    const r = AL('HORIZONTAL', { itemSpacing: 12, paddingTop: 9, paddingBottom: 9 });
    r.name = 'linha'; r.counterAxisAlignItems = 'CENTER'; r.fills = [];
    if (ri < rows.length - 1) {
      bord(r, TK.dividerBorder);
      r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 1;
    }
    wrap.appendChild(r); r.layoutSizingHorizontal = 'FILL';
    for (let ci = 0; ci < cols.length; ci++) {
      const h = AL('HORIZONTAL', { itemSpacing: 8 }); h.fills = [];
      h.counterAxisAlignItems = 'CENTER';
      h.primaryAxisAlignItems = cols[ci][2] === 'right' ? 'MAX' : 'MIN';
      r.appendChild(h);
      h.layoutSizingHorizontal = 'FIXED'; h.resize(cols[ci][1], 10); h.layoutSizingVertical = 'HUG';
      const arr = Array.isArray(rows[ri][ci]) ? rows[ri][ci] : [rows[ri][ci]];
      for (const el of arr) {
        if (!el) continue;
        h.appendChild(el);
        if (el.type === 'TEXT') {                     // esta ordem importa
          el.textAutoResize = 'HEIGHT';
          el.layoutSizingHorizontal = 'FILL';
          el.maxLines = 1;
          el.textTruncation = 'ENDING';
          el.textAlignHorizontal = cols[ci][2] === 'right' ? 'RIGHT' : 'LEFT';
        }
      }
    }
  }
  return wrap;
}

/** Fixed-height vertical spacer, stretched to the parent width. */
function gap(parent, h) {
  const g = figma.createFrame(); g.name = 'gap'; g.fills = []; g.resize(10, h);
  parent.appendChild(g); g.layoutSizingHorizontal = 'FILL';
}
