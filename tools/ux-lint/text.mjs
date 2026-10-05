#!/usr/bin/env node
// ux-lint, nível texto: higiene do texto de interface nas capturas HTML. Procura as marcas que fazem
// um texto parecer gerado por IA ou burocrático (travessão, título composto, descrição que repete o
// título, abertura vazia, caixa de título, termo técnico...) e textos desnecessários. Não julga
// arquitetura de tela (isso é o screen.mjs). Catálogo: knowledge/fundamentos/marcas-de-texto-gerado.md.
// Sem dependências.
//
// Uso: node tools/ux-lint/text.mjs --screens <pasta-ou-html...> [--code <pastas...>] [--ux UX.md]
//                                  [--module <m>] [--ignore <nomes...>] [--json]
// --module escolhe o glossário do módulo (`content.glossary` por módulo): os termos canônicos com maiúscula no
// meio ("Nota Fiscal", "Ordem de Compra") valem como nomes próprios no X10, junto de `content.proper-nouns`.
// --code procura cada texto apontado nas fontes (.ts/.tsx/.js/.jsx/.mjs/.py/.json) e devolve
// arquivo:linha, para corrigir onde o texto nasce.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, configFrom } from './lib/config.mjs';
import { loadGlossary, glossarySource } from './lib/glossary.mjs';
import { normalizeArgv } from '../lib/legacy-cli.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, getById, walk, contains, decodeEntities } from './lib/html.mjs';

export const SEVERITY = { X1: 2, X1b: 1, X2: 2, X3: 1, X4: 2, X5: 1, X6: 1, X7: 1, X8: 1, X9: 1, X10: 1, X11: 2 };
export const TYPES = ['title', 'button', 'tab', 'label', 'placeholder', 'helper', 'alert', 'accessible-name', 'tooltip', 'empty-value'];
/** Nome do tipo de elemento nas mensagens (as mensagens continuam em pt-BR). */
export const TYPE_LABEL = {
  title: 'título', button: 'botão', tab: 'aba', label: 'rótulo', placeholder: 'placeholder', helper: 'texto de apoio', alert: 'alerta',
  'accessible-name': 'nome acessível', tooltip: 'tooltip', 'empty-value': 'valor vazio',
};
export const LABELS_WITHOUT_VERB = ['ok', 'sim', 'não', 'nao', 'confirmar', 'enviar'];
export const TECHNICAL_TERMS = ['sha256', 'sha-256', 'hash', 'id', 'token', 'payload', 'SES', 'API', 'JSON', 'endpoint', 'webhook', 'UUID'];
const EMPTY_OPENINGS = [
  /^aqui (você|voce) (pode|encontra|vê|ve)\b/i,
  /^nest[ae] (tela|seção|secao|página|pagina|área|area|aba)\b/i,
  /^est[ae] (página|pagina|tela|seção|secao|área|area)\b/i,
  /^use (este|esta|estes|estas|o|a)\b.*\bpara\b/i,
  /^veja abaixo\b/i,
  /^clique aqui\b/i,
  /^abaixo (você|voce|estão|estao|está|esta)\b/i,
];
const STOP_WORDS = new Set('de da do das dos e a o as os em no na nos nas para pra por com sem ao aos à às um uma uns umas ou que se seu sua seus suas este esta esse essa isso aqui já mais deste desta neste nesta desse dessa nesse nessa'.split(' '));
const COMPANY_NAME = /\b(ltda|s\.?\s?a\.?|s\/a|eireli|me|epp)\b\.?/i;

