// Especificação das prévias de opção (contrato: knowledge/fundamentos/achados-de-ux.md, "Prévia das opções").
// Sem dependências e sem navegador: deriva, para cada caso da página de decisão, como localizar o elemento na
// captura (`locatorFor`), que operação cada opção aplica (`optionOps`) e a correção indicada pela regra quando o
// caso não tem opções (`implicitPreview`). O preview.mjs executa isso no Playwright; o mini diagrama de fluxo
// (`flowDiagram`) sai aqui mesmo, em SVG, sem navegador.
import { createHash } from 'node:crypto';

/** Versão do formato das prévias: entra no hash, então mudar a geração invalida o cache. */
export const PREVIEW_VERSION = 6;

/** Operações aceitas em `preview` (options.json). */
export const PREVIEW_OPS = ['text', 'remove', 'variant', 'move', 'style', 'example', 'none'];
export const BUTTON_VARIANTS = ['contained', 'outlined', 'text'];
/** CSS que `style` pode aplicar (lista fechada: layout e tipografia, nunca cor — cor vem dos tokens). */
export const ALLOWED_STYLE = [
  'max-width', 'min-width', 'width', 'min-height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'gap', 'font-size', 'font-weight',
  'line-height', 'letter-spacing', 'text-align', 'text-transform', 'white-space', 'justify-content', 'align-items',
  'align-self', 'flex-direction', 'flex-wrap', 'order', 'display',
];

