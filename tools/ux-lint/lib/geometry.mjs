// Geometria de tela para as regras de layout e hierarquia (L1–L9). Sem dependências.
//
// O jsdom e o parser de lib/html.mjs não calculam layout. A geometria vem de fora: tools/ux-lint/measure.mjs
// abre a captura HTML estática num navegador headless, mede os elementos e grava um arquivo
// `<nome>.geometry.json` neste formato. Tudo o que está abaixo do formato é análise pura sobre ele
// (sem navegador), o que permite testar as regras com geometria escrita à mão.
//
// ---------------------------------------------------------------- formato `geometry` (versão 1)
//
// {
//   "format": "dsx-geometry", "version": 1,
//   "screen": "04-minuta-editor",            // nome da captura sem .html (convenção <nn>-<screen-id>[.<state>])
//   "file": "04-minuta-editor.html",         // captura de origem (como foi passada ao measure)
//   "title": "/contratos/minutas/:minutaId", // <title> da captura (a skill de captura põe a rota)
//   "viewport": { "width": 1440, "height": 900 },
//   "page_height": 2140,                     // altura total do documento (scrollHeight)
//   "body_font_size": 15,                    // corpo de texto (px), lido do <body>
//   "dialog_open": false,                    // há [role=dialog] visível (seletor do UX.md)
//   "elements": [{
//     "id": "main > div:nth-of-type(2) > button:nth-of-type(1)", // caminho estável (âncora em #id estável)
//     "tag": "button", "role": null, "classes": ["MuiButton-root", "MuiButton-contained"],
//     "kind": "interactive",                 // interactive | heading | label | field | text | region | card | block | graphic
//     "text": "Baixar PDF",                  // nome acessível ou texto, até 80 caracteres
//     "text_length": 10,                     // tamanho do texto completo (para comprimento de linha)
//     "box": { "x": 1290, "y": 72, "width": 120, "height": 36 },  // getBoundingClientRect com rolagem 0
//     "style": { "font_size": 14, "font_weight": 600, "line_height": 24.5, "color": "rgb(255, 255, 255)",
//                "background_color": "rgb(14, 113, 184)", "display": "inline-flex", "visibility": "visible" },
//     "is_interactive": true, "is_primary": true, "is_destructive": false, "is_inline": false, "disabled": false,
//     "label_for": null,                     // em rótulos: id (caminho) do campo que o rótulo nomeia
//     "region": "main",                      // região pelo seletor do UX.md; diálogo = `diálogo "Título"`
//     "heading_level": null,                 // 1–6 em títulos (h1–h6 ou role=heading + aria-level)
//     "parent": "main > div:nth-of-type(2)", // caminho do pai no DOM (grupos de ações)
//     "form_group": "main > form",           // caminho do formulário/fieldset/diálogo/painel que agrupa o campo
//     "archetype_region": null,              // região de arquétipo declarada (data-region ou
//                                            // verification.selectors.archetype-regions do UX.md)
//     "selected": false                      // aria-selected/aria-pressed/aria-current (aba, botão alternado)
//   }]
// }
//
// Chaves extras são toleradas; chaves ausentes valem null/false. Coordenadas em px CSS, relativas ao topo da
// página (rolagem 0), então "y > 900" quer dizer "abaixo da primeira dobra" numa janela de 900 px.

export const GEOMETRY_FORMAT = 'dsx-geometry';
export const GEOMETRY_VERSION = 1;

/** Limites das regras L (sobrescrevíveis pela chave `layout` do front matter do UX.md, em kebab-case). */
export const LAYOUT_DEFAULTS = Object.freeze({
  fold: 900, // L6 e L2: altura da primeira dobra
  'max-emphasis': 3, // L2: elementos de peso alto tolerados na primeira dobra
  'emphasis-ratio': 1.25, // L2: texto ≥ 1,25× o corpo...
  'emphasis-weight': 600, // ...e em negrito conta como ênfase
  'saturated-min-area': 2500, // L2: bloco de cor saturada a partir desta área (px²)
  'align-tolerance': 4, // L4: bordas esquerdas a até 4 px contam como a mesma
  'max-left-edges': 2, // L4: posições distintas toleradas (ou o nº de colunas, se maior)
  'label-gap': 16, // L5: distância máxima rótulo × campo
  'action-gap': 48, // L5: distância máxima entre ações do mesmo grupo
  'max-line-chars': 90, // L7: caracteres por linha em texto corrido
  'min-target': 24, // L8: alvo mínimo (WCAG 2.5.8)
  'top-band': 240, // L1: faixa do topo da página (px abaixo do topo do conteúdo)
});

