#!/usr/bin/env node
// ux-lint, text level: hygiene of interface text in the HTML captures. Looks for the marks that make a
// text read as AI-generated or bureaucratic (dash, compound title, helper text that repeats the title,
// empty opening, title case, technical term...) and for unnecessary text. Does not judge screen
// architecture (that is screen.mjs). Catalog: knowledge/foundations/generated-text-marks.md.
// The product-text vocabulary comes from a language pack (lib/lang/, UX.md `content.language`, default pt-BR).
// No dependencies.
//
// Usage: node tools/ux-lint/text.mjs --screens <folder-or-html...> [--code <folders...>] [--ux UX.md]
//                                  [--module <m>] [--ignore <names...>] [--json]
// --module picks the module glossary (`content.glossary` per module): canonical terms with a capital letter in
// the middle ("Nota Fiscal", "Purchase Order") count as proper nouns for X10, together with `content.proper-nouns`.
// --code looks up each flagged text in the sources (.ts/.tsx/.js/.jsx/.mjs/.py/.json) and returns
// file:line, so the fix lands where the text is born.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, configFrom } from './lib/config.mjs';
import { loadGlossary, glossarySource } from './lib/glossary.mjs';
import { normalizeArgv } from '../lib/legacy-cli.mjs';
import { langPack } from './lib/lang/index.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, getById, walk, contains, decodeEntities } from './lib/html.mjs';

export const SEVERITY = { X1: 2, X1b: 1, X2: 2, X3: 1, X4: 2, X5: 1, X6: 1, X7: 1, X8: 1, X9: 1, X10: 1, X11: 2 };
export const TYPES = ['title', 'button', 'tab', 'label', 'placeholder', 'helper', 'alert', 'accessible-name', 'tooltip', 'empty-value'];
/** Element type name used in messages (messages are English; the product-text vocabulary comes from the language pack). */
export const TYPE_LABEL = {
  title: 'title', button: 'button', tab: 'tab', label: 'label', placeholder: 'placeholder', helper: 'helper text', alert: 'alert',
  'accessible-name': 'accessible name', tooltip: 'tooltip', 'empty-value': 'empty value',
};
/** Default (pt-BR) lists, kept as exports for compatibility; the detectors read the pack of `content.language`. */
export const LABELS_WITHOUT_VERB = langPack().labelsWithoutVerb;
export const TECHNICAL_TERMS = ['sha256', 'sha-256', 'hash', 'id', 'token', 'payload', 'SES', 'API', 'JSON', 'endpoint', 'webhook', 'UUID'];
/** Language-pack derived helpers, cached per pack. */
const PACK_CACHE = new Map();
function packTools(pack) {
  if (!PACK_CACHE.has(pack)) PACK_CACHE.set(pack, { pack, stop: new Set(pack.stopWords) });
  return PACK_CACHE.get(pack);
}

const ZW = /[​-‍﻿]/g;
const clean = (s) => (s || '').replace(ZW, '').replace(/\s+/g, ' ').trim();
const norm = (s) => clean(s).toLowerCase().replace(/[.!?:…]+$/, '').trim();
const words = (s) => clean(s).split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const stem = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 5);

const BLOCK_SEL = 'p, .MuiTypography-body1, .MuiTypography-body2, .MuiTypography-caption, .MuiTypography-subtitle1, .MuiTypography-subtitle2, .MuiDialogContentText-root';

function buttonVariant(n) {
  const c = ` ${n.attrs.class || ''} `;
  if (/ MuiButton-contained/.test(c)) return 'contained';
  if (/ MuiButton-outlined/.test(c)) return 'outlined';
  if (/ MuiButton-text/.test(c)) return 'text';
  if (/ MuiIconButton-root /.test(c)) return 'icon';
  if (/ MuiListItemButton-root /.test(c)) return 'list-item';
  if (/ MuiTableSortLabel-root /.test(c)) return 'sort';
  if (/ MuiChip-root /.test(c)) return 'chip';
  if (/ MuiToggleButton-root /.test(c)) return 'toggle';
  if (/ MuiMenuItem-root /.test(c) || n.attrs.role === 'menuitem') return 'menu-item';
  return 'other';
}

function fieldLabel(root, f) {
  if (f.attrs.id) for (const l of querySelectorAll(root, 'label')) if (l.attrs.for === f.attrs.id && visibleText(l)) return visibleText(l);
  const anc = closest(f.parent, 'label');
  if (anc && visibleText(anc)) return visibleText(anc);
  const fc = closest(f, '.MuiFormControl-root, .MuiTextField-root');
  if (fc) { const l = querySelectorAll(fc, 'label')[0]; if (l && visibleText(l)) return visibleText(l); }
  if (f.attrs['aria-labelledby']) {
    const t = f.attrs['aria-labelledby'].split(/\s+/).map((id) => getById(root, id)).filter(Boolean).map(visibleText).join(' ').trim();
    if (t) return t;
  }
  return clean(f.attrs['aria-label'] || '');
}

const withoutAsterisk = (s) => clean(s).replace(/\s*\*$/, '').trim();

