// Option preview specification (contract: knowledge/foundations/ux-findings.md, "Option previews").
// No dependencies and no browser: derives, for each case of the decision page, how to locate the element in the
// capture (`locatorFor`), which operation each option applies (`optionOps`) and the fix indicated by the rule when
// the case has no options (`implicitPreview`). preview.mjs runs this in Playwright (lib/preview-runtime.mjs, with the
// donors of lib/preview-kit.mjs); the mini flow diagram (`flowDiagram`) comes out here, as SVG.
// Two languages: `lang` (page language: labels, badges, diagram text; lib/page-strings.mjs, default en) and
// `productLang` (UX.md `content.language`: text built INSIDE the product, such as state blocks; default pt-BR).
// Option text and detector messages are parsed in both languages (pt-BR and English wording).
import { createHash } from 'node:crypto';
import { pageStrings, productText } from './page-strings.mjs';
import { unionList, PACKS } from './lang/index.mjs';

/** Preview format version: part of the hash, so changing the generation invalidates the cache. */
export const PREVIEW_VERSION = 9;

/** Operations accepted in `preview` (options.json). */
export const PREVIEW_OPS = [
  'text', 'remove', 'variant', 'move', 'style', 'align', 'replace-text-many', 'insert', 'wrap', 'annotate', 'badge',
  'synthesize-state', 'synthesize-region', 'example', 'none',
];
export const BUTTON_VARIANTS = ['contained', 'outlined', 'text'];
/** CSS that `style` may apply (closed list: layout and typography, never color; color comes from the tokens). */
export const ALLOWED_STYLE = [
  'max-width', 'min-width', 'width', 'min-height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'gap', 'font-size', 'font-weight',
  'line-height', 'letter-spacing', 'text-align', 'text-transform', 'white-space', 'justify-content', 'align-items',
  'align-self', 'flex-direction', 'flex-wrap', 'order', 'display',
];
/** `theme:<level>` value in `style`: size, weight and line height of the heading scale read from the module's captures. */
export const THEME_TOKEN_RE = /^theme:(h[1-6]|self)$/;
/** Donor roles that `insert` and `wrap` copy from a module capture (lib/preview-kit.mjs). */
export const KIT_ROLES = ['chip', 'helper', 'caption', 'search-field', 'panel', 'alert-info', 'alert-warning', 'alert-success'];
/** Targets `move` knows: end/start of the group, or the top of the region that fits in the first fold. */
const MOVE_TO = ['end', 'start', 'region-top'];
const POSITIONS = ['before', 'after', 'prepend', 'append'];
const ANNOTATE_KINDS = ['screen-reader', 'tooltip', 'hint'];
/** `badge` text when the option keeps the element (not a failure: today's image stands for "after"). English; per language: pageStrings(lang). */
export const BADGE_NO_CHANGE = pageStrings('en').badgeNoChange;
export const BADGE_ALREADY = pageStrings('en').badgeAlready;