const ZW = /[​-‍﻿]/g;
const clean = (s) => (s || '').replace(ZW, '').replace(/\s+/g, ' ').trim();
const norm = (s) => clean(s).toLowerCase().replace(/[.!?:…]+$/, '').trim();
const words = (s) => clean(s).split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const stem = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 5);
const contentWords = (s) => words(s).map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

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
/** Texto visível com espaço em toda fronteira de elemento (o textOf cola "Título" + "Chip" em "TítuloChip"). */
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
/** Blocos de texto distintos dentro de um controle (cartão clicável = título + resumo + chip). */
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
 * Inventário de textos de uma tela. Com diálogo aberto, só o diálogo.
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

  // Títulos (inclui título de diálogo e resumo de acordeão, que também é botão: conta como título).
  const headings = querySelectorAll(root, 'h1, h2, h3, h4, h5, h6, [role=heading], .MuiDialogTitle-root, .MuiAccordionSummary-root');
  for (const h of headings) {
    const variant = is(h, '.MuiAccordionSummary-root') ? 'accordion' : is(h, '.MuiDialogTitle-root') || closest(h, sel.dialog) ? 'dialog' : h.tag;
    // Chip de status dentro do título (ex.: "Preenchidos") é selo, não título.
    const pieces = variant === 'accordion' ? piecesOf(h) : [];
    add(h, 'title', pieces.length >= 2 ? visibleText(pieces[0], '.MuiChip-root') : visibleText(h, '.MuiChip-root'), { variant });
  }
  // Abas.
  for (const t of querySelectorAll(root, '.MuiTab-root, [role=tab]')) add(t, 'tab', visibleText(t) || t.attrs['aria-label']);
  // Botões (texto visível ou aria-label), fora abas e resumo de acordeão.
  for (const b of querySelectorAll(root, 'button, [role=button], a.MuiButton-root, [role=menuitem]')) {
    if (is(b, '.MuiTab-root, [role=tab], .MuiAccordionSummary-root') || b.attrs.role === 'combobox') continue;
    const visible = visibleText(b);
    const pieces = visible ? piecesOf(b) : [];
    if (pieces.length >= 2) add(b, 'button', visibleText(pieces[0]) || visible, { variant: 'composite', full: visible });
    else add(b, 'button', visible || b.attrs['aria-label'] || b.attrs.title, { variant: buttonVariant(b), from_aria_label: !visible });
  }
  // Rótulos.
  for (const l of querySelectorAll(root, 'label, legend')) add(l, 'label', withoutAsterisk(visibleText(l)));
  // Placeholders.
  for (const f of querySelectorAll(root, 'input[placeholder], textarea[placeholder]')) {
    add(f, 'placeholder', f.attrs.placeholder, { label: withoutAsterisk(fieldLabel(root, f)) });
  }
  // Texto de apoio: ajuda de campo, legendas e o parágrafo curto logo depois de um título.
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
  // Alertas.
  for (const a of querySelectorAll(root, '.MuiAlert-message')) add(a, 'alert', visibleText(a));
  // Nome acessível (aria-label). Botão sem texto visível já entrou como botão pelo próprio aria-label.
  for (const n of querySelectorAll(root, '[aria-label]')) {
    const visible = visibleText(n);
    const alreadyButton = (byNode.get(n) || []).some((i) => i.type === 'button' && i.from_aria_label);
    if (alreadyButton) continue;
    const control = is(n, 'button, [role=button], a, [role=tab], [role=menuitem]');
    add(n, 'accessible-name', n.attrs['aria-label'], { visible, control });
  }
  // Tooltip (atributo title).
  for (const n of querySelectorAll(root, '[title]')) {
    if (/^(html|head|link|style|meta|iframe|abbr)$/.test(n.tag)) continue;
    const control = is(n, 'button, [role=button], a, [role=tab], input, select, textarea') || !!closest(n, 'button, [role=button]');
    const truncatable = /MuiTypography-noWrap|ellipsis/.test(`${n.attrs.class || ''} ${n.attrs.style || ''}`) || querySelectorAll(n, '.MuiTypography-noWrap').length > 0;
    add(n, 'tooltip', n.attrs.title, { visible: visibleText(n), control, truncatable });
  }
  // Valor vazio: travessão sozinho em célula ou em texto de valor.
  for (const n of walk(root)) {
    if (n.type !== 'element' || !n.children.length || !n.children.every((c) => c.type === 'text')) continue;
    const t = clean(n.children.map((c) => c.text).join(''));
    if (/^[—–-]$/.test(t)) add(closest(n, 'td, th') || n, 'empty-value', t);
  }

  // Composto × específico: o mesmo texto contado em dois elementos aninhados conta uma vez — como título
  // quando um deles é título (acordeão, disclosure); senão, no descendente, que é o mais específico.
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
  // Mesmo nó, mesmo tipo, mesmo texto (ex.: diálogo h2 + .MuiDialogTitle-root): uma vez.
  const seen = new Set();
  return items.filter((i) => {
    if (excluded.has(i)) return false;
    const k = `${i.type}|${i.line}:${i.col}|${i.text}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------- regras ----------

const isAcronym = (w) => /^[A-ZÀ-Ý0-9]{2,}[A-ZÀ-Ý0-9-]*s?$/.test(w.replace(/[^\p{L}\p{N}-]/gu, ''));
const looksLikeVerb = (w) => {
  const x = w.toLowerCase().replace(/[^\p{L}-]/gu, '');
  return /(ar|er|ir|or|ôr)(-se)?$/.test(x);
};

function titleCaseWords(text, properNouns) {
  if (COMPANY_NAME.test(text)) return null;
  let t = text;
  for (const n of properNouns) t = t.replace(new RegExp(escRe(n), 'gi'), ' ');
  const ws = t.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')).filter(Boolean);
  const rest = ws.slice(1).filter((w) => /^\p{L}/u.test(w) && w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()) && !isAcronym(w));
  return rest.length > 0 && rest.every((w) => /^\p{Lu}/u.test(w) && /\p{Ll}/u.test(w)) ? rest : null;
}

const toSentenceCase = (text, properNouns) => {
  const ws = text.split(' ');
  return ws.map((w, i) => (i === 0 || isAcronym(w) || properNouns.some((n) => n.toLowerCase() === w.toLowerCase()) ? w : w.toLowerCase())).join(' ');
};

function dashes(text) {
  // Meia-risca entre números/datas (1–8, 2024–2026, 10/09–12/09) não conta.
  return text.replace(/(\d)\s?–\s?(?=\d)/g, '$1~').match(/[—–]/g) || [];
}

const SEPARATOR = /\s[—–|·]\s|\s-\s|:\s/;

/** Aplica X1–X11 a um item do inventário. Devolve [{ regra, severidade, mensagem, sugestao? }]. */
export function rulesForItem(it, cfg = configFrom({}), extras = {}) {
  const out = [];
  // `piece`: o pedaço que a regra acusa; com --code, se ele não está na linha de origem, veio do dado.
  const add = (rule, message, suggestion, piece) => out.push({ rule, severity: SEVERITY[rule], message, ...(suggestion ? { suggestion } : {}), ...(piece ? { piece } : {}) });
  const t = it.text;
  const properNouns = [...(cfg.content['proper-nouns'] || []).map(String), ...(extras.properNouns ?? [])];
  const structural = ['title', 'button', 'tab'].includes(it.type);

  // X1 / X1b
  if (it.type === 'empty-value') add('X1b', 'travessão no lugar de valor vazio', 'Não informado (ou deixe a célula vazia)');
  else if (dashes(t).length) {
    add('X1', 'travessão ou meia-risca no texto', t.replace(/\s*[—–]\s*(?!\d)/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*$/, ''), dashes(t)[0]);
  }

  // X2 — título/aba/botão composto.
  // Botão só com ícone: o aria-label é o lugar certo do nome do objeto; não é X2.
  if (structural && !it.from_aria_label && SEPARATOR.test(t)) {
    const parts = t.split(SEPARATOR).map((s) => s.trim()).filter(Boolean);
    const sep = t.match(SEPARATOR)[0].trim();
    const numeric = /^\d/.test(parts[1] || '') && /\d$/.test(parts[0] || '');
    if (parts.length >= 2 && !numeric) {
      if (it.type === 'button') add('X2', 'botão composto: o nome do objeto vai no nome acessível, não no texto', `texto "${parts[0]}"; aria-label "${parts[0]} ${parts.slice(1).join(' ')}"`, sep);
      else add('X2', `${TYPE_LABEL[it.type] ?? it.type} composto por dois blocos unidos por separador`, parts[0], sep);
    }
  }

  // X3 — descrição que repete o título: quase nada além das palavras dele, ou a 1ª frase só o reformula.
  if (it.type === 'helper' && it.title && words(t).length >= 3 && !/\d/.test(t)) {
    const tw = [...new Set(contentWords(it.title).map(stem))];
    const leftover = (txt) => [...new Set(contentWords(txt).map(stem))].filter((w) => !tw.includes(w)).length;
    const covers = (txt) => { const aw = new Set(contentWords(txt).map(stem)); return tw.length ? tw.filter((w) => aw.has(w)).length / tw.length : 0; };
    const firstSentence = t.split(/(?<=[.!?])\s+/)[0];
    const rest = t.slice(firstSentence.length).trim();
    if (tw.length && rest && covers(firstSentence) >= 0.6 && leftover(firstSentence) <= 2) {
      add('X3', `a primeira frase repete o título "${it.title}"`, rest);
    } else if (tw.length && covers(t) >= 0.6 && leftover(t) <= (tw.length >= 2 ? 3 : 1)) {
      add('X3', `texto de apoio só repete o título "${it.title}"`, 'remova, ou diga o que o título não diz (consequência, prazo, quem vê)');
    }
  }

  // X4 — abertura vazia.
  if (['helper', 'alert', 'tooltip', 'placeholder', 'title'].includes(it.type)) {
    const m = EMPTY_OPENINGS.find((re) => re.test(t));
    if (m) add('X4', `abertura vazia ("${t.match(m)[0]}")`, 'comece pelo que a pessoa faz ou ganha; corte a abertura');
  }

  // X5 — pontuação final.
  if (it.type === 'label' && /[:.]$/.test(t) && !/\.\.\.$|…$/.test(t)) add('X5', `rótulo termina com "${t.at(-1)}"`, t.replace(/[:.]+$/, ''));
  if (structural && /[^.]\.$/.test(t) && !COMPANY_NAME.test(t)) add('X5', `${TYPE_LABEL[it.type] ?? it.type} termina com ponto final`, t.replace(/\.$/, ''));

  // X6 — botão longo ou sem verbo.
  if (it.type === 'button' && !it.from_aria_label && !COMPANY_NAME.test(t) && !['list-item', 'sort', 'chip', 'menu-item', 'toggle', 'composite'].includes(it.variant)) {
    const ws = words(t);
    if (ws.length > 4) add('X6', `botão com ${ws.length} palavras (máx. 4)`);
    else if (LABELS_WITHOUT_VERB.includes(norm(t))) add('X6', `botão "${t}" sem objeto`, `${t} <objeto> (ex.: "Enviar pedido")`);
    else if (cfg.content.buttons === 'verb-object' && ['contained', 'outlined', 'text'].includes(it.variant) && ws.length && !looksLikeVerb(ws[0])) {
      add('X6', 'botão não começa por verbo', 'verbo no infinitivo + objeto (ex.: "Criar pedido")');
    }
  }

  // X7 — tooltip/aria-label redundante ou longo.
  // Tooltip igual ao texto num elemento que trunca (noWrap/ellipsis, ou texto ≥ 30 caracteres) é o texto inteiro: não conta.
  const truncated = it.type === 'tooltip' && (it.truncatable || clean(it.visible || '').length >= 30);
  if ((it.type === 'tooltip' || it.type === 'accessible-name') && it.visible && !truncated && norm(it.visible) === norm(t)) {
    add('X7', `${it.type === 'tooltip' ? 'tooltip' : 'aria-label'} repete o texto visível`, `remova o atributo ${it.type === 'tooltip' ? 'title' : 'aria-label'}`);
  }
  if ((it.type === 'tooltip' || (it.type === 'accessible-name' && it.control && !it.visible)) && it.control && words(t).length > 12) {
    add('X7', `dica com ${words(t).length} palavras num controle (máx. 12)`, 'leve a explicação para texto de apoio visível; deixe na dica só o nome da ação');
  }

  // X8 — placeholder que repete o rótulo.
  if (it.type === 'placeholder' && it.label) {
    const p = norm(t), r = norm(it.label);
    const rep = p === r || (r.length >= 3 && p.includes(r) && words(p).length <= words(r).length + 2);
    if (rep) add('X8', `placeholder repete o rótulo "${it.label}"`, 'remova, ou mostre um exemplo do formato esperado');
  }

  // X9 — parêntese explicativo.
  if ((structural || it.type === 'label')) {
    const m = t.match(/\(([^)]*)\)/);
    if (m && /\p{Ll}{3,}/u.test(m[1]) && !/^(opcional|obrigatório|obrigatorio)$/i.test(m[1].trim())) {
      add('X9', `parêntese explicativo em ${TYPE_LABEL[it.type] ?? it.type} ("(${m[1]})")`, t.replace(/\s*\([^)]*\)/, '').trim(), m[1].trim());
    }
  }

  // X10 — Caixa De Título.
  const capitalized = structural ? titleCaseWords(t, properNouns) : null;
  if (capitalized) add('X10', `caixa de título em ${TYPE_LABEL[it.type] ?? it.type}`, toSentenceCase(t, properNouns), capitalized[0]);

  // X11 — termo de implementação.
  const terms = extras.terms || termsFrom(cfg);
  for (const [term, re] of terms) {
    if (!re.test(t)) continue;
    if (/^ocr$/i.test(term) && /reconhec/i.test(t)) continue;
    add('X11', `termo de implementação "${term}"`, 'troque pela palavra do domínio da pessoa', t.match(re)[0]);
    break;
  }
  return out;
}

/** Termos canônicos do glossário com maiúscula depois da primeira letra viram nomes próprios do X10. */
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
    // Siglas de 2–4 letras em maiúsculas casam só em maiúsculas (evita "api" dentro de palavra comum).
    const caseSensitive = /^[A-Z]{2,4}$/.test(term);
    out.push([term, new RegExp(`(?<![\\p{L}\\p{N}_])${escRe(term)}(?![\\p{L}\\p{N}_])`, caseSensitive ? 'u' : 'iu')]);
  }
  out.push(['2xx', /(?<![\p{L}\p{N}])[1-5]xx(?![\p{L}\p{N}])|\bHTTP\s?\d{3}\b/iu]);
  return out;
}

/** Inventário + achados de uma tela. */
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

// ---------- origem no código ----------

const EXTS = /\.(tsx?|jsx?|mjs|cjs|py|json)$/;
const SKIP_DIRS = /^(node_modules|dist|build|coverage|\.git|__pycache__|\.venv|venv|\.next|\.turbo)$/;
const TEST_PATH = /(^|[/\\])(tests?|__tests__|__mocks__|fixtures?|mocks?)([/\\]|$)|\.(test|spec)\.[a-z]+$/;

/** Lê as fontes e normaliza (escapes decodificados, espaços colapsados, minúsculas) guardando o mapa de linhas. */
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
 * Apaga comentários (e docstrings, em Python) trocando por espaços, sem mexer nas quebras de linha:
 * texto em comentário não é texto da interface e confundiria a origem.
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
 * O literal (string, template ou texto JSX) em volta do trecho, até o delimitador mais próximo (no máximo
 * 80 caracteres), com folga de 12 além dele: pega `${t("x", "Rótulo")} — ${nome}` sem alcançar a linha vizinha.
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
 * Trechos candidatos (na caixa original): o texto inteiro, depois os pedaços entre partes dinâmicas
 * (números, datas, e-mails, aspas, separadores), na ordem em que aparecem.
 */
export function snippets(text) {
  const t = clean(text);
  if (/^[—–-]$/.test(t)) return [`'${t}'`, `"${t}"`, `\`${t}\``, `>${t}<`];
  const out = [t];
  const dynamic = /\S+@\S+|R\$\s?[\d.,]+|\d+[\d.,/:hº°ª%-]*|["“”«»'‘’][^"“”«»'‘’]*["“”«»'‘’]|\s[—–|·×]\s|\s-\s|[:;()?!]/g;
  const parts = t.split(dynamic).map((s) => s.trim().replace(/^[,.\s—–-]+|[,.\s—–-]+$/g, '')).filter((s) => s.length >= 5 || words(s).length >= 2);
  for (const p of parts) if (!out.includes(p)) out.push(p);
  // Por último, janelas do começo e do fim (o texto fixo de um template costuma abrir a frase).
  const ws = t.split(' ');
  const windows = ws.length > 6 ? [ws.slice(0, 5), ws.slice(-5)] : ws.length >= 3 ? [ws.slice(0, 3), ws.slice(0, 2)] : [];
  for (const j of windows.map((x) => x.join(' ').replace(/[,.;:]+$/, ''))) if (j.length >= 5 && !out.includes(j)) out.push(j);
  return out;
}