const clean = (s) => String(s ?? '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
export const sha1 = (...parts) => createHash('sha1').update(parts.map((p) => (typeof p === 'string' || Buffer.isBuffer(p) ? p : JSON.stringify(p ?? null))).join('\u0000')).digest('hex');

/** Valida uma operação declarada. Devolve { op } normalizada ou { error }. */
export function validateOp(raw) {
  if (!raw || typeof raw !== 'object') return { error: 'prévia sem "op"' };
  const op = raw.op;
  if (!PREVIEW_OPS.includes(op)) return { error: `operação desconhecida "${op}" (use ${PREVIEW_OPS.join(', ')})` };
  const out = { op, ...(typeof raw.selector === 'string' ? { selector: raw.selector } : {}) };
  if (op === 'text') { if (!clean(raw.text)) return { error: 'text exige "text"' }; out.text = clean(raw.text); }
  if (op === 'variant') { if (!BUTTON_VARIANTS.includes(raw.variant)) return { error: `variant exige "variant": ${BUTTON_VARIANTS.join('|')}` }; out.variant = raw.variant; }
  if (op === 'move') {
    if (raw.to && !['end', 'start'].includes(raw.to)) return { error: 'move: "to" é end ou start' };
    if (raw.justify && !['flex-end', 'flex-start', 'center', 'space-between'].includes(raw.justify)) return { error: 'move: "justify" é flex-end, flex-start, center ou space-between' };
    if (!raw.to && !raw.justify) return { error: 'move exige "to" ou "justify"' };
    if (raw.to) out.to = raw.to;
    if (raw.justify) out.justify = raw.justify;
  }
  if (op === 'style') {
    const css = raw.css && typeof raw.css === 'object' ? raw.css : null;
    if (!css || !Object.keys(css).length) return { error: 'style exige "css": { propriedade: valor }' };
    const bad = Object.keys(css).filter((k) => !ALLOWED_STYLE.includes(k));
    if (bad.length) return { error: `style: propriedade fora da lista (${bad.join(', ')}); permitidas: ${ALLOWED_STYLE.join(', ')}` };
    if (Object.values(css).some((v) => /[;{}<>]|url\(|expression/i.test(String(v)))) return { error: 'style: valor inválido' };
    out.css = Object.fromEntries(Object.entries(css).map(([k, v]) => [k, String(v)]));
  }
  if (op === 'example') { if (!clean(raw.screen)) return { error: 'example exige "screen" (nome da captura, ex.: 02-acervo.error)' }; out.screen = clean(raw.screen).replace(/\.html?$/, ''); }
  if (op === 'none') out.reason = clean(raw.reason) || 'sem prévia declarada';
  return { op: out };
}

// ---------- localização do elemento ----------

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Texto-modelo (com `{}` ou `{nome}`) → padrão de regex sobre o texto normalizado do elemento. */
export function toPattern(text, { anchored = true } = {}) {
  const t = clean(text);
  if (!t) return null;
  const parts = t.split(/\{[^{}]*\}/).map((p) => escRe(p).replace(/ /g, '\\s+'));
  const body = parts.join('.+?');
  if (!body.replace(/[.+?\\s]/g, '')) return null;
  return anchored ? `^${body}$` : body;
}
const quoted = (s) => [...String(s ?? '').matchAll(/["“]([^"”]+)["”]/g)].map((m) => clean(m[1])).filter(Boolean);
const KIND_OF_ELEMENT = { button: 'button', tab: 'button', menu: 'button', title: 'any', label: 'any', placeholder: 'placeholder', cell: 'any', helper: 'any', alert: 'any', tooltip: 'any', 'accessible-name': 'any' };

/** Variantes visuais citadas na mensagem do C2: [{ variant, screens }] na ordem da mensagem. */
export function parseVariantSpread(message) {
  const m = String(message ?? '').match(/variantes visuais diferentes \(([^)]*)\)/);
  if (!m) return [];
  return m[1].split(';').map((seg) => {
    const mm = seg.trim().match(/^(\w+) em (.+)$/);
    return mm ? { variant: mm[1], screens: mm[2].split(',').map((s) => s.trim()).filter(Boolean) } : null;
  }).filter(Boolean);
}

/** C2: variante da maioria (mais telas; empate → a primeira citada) e a que destoa. */
export function variantPlan(message) {
  const spread = parseVariantSpread(message);
  if (spread.length < 2) return null;
  const major = [...spread].sort((a, b) => b.screens.length - a.screens.length)[0];
  const minor = spread.find((s) => s !== major);
  return { major: major.variant, minor: minor.variant, screen: minor.screens[0] };
}

/**
 * Como achar o elemento do caso na captura. Devolve { screen_level?, selectors?, patterns?, contains?, prefixes?,
 * kind, max, require_class? } ou { screen_level: true } quando o achado é da tela inteira (sem elemento).
 */
export function locatorFor(c) {
  const msg = c.message ?? '';
  const rule = c.rule;
  if (c.family === 'states' || c.family === 'flow') return { screen_level: true };
  const sel = (c.selectors ?? []).filter(Boolean);
  if (c.family === 'text') {
    const kind = KIND_OF_ELEMENT[c.element] ?? 'any';
    const texts = [...new Set([c.text, ...(c.variants ?? [])].filter((t) => clean(t)))];
    return { kind, patterns: texts.map((t) => toPattern(t)).filter(Boolean), loose: texts.map((t) => toPattern(t, { anchored: false })).filter((p) => p && p.length >= 8), max: 1 };
  }
  if (c.family === 'layout') {
    if (sel.length) return { kind: 'any', selectors: sel.slice(0, 8), max: 8 };
    if (rule === 'L9') return { screen_level: true };
    if (rule === 'L7') { const p = quoted(c.text)[0]; return p ? { kind: 'any', prefixes: [p], max: 1 } : { screen_level: true }; }
    if (rule === 'L4') { const m = String(c.text).match(/ em (.+)$/); return m ? { kind: 'any', selectors: [m[1]], max: 1 } : { screen_level: true }; }
    if (rule === 'L3') return { kind: 'heading', patterns: quoted(msg).map((t) => toPattern(t)).filter(Boolean), max: 2 };
    const q = quoted(c.text)[0] ?? quoted(msg)[0];
    return q ? { kind: 'button', patterns: [toPattern(q)], max: 1 } : { screen_level: true };
  }
  if (c.family === 'screen') {
    if (rule === 'T3') return { screen_level: true };
    if (rule === 'T6') { const ex = String(msg).match(/ex\.: "([^"]+)/); return ex ? { kind: 'any', contains: [clean(ex[1]).replace(/…$/, '').slice(0, 60)], max: 1 } : { screen_level: true }; }
    const labels = quoted(msg).filter((l) => !/^(Enviar minuta)$/.test(l) || rule !== 'T7');
    const own = rule === 'T7' ? labels.slice(0, 1) : labels;
    return own.length ? { kind: 'button', patterns: own.map((t) => toPattern(t)).filter(Boolean), max: rule === 'T1' ? 8 : 4 } : { screen_level: true };
  }
  if (c.family === 'consistency') {
    const texts = [...new Set((c.variants ?? []).filter(Boolean))];
    const loc = { kind: rule === 'C3' ? 'any' : 'button', patterns: (texts.length ? texts : [c.text]).map((t) => toPattern(t)).filter(Boolean), max: 1 };
    if (rule === 'C2') { const v = variantPlan(msg); if (v) loc.require_class = `MuiButton-${v.minor}`; }
    return loc;
  }
  return { screen_level: true };
}

// ---------- operação de cada opção ----------

/** Opção que descreve uma mudança em vez de trazer o texto pronto: começa por um substantivo de estrutura… */
export const INSTRUCTION_NOUN_RE = /^(manter|selo|t[íi]tulo|r[óo]tulo|placeholder|apoio|rodap[ée]|link|dica|data numa|complemento|c[ée]lula|declarar|registrar)\b/i;
/** …ou por um verbo de edição (só vale fora de botões, onde "Remover Ana" é o próprio texto do botão). */
export const INSTRUCTION_VERB_RE = /^(mover|trocar|usar|remover|substituir|mostrar|esconder|tirar|levar|deixar|separar|juntar|recolher|colocar|passar)\b/i;
const isInstruction = (t, element) => /["“].+["”]/.test(t) || INSTRUCTION_NOUN_RE.test(t) || (!['button', 'tab', 'menu'].includes(element) && INSTRUCTION_VERB_RE.test(t));
const ELEMENT_WORD = /^(t[íi]tulo|r[óo]tulo|placeholder|apoio|texto|rodap[ée]|link|selo|dica|bot[ãa]o)(?=[\s"“])[^"“]*["“]([^"”]+)["”]/i;

const words = (s) => new Set(clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 2));
/** Lista "A · B · C" (um texto para cada elemento): escolhe o trecho com mais palavras em comum com o atual. */
export function pickSegment(optionText, currentTexts) {
  const segs = String(optionText).split(' · ').map(clean).filter(Boolean);
  const cur = new Set(currentTexts.flatMap((t) => [...words(t)]));
  let best = null, score = 0;
  for (const s of segs) { const n = [...words(s)].filter((w) => cur.has(w)).length; if (n > score) { best = s; score = n; } }
  return best;
}

/**
 * Operações da opção `o` (índice `i`) no caso `c`. A opção pode declarar `preview` (objeto ou lista); sem
 * declaração vale a prévia padrão da família. Devolve { ops: [op], derived: bool, note? } ou { none: motivo }.
 */
export function optionOps(c, o) {
  if (o?.preview !== undefined) {
    const list = [].concat(o.preview);
    const ops = [];
    for (const raw of list) {
      const v = validateOp(raw);
      if (v.error) return { none: `prévia declarada inválida: ${v.error}`, invalid: true };
      if (v.op.op === 'none') return { none: v.op.reason, declared: true };
      ops.push(v.op);
    }
    return { ops, derived: false };
  }
  if (c.family !== 'text') {
    const imp = implicitPreview(c);
    return imp.ops ? { ops: imp.ops, derived: true } : { none: imp.none };
  }
  return deriveTextOp(c, o);
}

/** Prévia padrão de uma opção de texto. */
export function deriveTextOp(c, o) {
  const t = clean(o?.text);
  if (!t) return { none: 'opção sem texto' };
  if (/^manter\b/i.test(t)) return { none: 'a opção mantém o elemento como está (igual a Hoje)' };
  if (c.element === 'accessible-name') return { none: 'nome acessível: o leitor de tela o anuncia, mas ele não aparece em pixels' };
  if (c.element === 'tooltip') return { none: 'a dica só aparece ao passar o mouse; a captura não a mostra' };
  if (/^\(remover\)\s*$/i.test(t)) return { ops: [{ op: 'remove' }], derived: true };
  if (/^\(remover\)\s+e\s/i.test(t)) return { ops: [{ op: 'remove' }], derived: true, note: 'a opção pede mais que remover; a prévia mostra só a remoção' };
  if (/^\(remover\)/i.test(t)) return { none: 'a opção descreve uma mudança que não é só remover; a prévia não a simula (declare "preview" na opção)' };
  if (isInstruction(t, c.element)) {
    const m = t.match(ELEMENT_WORD);
    if (m) return { ops: [{ op: 'text', text: clean(m[2]) }], derived: true, note: 'a opção muda mais que o texto; a prévia mostra só a troca do texto principal' };
    if (/^remover\b/i.test(t)) return { ops: [{ op: 'remove' }], derived: true, note: 'a opção pede mais que remover; a prévia mostra só a remoção' };
    return { none: 'a opção descreve uma mudança de estrutura; a prévia não a simula (declare "preview" na opção)' };
  }
  if (t.includes(' · ')) {
    const seg = pickSegment(t, [c.text, ...(c.variants ?? [])]);
    if (!seg) return { none: 'a opção lista textos de vários elementos e nenhum corresponde a este' };
    const choices = String(t).split(' · ').map(clean).filter(Boolean);
    return { ops: [{ op: 'text', text: seg, choices }], derived: true, note: 'a opção lista textos de vários elementos; a prévia aplica o que corresponde a este' };
  }
  return { ops: [{ op: 'text', text: t }], derived: true };
}

/**
 * Correção indicada pela regra, para caso sem opções (e prévia padrão da família quando a opção não declara):
 * L1 → move, L7 → style, C2 → variant, S1 → example, F → diagrama. Devolve { label, ops } | { label, flow } |
 * { none }.
 */
export function implicitPreview(c, { exampleFor = null } = {}) {
  const r = c.rule;
  if (c.family === 'layout' && r === 'L1') return { label: 'Ação primária no fim do grupo, alinhada à direita', ops: [{ op: 'move', to: 'end', justify: 'flex-end' }] };
  if (c.family === 'layout' && r === 'L7') return { label: 'Linha limitada a 72 caracteres', ops: [{ op: 'style', css: { 'max-width': '72ch' } }] };
  if (c.family === 'consistency' && r === 'C2') {
    const v = variantPlan(c.message);
    return v ? { label: `Mesmo peso da maioria (variante ${v.major})`, ops: [{ op: 'variant', variant: v.major }] } : { none: 'não deu para ler as variantes na mensagem do achado' };
  }
  if (c.family === 'states' && r === 'S1') {
    const state = stateOfRegion(c.region);
    const ex = exampleFor ? exampleFor(state, c.screens?.[0]) : null;
    return ex ? { label: `Como a tela ${ex} mostra o estado "${state}"`, ops: [{ op: 'example', screen: ex }] } : { none: `nenhuma outra tela do módulo tem captura do estado "${state}" para servir de exemplo` };
  }
  if (c.family === 'flow' && ['F1', 'F2', 'F5'].includes(r)) return { label: FLOW_LABEL[r], flow: true };
  return { none: `sem prévia automática para a regra ${r}; a correção depende da decisão` };
}
const FLOW_LABEL = { F1: 'Com uma saída', F2: 'Dentro de uma jornada', F5: 'Com caminho de volta' };
export const stateOfRegion = (region) => clean(String(region ?? '').split(' · ')[0]) || null;

/** Escolhe a captura que serve de exemplo de um estado: outra tela, mesmo tipo (diálogo × página) primeiro. */
export function pickExample(files, state, screen) {
  if (!state) return null;
  const re = new RegExp(`^\\d+-[\\w-]+\\.${escRe(state)}\\.html$`);
  const base = String(screen ?? '').replace(/\..*$/, '');
  const cand = files.filter((f) => re.test(f) && !f.startsWith(`${base}.`)).sort();
  if (!cand.length) return null;
  const dlg = /-dlg-/.test(base);
  return (cand.find((f) => /-dlg-/.test(f) === dlg) ?? cand[0]).replace(/\.html$/, '');
}

/** Ordem das capturas a tentar no caso (tela representativa primeiro). */
export function screenOrder(c) {
  const list = [...new Set(c.screens ?? [])];
  if (c.family === 'consistency' && c.rule === 'C2') { const v = variantPlan(c.message); if (v) list.sort((a, b) => (b === v.screen) - (a === v.screen)); }
  return list.sort((a, b) => (a.includes('.') ? 1 : 0) - (b.includes('.') ? 1 : 0));
}

/** Descrição curta de uma operação, para texto alternativo e manifesto. */
export function describeOps(ops) {
  return ops.map((o) => ({
    text: `texto trocado por "${o.text}"`, remove: 'elemento removido', variant: `botão na variante ${o.variant}`,
    move: [o.to ? `movido para o ${o.to === 'end' ? 'fim' : 'início'} do grupo` : '', o.justify ? `grupo alinhado (${o.justify})` : ''].filter(Boolean).join(', '),
    style: `estilo ${Object.entries(o.css ?? {}).map(([k, v]) => `${k}: ${v}`).join('; ')}`, example: `exemplo da captura ${o.screen}`,
  }[o.op] ?? o.op)).join('; ');
}

// ---------- fluxo: mini diagrama SVG ----------

const escX = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const short = (s, n = 26) => { const t = clean(s); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };

/**
 * Diagrama antes/depois das transições de uma tela do mapa de fluxo (F1, F2, F5). Devolve { before, after } em
 * SVG (cores por variáveis CSS da página, com valor de reserva) ou null se a tela não está no mapa.
 */
export function flowDiagram(map, screenId, rule) {
  const screens = map?.screens ?? [];
  const tr = map?.transitions ?? [];
  const by = new Map(screens.map((s) => [s.id, s]));
  const me = by.get(screenId);
  if (!me) return null;
  const inc = [...new Set(tr.filter((t) => t.to === screenId && t.from !== screenId).map((t) => t.from))];
  const out = [...new Set(tr.filter((t) => t.from === screenId && t.to !== screenId).map((t) => t.to))];
  const name = (id) => by.get(id)?.name ?? id;
  const W = 660, NW = 190, NH = 34, GAP = 12;
  const lim = (l) => (l.length > 4 ? [...l.slice(0, 3), `+${l.length - 3}`] : l);
  const left = lim(inc), right = lim(out);
  const backTarget = me.parent ?? inc[0] ?? null;
  const build = (after) => {
    let R = right.slice();
    if (after && rule === 'F1' && backTarget && !R.includes(backTarget)) R = [...R, backTarget];
    const rows = Math.max(left.length, R.length, 1);
    const H = 40 + rows * (NH + GAP) + (after && rule === 'F5' ? 40 : 0) + (rule === 'F2' ? 26 : 0);
    const cy = 30 + (rows * (NH + GAP)) / 2 - NH / 2 + (rule === 'F2' ? 22 : 0);
    const y = (i, n) => 30 + (rule === 'F2' ? 22 : 0) + ((rows - n) * (NH + GAP)) / 2 + i * (NH + GAP);
    const node = (x, yy, label, cls, title) => `<g class="n ${cls}"><title>${escX(title ?? label)}</title><rect x="${x}" y="${yy}" width="${NW}" height="${NH}" rx="8"/><text x="${x + NW / 2}" y="${yy + NH / 2 + 4}" text-anchor="middle">${escX(short(label))}</text></g>`;
    const edge = (x1, y1, x2, y2, cls) => `<path class="e ${cls}" d="M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}" marker-end="url(#a-${cls || 'n'})"/>`;
    const parts = [];
    const cx = (W - NW) / 2;
    left.forEach((id, i) => { const yy = y(i, left.length); parts.push(node(8, yy, id.startsWith('+') ? `${id} telas` : name(id), '', id)); parts.push(edge(8 + NW, yy + NH / 2, cx - 4, cy + NH / 2, '')); });
    R.forEach((id, i) => {
      const yy = y(i, R.length);
      const isNew = after && rule === 'F1' && id === backTarget && !right.includes(id);
      parts.push(node(W - NW - 8, yy, id.startsWith('+') ? `${id} telas` : name(id), isNew ? 'new' : '', id));
      parts.push(edge(cx + NW + 4, cy + NH / 2, W - NW - 12, yy + NH / 2, isNew ? 'new' : ''));
    });
    parts.push(node(cx, cy, me.name ?? screenId, 'me', screenId));
    if (!left.length) parts.push(`<text class="t" x="${8 + NW / 2}" y="${cy + NH / 2 + 4}" text-anchor="middle">sem entrada no mapa</text>`);
    if (!R.length) parts.push(`<text class="t warn" x="${W - NW / 2 - 8}" y="${cy + NH / 2 + 4}" text-anchor="middle">sem saída</text>`);
    if (after && rule === 'F5' && backTarget) {
      const by2 = H - 14;
      parts.push(`<path class="e new" d="M${cx + NW / 2},${cy + NH} C${cx + NW / 2},${by2} ${8 + NW / 2},${by2} ${8 + NW / 2},${y(Math.max(0, left.indexOf(backTarget)), left.length) + NH + 2}" marker-end="url(#a-new)"/>`);
      parts.push(`<text class="t new" x="${(cx + 8 + NW) / 2 + 20}" y="${by2 - 2}">voltar para ${escX(short(name(backTarget), 22))}</text>`);
    }
    if (rule === 'F2') parts.push(after
      ? `<rect class="j new" x="4" y="22" width="${W - 8}" height="${H - 26}" rx="12"/><text class="t new" x="14" y="16">jornada declarada no mapa (a definir)</text>`
      : `<text class="t warn" x="14" y="16">fora de todas as jornadas do mapa</text>`);
    const style = '<style>.n rect{fill:var(--surface,#fff);stroke:var(--line,#C9D2DE);stroke-width:1.5}.n text,.t{font:12px Inter,system-ui,sans-serif;fill:var(--fg,#1E2130)}.n.me rect{stroke:var(--accent,#0E71B8);stroke-width:2.5}.n.new rect{stroke:var(--ok,#15803D);stroke-dasharray:5 4;stroke-width:2}.e{fill:none;stroke:var(--muted,#5B6578);stroke-width:1.5}.e.new{stroke:var(--ok,#15803D);stroke-dasharray:5 4;stroke-width:2}.t.new{fill:var(--ok,#15803D);font-weight:600}.t.warn{fill:var(--bad,#B91C1C);font-weight:600}.j{fill:none;stroke-width:2;stroke-dasharray:6 5}.j.new{stroke:var(--ok,#15803D)}</style>';
    const defs = '<defs><marker id="a-n" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--muted,#5B6578)"/></marker><marker id="a-new" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--ok,#15803D)"/></marker></defs>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${style}${defs}${parts.join('')}</svg>`;
  };
  return { before: build(false), after: build(true), back_target: backTarget };
}