const clean = (s) => String(s ?? '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
export const sha1 = (...parts) => createHash('sha1').update(parts.map((p) => (typeof p === 'string' || Buffer.isBuffer(p) ? p : JSON.stringify(p ?? null))).join('\u0000')).digest('hex');
const isTargets = (t) => t === undefined || ['all', 'all-but-last', 'all-but-first'].includes(t) || (Number.isInteger(t) && t >= 0);

/** Validates a declared operation. Returns the normalized { op } or { error }. */
export function validateOp(raw) {
  if (!raw || typeof raw !== 'object') return { error: 'preview without "op"' };
  const op = raw.op;
  if (!PREVIEW_OPS.includes(op)) return { error: `unknown operation "${op}" (use ${PREVIEW_OPS.join(', ')})` };
  const out = { op, ...(typeof raw.selector === 'string' ? { selector: raw.selector } : {}) };
  if (!isTargets(raw.targets)) return { error: '"targets" is all, all-but-last, all-but-first or the index of the located element' };
  if (raw.targets !== undefined) out.targets = raw.targets;
  if (op === 'text') { if (!clean(raw.text)) return { error: 'text requires "text"' }; out.text = clean(raw.text); }
  if (op === 'variant') { if (!BUTTON_VARIANTS.includes(raw.variant)) return { error: `variant requires "variant": ${BUTTON_VARIANTS.join('|')}` }; out.variant = raw.variant; }
  if (op === 'move') {
    if (raw.to && !MOVE_TO.includes(raw.to)) return { error: `move: "to" is ${MOVE_TO.join(', ')}` };
    if (raw.justify && !['flex-end', 'flex-start', 'center', 'space-between'].includes(raw.justify)) return { error: 'move: "justify" is flex-end, flex-start, center or space-between' };
    if (!raw.to && !raw.justify) return { error: 'move requires "to" or "justify"' };
    if (raw.to) out.to = raw.to;
    if (raw.justify) out.justify = raw.justify;
    if (raw.to === 'region-top') out.fold = Number(raw.fold) > 0 ? Number(raw.fold) : 900;
  }
  if (op === 'style') {
    const css = raw.css && typeof raw.css === 'object' ? raw.css : null;
    if (!css || !Object.keys(css).length) return { error: 'style requires "css": { property: value }' };
    const bad = Object.keys(css).filter((k) => !ALLOWED_STYLE.includes(k));
    if (bad.length) return { error: `style: property not in the list (${bad.join(', ')}); allowed: ${ALLOWED_STYLE.join(', ')}` };
    if (Object.values(css).some((v) => /[;{}<>]|url\(|expression/i.test(String(v)))) return { error: 'style: invalid value' };
    if (Object.values(css).some((v) => /^theme:/.test(String(v)) && !THEME_TOKEN_RE.test(String(v)))) return { error: 'style: a theme value is theme:h1…theme:h6 or theme:self' };
    out.css = Object.fromEntries(Object.entries(css).map(([k, v]) => [k, String(v)]));
  }
  if (op === 'align') { out.mode = ['left', 'columns'].includes(raw.mode) ? raw.mode : 'auto'; out.targets = out.targets ?? 'all'; }
  if (op === 'replace-text-many') {
    const pairs = Array.isArray(raw.pairs) ? raw.pairs.filter((p) => p && clean(p.from)) : [];
    if (!pairs.length) return { error: 'replace-text-many requires "pairs": [{ "from": "…", "to": "…" }]' };
    out.pairs = pairs.map((p) => ({ from: clean(p.from), to: clean(p.to) }));
    out.scope = raw.scope === 'screen' ? 'screen' : 'element';
  }
  if (op === 'insert') {
    if (!POSITIONS.includes(raw.position ?? 'after')) return { error: `insert: "position" is ${POSITIONS.join(', ')}` };
    out.position = raw.position ?? 'after';
    if (raw.from !== undefined || raw.source !== undefined) {
      if (!clean(raw.source)) return { error: 'insert with "from" requires "source" (selector of the element to copy)' };
      out.source = clean(raw.source);
      if (clean(raw.from)) out.from = clean(raw.from).replace(/\.html?$/, '');
    } else {
      if (!KIT_ROLES.includes(raw.like ?? 'caption')) return { error: `insert: "like" is ${KIT_ROLES.join(', ')} (or "from" + "source")` };
      out.like = raw.like ?? 'caption';
    }
    if (raw.text !== undefined) out.text = clean(raw.text);
    if (raw.placeholder !== undefined) out.placeholder = clean(raw.placeholder);
  }
  if (op === 'wrap') { out.like = 'panel'; if (clean(raw.title)) out.title = clean(raw.title); }
  if (op === 'annotate') {
    if (!ANNOTATE_KINDS.includes(raw.kind ?? 'screen-reader')) return { error: `annotate: "kind" is ${ANNOTATE_KINDS.join(', ')}` };
    if (!clean(raw.text)) return { error: 'annotate requires "text" (what the screen reader announces or the hint shows)' };
    out.kind = raw.kind ?? 'screen-reader';
    out.text = clean(raw.text);
  }
  if (op === 'badge') out.text = clean(raw.text) || BADGE_NO_CHANGE;
  if (op === 'synthesize-state') {
    if (!clean(raw.state)) return { error: 'synthesize-state requires "state" (e.g. no-access, error, field-error)' };
    out.state = clean(raw.state);
    for (const k of ['title', 'text', 'action']) if (raw[k] !== undefined) out[k] = clean(raw[k]);
  }
  if (op === 'synthesize-region') {
    if (!clean(raw.region)) return { error: 'synthesize-region requires "region" (e.g. side-panel, kpi-strip)' };
    out.region = clean(raw.region);
    if (clean(raw.title)) out.title = clean(raw.title);
  }
  if (op === 'example') { if (!clean(raw.screen)) return { error: 'example requires "screen" (capture name, e.g. 02-library.error)' }; out.screen = clean(raw.screen).replace(/\.html?$/, ''); }
  if (op === 'none') out.reason = clean(raw.reason) || 'no preview declared';
  return { op: out };
}

// ---------- states and regions built on the screen itself ----------

/**
 * How to build on the screen a state no capture shows (S1). `mode`: `replace` (block in place of the content below
 * the header), `replace-data` (block in place of the table/list, filters stay), `banner` (alert at the top of the
 * content; in a dialog, above the action footer) or `field-error` (error on the required field). `block` is the
 * state block copied from a module capture: `error` (from *.error.html), `empty` (from *.empty.html), `loading`
 * (skeleton from *.loading.html). The texts are product text (lib/page-strings.mjs PRODUCT_TEXT, in the product
 * language) and follow the UX.md feedback policy: no-access says who grants it, error says what to do. An option
 * that brings its own text replaces the default.
 */
const RECIPE_SHAPE = {
  loading: { page: { mode: 'replace-data', block: 'loading' }, dialog: { mode: 'replace', block: 'loading' } },
  empty: { page: { mode: 'replace-data', block: 'empty' } },
  'empty-filtered': { page: { mode: 'replace-data', block: 'empty', button: true } },
  'no-data-in-period': { page: { mode: 'replace-data', block: 'empty' } },
  error: { page: { mode: 'replace-data', block: 'error' }, dialog: { mode: 'banner', color: 'error' } },
  'no-access': { page: { mode: 'replace', block: 'error', action: null }, dialog: { mode: 'banner', color: 'error' } },
  unavailable: { page: { mode: 'replace', block: 'error', action: null } },
  'invalid-link': { page: { mode: 'replace', block: 'error', action: null } },
  'expired-link': { page: { mode: 'replace', block: 'error', action: null } },
  'already-answered': { page: { mode: 'replace', block: 'empty' } },
  processing: { page: { mode: 'banner', color: 'info' } },
  partial: { page: { mode: 'banner', color: 'warning' } },
  stale: { page: { mode: 'banner', color: 'info' } },
  conflict: { page: { mode: 'banner', color: 'warning' } },
  saved: { page: { mode: 'banner', color: 'success' } },
  success: { page: { mode: 'banner', color: 'success' } },
  'unsaved-changes': { page: { mode: 'banner', color: 'warning' } },
  'read-only': { page: { mode: 'banner', color: 'info' } },
  'draft-restored': { page: { mode: 'banner', color: 'info' } },
  'field-error': { page: { mode: 'field-error' } },
};

/** State recipes with the product text of `productLang` (UX.md `content.language`; default pt-BR). */
export function stateRecipes(productLang) {
  const T = productText(productLang).state;
  const out = {};
  for (const [state, shape] of Object.entries(RECIPE_SHAPE)) {
    const t = T[state] ?? {};
    const text = (({ title, text: tx, action }) => ({ ...(title !== undefined ? { title } : {}), ...(tx !== undefined ? { text: tx } : {}), ...(action !== undefined ? { action } : {}) }))(t);
    out[state] = { page: { ...shape.page, ...text, ...('action' in shape.page ? { action: shape.page.action } : {}) } };
    if (shape.dialog) out[state].dialog = { ...shape.dialog, ...(t.dialog ? { text: t.dialog } : {}) };
  }
  return out;
}
/** Default recipes (pt-BR product text), kept for compatibility. */
export const STATE_RECIPES = stateRecipes('pt-BR');
/** State recipe (page and dialog), with the option's text over the default. `productLang`: product language. */
export function stateRecipe(state, over = {}, productLang) {
  const recipes = productLang ? stateRecipes(productLang) : STATE_RECIPES;
  const r = recipes[state] ?? { page: { mode: 'banner', color: 'info', text: productText(productLang).state.unknown(state) } };
  const merge = (x) => (x ? { ...x, ...Object.fromEntries(Object.entries(over).filter(([, v]) => v !== undefined)) } : null);
  return { page: merge(r.page), dialog: merge(r.dialog ?? (r.page.mode === 'field-error' || r.page.mode === 'banner' ? r.page : { mode: 'banner', color: r.page.block === 'error' ? 'error' : 'info', text: r.page.title ? `${r.page.title}. ${r.page.text ?? ''}`.trim() : r.page.text })) };
}

/** Missing archetype region (L9): default title of the region built as a container (product text, pt-BR default). */
export const REGION_TITLES = productText('pt-BR').region;
const regionTitle = (region, productLang) => productText(productLang).region[region] ?? region;

// ---------- locating the element ----------

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Template text (with `{}` or `{name}`) → regex pattern over the element's normalized text. */
export function toPattern(text, { anchored = true } = {}) {
  const t = clean(text);
  if (!t) return null;
  const literal = t.split(/\{[^{}]*\}/);
  // a template of only markers and separators ("{status} — {reason}") would match any text: not usable as a pattern
  if (literal.length > 1 && (literal.join('').match(/\p{L}/gu) ?? []).length < 3) return null;
  const parts = literal.map((p) => escRe(p).replace(/ /g, '\\s+'));
  const body = parts.join('.+?');
  return anchored ? `^${body}$` : body;
}
const quoted = (s) => [...String(s ?? '').matchAll(/["“]([^"”]+)["”]/g)].map((m) => clean(m[1])).filter(Boolean);
const KIND_OF_ELEMENT = { button: 'button', tab: 'button', menu: 'button', title: 'any', label: 'any', placeholder: 'placeholder', cell: 'any', helper: 'any', alert: 'any', tooltip: 'any', 'accessible-name': 'any' };

/** Visual variants cited in the C2 message (pt-BR or English wording): [{ variant, screens }] in message order. */
export function parseVariantSpread(message) {
  const m = String(message ?? '').match(/(?:variantes visuais diferentes|visual variants?)[^(]*\(([^)]*)\)/i);
  if (!m) return [];
  return m[1].split(';').map((seg) => {
    const mm = seg.trim().match(/^(\w+) (?:em|on|in) (.+)$/);
    return mm ? { variant: mm[1], screens: mm[2].split(',').map((s) => s.trim()).filter(Boolean) } : null;
  }).filter(Boolean);
}

/** C2: the majority variant (more screens; tie → the first cited) and the odd one. */
export function variantPlan(message) {
  const spread = parseVariantSpread(message);
  if (spread.length < 2) return null;
  const major = [...spread].sort((a, b) => b.screens.length - a.screens.length)[0];
  const minor = spread.find((s) => s !== major);
  return { major: major.variant, minor: minor.variant, screen: minor.screens[0] };
}

/** C1: cited labels (`"A" (screens…) × "B" (screens…)`); the first cited stays, the last one changes. */
export function labelPlan(message) {
  const occ = [...String(message ?? '').matchAll(/"([^"]+)" \(([^)]*)\)/g)].map((m) => ({ label: m[1], screens: m[2].split(',').map((s) => s.trim()).filter((s) => s && s !== '…') }));
  if (occ.length < 2) return null;
  return { keep: occ[0].label, change: occ.at(-1).label, screens: occ.at(-1).screens };
}

/** L6: fold cited in the message ("dobra em 900 px" / "fold at 900 px"); 900 when not cited. */
const foldOf = (msg) => Number(String(msg ?? '').match(/(?:dobra|fold)(?: line)?(?: em| at)? (\d+)\s*px/i)?.[1] ?? 900);
/** Example labels the detectors put in their own messages ("e.g. \"Send order\""): never the element itself. */
const EXAMPLE_LABELS = new Set(Object.values(PACKS).flatMap((p) => [p.examples.buttonWithObject, p.examples.verbObject]));

/**
 * How to find the case's element in the capture. Returns { screen_level?, selectors?, patterns?, contains?, prefixes?,
 * kind, max, require_class?, annotate_before?, viewport?, fold? } or { screen_level: true } when the finding is about
 * the whole screen (no element).
 */
export function locatorFor(c) {
  const msg = c.message ?? '';
  const rule = c.rule;
  if (c.family === 'states' || c.family === 'flow') return { screen_level: true };
  const sel = (c.selectors ?? []).filter(Boolean);
  if (c.family === 'text') {
    const kind = KIND_OF_ELEMENT[c.element] ?? 'any';
    const texts = [...new Set([c.text, ...(c.variants ?? [])].filter((t) => clean(t)))];
    const loc = { kind, patterns: texts.map((t) => toPattern(t)).filter(Boolean), loose: texts.map((t) => toPattern(t, { anchored: false })).filter((p) => p && p.length >= 8), max: 1 };
    if (c.element === 'accessible-name') loc.annotate_before = 'screen-reader';
    if (c.element === 'tooltip') loc.annotate_before = 'tooltip';
    return loc;
  }
  if (c.family === 'layout') {
    if (rule === 'L6' && sel.length) return { kind: 'any', selectors: sel.slice(0, 1), max: 1, viewport: true, fold: foldOf(msg) };
    if (sel.length) return { kind: 'any', selectors: sel.slice(0, 8), max: 8 };
    if (rule === 'L9') return { screen_level: true };
    if (rule === 'L7') { const p = quoted(c.text)[0]; return p ? { kind: 'any', prefixes: [p], max: 1 } : { screen_level: true }; }
    if (rule === 'L4') { const m = String(c.text).match(/ (?:em|in|on) (.+)$/); return m ? { kind: 'any', selectors: [m[1]], max: 1 } : { screen_level: true }; }
    if (rule === 'L3') return { kind: 'heading', patterns: quoted(msg).map((t) => toPattern(t)).filter(Boolean), max: 2 };
    const q = quoted(c.text)[0] ?? quoted(msg)[0];
    return q ? { kind: 'button', patterns: [toPattern(q)], max: 1, ...(rule === 'L6' ? { viewport: true, fold: foldOf(msg) } : {}) } : { screen_level: true };
  }
  if (c.family === 'screen') {
    // T3 without h1: the candidate is the most prominent text at the top of the content (the title already on screen)
    if (rule === 'T3') return { kind: 'main-title', max: 1 };
    if (rule === 'T6') { const ex = String(msg).match(/(?:ex\.:|e\.g\.,?) "([^"]+)/); return ex ? { kind: 'any', contains: [clean(ex[1]).replace(/…$/, '').slice(0, 60)], max: 1 } : { screen_level: true }; }
    const labels = quoted(msg).filter((l) => !EXAMPLE_LABELS.has(l) || rule !== 'T7');
    const own = rule === 'T7' ? labels.slice(0, 1) : labels;
    return own.length ? { kind: 'button', patterns: own.map((t) => toPattern(t)).filter(Boolean), max: rule === 'T1' ? 8 : 4 } : { screen_level: true };
  }
  if (c.family === 'consistency') {
    if (rule === 'C1') { const lp = labelPlan(msg); if (lp) return { kind: 'button', patterns: [toPattern(lp.change)], max: 1 }; }
    const texts = [...new Set((c.variants ?? []).filter(Boolean))];
    const loc = { kind: rule === 'C3' ? 'any' : 'button', patterns: (texts.length ? texts : [c.text]).map((t) => toPattern(t)).filter(Boolean), max: 1 };
    if (rule === 'C2') { const v = variantPlan(msg); if (v) loc.require_class = `MuiButton-${v.minor}`; }
    return loc;
  }
  return { screen_level: true };
}

// ---------- operation of each option ----------

/** An option that describes a change instead of bringing ready text starts with a structure noun (pt-BR or English)… */
export const INSTRUCTION_NOUN_RE = /^(manter|selo|t[íi]tulo|r[óo]tulo|placeholder|apoio|rodap[ée]|link|dica|data numa|complemento|c[ée]lula|declarar|registrar|nome acess[íi]vel|vers[ãa]o numa|keep|badge|title|label|helper|footer|hint|tooltip|date in a|complement|cell|declare|record|accessible name|version in a)\b/i;
/** …or with an editing verb (only outside buttons, where "Remove Ana" is the button text itself); every language pack. */
export const INSTRUCTION_VERB_RE = new RegExp(`^(${unionList('instructionVerbs').filter((v) => !['manter', 'selo', 'declarar', 'registrar', 'keep', 'badge', 'declare', 'record'].includes(v)).join('|')})\\b`, 'i');
const ELEMENT_NOUN = 't[íi]tulo|r[óo]tulo|placeholder|apoio|texto|rodap[ée]|link|selo|dica|bot[ãa]o|aba|legenda|title|label|helper|text|footer|badge|hint|tooltip|button|tab|caption';
const ELEMENT_WORD = new RegExp(`(?:^|[;.]\\s*)(${ELEMENT_NOUN})(?=[\\s"“])[^"“;]*["“]([^"”]+)["”]`, 'i');
const LABEL_COLON = new RegExp(`^(${ELEMENT_NOUN})\\s*:\\s*(.+)$`, 'i');
/** An option whose text is the sentence itself (with inner quotes, like “Create order”), not an instruction. */
const isSentence = (t, element) => !INSTRUCTION_NOUN_RE.test(t) && !(!['button', 'tab', 'menu'].includes(element) && INSTRUCTION_VERB_RE.test(t))
  && !ELEMENT_WORD.test(t) && !/,\s+(?:com|with)\s|\s+(?:ou|or)\s+["“]/.test(t) && !/^["“][^"”]+["”]\s+(?:vis[íi]vel|visible)/i.test(t);
const isInstruction = (t, element) => (/["“].+["”]/.test(t) && !isSentence(t, element)) || INSTRUCTION_NOUN_RE.test(t) || (!['button', 'tab', 'menu'].includes(element) && INSTRUCTION_VERB_RE.test(t));

const words = (s) => new Set(clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 2));
const stemHit = (a, b) => a === b || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5));
const numbers = (s) => new Set(String(s ?? '').match(/\d+/g) ?? []);
/**
 * List "A · B · C" (one text per element): picks the segment with the most words in common with the current one
 * (5-letter stem: "recipients" matches "recipient(s)"); tie or no word → the one that repeats the numbers of the
 * current text ("See 1 change" for "History (1)"). With no signal at all, null.
 */
