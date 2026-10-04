// Especificação das prévias de opção (contrato: knowledge/fundamentos/achados-de-ux.md, "Prévia das opções").
// Sem dependências e sem navegador: deriva, para cada caso da página de decisão, como localizar o elemento na
// captura (`locatorFor`), que operação cada opção aplica (`optionOps`) e a correção indicada pela regra quando o
// caso não tem opções (`implicitPreview`). O preview.mjs executa isso no Playwright (lib/preview-runtime.mjs, com
// os doadores de lib/preview-kit.mjs); o mini diagrama de fluxo (`flowDiagram`) sai aqui mesmo, em SVG.
import { createHash } from 'node:crypto';

/** Versão do formato das prévias: entra no hash, então mudar a geração invalida o cache. */
export const PREVIEW_VERSION = 7;

/** Operações aceitas em `preview` (options.json). */
export const PREVIEW_OPS = [
  'text', 'remove', 'variant', 'move', 'style', 'align', 'replace-text-many', 'insert', 'wrap', 'annotate', 'badge',
  'synthesize-state', 'synthesize-region', 'example', 'none',
];
export const BUTTON_VARIANTS = ['contained', 'outlined', 'text'];
/** CSS que `style` pode aplicar (lista fechada: layout e tipografia, nunca cor — cor vem dos tokens). */
export const ALLOWED_STYLE = [
  'max-width', 'min-width', 'width', 'min-height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'gap', 'font-size', 'font-weight',
  'line-height', 'letter-spacing', 'text-align', 'text-transform', 'white-space', 'justify-content', 'align-items',
  'align-self', 'flex-direction', 'flex-wrap', 'order', 'display',
];
/** Valor `theme:<nível>` em `style`: tamanho, peso e entrelinha da escala de títulos lida das capturas do módulo. */
export const THEME_TOKEN_RE = /^theme:(h[1-6]|self)$/;
/** Papéis de doador que `insert` e `wrap` copiam de uma captura do módulo (lib/preview-kit.mjs). */
export const KIT_ROLES = ['chip', 'helper', 'caption', 'search-field', 'panel', 'alert-info', 'alert-warning', 'alert-success'];
/** Elementos que `move` sabe alvejar: fim/começo do grupo, ou topo da região que cabe na primeira dobra. */
const MOVE_TO = ['end', 'start', 'region-top'];
const POSITIONS = ['before', 'after', 'prepend', 'append'];
const ANNOTATE_KINDS = ['screen-reader', 'tooltip', 'hint'];
/** Selo da operação `badge` quando a opção mantém o elemento (não é falha: a imagem de hoje vale para "depois"). */
export const BADGE_NO_CHANGE = 'Sem mudança';
export const BADGE_ALREADY = 'Já está assim nesta tela';