const INLINE = /^(b|strong|em|i|u|mark|small|sub|sup|code|abbr|s)$/;
/** Visible text with a space at every element boundary (textOf glues "Title" + "Chip" into "TitleChip"). */
export function visibleText(node, ignore = null) {
  if (!node || (node.type === 'element' && isHidden(node))) return '';
  const parts = [];
  const rec = (n) => {
    if (n.type === 'text') { parts.push(n.text); return; }
    if (n.type !== 'element') return;
    if ('hidden' in n.attrs || /display:none|visibility:hidden/.test((n.attrs.style || '').replace(/\s+/g, '').toLowerCase())) return;
    if (ignore && n !== node && matches(n, ignore)) return;
    const sep = INLINE.test(n.tag) ? '' : ' ';
    parts.push(sep);
    for (const ch of n.children || []) rec(ch);
    parts.push(sep);
  };
  rec(node);
  return clean(parts.join(''));
}

const PIECE_SEL = 'p, div, li, h1, h2, h3, h4, h5, h6, .MuiTypography-root, .MuiChip-root, .MuiListItemText-primary, .MuiListItemText-secondary';
/** Distinct text blocks inside a control (clickable card = title + summary + chip). */
function piecesOf(b) {
  const pieces = [];
  for (const n of walk(b)) {
    if (n.type !== 'text' || !clean(n.text) || isHidden(n.parent)) continue;
    let c = n.parent;
    for (let x = n.parent; x && x !== b; x = x.parent) if (matches(x, PIECE_SEL)) { c = x; break; }
    if (!pieces.includes(c)) pieces.push(c);
  }
  return pieces;
}

/**
 * Text inventory of a screen. With a dialog open, only the dialog.
 * Devolve [{ tipo, texto, variante?, titulo?, rotulo?, visivel?, linha, col, no }].
 */