/**
 * Onde o texto nasce. Primeiro o texto inteiro como está; se não houver, cada trecho, e vence a
 * ocorrência com mais indícios: outros trechos do texto por perto, a `peca` acusada colada nele,
 * mesma caixa, cara de literal, ser o primeiro trecho (a parte fixa de um template) e não ser teste.
 * Devolve { trecho, total, local: 'codigo' | 'dado', ocorrencias: [{ arquivo, linha, teste? }] } ou null.
 * `local: 'dado'` = só aparece em teste/fixture, ou a peça acusada não está junto do trecho (veio interpolada).
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

// ---------- agregação ----------

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
      // Sem origem no código, ou com a peça acusada vinda de fora da linha de origem: é dado, não texto da interface.
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

/** Mesma regra nascida na mesma linha (template com dado interpolado) = um achado, com as variantes. */
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

/** Textos mais problemáticos: soma de severidade × telas em todas as regras. */
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

/** Interpreta os argumentos; flags antigas (--telas, --codigo, --ignorar) viram as novas com aviso (tools/lib/legacy-cli.mjs). */
export function parseTextArgs(argv, warn) {
  argv = normalizeArgv('ux-lint/text.mjs', argv, warn);
  const out = { screens: [], code: [], ignore: [], ux: null, module: null, json: false };
  let current = 'screens';
  for (const a of argv) {
    if (a === '--json') { out.json = true; continue; }
    if (a.startsWith('--')) { current = a.slice(2); if (!(current in out)) throw new Error(`opção desconhecida: ${a}`); continue; }
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
    console.error('Uso: node tools/ux-lint/text.mjs --screens <pasta-ou-html...> [--code <pastas...>] [--ux UX.md] [--module <m>] [--ignore <nomes...>] [--json]');
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
  console.log(`Higiene de texto: ${summary.screens} telas, ${summary.texts} textos, ${summary.findings} achados (${summary.occurrences} ocorrências)${index ? `; ${summary.probable_data} descartados como provável dado` : ''}\n`);
  console.log(`Por regra (achados / ocorrências${index ? ' / provável dado' : ''}):`);
  for (const r of Object.keys(SEVERITY)) {
    const x = summary.by_rule[r];
    if (x) console.log(`  ${r.padEnd(4)} sev ${SEVERITY[r]}  ${String(x.findings).padStart(4)} / ${String(x.occurrences).padStart(4)}${index ? ` / ${x.probable_data}` : ''}`);
  }
  console.log('\nPor tipo de elemento (textos inventariados / ocorrências com achado, antes do filtro de dado):');
  for (const t of TYPES) if (summary.inventory_by_type[t]) console.log(`  ${t.padEnd(16)} ${String(summary.inventory_by_type[t]).padStart(5)} / ${summary.by_type[t] || 0}`);
  const source = (o) => (o ? `${o.occurrences.map((x) => `${short(x.file)}:${x.line}${x.test ? ' (teste)' : ''}`).join(', ')}${o.total > o.occurrences.length ? ` (+${o.total - o.occurrences.length})` : ''}` : 'não encontrado no código');
  console.log('\nTextos mais problemáticos:');
  for (const t of top) console.log(`  ${String(t.points).padStart(3)}  "${t.text.slice(0, 90)}" [${[...new Set(t.rules)].join(' ')}] ${t.screens.length} tela(s)${index ? `\n       ${source(t.source)}` : ''}`);
  console.log('\nAchados:');
  for (const g of groups.filter((x) => !x.probable_data)) {
    console.log(`\n${g.rule} sev ${g.severity} | ${g.types.join(', ')} | "${g.text.slice(0, 120)}"${g.variants ? ` (+${g.variants.length - 1} variantes do mesmo template)` : ''}`);
    console.log(`   ${g.message}${g.suggestion ? `\n   sugestão: ${g.suggestion}` : ''}`);
    console.log(`   telas (${g.screens.length}): ${g.screens.slice(0, 8).join(', ')}${g.screens.length > 8 ? ', …' : ''}`);
    if (index) console.log(`   origem${g.source && g.source.snippet !== clean(g.text) ? ` (trecho "${g.source.snippet}")` : ''}: ${source(g.source)}`);
  }
  const dataGroups = groups.filter((x) => x.probable_data);
  if (dataGroups.length) {
    console.log(`\nProvável dado (a peça acusada não está no código; não é texto da interface): ${dataGroups.length}`);
    for (const g of dataGroups) console.log(`   ${g.rule} "${g.text.slice(0, 90)}"${g.variants ? ` (+${g.variants.length - 1})` : ''}${g.source ? ` · template em ${short(g.source.occurrences[0].file)}:${g.source.occurrences[0].line}` : ''}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
