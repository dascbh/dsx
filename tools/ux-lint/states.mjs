#!/usr/bin/env node
// ux-lint, nível estados: aplica as regras S1–S3 do contrato do UX.md (knowledge/fundamentos/ux-md.md, "Estados")
// sobre a pasta de capturas HTML. Sem dependências.
//
// Uso: node tools/ux-lint/states.mjs <pasta-de-capturas> [--ux UX.md] [--archetypes <pasta>] [--order capture-order.json]
//                                    [--json] [--fail-at 3]
//
// Convenção de captura: `<nn>-<screen-id>.html` é o estado principal da tela (com dado, ou o diálogo aberto);
// `<nn>-<screen-id>.<state>.html` é um estado dela (`02-acervo.empty.html`, `03-documento.error.html`).
// Tipo e mãe de cada tela vêm, quando existe, do `capture-order.json` da pasta ou da pasta acima
// ([{ nn, id, type, parent }], o mesmo da skill de captura pelo código); sem ele, toda tela não diálogo é página.
//
// S1 estado obrigatório sem captura · S2 estado vazio/erro sem ação de saída · S3 mensagem de erro sem orientação.
// Estados obrigatórios por tipo de tela (a regra está em knowledge/fundamentos/ux-md.md, "Estados"):
//   página  — `states` do UX.md ∪ `states` do arquétipo, menos o principal (`success`) e os momentâneos
//             (`running`, `submitting`, `saving`); `empty`/`empty-filtered` do UX.md só quando o arquétipo tem
//             algum estado vazio (detalhe e editor não têm lista vazia) ou a tela não tem arquétipo.
//   filha   — aba, painel ou passo com mãe capturada (`parent` no capture-order): o conjunto da página menos o
//             que a mãe já exige (carregar, erro e sem acesso da mãe valem para a filha).
//   diálogo — só `error` quando o diálogo tem ação que chama o servidor (primária ou destrutiva) e `field-error`
//             quando o arquétipo o declara e o diálogo tem campo obrigatório; nunca `loading`, `empty`, `no-access`.
//   painel sem arquétipo nem mãe (ex.: menu) — nenhum estado exigido.
// JSON (--json): { summary, screens: [{ screen, nn, kind, archetype, parent, captures, required,
//                  findings: [{ rule, severity, state, region, message, evidence }] }] }.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, textOf, contains } from './lib/html.mjs';
import { loadArchetypes } from '../lint-archetypes.mjs';

export const SEVERITY = { S1: 2, S2: 2, S3: 2 };
/** Mínimo do contrato quando o UX.md não declara `states`. */
export const DEFAULT_STATES = ['loading', 'empty', 'error', 'no-access', 'success'];
/** Estados momentâneos: a captura é bem-vinda, mas não é exigida (somem em menos de um segundo). */
export const TRANSIENT_STATES = ['running', 'submitting', 'saving'];
/** Estado coberto pela captura principal, por tipo de tela. */
export const PRINCIPAL_STATE = { page: 'success', child: 'success', dialog: 'open', panel: 'success' };
export const DIALOG_ARCHETYPES = ['confirmation-dialog', 'form-dialog'];
/** Estados de carga que a mãe cobre pela filha. */
const PAGE_LOAD_STATES = ['loading', 'error', 'no-access'];
/** Estados em que a pessoa precisa de uma saída (S2). */
export const EXIT_STATES = /^(empty|empty-filtered|nothing-selected|no-data-in-period|error|no-access|invalid-link|expired-link|unavailable|item-removed)$/;
const ERROR_STATES = /^(error|no-access|invalid-link|expired-link|unavailable|item-removed|conflict)$/;
const EMPTY_STATES = /^(empty|empty-filtered|nothing-selected|no-data-in-period)$/;
/** Nome de arquivo de captura: `<nn>-<screen-id>[.<state>].html`. */
export const CAPTURE_RE = /^(\d+)-([a-z0-9]+(?:-[a-z0-9]+)*)(?:\.([a-z0-9]+(?:-[a-z0-9]+)*))?\.html$/;