export function takeInventory(html, cfg = configFrom({})) {
  const root = parseHtml(html);
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d) && !closest(d.parent, sel.dialog));
  const scope = dialogs.length ? dialogs : [root];
  const inScope = (n) => scope.some((e) => e === root || contains(e, n));
  const items = [];
  const byNode = new Map();
  const add = (node, type, text, extra = {}) => {
    text = clean(text);
    if (!text || isHidden(node) || !inScope(node)) return null;
    const it = { type, text, ...extra, line: node.line, col: node.col, node };
    items.push(it);
    if (!byNode.has(node)) byNode.set(node, []);
    byNode.get(node).push(it);
    return it;
  };
  const is = (n, s) => n.type === 'element' && matches(n, s);

  // Titles (includes dialog titles and accordion summaries, which are also buttons: they count as titles).
  const headings = querySelectorAll(root, 'h1, h2, h3, h4, h5, h6, [role=heading], .MuiDialogTitle-root, .MuiAccordionSummary-root');
  for (const h of headings) {
    const variant = is(h, '.MuiAccordionSummary-root') ? 'accordion' : is(h, '.MuiDialogTitle-root') || closest(h, sel.dialog) ? 'dialog' : h.tag;
    // A status chip inside the title (e.g. "Filled") is a badge, not the title.
    const pieces = variant === 'accordion' ? piecesOf(h) : [];
    add(h, 'title', pieces.length >= 2 ? visibleText(pieces[0], '.MuiChip-root') : visibleText(h, '.MuiChip-root'), { variant });
  }
  // Tabs.
  for (const t of querySelectorAll(root, '.MuiTab-root, [role=tab]')) add(t, 'tab', visibleText(t) || t.attrs['aria-label']);
  // Buttons (visible text or aria-label), except tabs and accordion summaries.
  for (const b of querySelectorAll(root, 'button, [role=button], a.MuiButton-root, [role=menuitem]')) {
    if (is(b, '.MuiTab-root, [role=tab], .MuiAccordionSummary-root') || b.attrs.role === 'combobox') continue;
    const visible = visibleText(b);
    const pieces = visible ? piecesOf(b) : [];
    if (pieces.length >= 2) add(b, 'button', visibleText(pieces[0]) || visible, { variant: 'composite', full: visible });
    else add(b, 'button', visible || b.attrs['aria-label'] || b.attrs.title, { variant: buttonVariant(b), from_aria_label: !visible });
  }
  // Labels.
  for (const l of querySelectorAll(root, 'label, legend')) add(l, 'label', withoutAsterisk(visibleText(l)));
  // Placeholders.
  for (const f of querySelectorAll(root, 'input[placeholder], textarea[placeholder]')) {
    add(f, 'placeholder', f.attrs.placeholder, { label: withoutAsterisk(fieldLabel(root, f)) });
  }
  // Helper text: field help, captions and the short paragraph right after a title.
  for (const n of querySelectorAll(root, '.MuiFormHelperText-root, .MuiTypography-caption')) add(n, 'helper', visibleText(n));
  const texts = [];
  for (const n of walk(root)) if (n.type === 'text' && clean(n.text)) texts.push(n);
  const idx = new Map(texts.map((t, i) => [t, i]));
  for (const h of headings) {
    const inside = texts.filter((t) => contains(h, t));
    if (!inside.length) continue;
    const next = texts[idx.get(inside.at(-1)) + 1];
    if (!next) continue;
    const block = closest(next.parent, BLOCK_SEL);
    if (!block || contains(block, h) || closest(block, 'button, [role=button], label, a, th, td, [role=tab], h1, h2, h3, h4, h5, h6')) continue;
    const t = visibleText(block);
    if (!t || words(t).length > 40) continue;
    const existing = (byNode.get(block) || []).find((i) => i.type === 'helper');
    if (existing) existing.title = visibleText(h);
    else add(block, 'helper', t, { title: visibleText(h) });
  }
  // Alerts.
  for (const a of querySelectorAll(root, '.MuiAlert-message')) add(a, 'alert', visibleText(a));
  // Accessible name (aria-label). A button with no visible text already entered as a button through its aria-label.
  for (const n of querySelectorAll(root, '[aria-label]')) {
    const visible = visibleText(n);
    const alreadyButton = (byNode.get(n) || []).some((i) => i.type === 'button' && i.from_aria_label);
    if (alreadyButton) continue;
    const control = is(n, 'button, [role=button], a, [role=tab], [role=menuitem]');
    add(n, 'accessible-name', n.attrs['aria-label'], { visible, control });
  }
  // Tooltip (title attribute).
  for (const n of querySelectorAll(root, '[title]')) {
    if (/^(html|head|link|style|meta|iframe|abbr)$/.test(n.tag)) continue;
    const control = is(n, 'button, [role=button], a, [role=tab], input, select, textarea') || !!closest(n, 'button, [role=button]');
    const truncatable = /MuiTypography-noWrap|ellipsis/.test(`${n.attrs.class || ''} ${n.attrs.style || ''}`) || querySelectorAll(n, '.MuiTypography-noWrap').length > 0;
    add(n, 'tooltip', n.attrs.title, { visible: visibleText(n), control, truncatable });
  }
  // Empty value: a lone dash in a cell or in a value text.
  for (const n of walk(root)) {
    if (n.type !== 'element' || !n.children.length || !n.children.every((c) => c.type === 'text')) continue;
    const t = clean(n.children.map((c) => c.text).join(''));
    if (/^[—–-]$/.test(t)) add(closest(n, 'td, th') || n, 'empty-value', t);
  }

  // Compound vs specific: the same text found on two nested elements counts once: as a title when one of
  // them is a title (accordion, disclosure); otherwise on the descendant, the more specific one.
  const excluded = new Set();
  const isSide = (i) => i.type === 'accessible-name' || i.type === 'tooltip' || i.type === 'placeholder';
  for (const a of items) {
    if (isSide(a) || excluded.has(a)) continue;
    const k = norm(a.text);
    for (const b of items) {
      if (a === b || excluded.has(b) || isSide(b) || b.type === 'helper') continue;
      if (a.node === b.node || !contains(a.node, b.node) || norm(b.text) !== k) continue;
      if (a.type === 'title' && b.type !== 'title') excluded.add(b);
      else { excluded.add(a); break; }
    }
  }
  // Same node, same type, same text (e.g. dialog h2 + .MuiDialogTitle-root): once.
  const seen = new Set();
  return items.filter((i) => {
    if (excluded.has(i)) return false;
    const k = `${i.type}|${i.line}:${i.col}|${i.text}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------- rules ----------

const isAcronym = (w) => /^[A-ZÀ-Ý0-9]{2,}[A-ZÀ-Ý0-9-]*s?$/.test(w.replace(/[^\p{L}\p{N}-]/gu, ''));

function titleCaseWords(text, properNouns, P) {
  if (P.pack.companyName.test(text)) return null;
  let t = text;
  for (const n of properNouns) t = t.replace(new RegExp(escRe(n), 'gi'), ' ');
  const ws = t.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')).filter(Boolean);
  const rest = ws.slice(1).filter((w) => /^\p{L}/u.test(w) && w.length >= 3 && !P.stop.has(w.toLowerCase()) && !isAcronym(w));
  return rest.length > 0 && rest.every((w) => /^\p{Lu}/u.test(w) && /\p{Ll}/u.test(w)) ? rest : null;
}

const toSentenceCase = (text, properNouns) => {
  const ws = text.split(' ');
  return ws.map((w, i) => (i === 0 || isAcronym(w) || properNouns.some((n) => n.toLowerCase() === w.toLowerCase()) ? w : w.toLowerCase())).join(' ');
};

function dashes(text) {
  // An en dash between numbers/dates (1–8, 2024–2026, 10/09–12/09) does not count.
  return text.replace(/(\d)\s?–\s?(?=\d)/g, '$1~').match(/[—–]/g) || [];
}

const SEPARATOR = /\s[—–|·]\s|\s-\s|:\s/;

/**
 * Applies X1–X11 to one inventory item. Returns [{ rule, severity, message, suggestion? }].
 * The product-text vocabulary comes from the language pack of `cfg.content.language` (default pt-BR);
 * `extras.pack` overrides it.
 */
export function rulesForItem(it, cfg = configFrom({}), extras = {}) {
  const out = [];
  // `piece`: the part the rule flags; with --code, when it is not on the source line, it came from data.
  const add = (rule, message, suggestion, piece) => out.push({ rule, severity: SEVERITY[rule], message, ...(suggestion ? { suggestion } : {}), ...(piece ? { piece } : {}) });
  const P = packTools(extras.pack ?? langPack(cfg));
  const L = P.pack;
  const contentWords = (s) => words(s).map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')).filter((w) => w.length > 2 && !P.stop.has(w));
  const t = it.text;
  const properNouns = [...(cfg.content['proper-nouns'] || []).map(String), ...(extras.properNouns ?? [])];
  const structural = ['title', 'button', 'tab'].includes(it.type);
  const typeName = TYPE_LABEL[it.type] ?? it.type;

  // X1 / X1b
  if (it.type === 'empty-value') add('X1b', 'dash used as an empty value', `${L.examples.emptyValue} (or leave the cell empty)`);
  else if (L.flagDashes && dashes(t).length) {
    add('X1', 'em or en dash in the text', t.replace(/\s*[—–]\s*(?!\d)/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*$/, ''), dashes(t)[0]);
  }

  // X2: compound title/tab/button.
  // Icon-only button: the aria-label is the right place for the object's name; not X2.
  if (structural && !it.from_aria_label && SEPARATOR.test(t)) {
    const parts = t.split(SEPARATOR).map((s) => s.trim()).filter(Boolean);
    const sep = t.match(SEPARATOR)[0].trim();
    const numeric = /^\d/.test(parts[1] || '') && /\d$/.test(parts[0] || '');
    if (parts.length >= 2 && !numeric) {
      if (it.type === 'button') add('X2', "compound button: the object's name goes in the accessible name, not in the text", `text "${parts[0]}"; aria-label "${parts[0]} ${parts.slice(1).join(' ')}"`, sep);
      else add('X2', `${typeName} made of two blocks joined by a separator`, parts[0], sep);
    }
  }

  // X3: helper text that repeats the title: almost nothing beyond its words, or the 1st sentence only rephrases it.
  if (it.type === 'helper' && it.title && words(t).length >= 3 && !/\d/.test(t)) {
    const tw = [...new Set(contentWords(it.title).map(stem))];
    const leftover = (txt) => [...new Set(contentWords(txt).map(stem))].filter((w) => !tw.includes(w)).length;
    const covers = (txt) => { const aw = new Set(contentWords(txt).map(stem)); return tw.length ? tw.filter((w) => aw.has(w)).length / tw.length : 0; };
    const firstSentence = t.split(/(?<=[.!?])\s+/)[0];
    const rest = t.slice(firstSentence.length).trim();
    if (tw.length && rest && covers(firstSentence) >= 0.6 && leftover(firstSentence) <= 2) {
      add('X3', `the first sentence repeats the title "${it.title}"`, rest);
    } else if (tw.length && covers(t) >= 0.6 && leftover(t) <= (tw.length >= 2 ? 3 : 1)) {
      add('X3', `helper text only repeats the title "${it.title}"`, 'remove it, or say what the title does not (consequence, deadline, who sees it)');
    }
  }

  // X4: empty opening.
  if (['helper', 'alert', 'tooltip', 'placeholder', 'title'].includes(it.type)) {
    const m = L.emptyOpenings.find((re) => re.test(t));
    if (m) add('X4', `empty opening ("${t.match(m)[0]}")`, 'start with what the person does or gets; cut the opening');
  }

  // X5: final punctuation.
  if (it.type === 'label' && /[:.]$/.test(t) && !/\.\.\.$|…$/.test(t)) add('X5', `label ends with "${t.at(-1)}"`, t.replace(/[:.]+$/, ''));
  if (structural && /[^.]\.$/.test(t) && !L.companyName.test(t)) add('X5', `${typeName} ends with a period`, t.replace(/\.$/, ''));

  // X6: long button, or no verb.
  if (it.type === 'button' && !it.from_aria_label && !L.companyName.test(t) && !['list-item', 'sort', 'chip', 'menu-item', 'toggle', 'composite'].includes(it.variant)) {
    const ws = words(t);
    if (ws.length > 4) add('X6', `button with ${ws.length} words (max. 4)`);
    else if (L.labelsWithoutVerb.includes(norm(t))) add('X6', `button "${t}" without an object`, `${t} <${L.examples.object}> (e.g. "${L.examples.buttonWithObject}")`);
    else if (cfg.content.buttons === 'verb-object' && ['contained', 'outlined', 'text'].includes(it.variant) && ws.length && !L.isVerb(ws[0])) {
      add('X6', 'button does not start with a verb', `verb + object (e.g. "${L.examples.verbObject}")`);
    }
  }

  // X7: redundant or long tooltip/aria-label.
  // A tooltip equal to the text on an element that truncates (noWrap/ellipsis, or text ≥ 30 characters) is the full text: does not count.
  const truncated = it.type === 'tooltip' && (it.truncatable || clean(it.visible || '').length >= 30);
  if ((it.type === 'tooltip' || it.type === 'accessible-name') && it.visible && !truncated && norm(it.visible) === norm(t)) {
    add('X7', `${it.type === 'tooltip' ? 'tooltip' : 'aria-label'} repeats the visible text`, `remove the ${it.type === 'tooltip' ? 'title' : 'aria-label'} attribute`);
  }
  if ((it.type === 'tooltip' || (it.type === 'accessible-name' && it.control && !it.visible)) && it.control && words(t).length > 12) {
    add('X7', `hint with ${words(t).length} words on a control (max. 12)`, 'move the explanation to visible helper text; keep only the action name in the hint');
  }

  // X8: placeholder that repeats the label.
  if (it.type === 'placeholder' && it.label) {
    const p = norm(t), r = norm(it.label);
    const rep = p === r || (r.length >= 3 && p.includes(r) && words(p).length <= words(r).length + 2);
    if (rep) add('X8', `placeholder repeats the label "${it.label}"`, 'remove it, or show an example of the expected format');
  }

  // X9: explanatory parenthesis.
  if ((structural || it.type === 'label')) {
    const m = t.match(/\(([^)]*)\)/);
    if (m && /\p{Ll}{3,}/u.test(m[1]) && !L.optionalMarker.test(m[1].trim())) {
      add('X9', `explanatory parenthesis in ${typeName} ("(${m[1]})")`, t.replace(/\s*\([^)]*\)/, '').trim(), m[1].trim());
    }
  }

  // X10: Title Case.
  const capitalized = structural ? titleCaseWords(t, properNouns, P) : null;
  if (capitalized) add('X10', `title case in ${typeName}`, toSentenceCase(t, properNouns), capitalized[0]);

  // X11: implementation term.
  const terms = extras.terms || termsFrom(cfg);
  for (const [term, re] of terms) {
    if (!re.test(t)) continue;
    if (/^ocr$/i.test(term) && L.ocrExplained.test(t)) continue;
    add('X11', `implementation term "${term}"`, "use the word from the person's domain", t.match(re)[0]);
    break;
  }
  return out;
}

/** Canonical glossary terms with a capital after the first letter become X10 proper nouns. */
export function glossaryProperNouns(glossary = []) {
  const terms = glossary.flatMap((g) => clean(g.term).replace(/\([^)]*\)/g, ' ').split(/\s+\/\s+/)).map(clean);
  return [...new Set(terms.filter((t) => t.length > 1 && /\p{Lu}/u.test(t.slice(1))))];
}

export function termsFrom(cfg) {
  const list = [...(cfg.content.forbidden || []).map(String), ...TECHNICAL_TERMS, 'OCR'];
  const seen = new Set();
  const out = [];
  for (const term of list) {
    const k = term.toLowerCase();
    if (!term || seen.has(k)) continue;
    seen.add(k);
    // Uppercase acronyms of 2–4 letters match only in uppercase (avoids "api" inside a common word).
    const caseSensitive = /^[A-Z]{2,4}$/.test(term);
    out.push([term, new RegExp(`(?<![\\p{L}\\p{N}_])${escRe(term)}(?![\\p{L}\\p{N}_])`, caseSensitive ? 'u' : 'iu')]);
  }
  out.push(['2xx', /(?<![\p{L}\p{N}])[1-5]xx(?![\p{L}\p{N}])|\bHTTP\s?\d{3}\b/iu]);
  return out;
}

/** Inventory + findings of one screen. */
export function analyzeText(html, cfg = configFrom({}), file = 'tela.html', { properNouns = [] } = {}) {
  const terms = termsFrom(cfg);
  const inventory = takeInventory(html, cfg);
  const findings = [];
  for (const it of inventory) {
    for (const a of rulesForItem(it, cfg, { terms, properNouns })) {
      findings.push({ ...a, type: it.type, text: it.text, evidence: `${file}:${it.line}:${it.col}` });
    }
  }
  return { file, inventory: inventory.map(({ node, ...r }) => r), findings };
}

// ---------- source in the code ----------

const EXTS = /\.(tsx?|jsx?|mjs|cjs|py|json)$/;
const SKIP_DIRS = /^(node_modules|dist|build|coverage|\.git|__pycache__|\.venv|venv|\.next|\.turbo)$/;
const TEST_PATH = /(^|[/\\])(tests?|__tests__|__mocks__|fixtures?|mocks?)([/\\]|$)|\.(test|spec)\.[a-z]+$/;

/** Reads the sources and normalizes them (escapes decoded, whitespace collapsed, lowercase), keeping the line map. */
export function indexCode(folders) {
  const files = [];
  const rec = (p) => {
    let st;
    try { st = statSync(p); } catch { return; }
    if (st.isDirectory()) {
      if (SKIP_DIRS.test(basename(p))) return;
      for (const f of readdirSync(p).sort()) rec(join(p, f));
    } else if (EXTS.test(p) && st.size < 2_000_000) files.push(indexSource(p, readFileSync(p, 'utf8')));
  };
  for (const p of folders) rec(p);
  return files;
}

/**
 * Blanks out comments (and Python docstrings) with spaces, keeping line breaks:
 * text in a comment is not interface text and would mislead the source lookup.
 */
export function stripComments(src, py = false) {
  const out = src.split('');
  const n = src.length;
  const blank = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '; };
  const TRIPLE_QUOTES = ['"'.repeat(3), "'".repeat(3)];
  let i = 0;
  while (i < n) {
    const c = src[i];
    const triple = py ? TRIPLE_QUOTES.find((q) => src.startsWith(q, i)) : null;
    if (triple) {
      const end = src.indexOf(triple, i + 3);
      const e = end === -1 ? n : end + 3;
      const lineStart = src.lastIndexOf('\n', i - 1) + 1;
      if (/^\s*$/.test(src.slice(lineStart, i))) blank(i, e); // docstring: abre a linha
      i = e;
      continue;
    }
    if (c === '"' || c === "'" || (c === '`' && !py)) {
      let k = i + 1;
      while (k < n && src[k] !== c) {
        if (src[k] === '\\') k++;
        else if (src[k] === '\n' && c !== '`') break;
        k++;
      }
      i = k + 1;
      continue;
    }
    if (py ? c === '#' : c === '/' && src[i + 1] === '/') {
      const e = src.indexOf('\n', i);
      blank(i, e === -1 ? n : e);
      i = e === -1 ? n : e;
      continue;
    }
    if (!py && c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const e = end === -1 ? n : end + 2;
      blank(i, e);
      i = e;
      continue;
    }
    i++;
  }
  return out.join('');
}