export const LAYOUT_SEVERITY = Object.freeze({ L1: 2, L2: 2, L3: 2, L4: 1, L5: 1, L6: 2, L7: 1, L8: 2, L9: 1 });

/** Regiões de arquétipo que só existem em certas condições (seleção, ação perigosa): ausência não é achado. */
export const CONDITIONAL_REGIONS = new Set(['bulk-actions-bar', 'danger-zone', 'quick-view']);

// ---------------------------------------------------------------- utilidades geométricas

export const right = (b) => b.x + b.width;
export const bottom = (b) => b.y + b.height;
export const centerX = (b) => b.x + b.width / 2;
export const centerY = (b) => b.y + b.height / 2;
export const area = (b) => Math.max(0, b.width) * Math.max(0, b.height);

/** `a` contém `b` (com folga de `tol` px). */
export function containsBox(a, b, tol = 1) {
  return b.x >= a.x - tol && b.y >= a.y - tol && right(b) <= right(a) + tol && bottom(b) <= bottom(a) + tol;
}

/** Distância entre retângulos (0 quando se tocam ou se sobrepõem). */
export function boxDistance(a, b) {
  const dx = Math.max(0, a.x - right(b), b.x - right(a));
  const dy = Math.max(0, a.y - bottom(b), b.y - bottom(a));
  return Math.hypot(dx, dy);
}

/** Agrupa valores próximos (diferença ≤ tol do primeiro do grupo). Devolve os representantes. */
export function clusterValues(values, tol = 4) {
  const sorted = [...values].sort((a, b) => a - b);
  const out = [];
  for (const v of sorted) if (!out.length || v - out.at(-1).start > tol) out.push({ start: v, values: [v] }); else out.at(-1).values.push(v);
  return out.map((c) => c.values[0]);
}

/** Lê cor CSS calculada (rgb/rgba/#hex) → { r, g, b, a } ou null. */
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

/** HSL de uma cor (s e l de 0 a 1). */
export function toHsl({ r, g, b }) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

/** Cor saturada o bastante para atrair o olho (fundo cheio, não tom pastel nem cinza). */
export function isSaturated(color) {
  const c = typeof color === 'string' ? parseColor(color) : color;
  if (!c || c.a < 0.5) return false;
  const { s, l } = toHsl(c);
  return s >= 0.45 && l >= 0.2 && l <= 0.7;
}

/** Id da tela a partir do nome da captura: `04-minuta-editor.empty` → `minuta-editor`. */
export function screenIdOf(name) {
  return String(name).replace(/^.*[\\/]/, '').replace(/\.geometry\.json$|\.html?$/, '').replace(/^\d+[-_]/, '').replace(/\..*$/, '');
}

// ---------------------------------------------------------------- leitura da geometria

const EL_DEFAULTS = {
  tag: 'div', role: null, classes: [], kind: 'block', text: '', text_length: 0, is_interactive: false, is_primary: false,
  is_destructive: false, is_inline: false, label_for: null, region: '(fora de região)', heading_level: null, parent: null,
  form_group: null, archetype_region: null, selected: false, disabled: false,
};