export function pickSegment(optionText, currentTexts) {
  const segs = String(optionText).split(' · ').map(clean).filter(Boolean);
  const cur = [...new Set(currentTexts.flatMap((t) => [...words(t)]))];
  const nums = new Set(currentTexts.flatMap((t) => [...numbers(t)]));
  let best = null, score = 0;
  for (const s of segs) {
    const w = [...words(s)];
    const n = w.filter((x) => cur.some((y) => stemHit(x, y))).length * 2 + [...numbers(s)].filter((x) => nums.has(x)).length;
    if (n > score) { best = s; score = n; }
  }
  return best;
}

/** Text of an instruction: quotes after the element name, "A → B", "Label: text", "X, with helper "Y"". */
export function extractOptionText(t) {
  const arrow = t.split(/\s*(?:→|->)\s*/);
  if (arrow.length > 1 && clean(arrow.at(-1))) return { text: clean(arrow.at(-1)).replace(/^["“]|["”]$/g, ''), how: 'arrow' };
  const lc = t.match(LABEL_COLON);
  if (lc && !/["“]/.test(lc[2])) return { text: clean(lc[2]), how: 'label' };
  const m = t.match(ELEMENT_WORD);
  if (m) return { text: clean(m[2]), how: 'element' };
  const whole = t.match(/^["“]([^"”]+)["”]$/);
  if (whole) return { text: clean(whole[1]), how: 'quoted' };
  return null;
}

/** Complement of "X, com|with <apoio|selo|nome acessível|dica|helper|badge|accessible name|hint> "Y"": main text + complement operation. */
function withComplement(t) {
  const m = t.match(/^([^,;]+?),\s+(?:com|with)\s+(apoio|selo|nome acess[íi]vel|dica|helper(?: text)?|badge|accessible name|hint|tooltip)\s+["“]([^"”]+)["”](.*)$/i);
  if (!m) return null;
  const kind = m[2].toLowerCase();
  const extra = /^(apoio|helper)/.test(kind) ? { op: 'insert', like: 'helper', position: 'after', text: clean(m[3]) }
    : /^(selo|badge)$/.test(kind) ? { op: 'insert', like: 'chip', position: 'after', text: clean(m[3]) }
      : /^(dica|hint|tooltip)$/.test(kind) ? { op: 'annotate', kind: 'tooltip', text: clean(m[3]) }
        : { op: 'annotate', kind: 'screen-reader', text: clean(m[3]) };
  const main = clean(m[1]).replace(/^["“]|["”]$/g, '');
  const ops = /^["“].+["”]\s+(?:vis[íi]vel|visible)$/i.test(clean(m[1])) ? [extra] : [{ op: 'text', text: main }, extra];
  return { ops, derived: true, ...(clean(m[4]) ? { note: 'the option brings more than one alternative; the preview shows the first' } : {}) };
}

/**
 * Operations of option `o` in case `c`. The option may declare `preview` (object or list); without a declaration the
 * family's default preview applies. Returns { ops: [op], derived: bool, note? } or { none: reason }.
 * opts: { lang (page language, for badges), productLang (product language, for built text) }.
 */
export function optionOps(c, o, opts = {}) {
  if (o?.preview !== undefined) {
    const list = [].concat(o.preview);
    const ops = [];
    for (const raw of list) {
      const v = validateOp(raw);
      if (v.error) return { none: `invalid declared preview: ${v.error}`, invalid: true };
      if (v.op.op === 'none') return { none: v.op.reason, declared: true };
      ops.push(v.op);
    }
    return { ops, derived: false };
  }
  if (c.family !== 'text') {
    const imp = implicitPreview(c, opts);
    return imp.ops ? { ops: imp.ops, derived: true } : { none: imp.none };
  }
  if (BEHAVIOR_RULES.has(c.rule)) return behaviorOptionOps(c, o, opts);
  return deriveTextOp(c, o, opts);
}

/**
 * Review rules whose options usually describe behavior, structure or flow (heuristics, dark patterns, IA,
 * accessibility, laws), not a replacement text. Their option text is only taken as screen text when the option says
 * so explicitly ("A" → "B", Label: text, element + quoted text, a whole quoted text); anything else is an instruction
 * and gets no derived preview: a wrong "after" image is worse than none.
 */
export const BEHAVIOR_RULES = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'DP', 'IA', 'A11Y', 'LAW']);
/** Stored in English in the manifest; the page shows it in its language (pageStrings(lang).reasonBehavior). */
export const NO_PREVIEW_BEHAVIOR = pageStrings('en').reasonBehavior;

function behaviorOptionOps(c, o, opts) {
  const t = clean(o?.text);
  if (!t) return { none: 'option without text' };
  if (/^(manter|keep)\b/i.test(t)) return deriveTextOp(c, o, opts);
  if (c.element === 'accessible-name' || c.element === 'tooltip') return deriveTextOp(c, o, opts);
  const ex = extractOptionText(t);
  if (!ex) return { none: NO_PREVIEW_BEHAVIOR };
  const r = deriveTextOp(c, o, opts);
  return r.ops?.some((x) => x.op === 'text' && !plausibleText(c, x.text)) ? { none: NO_PREVIEW_BEHAVIOR } : r;
}

/** Elements whose text is a short label: an unquoted replacement much longer than a label is an instruction. */
const LABEL_ELEMENTS = new Set(['button', 'tab', 'menu', 'label', 'title', 'cell', 'chip']);
export const LABEL_MAX_CHARS = 60;
/** A replacement that cannot be the element's text: a label-like element receiving a paragraph. */
export function plausibleText(c, text) {
  if (!LABEL_ELEMENTS.has(c.element)) return true;
  const cur = clean([c.text, ...(c.variants ?? [])].sort((a, b) => String(b).length - String(a).length)[0] ?? '');
  const t = clean(text);
  return t.length <= Math.max(LABEL_MAX_CHARS, cur.length * 2);
}

/** What the screen reader or the hint would say in the option (accessible name and hint are not pixels: they become an annotation). */
function annotationText(t) {
  const named = t.match(/(?:nome acess[íi]vel|accessible name)\s+["“]([^"”]+)["”]/i) ?? t.match(/(?:dica|hint|tooltip)\s+["“]([^"”]+)["”]/i);
  if (named) return clean(named[1]);
  const ex = extractOptionText(t);
  if (ex) return ex.text;
  const q = quoted(t);
  if (q.length && INSTRUCTION_NOUN_RE.test(t)) return q[0];
  return t;
}

/** Default preview of a text option. Option text is read in pt-BR or English ("manter"/"keep", "(remover)"/"(remove)"). */
export function deriveTextOp(c, o, { lang = 'en' } = {}) {
  const t = clean(o?.text);
  if (!t) return { none: 'option without text' };
  if (/^(manter|keep)\b/i.test(t) || /^\((remover|remove)\)\s+(nenhuma mudan[çc]a|no change)/i.test(t)) return { ops: [{ op: 'badge', text: pageStrings(lang).badgeNoChange }], derived: true };
  if (c.element === 'accessible-name') return { ops: [{ op: 'annotate', kind: 'screen-reader', text: annotationText(t) }], derived: true };
  if (c.element === 'tooltip') return { ops: [{ op: 'annotate', kind: 'tooltip', text: annotationText(t) }], derived: true };
  if (/^\((remover|remove)\)\s*$/i.test(t)) return { ops: [{ op: 'remove' }], derived: true };
  if (/^\((remover|remove)\)\s+(e|and)\s/i.test(t)) return { ops: [{ op: 'remove' }], derived: true, note: 'the option asks for more than removing; the preview shows only the removal' };
  if (/^\((remover|remove)\)/i.test(t)) return { none: 'the option describes a change that is not only a removal; the preview does not simulate it (declare "preview" in the option)' };
  const comp = withComplement(t);
  if (comp) return comp;
  if (isInstruction(t, c.element)) {
    const ex = extractOptionText(t);
    if (ex) return { ops: [{ op: 'text', text: ex.text }], derived: true, ...(ex.how === 'element' ? { note: 'the option changes more than the text; the preview shows only the main text replacement' } : {}) };
    if (/^(remover|remove)\b/i.test(t)) return { ops: [{ op: 'remove' }], derived: true, note: 'the option asks for more than removing; the preview shows only the removal' };
    return { none: 'the option describes a structure change; the preview does not simulate it (declare "preview" in the option)' };
  }
  if (/(?:→|->)/.test(t)) return { ops: [{ op: 'text', text: extractOptionText(t).text }], derived: true };
  if (t.includes(' · ')) {
    const choices = String(t).split(' · ').map(clean).filter(Boolean);
    const seg = pickSegment(t, [c.text, ...(c.variants ?? [])]);
    if (!seg) return { ops: [{ op: 'text', text: choices[0], choices }], derived: true, note: 'the option lists texts of several elements and none repeats words of this one; the preview applies the closest one, in the capture' };
    return { ops: [{ op: 'text', text: seg, choices }], derived: true, note: 'the option lists texts of several elements; the preview applies the one that matches this element' };
  }
  const q = t.match(/^["“]([^"”]+)["”]$/);
  if (!q && !plausibleText(c, t)) return { none: NO_PREVIEW_BEHAVIOR };
  return { ops: [{ op: 'text', text: q ? clean(q[1]) : t }], derived: true };
}

/** Technical terms with no place on the screen → plain word ('' = drop the term). Used by the T6 default; pt-BR product text (per language: productText(lang).plainTerms). */
export const PLAIN_TERMS = productText('pt-BR').plainTerms;

/**
 * Fix indicated by the rule, for a case without options (and the family's default preview when the option declares
 * none). Returns { label, ops } | { label, flow } | { none }. Labels in the page language (`lang`, default en); text
 * built in the product (region title, plain word) in `productLang` (default pt-BR). Detector messages are parsed in
 * pt-BR or English wording.
 */
export function implicitPreview(c, { exampleFor = null, lang = 'en', productLang = undefined } = {}) {
  const I = pageStrings(lang).implicit;
  const r = c.rule;
  const msg = c.message ?? '';
  if (c.family === 'layout') {
    if (r === 'L1') return { label: I.L1, ops: [{ op: 'move', to: 'end', justify: 'flex-end' }] };
    if (r === 'L3') return { label: I.L3, ops: [{ op: 'style', targets: 'all', css: { 'font-size': 'theme:self', 'line-height': 'theme:self', 'font-weight': 'theme:self' } }] };
    if (r === 'L4') return { label: I.L4, ops: [{ op: 'align', mode: 'auto', targets: 'all' }] };
    if (r === 'L6') return { label: I.L6, ops: [{ op: 'move', to: 'region-top', fold: foldOf(msg) }] };
    // 60ch ≈ 72 characters of running text ("ch" is the width of the zero, wider than the average letter)
    if (r === 'L7') return { label: I.L7, ops: [{ op: 'style', css: { 'max-width': '60ch' } }] };
    if (r === 'L8') { const n = /44/.test(msg) ? 44 : 24; return { label: I.L8(n), ops: [{ op: 'style', css: { 'min-width': `${n}px`, 'min-height': `${n}px` } }] }; }
    if (r === 'L9') {
      const region = String(c.text ?? msg).match(/(?:regi[ãa]o|region) "?([\w-]+)"?/i)?.[1] ?? String(msg).match(/(?:regi[ãa]o|region) "?([\w-]+)"?/i)?.[1] ?? null;
      if (!region) return { none: 'could not read the missing region in the finding' };
      const title = regionTitle(region, productLang);
      return { label: I.L9(title), ops: [{ op: 'synthesize-region', region, title }] };
    }
  }
  if (c.family === 'consistency' && r === 'C2') {
    const v = variantPlan(msg);
    return v ? { label: I.C2(v.major), ops: [{ op: 'variant', variant: v.major }] } : { none: 'could not read the variants in the finding message' };
  }
  if (c.family === 'consistency' && r === 'C1') {
    const lp = labelPlan(msg);
    return lp ? { label: I.C1(lp.keep), ops: [{ op: 'text', text: lp.keep }] } : { none: 'could not read the labels in the finding message' };
  }
  if (c.family === 'states' && r === 'S1') {
    const state = stateOfRegion(c.region);
    if (state) return { label: I.S1(state), ops: [{ op: 'synthesize-state', state }] };
    const ex = exampleFor ? exampleFor(state, c.screens?.[0]) : null;
    return ex ? { label: I.S1example(ex, state), ops: [{ op: 'example', screen: ex }] } : { none: `no other screen of the module has a capture of the state "${state}" to serve as an example` };
  }
  if (c.family === 'screen') {
    if (r === 'T1') return { label: I.T1, ops: [{ op: 'variant', variant: 'outlined', targets: 'all-but-last' }] };
    if (r === 'T3') return { label: I.T3, ops: [{ op: 'style', css: { 'font-size': 'theme:h1', 'line-height': 'theme:h1', 'font-weight': 'theme:h1' } }, { op: 'annotate', kind: 'screen-reader', text: I.T3sr }] };
    if (r === 'T6') {
      const term = msg.match(/(?:termo proibido|forbidden term) "([^"]+)"/i)?.[1];
      if (!term) return { none: 'could not read the forbidden term in the finding' };
      const plain = productText(productLang).plainTerms[term.toLowerCase()];
      return { label: I.T6(term, plain), ops: [{ op: 'replace-text-many', pairs: [{ from: term, to: plain ?? '' }], scope: 'element' }] };
    }
    if (r === 'T7') { const lb = quoted(msg).find((l) => !EXAMPLE_LABELS.has(l)); return lb ? { label: I.T7, ops: [{ op: 'text', text: `${lb} {context}` }] } : { none: 'could not read the button in the finding' }; }
  }
  if (c.family === 'text') {
    if (r === 'X9') return { label: I.X9, ops: [{ op: 'text', text: '{no-parens}' }] };
    if (r === 'X2') return { label: I.X2, ops: [{ op: 'text', text: '{part:0}' }, { op: 'insert', like: 'helper', position: 'after', text: '{part:1}' }] };
    if (r === 'X6' && /palavras|words/.test(msg)) return { label: I.X6long, ops: [{ op: 'text', text: '{part:0}' }] };
    if (r === 'X6' && /sem objeto|without an object|no object/.test(msg)) return { label: I.X6obj, ops: [{ op: 'text', text: `${clean(c.text)} {context}` }] };
  }
  if (c.family === 'flow' && ['F1', 'F2', 'F5'].includes(r)) return { label: I[r], flow: true };
  return { none: `no automatic preview for rule ${r}; the fix depends on the decision` };
}
export const stateOfRegion = (region) => clean(String(region ?? '').split(' · ')[0]) || null;

/** Picks the capture that serves as an example of a state: another screen, same type (dialog × page) first. */
export function pickExample(files, state, screen) {
  if (!state) return null;
  const re = new RegExp(`^\\d+-[\\w-]+\\.${escRe(state)}\\.html$`);
  const base = String(screen ?? '').replace(/\..*$/, '');
  const cand = files.filter((f) => re.test(f) && !f.startsWith(`${base}.`)).sort();
  if (!cand.length) return null;
  const dlg = /-dlg-/.test(base);
  return (cand.find((f) => /-dlg-/.test(f) === dlg) ?? cand[0]).replace(/\.html$/, '');
}

/** Order of the captures to try for the case (representative screen first). */
export function screenOrder(c) {
  const list = [...new Set(c.screens ?? [])];
  if (c.family === 'consistency' && c.rule === 'C2') { const v = variantPlan(c.message); if (v) list.sort((a, b) => (b === v.screen) - (a === v.screen)); }
  if (c.family === 'consistency' && c.rule === 'C1') { const lp = labelPlan(c.message); if (lp) list.sort((a, b) => lp.screens.includes(b) - lp.screens.includes(a)); }
  return list.sort((a, b) => (a.includes('.') ? 1 : 0) - (b.includes('.') ? 1 : 0));
}

/** Do the operations change the capture's DOM (rather than just showing another capture)? */
export const domOps = (ops) => (ops ?? []).some((o) => o.op !== 'example');
/** Operations that depend on the module's donors (lib/preview-kit.mjs). */
export const needsKit = (ops) => (ops ?? []).some((o) => ['synthesize-state', 'synthesize-region', 'insert', 'wrap', 'variant', 'style', 'annotate'].includes(o.op));

/** Short description of the operations, for alt text and the manifest (page language `lang`, default en). */
export function describeOps(ops, lang = 'en') {
  const O = pageStrings(lang).ops;
  return ops.map((o) => ({
    text: O.text(o.text), remove: O.remove,
    variant: O.variant(o.targets === 'all-but-last', o.variant),
    move: [o.to ? O.moveTo[o.to] ?? o.to : '', o.justify ? O.justify(o.justify) : ''].filter(Boolean).join(', '),
    style: O.style(Object.entries(o.css ?? {}).map(([k, v]) => `${k}: ${v}`).join('; ')), align: O.align,
    'replace-text-many': O.replaceMany((o.pairs ?? []).map((p) => `"${p.from}" → "${p.to}"`).join(', ')),
    insert: O.insert(o.like, o.from, o.text),
    wrap: O.wrap(o.title),
    annotate: `${O.annotate[o.kind] ?? O.annotate['screen-reader']}: "${o.text}"`,
    badge: O.badge(o.text), 'synthesize-state': O.state(o.state),
    'synthesize-region': O.region(o.title ?? o.region), example: O.example(o.screen),
  }[o.op] ?? o.op)).join('; ');
}

/** Short label of the preview type, shown under each "after" on the page (English; per language: pageStrings(lang).proposal). */
export const PROPOSAL_LABEL = pageStrings('en').proposal;
export function previewKind(ops, lang = 'en') {
  const S = pageStrings(lang);
  const K = S.kind;
  const list = ops ?? [];
  const has = (...k) => list.some((o) => k.includes(o.op));
  const out = [];
  if (has('synthesize-state', 'synthesize-region', 'insert', 'wrap')) out.push(S.proposal);
  if (has('text', 'replace-text-many') && !out.length) out.push(K.text);
  if (has('remove') && !out.length) out.push(K.remove);
  if (has('variant')) out.push(K.variant);
  if (has('move')) out.push(K.move);
  if (has('style', 'align') && !has('variant', 'move')) out.push(list.some((o) => Object.values(o.css ?? {}).some((v) => /^theme:/.test(v))) ? K.themeSize : K.style);
  for (const a of list.filter((o) => o.op === 'annotate')) out.push(a.kind === 'tooltip' ? K.annTooltip : a.kind === 'hint' ? K.ann : K.annSr);
  for (const b of list.filter((o) => o.op === 'badge')) out.push(b.text);
  if (has('example')) out.push(K.example);
  if (has('flow')) out.push(K.flow);
  return [...new Set(out)].join(' · ');
}

// ---------- flow: mini SVG diagram ----------

const escX = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const short = (s, n = 26) => { const t = clean(s); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };

/**
 * Before/after diagram of the transitions of a flow-map screen (F1, F2, F5). Returns { before, after } as SVG (colors
 * from the page's CSS variables, with fallback values) or null when the screen is not in the map. Text in `lang`.
 */
export function flowDiagram(map, screenId, rule, lang = 'en') {
  const F = pageStrings(lang).flow;
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
    left.forEach((id, i) => { const yy = y(i, left.length); parts.push(node(8, yy, id.startsWith('+') ? `${id} ${F.screens}` : name(id), '', id)); parts.push(edge(8 + NW, yy + NH / 2, cx - 4, cy + NH / 2, '')); });
    R.forEach((id, i) => {
      const yy = y(i, R.length);
      const isNew = after && rule === 'F1' && id === backTarget && !right.includes(id);
      parts.push(node(W - NW - 8, yy, id.startsWith('+') ? `${id} ${F.screens}` : name(id), isNew ? 'new' : '', id));
      parts.push(edge(cx + NW + 4, cy + NH / 2, W - NW - 12, yy + NH / 2, isNew ? 'new' : ''));
    });
    parts.push(node(cx, cy, me.name ?? screenId, 'me', screenId));
    if (!left.length) parts.push(`<text class="t" x="${8 + NW / 2}" y="${cy + NH / 2 + 4}" text-anchor="middle">${escX(F.noEntry)}</text>`);
    if (!R.length) parts.push(`<text class="t warn" x="${W - NW / 2 - 8}" y="${cy + NH / 2 + 4}" text-anchor="middle">${escX(F.noExit)}</text>`);
    if (after && rule === 'F5' && backTarget) {
      const by2 = H - 14;
      parts.push(`<path class="e new" d="M${cx + NW / 2},${cy + NH} C${cx + NW / 2},${by2} ${8 + NW / 2},${by2} ${8 + NW / 2},${y(Math.max(0, left.indexOf(backTarget)), left.length) + NH + 2}" marker-end="url(#a-new)"/>`);
      parts.push(`<text class="t new" x="${(cx + 8 + NW) / 2 + 20}" y="${by2 - 2}">${escX(F.backTo(short(name(backTarget), 22)))}</text>`);
    }
    if (rule === 'F2') parts.push(after
      ? `<rect class="j new" x="4" y="22" width="${W - 8}" height="${H - 26}" rx="12"/><text class="t new" x="14" y="16">${escX(F.declared)}</text>`
      : `<text class="t warn" x="14" y="16">${escX(F.outside)}</text>`);
    const style = '<style>.n rect{fill:var(--surface,#fff);stroke:var(--line,#C9D2DE);stroke-width:1.5}.n text,.t{font:12px Inter,system-ui,sans-serif;fill:var(--fg,#1E2130)}.n.me rect{stroke:var(--accent,#2B59C3);stroke-width:2.5}.n.new rect{stroke:var(--ok,#15803D);stroke-dasharray:5 4;stroke-width:2}.e{fill:none;stroke:var(--muted,#5B6578);stroke-width:1.5}.e.new{stroke:var(--ok,#15803D);stroke-dasharray:5 4;stroke-width:2}.t.new{fill:var(--ok,#15803D);font-weight:600}.t.warn{fill:var(--bad,#B91C1C);font-weight:600}.j{fill:none;stroke-width:2;stroke-dasharray:6 5}.j.new{stroke:var(--ok,#15803D)}</style>';
    const defs = '<defs><marker id="a-n" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--muted,#5B6578)"/></marker><marker id="a-new" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--ok,#15803D)"/></marker></defs>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${style}${defs}${parts.join('')}</svg>`;
  };
  return { before: build(false), after: build(true), back_target: backTarget };
}