const clean = (s) => String(s ?? '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
export const sha1 = (...parts) => createHash('sha1').update(parts.map((p) => (typeof p === 'string' || Buffer.isBuffer(p) ? p : JSON.stringify(p ?? null))).join('\u0000')).digest('hex');
const isTargets = (t) => t === undefined || ['all', 'all-but-last', 'all-but-first'].includes(t) || (Number.isInteger(t) && t >= 0);

/** Valida uma operação declarada. Devolve { op } normalizada ou { error }. */
export function validateOp(raw) {
  if (!raw || typeof raw !== 'object') return { error: 'prévia sem "op"' };
  const op = raw.op;
  if (!PREVIEW_OPS.includes(op)) return { error: `operação desconhecida "${op}" (use ${PREVIEW_OPS.join(', ')})` };
  const out = { op, ...(typeof raw.selector === 'string' ? { selector: raw.selector } : {}) };
  if (!isTargets(raw.targets)) return { error: '"targets" é all, all-but-last, all-but-first ou o índice do elemento localizado' };
  if (raw.targets !== undefined) out.targets = raw.targets;
  if (op === 'text') { if (!clean(raw.text)) return { error: 'text exige "text"' }; out.text = clean(raw.text); }
  if (op === 'variant') { if (!BUTTON_VARIANTS.includes(raw.variant)) return { error: `variant exige "variant": ${BUTTON_VARIANTS.join('|')}` }; out.variant = raw.variant; }
  if (op === 'move') {
    if (raw.to && !MOVE_TO.includes(raw.to)) return { error: `move: "to" é ${MOVE_TO.join(', ')}` };
    if (raw.justify && !['flex-end', 'flex-start', 'center', 'space-between'].includes(raw.justify)) return { error: 'move: "justify" é flex-end, flex-start, center ou space-between' };
    if (!raw.to && !raw.justify) return { error: 'move exige "to" ou "justify"' };
    if (raw.to) out.to = raw.to;
    if (raw.justify) out.justify = raw.justify;
    if (raw.to === 'region-top') out.fold = Number(raw.fold) > 0 ? Number(raw.fold) : 900;
  }
  if (op === 'style') {
    const css = raw.css && typeof raw.css === 'object' ? raw.css : null;
    if (!css || !Object.keys(css).length) return { error: 'style exige "css": { propriedade: valor }' };
    const bad = Object.keys(css).filter((k) => !ALLOWED_STYLE.includes(k));
    if (bad.length) return { error: `style: propriedade fora da lista (${bad.join(', ')}); permitidas: ${ALLOWED_STYLE.join(', ')}` };
    if (Object.values(css).some((v) => /[;{}<>]|url\(|expression/i.test(String(v)))) return { error: 'style: valor inválido' };
    if (Object.values(css).some((v) => /^theme:/.test(String(v)) && !THEME_TOKEN_RE.test(String(v)))) return { error: 'style: valor de tema é theme:h1…theme:h6 ou theme:self' };
    out.css = Object.fromEntries(Object.entries(css).map(([k, v]) => [k, String(v)]));
  }
  if (op === 'align') { out.mode = ['left', 'columns'].includes(raw.mode) ? raw.mode : 'auto'; out.targets = out.targets ?? 'all'; }
  if (op === 'replace-text-many') {
    const pairs = Array.isArray(raw.pairs) ? raw.pairs.filter((p) => p && clean(p.from)) : [];
    if (!pairs.length) return { error: 'replace-text-many exige "pairs": [{ "from": "…", "to": "…" }]' };
    out.pairs = pairs.map((p) => ({ from: clean(p.from), to: clean(p.to) }));
    out.scope = raw.scope === 'screen' ? 'screen' : 'element';
  }
  if (op === 'insert') {
    if (!POSITIONS.includes(raw.position ?? 'after')) return { error: `insert: "position" é ${POSITIONS.join(', ')}` };
    out.position = raw.position ?? 'after';
    if (raw.from !== undefined || raw.source !== undefined) {
      if (!clean(raw.source)) return { error: 'insert com "from" exige "source" (seletor do elemento a copiar)' };
      out.source = clean(raw.source);
      if (clean(raw.from)) out.from = clean(raw.from).replace(/\.html?$/, '');
    } else {
      if (!KIT_ROLES.includes(raw.like ?? 'caption')) return { error: `insert: "like" é ${KIT_ROLES.join(', ')} (ou "from" + "source")` };
      out.like = raw.like ?? 'caption';
    }
    if (raw.text !== undefined) out.text = clean(raw.text);
    if (raw.placeholder !== undefined) out.placeholder = clean(raw.placeholder);
  }
  if (op === 'wrap') { out.like = 'panel'; if (clean(raw.title)) out.title = clean(raw.title); }
  if (op === 'annotate') {
    if (!ANNOTATE_KINDS.includes(raw.kind ?? 'screen-reader')) return { error: `annotate: "kind" é ${ANNOTATE_KINDS.join(', ')}` };
    if (!clean(raw.text)) return { error: 'annotate exige "text" (o que o leitor de tela anuncia ou a dica mostra)' };
    out.kind = raw.kind ?? 'screen-reader';
    out.text = clean(raw.text);
  }
  if (op === 'badge') out.text = clean(raw.text) || BADGE_NO_CHANGE;
  if (op === 'synthesize-state') {
    if (!clean(raw.state)) return { error: 'synthesize-state exige "state" (ex.: no-access, error, field-error)' };
    out.state = clean(raw.state);
    for (const k of ['title', 'text', 'action']) if (raw[k] !== undefined) out[k] = clean(raw[k]);
  }
  if (op === 'synthesize-region') {
    if (!clean(raw.region)) return { error: 'synthesize-region exige "region" (ex.: side-panel, kpi-strip)' };
    out.region = clean(raw.region);
    if (clean(raw.title)) out.title = clean(raw.title);
  }
  if (op === 'example') { if (!clean(raw.screen)) return { error: 'example exige "screen" (nome da captura, ex.: 02-acervo.error)' }; out.screen = clean(raw.screen).replace(/\.html?$/, ''); }
  if (op === 'none') out.reason = clean(raw.reason) || 'sem prévia declarada';
  return { op: out };
}

// ---------- estados e regiões montados na própria tela ----------

/**
 * Como montar na tela um estado que nenhuma captura mostra (S1). `mode`: `replace` (bloco no lugar do conteúdo
 * abaixo do cabeçalho), `replace-data` (bloco no lugar da tabela/lista, filtros ficam), `banner` (alerta no topo do
 * conteúdo; em diálogo, acima do rodapé de ações) ou `field-error` (erro no campo obrigatório). `block` é o bloco de
 * estado copiado de uma captura do módulo: `error` (de *.error.html), `empty` (de *.empty.html), `loading`
 * (esqueleto de *.loading.html). Os textos seguem a política de feedback do UX.md: sem acesso diz quem concede,
 * erro diz o que fazer. A opção, quando traz texto, troca o padrão.
 */
const NO_ACCESS_TEXT = 'Quem concede o acesso é o administrador da sua conta. Peça a ele e recarregue a página.';
const LINK_TEXT = 'Peça um novo link a quem enviou o pedido.';
export const STATE_RECIPES = {
  loading: { page: { mode: 'replace-data', block: 'loading' }, dialog: { mode: 'replace', block: 'loading' } },
  empty: { page: { mode: 'replace-data', block: 'empty', title: 'Nada por aqui ainda', text: 'Quando houver itens, eles aparecem aqui.' } },
  'empty-filtered': { page: { mode: 'replace-data', block: 'empty', button: true, title: 'Nenhum resultado para estes filtros', text: 'Mude ou limpe os filtros para ver mais itens.', action: 'Limpar filtros' } },
  'no-data-in-period': { page: { mode: 'replace-data', block: 'empty', title: 'Nada neste período', text: 'Escolha outro período para ver os dados.' } },
  error: {
    page: { mode: 'replace-data', block: 'error', title: 'Não foi possível carregar', text: 'Não foi possível falar com o servidor agora. Tente de novo em instantes.', action: 'Tentar novamente' },
    dialog: { mode: 'banner', color: 'error', text: 'Não foi possível concluir agora. O que você preencheu continua aqui; tente de novo.' },
  },
  'no-access': {
    page: { mode: 'replace', block: 'error', title: 'Você não tem acesso a esta área', text: NO_ACCESS_TEXT, action: null },
    dialog: { mode: 'banner', color: 'error', text: `Você não tem permissão para esta ação. ${NO_ACCESS_TEXT}` },
  },
  unavailable: { page: { mode: 'replace', block: 'error', title: 'Este conteúdo não está disponível', text: 'Ele pode ter sido removido. Volte à lista e abra de novo.', action: null } },
  'invalid-link': { page: { mode: 'replace', block: 'error', title: 'Este link não está mais disponível.', text: LINK_TEXT, action: null } },
  'expired-link': { page: { mode: 'replace', block: 'error', title: 'Este link expirou.', text: LINK_TEXT, action: null } },
  'already-answered': { page: { mode: 'replace', block: 'empty', title: 'Esta resposta já foi registrada', text: 'Não é preciso responder de novo. Se precisar mudar algo, fale com quem enviou o pedido.' } },
  processing: { page: { mode: 'banner', color: 'info', text: 'Processando… O conteúdo aparece aqui assim que terminar.' } },
  partial: { page: { mode: 'banner', color: 'warning', text: 'Parte dos dados não carregou; o que aparece abaixo pode estar incompleto. Tente de novo em instantes.' } },
  stale: { page: { mode: 'banner', color: 'info', text: 'Estes dados podem estar desatualizados. Atualize para ver a situação de agora.' } },
  conflict: { page: { mode: 'banner', color: 'warning', text: 'Outra pessoa salvou uma versão mais nova enquanto você editava. Reveja as mudanças antes de salvar.' } },
  saved: { page: { mode: 'banner', color: 'success', text: 'Alterações salvas.' } },
  success: { page: { mode: 'banner', color: 'success', text: 'Pronto. A mudança foi gravada.' } },
  'unsaved-changes': { page: { mode: 'banner', color: 'warning', text: 'Há alterações não salvas.' } },
  'read-only': { page: { mode: 'banner', color: 'info', text: 'Somente leitura: você pode ver, mas não editar.' } },
  'draft-restored': { page: { mode: 'banner', color: 'info', text: 'Rascunho recuperado: você continua de onde parou.' } },
  'field-error': { page: { mode: 'field-error', text: 'Preencha este campo.' } },
};
/** Receita do estado (página e diálogo), com o texto da opção por cima do padrão. */
export function stateRecipe(state, over = {}) {
  const r = STATE_RECIPES[state] ?? { page: { mode: 'banner', color: 'info', text: `Estado "${state}".` } };
  const merge = (x) => (x ? { ...x, ...Object.fromEntries(Object.entries(over).filter(([, v]) => v !== undefined)) } : null);
  return { page: merge(r.page), dialog: merge(r.dialog ?? (r.page.mode === 'field-error' || r.page.mode === 'banner' ? r.page : { mode: 'banner', color: r.page.block === 'error' ? 'error' : 'info', text: r.page.title ? `${r.page.title}. ${r.page.text ?? ''}`.trim() : r.page.text })) };
}

/** Região de arquétipo ausente (L9): título padrão da região montada como contêiner. */
export const REGION_TITLES = {
  'side-panel': 'Painel lateral', 'kpi-strip': 'Indicadores', 'search-bar': 'Busca', 'decision-area': 'Decisão',
  'viewer-toolbar': 'Barra do documento', filters: 'Filtros', 'bulk-actions-bar': 'Ações em lote', toolbar: 'Barra de ações',
  header: 'Cabeçalho', summary: 'Resumo', 'danger-zone': 'Zona de risco', 'quick-view': 'Visualização rápida',
};

// ---------- localização do elemento ----------

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Texto-modelo (com `{}` ou `{nome}`) → padrão de regex sobre o texto normalizado do elemento. */
export function toPattern(text, { anchored = true } = {}) {
  const t = clean(text);
  if (!t) return null;
  const literal = t.split(/\{[^{}]*\}/);
  // modelo só de marcadores e separadores ("{status} — {motivo}") casaria qualquer texto: não serve de padrão
  if (literal.length > 1 && (literal.join('').match(/\p{L}/gu) ?? []).length < 3) return null;
  const parts = literal.map((p) => escRe(p).replace(/ /g, '\\s+'));
  const body = parts.join('.+?');
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

/** C1: rótulos citados (`"A" (telas…) × "B" (telas…)`); fica o primeiro citado, troca o último. */
export function labelPlan(message) {
  const occ = [...String(message ?? '').matchAll(/"([^"]+)" \(([^)]*)\)/g)].map((m) => ({ label: m[1], screens: m[2].split(',').map((s) => s.trim()).filter((s) => s && s !== '…') }));
  if (occ.length < 2) return null;
  return { keep: occ[0].label, change: occ.at(-1).label, screens: occ.at(-1).screens };
}

/** L6: dobra citada na mensagem ("dobra em 900 px"); 900 sem citação. */
const foldOf = (msg) => Number(String(msg ?? '').match(/dobra em (\d+)\s*px/)?.[1] ?? 900);

/**
 * Como achar o elemento do caso na captura. Devolve { screen_level?, selectors?, patterns?, contains?, prefixes?,
 * kind, max, require_class?, annotate_before?, viewport?, fold? } ou { screen_level: true } quando o achado é da
 * tela inteira (sem elemento).
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
    if (rule === 'L4') { const m = String(c.text).match(/ em (.+)$/); return m ? { kind: 'any', selectors: [m[1]], max: 1 } : { screen_level: true }; }
    if (rule === 'L3') return { kind: 'heading', patterns: quoted(msg).map((t) => toPattern(t)).filter(Boolean), max: 2 };
    const q = quoted(c.text)[0] ?? quoted(msg)[0];
    return q ? { kind: 'button', patterns: [toPattern(q)], max: 1, ...(rule === 'L6' ? { viewport: true, fold: foldOf(msg) } : {}) } : { screen_level: true };
  }
  if (c.family === 'screen') {
    // T3 sem h1: o candidato é o texto mais destacado no topo do conteúdo (o título que já está na tela)
    if (rule === 'T3') return { kind: 'main-title', max: 1 };
    if (rule === 'T6') { const ex = String(msg).match(/ex\.: "([^"]+)/); return ex ? { kind: 'any', contains: [clean(ex[1]).replace(/…$/, '').slice(0, 60)], max: 1 } : { screen_level: true }; }
    const labels = quoted(msg).filter((l) => !/^(Enviar minuta)$/.test(l) || rule !== 'T7');
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

// ---------- operação de cada opção ----------

/** Opção que descreve uma mudança em vez de trazer o texto pronto: começa por um substantivo de estrutura… */
export const INSTRUCTION_NOUN_RE = /^(manter|selo|t[íi]tulo|r[óo]tulo|placeholder|apoio|rodap[ée]|link|dica|data numa|complemento|c[ée]lula|declarar|registrar|nome acess[íi]vel|vers[ãa]o numa)\b/i;
/** …ou por um verbo de edição (só vale fora de botões, onde "Remover Ana" é o próprio texto do botão). */
export const INSTRUCTION_VERB_RE = /^(mover|trocar|usar|remover|substituir|mostrar|esconder|tirar|levar|deixar|separar|juntar|recolher|colocar|passar)\b/i;
const ELEMENT_NOUN = 't[íi]tulo|r[óo]tulo|placeholder|apoio|texto|rodap[ée]|link|selo|dica|bot[ãa]o|aba|legenda';
const ELEMENT_WORD = new RegExp(`(?:^|[;.]\\s*)(${ELEMENT_NOUN})(?=[\\s"“])[^"“;]*["“]([^"”]+)["”]`, 'i');
const LABEL_COLON = new RegExp(`^(${ELEMENT_NOUN})\\s*:\\s*(.+)$`, 'i');
/** Opção cujo texto é a própria frase (com aspas internas, como “Criar aditivo”), não uma instrução. */
const isSentence = (t, element) => !INSTRUCTION_NOUN_RE.test(t) && !(!['button', 'tab', 'menu'].includes(element) && INSTRUCTION_VERB_RE.test(t))
  && !ELEMENT_WORD.test(t) && !/,\s+com\s|\s+ou\s+["“]/.test(t) && !/^["“][^"”]+["”]\s+vis[íi]vel/i.test(t);
const isInstruction = (t, element) => (/["“].+["”]/.test(t) && !isSentence(t, element)) || INSTRUCTION_NOUN_RE.test(t) || (!['button', 'tab', 'menu'].includes(element) && INSTRUCTION_VERB_RE.test(t));

const words = (s) => new Set(clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 2));
const stemHit = (a, b) => a === b || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5));
const numbers = (s) => new Set(String(s ?? '').match(/\d+/g) ?? []);
/**
 * Lista "A · B · C" (um texto para cada elemento): escolhe o trecho com mais palavras em comum com o atual
 * (radical de 5 letras: "destinatários" casa "destinatário(s)"); empate ou nenhuma palavra → o que repete os
 * números do texto atual ("Ver 1 mudança" para "Histórico (1)"). Sem nenhum sinal, null.
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

/** Texto de uma instrução: aspas depois do nome do elemento, "A → B", "Rótulo: texto", "X, com apoio "Y"". */
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