const ERROR_ALERT = '.MuiAlert-standardError, .MuiAlert-filledError, .MuiAlert-outlinedError, .MuiAlert-colorError';
const ANY_ALERT = '[role=alert], .MuiAlert-root';
const ACTION = 'button, [role=button], a[href], [role=link]';
const NOT_EXIT = '[role=tab], .MuiTab-root, .MuiTableSortLabel-root, [role=combobox], [role=switch], [role=checkbox], [role=radio]';
const EMPTY_TEXT = /^(nenhum|nenhuma|ainda não|ainda nao|não há|nao ha|sem (resultados|itens|dados|registros)|vazio|no (results|items|data)|nothing)\b|\bainda não (tem|há|foi)\b/i;
/** Verbos e expressões de próximo passo numa mensagem de erro (pt-BR e inglês). Sem acento, minúsculas. */
const GUIDANCE = new RegExp(`\\b(${[
  'tente', 'tentar', 'verifique', 'verificar', 'confira', 'conferir', 'recarregue', 'recarregar', 'atualize', 'atualizar',
  'volte', 'voltar', 'contate', 'contatar', 'entre em contato', 'fale com', 'peca', 'pedir', 'solicite', 'solicitar',
  'aguarde', 'aguardar', 'selecione', 'selecionar', 'preencha', 'preencher', 'corrija', 'corrigir', 'revise', 'revisar',
  'envie', 'enviar', 'reenvie', 'carregue', 'carregar', 'abra', 'abrir', 'clique', 'use', 'usar', 'escolha', 'escolher',
  'faca', 'fazer', 'informe', 'informar', 'avise', 'avisar', 'acesse', 'acessar', 'reprocesse', 'reprocessar', 'crie', 'criar',
  'digite', 'conecte', 'conectar', 'remova', 'de novo', 'novamente', 'mais tarde', 'em instantes',
  'try', 'retry', 'check', 'reload', 'refresh', 'contact', 'again', 'later',
].join('|')})\\b`, 'i');
const ONLY_FAILURE = /^(erro|falha|falhou|error|failed|algo deu errado|ocorreu um erro|something went wrong)\b[^a-z]{0,40}$/i;
const CODE_LIKE = /\b(HTTP\s*)?[45]\d\d\b|\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b|\bERR[_-]/;

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// ---------- entradas ----------

/** Lista as capturas de uma pasta e agrupa por tela: Map<screenId, { nn, main, states: Map<state, file> }>. */
export function discoverCaptures(dir) {
  const screens = new Map();
  for (const f of readdirSync(dir).sort()) {
    const m = CAPTURE_RE.exec(f);
    if (!m) continue;
    const [, nn, id, state] = m;
    if (!screens.has(id)) screens.set(id, { nn, main: null, states: new Map() });
    const s = screens.get(id);
    if (state) s.states.set(state, join(dir, f));
    else { s.main = join(dir, f); s.nn = nn; }
  }
  return screens;
}

/** Arquétipos: id → { states, regions, primary_action }. Lê index.json quando existe; senão, os cartões. */
export function loadArchetypeStates(dir) {
  const out = {};
  if (!dir || !existsSync(dir)) return out;
  const index = join(dir, 'index.json');
  if (existsSync(index)) {
    for (const a of JSON.parse(readFileSync(index, 'utf8'))) out[a.id] = { states: a.states ?? [], regions: a.regions ?? [] };
    return out;
  }
  for (const c of loadArchetypes(dir)) if (c.fm?.id) out[c.fm.id] = { states: c.fm.states ?? [], regions: c.fm.regions ?? [] };
  return out;
}

/** capture-order.json da pasta ou da pasta acima → Map<id, { type, parent }>. */
export function loadOrder(dir, explicit = null) {
  const file = explicit ?? [join(dir, 'capture-order.json'), join(dirname(dir), 'capture-order.json')].find(existsSync);
  if (!file || !existsSync(file)) return { file: null, order: new Map() };
  const list = JSON.parse(readFileSync(file, 'utf8'));
  return { file, order: new Map((Array.isArray(list) ? list : list.screens ?? []).map((x) => [x.id, { type: x.type ?? null, parent: x.parent ?? null }])) };
}

/** Mapa tela → arquétipo a partir de `archetypes` do UX.md ({ arquétipo: [telas] }). */
export function archetypeByScreen(cfg) {
  const out = new Map();
  for (const [arch, screens] of Object.entries(cfg.archetypes ?? {})) for (const s of [].concat(screens ?? [])) out.set(String(s), arch);
  return out;
}

// ---------- análise de uma captura ----------

function regionOf(root, node, cfg) {
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
  const d = dialogs.find((x) => contains(x, node));
  if (d) return d;
  return closest(node, (sel.regions ?? []).filter((r) => r !== sel.dialog).join(', ') || 'main') ?? root;
}