export function indexSource(file, src) {
  const stripped = /\.json$/.test(file) ? src : stripComments(src, /\.py$/.test(file));
  const pre = decodeEntities(
    stripped
      .replace(/\\u\{?([0-9a-fA-F]{4,5})\}?/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/\\(['"`])/g, '$1')
      .replace(/\{\s*(['"])\s\1\s*\}/g, ' '),
  );
  let out = '';
  const lineStarts = [0];
  let last = 0;
  const re = /\s+/g;
  let m;
  while ((m = re.exec(pre))) {
    out += pre.slice(last, m.index) + ' ';
    const nl = (m[0].match(/\n/g) || []).length;
    for (let i = 0; i < nl; i++) lineStarts.push(out.length);
    last = re.lastIndex;
  }
  out += pre.slice(last);
  const lower = out.toLowerCase();
  return { file, text: lower.length === out.length ? lower : out, original: out, lineStarts, test: TEST_PATH.test(file) };
}

function lineAt(lineStarts, pos) {
  let lo = 0, hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= pos) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

const LETTER = /[\p{L}\p{N}]/u;
const DELIM = /["'`<>]/;
/**
 * The literal (string, template or JSX text) around the snippet, up to the nearest delimiter (at most
 * 80 characters), with 12 of slack beyond it: catches `${t("x", "Label")} — ${name}` without reaching the next line.
 */
function sameLiteral(txt, pos, end) {
  let a = pos, b = end;
  while (a > 0 && pos - a < 80 && !DELIM.test(txt[a - 1])) a--;
  while (b < txt.length && b - end < 80 && !DELIM.test(txt[b])) b++;
  return txt.slice(Math.max(0, a - 12), b + 12);
}
function search(index, needle, minLength = 4) {
  const hits = [];
  if (needle.length < minLength) return hits;
  for (const f of index) {
    let i = f.text.indexOf(needle);
    while (i !== -1) {
      const before = f.text[i - 1] || ' ', after = f.text[i + needle.length] || ' ';
      if ((!LETTER.test(before) || !LETTER.test(needle[0])) && (!LETTER.test(after) || !LETTER.test(needle.at(-1)))) {
        const literal = (/['"`>]/.test(before) ? 0.5 : 0) + (/['"`<$]/.test(after) ? 0.5 : 0);
        hits.push({ f, pos: i, end: i + needle.length, line: lineAt(f.lineStarts, i), literal });
      }
      i = f.text.indexOf(needle, i + needle.length);
    }
  }
  return hits;
}

/**
 * Candidate snippets (original case): the whole text, then the pieces between dynamic parts
 * (numbers, dates, e-mails, quotes, separators), in order of appearance.
 */
export function snippets(text) {
  const t = clean(text);
  if (/^[—–-]$/.test(t)) return [`'${t}'`, `"${t}"`, `\`${t}\``, `>${t}<`];
  const out = [t];
  const dynamic = /\S+@\S+|R\$\s?[\d.,]+|\d+[\d.,/:hº°ª%-]*|["“”«»'‘’][^"“”«»'‘’]*["“”«»'‘’]|\s[—–|·×]\s|\s-\s|[:;()?!]/g;
  const parts = t.split(dynamic).map((s) => s.trim().replace(/^[,.\s—–-]+|[,.\s—–-]+$/g, '')).filter((s) => s.length >= 5 || words(s).length >= 2);
  for (const p of parts) if (!out.includes(p)) out.push(p);
  // Last, windows from the start and the end (the fixed text of a template usually opens the sentence).
  const ws = t.split(' ');
  const windows = ws.length > 6 ? [ws.slice(0, 5), ws.slice(-5)] : ws.length >= 3 ? [ws.slice(0, 3), ws.slice(0, 2)] : [];
  for (const j of windows.map((x) => x.join(' ').replace(/[,.;:]+$/, ''))) if (j.length >= 5 && !out.includes(j)) out.push(j);
  return out;
}

/**
 * Where the text is born. First the whole text as is; if absent, each snippet, and the occurrence with the
 * most evidence wins: other snippets of the text nearby, the flagged `piece` attached to it, same case,
 * looks like a literal, being the first snippet (the fixed part of a template) and not being a test.
 * Returns { snippet, total, location: 'code' | 'data', occurrences: [{ file, line, test? }] } or null.
 * `location: 'data'` = only appears in tests/fixtures, or the flagged piece is not next to the snippet (it was interpolated).
 */
export function sourceOf(index, text, piece = null, max = 5) {
  const cands = snippets(text);
  const lowered = cands.map((c) => c.toLowerCase());
  const minLength = cands[0].length <= 4 && /^['"`>]/.test(cands[0]) ? 3 : 4;
  const score = (h, ci) => {
    const near = sameLiteral(h.f.original, h.pos, h.end);
    const far = h.f.text.slice(Math.max(0, h.pos - 200), h.end + 200);
    const hasPiece = !piece || ci === 0 || near.includes(piece);
    const sameCase = h.f.original.slice(h.pos, h.end) === cands[ci] ? 1 : 0;
    const neighbors = lowered.filter((c, k) => k > 0 && k !== ci && far.includes(c)).length;
    const points = (ci === 0 ? 10 : 0) + neighbors + (hasPiece ? 2 : 0) + sameCase + h.literal + (ci === 1 ? 0.75 : 0) + Math.min(cands[ci].length, 40) / 40 - (h.f.test ? 20 : 0);
    return { ...h, ci, hasPiece, points };
  };
  let all = search(index, lowered[0], minLength).map((h) => score(h, 0));
  if (!all.length) {
    for (let ci = 1; ci < cands.length; ci++) all.push(...search(index, lowered[ci], minLength).slice(0, 400).map((h) => score(h, ci)));
  }
  if (!all.length) return null;
  all.sort((a, b) => b.points - a.points || a.f.file.localeCompare(b.f.file) || a.line - b.line);
  const top = all[0];
  const location = top.f.test || !top.hasPiece ? 'data' : 'code';
  const seen = new Set();
  const occurrences = [];
  for (const h of all.filter((x) => x.ci === top.ci)) {
    const k = `${h.f.file}:${h.line}`;
    if (seen.has(k)) continue;
    seen.add(k);
    occurrences.push({ file: h.f.file, line: h.line, ...(h.f.test ? { test: true } : {}) });
  }
  return { snippet: cands[top.ci], total: occurrences.length, location, occurrences: occurrences.slice(0, max) };
}

// ---------- aggregation ----------

export function group(results, index = null) {
  const groups = new Map();
  for (const r of results) for (const a of r.findings) {
    const k = `${a.rule}|${a.text}`;
    if (!groups.has(k)) groups.set(k, { rule: a.rule, severity: a.severity, text: a.text, message: a.message, suggestion: a.suggestion, piece: a.piece, types: new Set(), screens: new Set(), evidence: [] });
    const g = groups.get(k);
    g.types.add(a.type);
    g.screens.add(basename(r.file));
    g.evidence.push(a.evidence);
  }
  const cache = new Map();
  let list = [...groups.values()].map(({ piece, ...g }) => {
    const out = { ...g, types: [...g.types], screens: [...g.screens], occurrences: g.evidence.length };
    if (index) {
      const k = `${g.text}|${piece || ''}`;
      if (!cache.has(k)) cache.set(k, sourceOf(index, g.text, piece));
      out.source = cache.get(k);
      // No source in the code, or the flagged piece comes from outside the source line: it is data, not interface text.
      if (!out.source || out.source.location === 'data') {
        out.probable_data = true;
        out.original_severity = out.severity;
        out.severity = 0;
      }
    }
    return out;
  });
  if (index) list = mergeBySource(list);
  return list.sort((a, b) => b.severity - a.severity || b.screens.length - a.screens.length || a.rule.localeCompare(b.rule, 'pt', { numeric: true }) || a.text.localeCompare(b.text));
}

/** Same rule born on the same line (template with interpolated data) = one finding, with its variants. */
function mergeBySource(list) {
  const out = [];
  const byLine = new Map();
  for (const g of list) {
    const o = g.source?.occurrences?.[0];
    const template = o && g.source.snippet !== clean(g.text);
    if (!template) { out.push(g); continue; }
    const k = `${g.rule}|${o.file}:${o.line}|${g.source.snippet}|${!!g.probable_data}`;
    const existing = byLine.get(k);
    if (!existing) { byLine.set(k, g); out.push(g); continue; }
    existing.variants = [...(existing.variants || [existing.text]), g.text];
    existing.screens = [...new Set([...existing.screens, ...g.screens])];
    existing.types = [...new Set([...existing.types, ...g.types])];
    existing.evidence.push(...g.evidence);
    existing.occurrences += g.occurrences;
  }
  return out;
}

/** Most problematic texts: sum of severity × screens across all rules. */
export function ranking(groups, n = 10) {
  const byText = new Map();
  for (const g of groups) {
    if (!byText.has(g.text)) byText.set(g.text, { text: g.text, points: 0, rules: [], screens: new Set(), types: new Set(), source: g.source });
    const t = byText.get(g.text);
    t.points += g.severity * g.screens.length;
    t.rules.push(g.rule);
    g.screens.forEach((x) => t.screens.add(x));
    g.types.forEach((x) => t.types.add(x));
  }
  return [...byText.values()].map((t) => ({ ...t, screens: [...t.screens], types: [...t.types] }))
    .sort((a, b) => b.points - a.points || a.text.localeCompare(b.text)).slice(0, n);
}

export function summarize(results, groups) {
  const inventoryByType = {}, byType = {}, byRule = {};
  for (const r of results) {
    for (const i of r.inventory) inventoryByType[i.type] = (inventoryByType[i.type] || 0) + 1;
    for (const a of r.findings) byType[a.type] = (byType[a.type] || 0) + 1;
  }
  for (const g of groups) {
    const r = (byRule[g.rule] ||= { findings: 0, occurrences: 0, probable_data: 0 });
    if (g.probable_data) r.probable_data++;
    else { r.findings++; r.occurrences += g.occurrences; }
  }
  const uiFindings = groups.filter((g) => !g.probable_data);
  return {
    screens: results.length,
    texts: Object.values(inventoryByType).reduce((s, n) => s + n, 0),
    inventory_by_type: inventoryByType, by_type: byType, by_rule: byRule,
    findings: uiFindings.length,
    occurrences: uiFindings.reduce((s, g) => s + g.occurrences, 0),
    probable_data: groups.length - uiFindings.length,
  };
}

// ---------- CLI ----------

/** Parses the arguments; old flags (--telas, --codigo, --ignorar) become the new ones with a warning (tools/lib/legacy-cli.mjs). */
export function parseTextArgs(argv, warn) {
  argv = normalizeArgv('ux-lint/text.mjs', argv, warn);
  const out = { screens: [], code: [], ignore: [], ux: null, module: null, json: false };
  let current = 'screens';
  for (const a of argv) {
    if (a === '--json') { out.json = true; continue; }
    if (a.startsWith('--')) { current = a.slice(2); if (!(current in out)) throw new Error(`unknown option: ${a}`); continue; }
    if (current === 'ux') { out.ux = a; current = 'screens'; continue; }
    if (current === 'module') { out.module = a; current = 'screens'; continue; }
    out[current].push(a);
  }
  return out;
}

function listHtml(inputs, ignore) {
  const out = [];
  for (const e of inputs) {
    if (statSync(e).isDirectory()) { for (const f of readdirSync(e).sort()) if (f.endsWith('.html')) out.push(join(e, f)); }
    else out.push(e);
  }
  return out.filter((f) => !ignore.includes(basename(f)));
}

const short = (p) => { const r = relative(process.cwd(), p); return r && !r.startsWith('..') && !isAbsolute(r) ? r : p; };

function main() {
  let args;
  try { args = parseTextArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  if (!args.screens.length) {
    console.error('Usage: node tools/ux-lint/text.mjs --screens <folder-or-html...> [--code <folders...>] [--ux UX.md] [--module <m>] [--ignore <names...>] [--json]');
    process.exit(2);
  }
  const cfg = loadConfig(args.ux);
  const properNouns = glossaryProperNouns(loadGlossary(cfg, args.ux, args.module));
  const glossaryKey = glossarySource(cfg.content?.glossary, args.module).module;
  const results = listHtml(args.screens, args.ignore).map((f) => analyzeText(readFileSync(f, 'utf8'), cfg, f, { properNouns }));
  const index = args.code.length ? indexCode(args.code) : null;
  const groups = group(results, index);
  const summary = { ...summarize(results, groups), glossary_proper_nouns: properNouns.length, ...(glossaryKey ? { glossary_module: glossaryKey } : {}) };
  const top = ranking(groups);
  if (args.json) {
    console.log(JSON.stringify({ summary, ranking: top, findings: groups, screens: results, ...(cfg.legacyWarnings.length ? { warnings: cfg.legacyWarnings } : {}) }, null, 2));
    return;
  }
  console.log(`Text hygiene: ${summary.screens} screens, ${summary.texts} texts, ${summary.findings} findings (${summary.occurrences} occurrences)${index ? `; ${summary.probable_data} set aside as probable data` : ''}\n`);
  console.log(`By rule (findings / occurrences${index ? ' / probable data' : ''}):`);
  for (const r of Object.keys(SEVERITY)) {
    const x = summary.by_rule[r];
    if (x) console.log(`  ${r.padEnd(4)} sev ${SEVERITY[r]}  ${String(x.findings).padStart(4)} / ${String(x.occurrences).padStart(4)}${index ? ` / ${x.probable_data}` : ''}`);
  }
  console.log('\nBy element type (texts inventoried / occurrences with a finding, before the data filter):');
  for (const t of TYPES) if (summary.inventory_by_type[t]) console.log(`  ${t.padEnd(16)} ${String(summary.inventory_by_type[t]).padStart(5)} / ${summary.by_type[t] || 0}`);
  const source = (o) => (o ? `${o.occurrences.map((x) => `${short(x.file)}:${x.line}${x.test ? ' (test)' : ''}`).join(', ')}${o.total > o.occurrences.length ? ` (+${o.total - o.occurrences.length})` : ''}` : 'not found in the code');
  console.log('\nMost problematic texts:');
  for (const t of top) console.log(`  ${String(t.points).padStart(3)}  "${t.text.slice(0, 90)}" [${[...new Set(t.rules)].join(' ')}] ${t.screens.length} screen(s)${index ? `\n       ${source(t.source)}` : ''}`);
  console.log('\nFindings:');
  for (const g of groups.filter((x) => !x.probable_data)) {
    console.log(`\n${g.rule} sev ${g.severity} | ${g.types.join(', ')} | "${g.text.slice(0, 120)}"${g.variants ? ` (+${g.variants.length - 1} variants of the same template)` : ''}`);
    console.log(`   ${g.message}${g.suggestion ? `\n   suggestion: ${g.suggestion}` : ''}`);
    console.log(`   screens (${g.screens.length}): ${g.screens.slice(0, 8).join(', ')}${g.screens.length > 8 ? ', …' : ''}`);
    if (index) console.log(`   source${g.source && g.source.snippet !== clean(g.text) ? ` (snippet "${g.source.snippet}")` : ''}: ${source(g.source)}`);
  }
  const dataGroups = groups.filter((x) => x.probable_data);
  if (dataGroups.length) {
    console.log(`\nProbable data (the flagged piece is not in the code; not interface text): ${dataGroups.length}`);
    for (const g of dataGroups) console.log(`   ${g.rule} "${g.text.slice(0, 90)}"${g.variants ? ` (+${g.variants.length - 1})` : ''}${g.source ? ` · template in ${short(g.source.occurrences[0].file)}:${g.source.occurrences[0].line}` : ''}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