/** Completa a geometria com os padrões (chaves ausentes) e valida o mínimo. */
export function normalizeGeometry(g) {
  if (!g || typeof g !== 'object' || !Array.isArray(g.elements)) throw new Error('geometria inválida: falta "elements"');
  return {
    format: g.format ?? GEOMETRY_FORMAT, version: g.version ?? GEOMETRY_VERSION, screen: g.screen ?? 'tela', file: g.file ?? `${g.screen ?? 'tela'}.html`,
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

const isDialogRegion = (r) => /^diálogo/.test(String(r ?? ''));
/** Região do shell (cabeçalho e menu do produto): fora das regras de conteúdo. */
export const isShellRegion = (r) => /^(header|nav)(\b|#|\[)|\[role=(banner|navigation)\]/.test(String(r ?? ''));

/**
 * Elementos em foco: com diálogo aberto, só o diálogo (é o que a pessoa vê); sem diálogo, tudo fora do
 * cabeçalho e do menu do produto. Devolve { elements, ref, regionLabel }: `ref` é a caixa de referência
 * (o diálogo ou a área de conteúdo).
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
  return { elements: content, ref, regionLabel: refEl?.region ?? content[0]?.region ?? '(tela)' };
}

const label = (e) => (e.text ? `"${String(e.text).slice(0, 50)}"` : `<${e.tag}>`);
const r1 = (n) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------- detecção de regiões de arquétipo

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

/** Mesma linha: centros a até `tol` px ou sobreposição vertical de ao menos metade da menor altura. */
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
 * Há na tela a região de arquétipo `id`? Primeiro pela marcação declarada (`archetype_region`), depois por
 * heurística geométrica. Devolve { present, how } — `how`: 'declared' | 'heuristic' | 'conditional' | 'no-detector'.
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
      // título editável no lugar (campo com texto grande) também é cabeçalho
      || (!dialog && inRef.some((e) => e.box.y <= topLimit && e.text && e.style.font_size >= (geom.body_font_size || 16) * 1.25 && e.kind !== 'region'));
    if (!present && id === 'public-header') present = inRef.some((e) => e.kind === 'graphic' && e.box.y <= topLimit);
  } else if (BODY_REGIONS.has(id)) {
    const minH = dialog ? 32 : 120;
    present = inRef.some((e) => e.kind !== 'heading' && !e.is_interactive && e.box.width >= ref.width * 0.3 && e.box.height >= minH && e.box.y >= ref.y + 8);
    if (!present) {
      // Corpo sem contêiner próprio: o conjunto de textos e campos abaixo do primeiro título, largo e alto o bastante.
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
      || rows(inRef.filter((e) => /^(passo|etapa|step)\b|^\d+\s*[.)–-]?\s*\S/i.test(e.text || '') && e.box.height <= 64)).some((r) => r.length >= 3);
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

// ---------------------------------------------------------------- regras

/** Posição satisfeita? `pos`: top-right | bottom-right | top-left | bottom-left | inline (e combinações). */
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
 * Aplica L1–L9 a uma geometria. `ctx`:
 *   { archetype: { id, regions: [], primary_action: { region, position } } | null,
 *     primary_position (do UX.md), limits (LAYOUT_DEFAULTS sobrescritos) }
 * Devolve { file, screen, archetype, dialog_open, findings: [{ rule, severity, region, message, anchor, evidence, elements, measure }] }.
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
  // Diálogo é fixo na janela: a dobra conta a partir do topo do diálogo (e a captura estática pode tê-lo deslocado).
  const foldTop = dialog ? ref.y : 0;
  const belowFold = (b) => bottom(b) - foldTop > fold;

  // Primárias candidatas: em foco; com a primária esperada no cabeçalho da página, as primárias de um painel
  // lateral (uma por bloco, declarado em vários UX.md) ficam de fora.
  const primaries = els.filter((e) => e.is_primary && e.is_interactive !== false);
  const expectedRegion = arch?.primary_action?.region ?? null;
  const panels = sideColumns(els, ref, 'right');
  const candidates = !dialog && (!expectedRegion || /header/.test(expectedRegion))
    ? primaries.filter((p) => !panels.some((pn) => containsBox(pn.box, p.box)))
    : primaries;

  // L1 — posição da primária.
  const position = arch?.primary_action?.position ?? ctx.primary_position ?? null;
  if (position && position !== 'inline' && candidates.length) {
    const opts = { dialog, contentBottom, topBand: lim['top-band'] };
    if (!candidates.some((p) => positionOk(p.box, position, ref, opts))) {
      const p = candidates[0];
      const fx = Math.round(((centerX(p.box) - ref.x) / (ref.width || 1)) * 100);
      const fy = dialog ? Math.round(((centerY(p.box) - ref.y) / (ref.height || 1)) * 100) : Math.round(p.box.y - ref.y);
      add('L1', p.region, `ação primária ${label(p)} fora da posição declarada (${position}${arch ? `, arquétipo ${arch.id}` : ', UX.md'}): centro a ${fx}% da largura${dialog ? ` e ${fy}% da altura do diálogo` : `, topo ${fy} px abaixo do início do conteúdo`}`,
        `primária ${label(p)}`, [p], { position_expected: position, center_x_pct: fx, [dialog ? 'center_y_pct' : 'top_offset_px']: fy });
    }
  }

  // L2 — ênfases concorrentes na primeira dobra.
  const heavy = [];
  for (const e of els) {
    if (e.box.y - foldTop >= fold || e.box.width <= 0) continue;
    const bg = e.style.background_color;
    let why = null;
    if (e.is_interactive && (e.is_primary || isSaturated(bg))) why = 'botão cheio';
    else if (!e.is_interactive && e.kind !== 'region' && e.style.font_size >= body * lim['emphasis-ratio'] && Number(e.style.font_weight) >= lim['emphasis-weight'] && e.text) why = `texto ${r1(e.style.font_size)} px em negrito`;
    else if (!e.is_interactive && e.kind !== 'region' && isSaturated(bg) && area(e.box) >= lim['saturated-min-area']) why = 'bloco de cor saturada';
    if (why) heavy.push({ e, why });
  }
  // Funde o que está dentro de outro elemento já contado e blocos saturados vizinhos (ex.: células de um cabeçalho de tabela).
  const merged = [];
  for (const h of heavy.sort((a, b) => area(b.e.box) - area(a.e.box))) {
    const host = merged.find((m) => m.boxes.some((b) => containsBox(b, h.e.box)) || (h.why === 'bloco de cor saturada' && m.why === h.why && m.boxes.some((b) => boxDistance(b, h.e.box) <= 2)));
    if (host) host.boxes.push(h.e.box); else merged.push({ ...h, boxes: [h.e.box] });
  }
  if (merged.length > lim['max-emphasis']) {
    const top = merged.sort((a, b) => a.e.box.y - b.e.box.y || a.e.box.x - b.e.box.x);
    add('L2', scope.regionLabel, `${merged.length} elementos de peso visual alto na primeira dobra (máx. ${lim['max-emphasis']}): ${top.map((h) => `${label(h.e)} (${h.why})`).join(', ')}`,
      `ênfases na primeira dobra`, top.map((h) => h.e), { count: merged.length, max: lim['max-emphasis'] });
  }

  // L3 — escala de títulos.
  const heads = els.filter((e) => e.kind === 'heading' && e.heading_level && e.style.font_size);
  const h1 = heads.filter((h) => h.heading_level === 1);
  if (h1.length) {
    const h1size = Math.max(...h1.map((h) => h.style.font_size));
    const numeric = (t) => /^[\s\d.,%R$€+\-–/:()]+$/.test(t || '');
    const bigger = els.filter((e) => e.heading_level !== 1 && e.text && e.style.font_size > h1size + 0.5 && !numeric(e.text) && e.kind !== 'region')
      .sort((a, b) => b.style.font_size - a.style.font_size);
    if (bigger.length) {
      const b = bigger[0];
      add('L3', b.region, `título principal ${label(h1[0])} (${r1(h1size)} px) não é o maior texto: ${label(b)} tem ${r1(b.style.font_size)} px${bigger.length > 1 ? ` (+${bigger.length - 1})` : ''}`,
        `h1 menor que ${label(b)}`, [h1[0], b], { h1_px: r1(h1size), larger_px: r1(b.style.font_size) });
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
      add('L3', big.region, `h${levels[j]} ${label(big)} (${r1(big.style.font_size)} px) maior que h${levels[i]} ${label(u)} (${r1(minUp)} px)`,
        `h${levels[j]} maior que h${levels[i]}`, [u, big], { upper_level: levels[i], upper_px: r1(minUp), lower_level: levels[j], lower_px: r1(big.style.font_size) });
    }
  }

  // L4 — alinhamento de campos/rótulos de um formulário e de cartões irmãos.
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
        add('L4', g[0].region, `${g.length} ${what} com bordas esquerdas em ${edges.length} posições distintas (tolerância ${tol} px; esperado até ${allowed}): x = ${edges.map(Math.round).join(', ')}`,
          `${what} em ${k ?? '(sem grupo)'}`, g.slice(0, 8), { edges: edges.map(Math.round), allowed });
      }
    }
  };
  const fieldLike = els.filter((e) => e.kind === 'field' || (e.kind === 'label' && !els.some((f) => f.kind === 'field' && f.id === e.label_for && containsBox(f.box, e.box, 2))));
  // Rótulo flutuante (dentro da caixa do campo) não é uma borda própria.
  alignCheck(fieldLike.filter((e) => e.kind === 'field' || !els.some((f) => f.kind === 'field' && containsBox({ ...f.box, y: f.box.y - 12, height: f.box.height + 12 }, e.box, 2))),
    'campos e rótulos', (e) => e.form_group ?? e.region);
  alignCheck(els.filter((e) => e.kind === 'card'), 'cartões', (e) => e.parent ?? e.region);

  // L5 — proximidade.
  const byId = new Map(geom.elements.map((e) => [e.id, e]));
  const fields = els.filter((e) => e.kind === 'field');
  for (const l of els.filter((e) => e.kind === 'label' && e.label_for)) {
    const f = byId.get(l.label_for);
    if (!f) continue;
    const d = boxDistance(l.box, f.box);
    if (d > lim['label-gap']) {
      add('L5', l.region, `rótulo ${label(l)} a ${Math.round(d)} px do seu campo (máx. ${lim['label-gap']} px)`, `rótulo ${label(l)} longe do campo`, [l, f], { distance_px: Math.round(d), max: lim['label-gap'] });
      continue;
    }
    const other = fields.filter((o) => o.id !== f.id).map((o) => ({ o, d: boxDistance(l.box, o.box) })).sort((a, b) => a.d - b.d)[0];
    if (other && other.d + 2 < d) {
      add('L5', l.region, `rótulo ${label(l)} mais perto de outro campo (${Math.round(other.d)} px) que do seu (${Math.round(d)} px)`, `rótulo ${label(l)} perto do campo vizinho`, [l, f, other.o], { own_px: Math.round(d), other_px: Math.round(other.d) });
    }
  }
  // Grupo de ações = botões irmãos (mesmo pai no DOM). Links são navegação, não entram.
  const isButton = (e) => e.tag === 'button' || e.role === 'button';
  const actions = els.filter((e) => e.is_interactive && e.kind === 'interactive' && e.parent && !e.is_inline && isButton(e));
  const between = (a, b) => els.some((x) => x !== a && x !== b && !CONTAINER.has(x.kind) && x.box.x >= right(a.box) - 1 && right(x.box) <= b.box.x + 1
    && sameRow(x.box, a.box) && x.box.width > 0);
  // Grupos pelo pai no DOM, fundidos quando os botões se encostam na mesma linha (invólucros como o de uma
  // dica de ferramenta trocam o pai sem mudar o grupo visual).
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
        if (a.is_destructive !== b.is_destructive) continue; // destrutiva afastada de propósito
        if (between(a, b)) continue; // há conteúdo entre as duas (ex.: "pág. 1 de 3" entre anterior e próxima)
        const gap = b.box.x - right(a.box);
        if (gap > lim['action-gap']) {
          add('L5', a.region, `ações do mesmo grupo ${label(a)} e ${label(b)} separadas por ${Math.round(gap)} px (máx. ${lim['action-gap']} px)`, `ações ${label(a)} × ${label(b)} afastadas`, [a, b], { gap_px: Math.round(gap), max: lim['action-gap'] });
          reported = true;
        }
      }
    }
    if (reported) continue;
    // Proximidade relativa só em grupo coeso: uma linha, vãos dentro do limite.
    if (rows(g, 8).length > 1) continue;
    const ordered = [...g].sort((a, b) => a.box.x - b.box.x);
    if (ordered.some((b, i) => i > 0 && b.box.x - right(ordered[i - 1].box) > lim['action-gap'])) continue;
    for (const a of g) {
      const own = Math.min(...g.filter((x) => x !== a).map((x) => boxDistance(a.box, x.box)));
      const near = actions.filter((x) => groupOf(x) !== groupOf(a) && x.region === a.region).map((x) => ({ x, d: boxDistance(a.box, x.box) })).sort((p, q) => p.d - q.d)[0];
      if (near && near.d + 2 < own && own > 8) {
        add('L5', a.region, `ação ${label(a)} mais perto de ${label(near.x)}, de outro grupo (${Math.round(near.d)} px), que do próprio grupo (${Math.round(own)} px)`, `ação ${label(a)} perto do grupo vizinho`, [a, near.x], { own_px: Math.round(own), other_px: Math.round(near.d) });
        break;
      }
    }
  }

  // L6 — primeira dobra: título e ação primária.
  const title = dialog ? els.find((e) => e.kind === 'heading') : els.find((e) => e.kind === 'heading' && e.heading_level === 1);
  const where = dialog ? 'do topo do diálogo' : 'do topo da página';
  // Num diálogo, título e rodapé ficam fixos e só o corpo rola; a captura estática não limita a altura do
  // diálogo à janela, então elemento dentro de dialog-header/dialog-footer não reprova.
  const pinned = (e) => dialog && geom.elements.some((x) => (x.archetype_region === 'dialog-footer' || x.archetype_region === 'dialog-header') && containsBox(x.box, e.box, 1));
  if (title && belowFold(title.box) && !pinned(title)) {
    const y = Math.round(bottom(title.box) - foldTop);
    add('L6', title.region, `título ${label(title)} fora da primeira dobra (termina a ${y} px ${where}; dobra em ${fold} px)`, `título ${label(title)} abaixo da dobra`, [title], { bottom_px: y, fold });
  }
  if (candidates.length && candidates.every((p) => belowFold(p.box) && !pinned(p))) {
    const p = candidates[0];
    const y = Math.round(bottom(p.box) - foldTop);
    add('L6', p.region, `ação primária ${label(p)} fora da primeira dobra (termina a ${y} px ${where}; dobra em ${fold} px)`, `primária ${label(p)} abaixo da dobra`, [p], { bottom_px: y, fold });
  }

  // L7 — comprimento de linha em texto corrido.
  for (const t of els.filter((e) => e.kind === 'text' && e.text_length > lim['max-line-chars'])) {
    const fs = t.style.font_size || body;
    const lh = t.style.line_height || fs * 1.4;
    const lines = Math.max(1, Math.round(t.box.height / lh));
    const cpl = lines > 1 ? t.text_length / lines : Math.min(t.text_length, t.box.width / (0.5 * fs));
    // Texto corrido: duas linhas ou mais, ou uma linha bem acima do limite (frase curta que só passa raspando não conta).
    if (lines === 1 && t.text_length < lim['max-line-chars'] * 1.33) continue;
    if (cpl > lim['max-line-chars']) {
      add('L7', t.region, `texto corrido com ~${Math.round(cpl)} caracteres por linha (máx. ${lim['max-line-chars']}; largura ${Math.round(t.box.width)} px, ${r1(fs)} px, ${lines} linha(s))`,
        `linha longa em ${label(t)}`, [t], { chars_per_line: Math.round(cpl), width_px: Math.round(t.box.width), lines, max: lim['max-line-chars'] });
    }
  }

  // L8 — alvo clicável menor que 24×24 (exceções: alvo em linha de texto e espaçamento suficiente, WCAG 2.5.8).
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
    add('L8', t.region, `alvo clicável ${label(t)} com ${Math.round(t.box.width)}×${Math.round(t.box.height)} px (mín. ${min}×${min}, sem espaço livre em volta)${ts.length > 1 ? ` (${ts.length}×)` : ''}`,
      `alvo pequeno ${label(t)}`, ts.slice(0, 5), { width_px: Math.round(t.box.width), height_px: Math.round(t.box.height), count: ts.length, min });
  }

  // L9 — regiões do arquétipo declarado.
  const unchecked = [];
  if (arch?.regions?.length) {
    for (const id of arch.regions) {
      const d = detectArchetypeRegion(id, scope, geom);
      if (d.how === 'no-detector') unchecked.push(id);
      if (!d.present) {
        add('L9', scope.regionLabel, `região "${id}" do arquétipo ${arch.id} não encontrada na tela (marque-a com data-region="${id}" ou declare verification.selectors.archetype-regions)`,
          `região ${id} ausente`, [], { archetype: arch.id, region: id });
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