const regionName = (r, cfg) => {
  if (!r || r.type !== 'element') return '(tela)';
  if (matches(r, cfg.verification.selectors.dialog)) return 'diálogo';
  return r.tag + (r.attrs.role ? `[role=${r.attrs.role}]` : '');
};

function disabled(n) {
  for (let x = n; x && x.type === 'element'; x = x.parent) {
    if ('disabled' in x.attrs || x.attrs['aria-disabled'] === 'true' || / Mui-disabled /.test(` ${x.attrs.class || ''} `)) return true;
  }
  return false;
}

/** Ações que tiram a pessoa do estado: botão ou link visível e habilitado (abas, ordenação e campos não contam). */
function exits(scope) {
  return querySelectorAll(scope, ACTION).filter((b) => !isHidden(b) && !disabled(b) && !matches(b, NOT_EXIT) && !closest(b, NOT_EXIT) && !closest(b, '[aria-hidden=true]'));
}

/** Mensagens de estado na captura: alertas de erro (e qualquer alerta numa captura de erro) ou o texto de vazio. */
function stateMessages(root, state, cfg) {
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
  const inFocus = (n) => !dialogs.length || dialogs.some((d) => contains(d, n));
  const visible = (n) => !isHidden(n) && inFocus(n) && clean(textOf(n));
  const alertSel = state && ERROR_STATES.test(state) ? ANY_ALERT : ERROR_ALERT;
  const alerts = querySelectorAll(root, alertSel).filter(visible).filter((a, _, all) => !all.some((b) => b !== a && contains(b, a)));
  if (state && EMPTY_STATES.test(state)) {
    const blocks = querySelectorAll(root, 'p, td, li, strong, h2, h3, h4, h5, h6, .MuiTypography-root').filter(visible)
      .filter((n) => EMPTY_TEXT.test(clean(textOf(n))));
    return { kind: 'empty', nodes: blocks.filter((a, _, all) => !all.some((b) => b !== a && contains(b, a))) };
  }
  return { kind: 'error', nodes: alerts };
}

/**
 * Analisa a captura de um estado (ou a principal, `state = null`, só para o S3). Devolve achados S2/S3.
 * `file` entra na evidência.
 */
export function analyzeStateCapture(html, state, cfg = configFrom({}), file = 'tela.html') {
  const root = parseHtml(html);
  const findings = [];
  const ev = (n) => `${file}:${n.line}:${n.col}`;
  const add = (rule, region, message, evidence) => findings.push({ rule, severity: SEVERITY[rule], state: state ?? 'principal', region, message, evidence });
  const { kind, nodes } = stateMessages(root, state, cfg);

  // S2 — vazio/erro sem ação de saída na região do estado.
  if (state && EXIT_STATES.test(state)) {
    const sel = cfg.verification.selectors;
    const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
    const anchor = nodes[0] ?? dialogs[0] ?? querySelectorAll(root, 'main')[0] ?? root;
    const region = anchor === root ? root : regionOf(root, anchor, cfg);
    if (!exits(region).length) {
      add('S2', regionName(region, cfg), `estado "${state}" sem botão ou link de saída na região (ofereça o próximo passo: tentar de novo, limpar filtro, criar, voltar)`, anchor === root ? file : ev(anchor));
    }
  }

  // S3 — mensagem de erro sem orientação.
  if (kind === 'error') {
    if (state && ERROR_STATES.test(state) && !nodes.length) {
      add('S3', '(tela)', `estado "${state}" sem mensagem de erro visível (diga o que aconteceu e o que fazer)`, file);
    }
    for (const n of nodes) {
      const text = clean(textOf(n));
      const hasAction = exits(n).length > 0;
      const guided = GUIDANCE.test(fold(text));
      const bare = ONLY_FAILURE.test(fold(text)) || (CODE_LIKE.test(text) && text.split(' ').length <= 6);
      if (!bare && (guided || hasAction)) continue;
      add('S3', regionName(regionOf(root, n, cfg), cfg), `mensagem de erro sem orientação: "${text.slice(0, 100)}" (diga o que aconteceu e o que a pessoa pode fazer)`, ev(n));
    }
  }
  return findings;
}