/** Complemento de "X, com <apoio|selo|nome acessível|dica> "Y"": texto principal + operação do complemento. */
function withComplement(t) {
  const m = t.match(/^([^,;]+?),\s+com\s+(apoio|selo|nome acess[íi]vel|dica)\s+["“]([^"”]+)["”](.*)$/i);
  if (!m) return null;
  const kind = m[2].toLowerCase();
  const extra = kind === 'apoio' ? { op: 'insert', like: 'helper', position: 'after', text: clean(m[3]) }
    : kind === 'selo' ? { op: 'insert', like: 'chip', position: 'after', text: clean(m[3]) }
      : kind === 'dica' ? { op: 'annotate', kind: 'tooltip', text: clean(m[3]) }
        : { op: 'annotate', kind: 'screen-reader', text: clean(m[3]) };
  const main = clean(m[1]).replace(/^["“]|["”]$/g, '');
  const ops = /^["“].+["”]\s+vis[íi]vel$/i.test(clean(m[1])) ? [extra] : [{ op: 'text', text: main }, extra];
  return { ops, derived: true, ...(clean(m[4]) ? { note: 'a opção traz mais de uma alternativa; a prévia mostra a primeira' } : {}) };
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

/** O que o leitor de tela ou a dica diria na opção (nome acessível e dica não aparecem em pixels: vira anotação). */
function annotationText(t) {
  const named = t.match(/nome acess[íi]vel\s+["“]([^"”]+)["”]/i) ?? t.match(/dica\s+["“]([^"”]+)["”]/i);
  if (named) return clean(named[1]);
  const ex = extractOptionText(t);
  if (ex) return ex.text;
  const q = quoted(t);
  if (q.length && INSTRUCTION_NOUN_RE.test(t)) return q[0];
  return t;
}

/** Prévia padrão de uma opção de texto. */
export function deriveTextOp(c, o) {
  const t = clean(o?.text);
  if (!t) return { none: 'opção sem texto' };
  if (/^manter\b/i.test(t) || /^\(remover\)\s+nenhuma mudan[çc]a/i.test(t)) return { ops: [{ op: 'badge', text: BADGE_NO_CHANGE }], derived: true };
  if (c.element === 'accessible-name') return { ops: [{ op: 'annotate', kind: 'screen-reader', text: annotationText(t) }], derived: true };
  if (c.element === 'tooltip') return { ops: [{ op: 'annotate', kind: 'tooltip', text: annotationText(t) }], derived: true };
  if (/^\(remover\)\s*$/i.test(t)) return { ops: [{ op: 'remove' }], derived: true };
  if (/^\(remover\)\s+e\s/i.test(t)) return { ops: [{ op: 'remove' }], derived: true, note: 'a opção pede mais que remover; a prévia mostra só a remoção' };
  if (/^\(remover\)/i.test(t)) return { none: 'a opção descreve uma mudança que não é só remover; a prévia não a simula (declare "preview" na opção)' };
  const comp = withComplement(t);
  if (comp) return comp;
  if (isInstruction(t, c.element)) {
    const ex = extractOptionText(t);
    if (ex) return { ops: [{ op: 'text', text: ex.text }], derived: true, ...(ex.how === 'element' ? { note: 'a opção muda mais que o texto; a prévia mostra só a troca do texto principal' } : {}) };
    if (/^remover\b/i.test(t)) return { ops: [{ op: 'remove' }], derived: true, note: 'a opção pede mais que remover; a prévia mostra só a remoção' };
    return { none: 'a opção descreve uma mudança de estrutura; a prévia não a simula (declare "preview" na opção)' };
  }
  if (/(?:→|->)/.test(t)) return { ops: [{ op: 'text', text: extractOptionText(t).text }], derived: true };
  if (t.includes(' · ')) {
    const choices = String(t).split(' · ').map(clean).filter(Boolean);
    const seg = pickSegment(t, [c.text, ...(c.variants ?? [])]);
    if (!seg) return { ops: [{ op: 'text', text: choices[0], choices }], derived: true, note: 'a opção lista textos de vários elementos e nenhum repete palavras deste; a prévia aplica o que mais se parece, na captura' };
    return { ops: [{ op: 'text', text: seg, choices }], derived: true, note: 'a opção lista textos de vários elementos; a prévia aplica o que corresponde a este' };
  }
  const q = t.match(/^["“]([^"”]+)["”]$/);
  return { ops: [{ op: 'text', text: q ? clean(q[1]) : t }], derived: true };
}

/** Termos técnicos sem lugar na tela → palavra comum ('' = tirar o termo). Usado pelo padrão de T6. */
export const PLAIN_TERMS = {
  ses: 'e-mail', smtp: 'e-mail', sha256: '', sha1: '', md5: '', hash: '', token: 'código', uuid: 'código',
  payload: 'dados', endpoint: 'endereço', backend: 'servidor', worker: 'processo automático', snapshot: 'versão',
  tenant: 'conta', flag: 'opção', rls: '', is_corrente: '', json: 'arquivo', api: 'integração',
};

/**
 * Correção indicada pela regra, para caso sem opções (e prévia padrão da família quando a opção não declara).
 * Devolve { label, ops } | { label, flow } | { none }.
 */
export function implicitPreview(c, { exampleFor = null } = {}) {
  const r = c.rule;
  const msg = c.message ?? '';
  if (c.family === 'layout') {
    if (r === 'L1') return { label: 'Ação primária no fim do grupo, alinhada à direita', ops: [{ op: 'move', to: 'end', justify: 'flex-end' }] };
    if (r === 'L3') return { label: 'Títulos na escala do tema (nível maior, texto maior)', ops: [{ op: 'style', targets: 'all', css: { 'font-size': 'theme:self', 'line-height': 'theme:self', 'font-weight': 'theme:self' } }] };
    if (r === 'L4') return { label: 'Bordas esquerdas alinhadas às colunas do grupo', ops: [{ op: 'align', mode: 'auto', targets: 'all' }] };
    if (r === 'L6') return { label: 'Ação primária dentro da primeira dobra', ops: [{ op: 'move', to: 'region-top', fold: foldOf(msg) }] };
    // 60ch ≈ 72 caracteres de texto corrido (o "ch" é a largura do zero, maior que a letra média)
    if (r === 'L7') return { label: 'Linha limitada a cerca de 72 caracteres', ops: [{ op: 'style', css: { 'max-width': '60ch' } }] };
    if (r === 'L8') { const big = /44/.test(msg); return { label: `Alvo de pelo menos ${big ? 44 : 24}×${big ? 44 : 24} px`, ops: [{ op: 'style', css: { 'min-width': `${big ? 44 : 24}px`, 'min-height': `${big ? 44 : 24}px` } }] }; }
    if (r === 'L9') { const region = String(c.text ?? msg).match(/regi[ãa]o "?([\w-]+)"?/)?.[1] ?? null; return region ? { label: `Região "${REGION_TITLES[region] ?? region}" montada na tela`, ops: [{ op: 'synthesize-region', region, title: REGION_TITLES[region] ?? region }] } : { none: 'não deu para ler a região ausente no achado' }; }
  }
  if (c.family === 'consistency' && r === 'C2') {
    const v = variantPlan(msg);
    return v ? { label: `Mesmo peso da maioria (variante ${v.major})`, ops: [{ op: 'variant', variant: v.major }] } : { none: 'não deu para ler as variantes na mensagem do achado' };
  }
  if (c.family === 'consistency' && r === 'C1') {
    const lp = labelPlan(msg);
    return lp ? { label: `Mesmo rótulo em todas as telas ("${lp.keep}", o primeiro citado)`, ops: [{ op: 'text', text: lp.keep }] } : { none: 'não deu para ler os rótulos na mensagem do achado' };
  }
  if (c.family === 'states' && r === 'S1') {
    const state = stateOfRegion(c.region);
    if (state) return { label: `Estado "${state}" montado na própria tela`, ops: [{ op: 'synthesize-state', state }] };
    const ex = exampleFor ? exampleFor(state, c.screens?.[0]) : null;
    return ex ? { label: `Como a tela ${ex} mostra o estado "${state}"`, ops: [{ op: 'example', screen: ex }] } : { none: `nenhuma outra tela do módulo tem captura do estado "${state}" para servir de exemplo` };
  }
  if (c.family === 'screen') {
    if (r === 'T1') return { label: 'Uma primária por região: as demais em contornado', ops: [{ op: 'variant', variant: 'outlined', targets: 'all-but-last' }] };
    if (r === 'T3') return { label: 'Título principal como h1, na escala do tema', ops: [{ op: 'style', css: { 'font-size': 'theme:h1', 'line-height': 'theme:h1', 'font-weight': 'theme:h1' } }, { op: 'annotate', kind: 'screen-reader', text: 'Título, nível 1: {self}' }] };
    if (r === 'T6') {
      const term = msg.match(/termo proibido "([^"]+)"/)?.[1];
      if (!term) return { none: 'não deu para ler o termo proibido no achado' };
      const plain = PLAIN_TERMS[term.toLowerCase()];
      return { label: plain ? `"${term}" trocado por "${plain}"` : `"${term}" tirado do texto`, ops: [{ op: 'replace-text-many', pairs: [{ from: term, to: plain ?? '' }], scope: 'element' }] };
    }
    if (r === 'T7') { const lb = quoted(msg)[0]; return lb ? { label: 'Verbo + objeto (o objeto vem do rótulo mais próximo)', ops: [{ op: 'text', text: `${lb} {context}` }] } : { none: 'não deu para ler o botão no achado' }; }
  }
  if (c.family === 'text') {
    if (r === 'X9') return { label: 'Sem o parêntese explicativo', ops: [{ op: 'text', text: '{no-parens}' }] };
    if (r === 'X2') return { label: 'Um bloco no título, o outro em apoio logo abaixo', ops: [{ op: 'text', text: '{part:0}' }, { op: 'insert', like: 'helper', position: 'after', text: '{part:1}' }] };
    if (r === 'X6' && /palavras/.test(msg)) return { label: 'Só o primeiro bloco (até 4 palavras)', ops: [{ op: 'text', text: '{part:0}' }] };
    if (r === 'X6' && /sem objeto/.test(msg)) return { label: 'Verbo + objeto (o objeto vem do rótulo mais próximo)', ops: [{ op: 'text', text: `${clean(c.text)} {context}` }] };
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
  if (c.family === 'consistency' && c.rule === 'C1') { const lp = labelPlan(c.message); if (lp) list.sort((a, b) => lp.screens.includes(b) - lp.screens.includes(a)); }
  return list.sort((a, b) => (a.includes('.') ? 1 : 0) - (b.includes('.') ? 1 : 0));
}

/** As operações mexem no DOM da captura (e não só mostram outra captura)? */
export const domOps = (ops) => (ops ?? []).some((o) => o.op !== 'example');
/** Operações que dependem dos doadores do módulo (lib/preview-kit.mjs). */
export const needsKit = (ops) => (ops ?? []).some((o) => ['synthesize-state', 'synthesize-region', 'insert', 'wrap', 'variant', 'style', 'annotate'].includes(o.op));

/** Descrição curta de uma operação, para texto alternativo e manifesto. */
export function describeOps(ops) {
  return ops.map((o) => ({
    text: `texto trocado por "${o.text}"`, remove: 'elemento removido',
    variant: `${o.targets === 'all-but-last' ? 'demais botões' : 'botão'} na variante ${o.variant}`,
    move: [o.to ? `movido para ${o.to === 'end' ? 'o fim do grupo' : o.to === 'start' ? 'o início do grupo' : 'dentro da primeira dobra'}` : '', o.justify ? `grupo alinhado (${o.justify})` : ''].filter(Boolean).join(', '),
    style: `estilo ${Object.entries(o.css ?? {}).map(([k, v]) => `${k}: ${v}`).join('; ')}`, align: 'bordas esquerdas alinhadas',
    'replace-text-many': `textos trocados (${(o.pairs ?? []).map((p) => `"${p.from}" → "${p.to}"`).join(', ')})`,
    insert: `inserido ${o.like ? `(${o.like})` : `de ${o.from ?? 'esta captura'}`}${o.text ? ` com "${o.text}"` : ''}`,
    wrap: `agrupado num contêiner${o.title ? ` "${o.title}"` : ''}`,
    annotate: `${o.kind === 'tooltip' ? 'dica' : o.kind === 'hint' ? 'anotação' : 'leitor de tela'}: "${o.text}"`,
    badge: `selo "${o.text}"`, 'synthesize-state': `estado "${o.state}" montado na tela`,
    'synthesize-region': `região "${o.title ?? o.region}" montada na tela`, example: `exemplo da captura ${o.screen}`,
  }[o.op] ?? o.op)).join('; ');
}

/** Legenda curta do tipo de prévia, mostrada abaixo de cada "depois" na página. */
export const PROPOSAL_LABEL = 'Proposta montada com componentes da própria tela';
export function previewKind(ops) {
  const list = ops ?? [];
  const has = (...k) => list.some((o) => k.includes(o.op));
  const out = [];
  if (has('synthesize-state', 'synthesize-region', 'insert', 'wrap')) out.push(PROPOSAL_LABEL);
  if (has('text', 'replace-text-many') && !out.length) out.push('Texto trocado');
  if (has('remove') && !out.length) out.push('Elemento removido');
  if (has('variant')) out.push('Peso do botão trocado');
  if (has('move')) out.push('Elemento movido');
  if (has('style', 'align') && !has('variant', 'move')) out.push(list.some((o) => Object.values(o.css ?? {}).some((v) => /^theme:/.test(v))) ? 'Tamanho na escala do tema' : 'Estilo ajustado');
  for (const a of list.filter((o) => o.op === 'annotate')) out.push(a.kind === 'tooltip' ? 'Anotação: dica' : a.kind === 'hint' ? 'Anotação' : 'Anotação: leitor de tela');
  for (const b of list.filter((o) => o.op === 'badge')) out.push(b.text);
  if (has('example')) out.push('Exemplo de outra tela');
  if (has('flow')) out.push('Diagrama do fluxo');
  return [...new Set(out)].join(' · ');
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