/** O diálogo da captura principal chama o servidor (primária/destrutiva fora de cancelar) e tem campo obrigatório? */
function dialogTraits(html, cfg) {
  const root = parseHtml(html);
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d));
  const scope = dialogs.length ? dialogs : [];
  const cancel = /^(cancelar|voltar|fechar|não|nao|cancel|close|back)$/i;
  let serverAction = false, requiredField = false;
  for (const d of scope) {
    for (const b of querySelectorAll(d, sel.button)) {
      if (isHidden(b) || cancel.test(clean(textOf(b)))) continue;
      if (matches(b, sel.primary) || matches(b, sel.destructive)) serverAction = true;
    }
    if (querySelectorAll(d, '[required], [aria-required=true], .MuiFormLabel-asterisk').length) requiredField = true;
  }
  return { open: dialogs.length > 0, serverAction, requiredField };
}

// ---------- estados obrigatórios ----------

/**
 * Estados exigidos de uma tela. `kind`: page | child | dialog | panel. `parentRequired`: conjunto exigido da mãe
 * (filhas). `traits`: { serverAction, requiredField } do diálogo; { public } de página sem login (sem `no-access`).
 */
export function requiredStates({ kind, archetype = null, uxStates = DEFAULT_STATES, archetypeStates = null, parentRequired = [], traits = {} }) {
  const arch = archetypeStates ?? [];
  if (kind === 'dialog') {
    const out = [];
    if (traits.serverAction) out.push('error');
    if (traits.requiredField && arch.includes('field-error')) out.push('field-error');
    return out;
  }
  if (kind === 'panel' && !archetype) return [];
  const archHasEmpty = arch.some((s) => EMPTY_STATES.test(s));
  const fromUx = uxStates.filter((s) => !EMPTY_STATES.test(s) || !archetype || archHasEmpty);
  let out = [...new Set([...fromUx, ...arch])]
    .filter((s) => s !== PRINCIPAL_STATE[kind] && s !== 'open' && !TRANSIENT_STATES.includes(s));
  if (kind === 'child') out = out.filter((s) => !parentRequired.includes(s) && !PAGE_LOAD_STATES.includes(s));
  // página pública sem login não tem "sem acesso": quem tem o link entra (link inválido/expirado vêm do arquétipo)
  if (traits.public) out = out.filter((s) => s !== 'no-access');
  return out;
}

/** De onde vem cada estado exigido (para a mensagem do S1). */
function origin(state, uxStates, archetype, archStates, kind) {
  if (kind === 'dialog') return state === 'error' ? 'diálogo com ação que chama o servidor' : `diálogo com campo obrigatório, arquétipo ${archetype}`;
  const ux = uxStates.includes(state), ar = (archStates ?? []).includes(state);
  if (ux && ar) return `UX.md e arquétipo ${archetype}`;
  return ux ? 'UX.md' : `arquétipo ${archetype}`;
}

/**
 * Analisa a pasta inteira. Devolve [{ screen, nn, kind, archetype, parent, captures, required, findings }].
 * `archetypes`: id → { states } (loadArchetypeStates); `order`: Map de loadOrder.
 */
export function analyzeStates(dir, cfg = configFrom({}), { archetypes = {}, order = new Map() } = {}) {
  const captures = discoverCaptures(dir);
  const byScreen = archetypeByScreen(cfg);
  const uxStates = Array.isArray(cfg.states) && cfg.states.length ? cfg.states : DEFAULT_STATES;
  const info = new Map();
  // 1º passo: tipo de cada tela.
  for (const [id, c] of captures) {
    const archetype = byScreen.get(id) ?? null;
    const o = order.get(id) ?? {};
    const traits = c.main ? dialogTraits(readFileSync(c.main, 'utf8'), cfg) : {};
    let kind = 'page';
    if (DIALOG_ARCHETYPES.includes(archetype) || /^(dialog|modal)$/.test(o.type ?? '') || (!archetype && traits.open)) kind = 'dialog';
    else if (o.parent && captures.has(o.parent)) kind = 'child';
    else if (/^(panel|drawer)$/.test(o.type ?? '') && !archetype) kind = 'panel';
    if (o.type === 'public') traits.public = true;
    info.set(id, { kind, archetype, parent: o.parent ?? null, traits });
  }
  // 2º passo: exigidos. A filha desconta tudo o que a mãe (e as mães dela) já exigem.
  const req = new Map();
  const covered = new Map();
  const requiredOf = (id, seen = new Set()) => {
    if (req.has(id)) return req.get(id);
    const i = info.get(id);
    if (!i || seen.has(id)) return [];
    seen.add(id);
    if (i.kind === 'child') requiredOf(i.parent, seen);
    const parentRequired = i.kind === 'child' ? covered.get(i.parent) ?? [] : [];
    const r = requiredStates({ kind: i.kind, archetype: i.archetype, uxStates, archetypeStates: archetypes[i.archetype]?.states ?? null, parentRequired, traits: i.traits });
    req.set(id, r);
    covered.set(id, [...new Set([...parentRequired, ...r])]);
    return r;
  };
  const results = [];
  for (const [id, c] of captures) {
    const i = info.get(id);
    const required = requiredOf(id);
    const findings = [];
    const mainFile = c.main ?? [...c.states.values()][0];
    for (const s of required) {
      if (c.states.has(s)) continue;
      findings.push({
        rule: 'S1', severity: SEVERITY.S1, state: s, region: '(tela)',
        message: `estado "${s}" exigido (${origin(s, uxStates, i.archetype, archetypes[i.archetype]?.states, i.kind)}) sem captura ${c.nn}-${id}.${s}.html`,
        evidence: mainFile,
      });
    }
    if (c.main) findings.push(...analyzeStateCapture(readFileSync(c.main, 'utf8'), null, cfg, c.main));
    for (const [s, f] of c.states) findings.push(...analyzeStateCapture(readFileSync(f, 'utf8'), s, cfg, f));
    results.push({ screen: id, nn: c.nn, kind: i.kind, archetype: i.archetype, parent: i.parent, captures: [...(c.main ? ['(principal)'] : []), ...c.states.keys()], required, findings });
  }
  return results.sort((a, b) => a.nn.localeCompare(b.nn, 'en', { numeric: true }) || a.screen.localeCompare(b.screen));
}

export function summarize(results) {
  const byRule = {};
  const bySeverity = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of results) for (const a of r.findings) { byRule[a.rule] = (byRule[a.rule] || 0) + 1; bySeverity[a.severity]++; }
  return {
    screens: results.length,
    state_captures: results.reduce((s, r) => s + r.captures.filter((c) => c !== '(principal)').length, 0),
    screens_with_findings: results.filter((r) => r.findings.length).length,
    findings: results.reduce((s, r) => s + r.findings.length, 0),
    by_rule: byRule,
    by_severity: bySeverity,
  };
}

const USAGE = 'Uso: node tools/ux-lint/states.mjs <pasta-de-capturas> [--ux UX.md] [--archetypes <pasta>] [--order capture-order.json] [--json] [--fail-at 3]';
const DEFAULT_ARCHETYPES = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'archetypes');

function main() {
  const args = parseCli('ux-lint/states.mjs');
  const dir = args._[0];
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) { console.error(USAGE); process.exit(2); }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const archetypes = loadArchetypeStates(typeof args.archetypes === 'string' ? args.archetypes : DEFAULT_ARCHETYPES);
  const { file: orderFile, order } = loadOrder(dir, typeof args.order === 'string' ? args.order : null);
  const results = analyzeStates(dir, cfg, { archetypes, order });
  const summary = summarize(results);
  const threshold = Number(args['fail-at'] ?? 3);
  if (args.json) {
    console.log(JSON.stringify({ summary, ...(orderFile ? { order: orderFile } : {}), screens: results, ...(cfg.legacyWarnings.length ? { warnings: cfg.legacyWarnings } : {}) }, null, 2));
  } else {
    for (const r of results) {
      const tag = `${r.nn}-${r.screen} [${r.kind}${r.archetype ? ` · ${r.archetype}` : ''}] estados: ${r.captures.join(', ') || '—'}; exigidos: ${r.required.join(', ') || '—'}`;
      if (!r.findings.length) { console.log(`✓ ${tag}`); continue; }
      console.log(`✗ ${tag}`);
      for (const a of r.findings) console.log(`   ${a.rule} sev ${a.severity} | ${a.state} | ${a.region} | ${a.message}\n      ${a.evidence}`);
    }
    const rules = Object.entries(summary.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum';
    console.log(`\nResumo: ${summary.screens} telas, ${summary.state_captures} capturas de estado, ${summary.findings} achados (${rules})${orderFile ? `; tipos de ${basename(orderFile)}` : ''}`);
  }
  process.exit(results.some((r) => r.findings.some((a) => a.severity >= threshold)) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
