#!/usr/bin/env node
// Variações de UX de um fluxo (skill repensar-ux): confere o manifesto, mede as capturas, roda os detectores do
// ux-lint nos frames de cada variante cruzando com os achados que ela diz resolver, gera a página de comparação e
// grava a decisão do dono. Contrato do manifesto: skills/repensar-ux/SKILL.md.
//
//   node tools/ux-lint/variations.mjs validate --root <projeto> --module <m> --flow <f> [--manifest <variations.json>] [--json]
//   node tools/ux-lint/variations.mjs measure  --root … --module … --flow … [--ux UX.md] [--json]
//   node tools/ux-lint/variations.mjs lint     --root … --module … --flow … [--ux UX.md] [--no-layout] [--json] [--fail-at 3]
//   node tools/ux-lint/variations.mjs page     --root … --module … --flow … --out <saida.html> [--shots <pasta>] [--no-shots]
//                                              [--no-layout] [--product …] [--findings-page <url>] [--max-page-mb 10]
//   node tools/ux-lint/variations.mjs decide   --root … --module … --flow … (--variant <id> | --compose screen=b,flow=b,behavior=a,text=a)
//                                              [--comment "…"] [--by nome]
//   node tools/ux-lint/variations.mjs import   --root … <decision.json>
//
// Manifesto: <root>/.dsx/variations/<module>/<flow>/variations.json (ou --manifest). Capturas e caminhos de `code`
// são relativos à raiz do projeto. O Playwright (recorte das telas e geometria para o layout) é resolvido a partir do
// diretório atual, como em preview.mjs: rode de uma pasta do projeto que o tenha (no AURIS, frontend/). Sem ele, a
// página sai sem as telas recortadas e o lint não roda as regras de layout (L).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname, basename, relative, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from '../lib/cli.mjs';
import { loadConfig } from './lib/config.mjs';
import { parseHtml, querySelectorAll, isHidden, closest } from './lib/html.mjs';
import { analyzeText, visibleText, indexSource, sourceOf } from './text.mjs';
import { analyzeScreen } from './screen.mjs';
import { analyzeStateCapture, CAPTURE_RE } from './states.mjs';
import { normText } from './findings.mjs';
import { resolvePlaywright, measure as measureGeometry, PLAYWRIGHT_MISSING } from './measure.mjs';
import { analyzeLayout } from './lib/geometry.mjs';
import { archetypeCatalog, analyzeGeometry, limitsFrom } from './layout.mjs';
import { encoder } from './preview.mjs';
import { renderVariationsPages, PAGE_MAX_BYTES } from './lib/variations-page.mjs';

const DSX = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FORMAT = 1;
export const KINDS = ['screen', 'state', 'behavior'];
export const AXES = ['screen', 'flow', 'behavior', 'text'];
export const AXIS_PT = { screen: 'Tela', flow: 'Fluxo', behavior: 'Comportamento', text: 'Texto' };
export const METRICS = ['steps', 'clicks_to_done', 'dialogs', 'primary_actions', 'words_on_screen', 'decisions'];
/** Métricas que as capturas medem (as outras só o manifesto declara). */
export const MEASURED = ['dialogs', 'primary_actions', 'words_on_screen'];
const SHOTS_VERSION = 2;
const sha1 = (...p) => createHash('sha1').update(p.map((x) => (typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x))).join('\u0000')).digest('hex');
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

// ---------- manifesto ----------

export const manifestPath = ({ root, module, flow }) => join(root, '.dsx', 'variations', module, flow, 'variations.json');
/** Raiz do projeto a partir do caminho do manifesto (`…/<root>/.dsx/variations/<m>/<f>/variations.json`). */
export function rootFromManifest(file) {
  const abs = resolve(file);
  const i = abs.lastIndexOf(`${sep}.dsx${sep}variations${sep}`);
  return i >= 0 ? abs.slice(0, i) : dirname(abs);
}

/** Todas as linhas da comparação: hoje primeiro, depois as variantes. */
export const rowsOf = (m) => [{ ...(m.current ?? {}), id: m.current?.id ?? 'current', is_current: true }, ...(m.variants ?? []).map((v) => ({ ...v, is_current: false }))];

export function loadCatalogs(dsx = DSX) {
  const read = (p) => { try { return JSON.parse(readFileSync(join(dsx, p), 'utf8')); } catch { return null; } };
  const arch = read('archetypes/index.json') ?? [];
  const pats = read('patterns/index.json') ?? [];
  const dims = read('data/ux-dimensions.json') ?? {};
  const patterns = new Set();
  for (const p of Array.isArray(pats) ? pats : pats.patterns ?? []) { patterns.add(p.id); if (p.category) patterns.add(`${p.category}/${p.id}`); }
  const patList = Array.isArray(pats) ? pats : pats.patterns ?? [];
  return {
    archetypes: new Set(arch.map((a) => a.id)), archetype_cards: Object.fromEntries(arch.map((a) => [a.id, a])), patterns,
    pattern_cards: Object.fromEntries(patList.map((p) => [p.id, { title: p.title, category: p.category }])),
    laws: new Set(Object.keys(dims.laws_index ?? {})), law_cards: Object.fromEntries(Object.entries(dims.laws_index ?? {}).map(([k, v]) => [k, v.name_pt ?? k])),
    rules: { ...(dims.rules_index ?? {}), ...(dims.review_rules ?? {}) },
  };
}

/** Registro de achados do módulo: Map id → item (vazio quando não há registro). */
export function loadRegistry(root, module) {
  const f = join(root, '.dsx', 'findings', module, 'findings.json');
  if (!isFile(f)) return { file: null, items: new Map() };
  try { return { file: f, items: new Map((JSON.parse(readFileSync(f, 'utf8')).items ?? []).map((i) => [i.id, i])) }; } catch { return { file: f, items: new Map() }; }
}

const codeExists = (root, p) => {
  if (!/[*?]/.test(p)) return existsSync(join(root, p));
  return isDir(join(root, p.slice(0, p.search(/[*?]/)).replace(/[^/]*$/, '') || '.'));
};

/**
 * Confere o manifesto. Erro impede a página e a decisão; aviso é variação fraca ou dado faltando que não quebra.
 * Regras contra variação falsa: as quatro mudanças por eixo, frames próprios (não os de hoje nem os de outra
 * variante) e ao menos um padrão, arquétipo ou lei citados.
 */
export function validateManifest(m, { root, catalogs = loadCatalogs(), registry = new Map() } = {}) {
  const errors = [], warnings = [];
  const err = (s) => errors.push(s), warn = (s) => warnings.push(s);
  if (m.format !== FORMAT) err(`format ${JSON.stringify(m.format)}: esperado ${FORMAT}`);
  for (const k of ['module', 'flow', 'title']) if (!m[k]) err(`falta "${k}"`);
  for (const k of ['persona', 'task']) if (!m[k]) warn(`falta "${k}": a página abre com a tarefa e a persona`);
  if (!m.current) err('falta "current" (a versão de hoje)');
  if (!(m.variants ?? []).length) err('nenhuma variante em "variants"');
  if ((m.variants ?? []).length && m.variants.length < 2) warn(`${m.variants.length} variante: o método pede 3, realmente diferentes`);
  const ids = new Set();
  const captureOwner = new Map();
  const currentIds = new Set((m.current?.frames ?? []).map((f) => f.id));
  for (const row of rowsOf(m)) {
    const tag = row.is_current ? 'current' : `variante "${row.id}"`;
    if (ids.has(row.id)) err(`${tag}: id repetido`);
    ids.add(row.id);
    const frames = row.frames ?? [];
    if (!frames.length) err(`${tag}: sem frames`);
    const fids = new Set(frames.map((f) => f.id));
    const seen = new Set();
    for (const f of frames) {
      const ft = `${tag}, frame "${f.id}"`;
      if (!f.id) err(`${tag}: frame sem id`);
      if (seen.has(f.id)) err(`${ft}: id repetido`);
      seen.add(f.id);
      if (!f.step) err(`${ft}: falta "step"`);
      if (!KINDS.includes(f.kind)) err(`${ft}: kind ${JSON.stringify(f.kind)} (use ${KINDS.join(' | ')})`);
      if (!f.capture) err(`${ft}: falta "capture"`);
      else if (!isFile(join(root, f.capture))) err(`${ft}: captura não existe (${f.capture})`);
      else if (!row.is_current) {
        const owner = captureOwner.get(f.capture);
        if (owner && owner !== row.id) err(`${ft}: a mesma captura de "${owner}" (${f.capture}); variação precisa de frames próprios`);
      }
      if (f.capture) { if (row.is_current) captureOwner.set(f.capture, 'current'); else if (!captureOwner.has(f.capture)) captureOwner.set(f.capture, row.id); }
      if (f.kind === 'behavior') {
        const b = f.behavior ?? {};
        if (!b.action) err(`${ft}: frame de comportamento sem "behavior.action"`);
        for (const k of ['before', 'after']) if (b[k] && !fids.has(b[k])) err(`${ft}: behavior.${k} "${b[k]}" não é frame desta linha`);
        if (!b.before) warn(`${ft}: comportamento sem "behavior.before"; a página mostra só o depois`);
      }
    }
    if (row.hero && !fids.has(row.hero)) err(`${tag}: hero "${row.hero}" não é frame desta linha`);
    for (const f of frames) if (f.compare_to && !row.is_current && !currentIds.has(f.compare_to)) err(`${tag}, frame "${f.id}": compare_to "${f.compare_to}" não é frame de hoje`);
    const metrics = row.metrics ?? {};
    for (const k of METRICS) if (!Number.isFinite(Number(metrics[k])) || metrics[k] === null || metrics[k] === '') err(`${tag}: métrica "${k}" ausente ou não numérica`);
    if (row.is_current) continue;
    for (const k of ['name', 'concept', 'hypothesis']) if (!row[k]) err(`${tag}: falta "${k}"`);
    if (!(row.tradeoffs ?? []).length) err(`${tag}: sem "tradeoffs" (toda variação piora alguma coisa; diga o quê)`);
    const empty = AXES.filter((a) => !String(row.changes?.[a] ?? '').trim());
    if (!row.changes) err(`${tag}: falta "changes"`);
    else if (empty.length >= 3) err(`${tag}: muda só ${AXIS_PT[AXES.find((a) => !empty.includes(a))] ?? 'nada'}; variação de verdade muda tela, fluxo, comportamento e texto`);
    else if (empty.length) warn(`${tag}: sem mudança em ${empty.map((a) => AXIS_PT[a].toLowerCase()).join(', ')}`);
    if (row.archetype && !catalogs.archetypes.has(row.archetype)) err(`${tag}: arquétipo "${row.archetype}" não existe em archetypes/`);
    for (const p of row.patterns ?? []) if (!catalogs.patterns.has(p)) err(`${tag}: padrão "${p}" não existe em patterns/`);
    for (const l of row.laws ?? []) if (!catalogs.laws.has(l)) err(`${tag}: lei "${l}" não existe em data/ux-dimensions.json (laws_index)`);
    if (!row.archetype && !(row.patterns ?? []).length && !(row.laws ?? []).length) err(`${tag}: sem arquétipo, padrão nem lei; a variação precisa de âncora no catálogo`);
    for (const id of row.resolves ?? []) {
      const it = registry.get(id);
      if (!it) err(`${tag}: achado "${id}" não existe no registro do módulo`);
      else if (['fixed', 'ignored'].includes(it.status)) warn(`${tag}: achado "${id}" já está ${it.status === 'fixed' ? 'corrigido' : 'ignorado'}`);
    }
    for (const c of row.code ?? []) if (!codeExists(root, c)) warn(`${tag}: código "${c}" não encontrado`);
  }
  const bySet = new Map();
  for (const v of m.variants ?? []) {
    const k = (v.frames ?? []).map((f) => f.capture).sort().join('|');
    if (k && bySet.has(k)) err(`variantes "${bySet.get(k)}" e "${v.id}" têm os mesmos frames`);
    bySet.set(k, v.id);
  }
  return { errors, warnings };
}

// ---------- medida ----------

const WORD = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;
export const countWords = (s) => (String(s ?? '').match(WORD) ?? []).length;

/**
 * Mede uma captura com os seletores do UX.md: palavras visíveis (com diálogo aberto, só o diálogo; senão as regiões
 * de conteúdo, sem `header` e `nav`, que são a moldura do produto; fora `aria-hidden`, `aria-live` e `legend`; com o valor dos campos de texto),
 * ações primárias visíveis e diálogo aberto.
 */
export function measureCapture(html, cfg) {
  const root = parseHtml(html);
  const sel = cfg.verification.selectors;
  const dialogs = querySelectorAll(root, sel.dialog).filter((d) => !isHidden(d) && !closest(d.parent, sel.dialog));
  const shell = (sel.regions ?? []).filter((r) => /^(header|nav)\b|role=(banner|navigation)/.test(r)).join(', ') || 'header, nav';
  let scope = dialogs;
  if (!scope.length) {
    const main = querySelectorAll(root, 'main').filter((n) => !isHidden(n) && !closest(n.parent, 'main'));
    scope = main.length ? main : [querySelectorAll(root, 'body')[0] ?? root];
  }
  const skip = `${dialogs.length ? '' : `${shell}, `}[aria-hidden=true], [aria-live], legend`;
  const values = scope.flatMap((s) => querySelectorAll(s, 'input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea')).filter((i) => !isHidden(i)).map((i) => i.attrs.value ?? '');
  const words = scope.reduce((n, s) => n + countWords(visibleText(s, skip)), 0) + values.reduce((n, v) => n + countWords(v), 0);
  const primaries = scope.flatMap((s) => querySelectorAll(s, sel.primary)).filter((b) => !isHidden(b) && !closest(b, '[aria-hidden=true]'));
  return { words, primary_actions: new Set(primaries).size, dialog_open: dialogs.length > 0 };
}

/** Frames que contam como "tela do caminho": os de tipo `screen` (sem nenhum, todos). */
const pathFrames = (row) => { const s = (row.frames ?? []).filter((f) => f.kind === 'screen'); return s.length ? s : row.frames ?? []; };

/**
 * Métricas medidas de uma linha: words_on_screen = média de palavras por tela do caminho; primary_actions = maior
 * número de primárias visíveis numa mesma tela do caminho; dialogs = passos cujo frame mostra diálogo aberto.
 * `steps`, `clicks_to_done` e `decisions` dependem do cenário e ficam só declaradas.
 */
export function measureRow(row, { root, cfg }) {
  const per = new Map();
  for (const f of row.frames ?? []) {
    const p = join(root, f.capture ?? '');
    if (!isFile(p)) continue;
    per.set(f.id, measureCapture(readFileSync(p, 'utf8'), cfg));
  }
  const path = pathFrames(row).filter((f) => per.has(f.id));
  const words = path.map((f) => per.get(f.id).words);
  return {
    frames: Object.fromEntries(per),
    metrics: {
      words_on_screen: words.length ? Math.round(words.reduce((a, b) => a + b, 0) / words.length) : 0,
      primary_actions: path.reduce((n, f) => Math.max(n, per.get(f.id).primary_actions), 0),
      dialogs: new Set((row.frames ?? []).filter((f) => per.get(f.id)?.dialog_open).map((f) => f.step)).size,
    },
  };
}

/** Divergência entre declarada e medida: palavras com tolerância de 10%; as demais exatas. */
export function divergences(declared = {}, measured = {}) {
  const out = [];
  for (const k of MEASURED) {
    const d = Number(declared[k]), x = measured[k];
    if (!Number.isFinite(d) || x === undefined) continue;
    const off = k === 'words_on_screen' ? Math.abs(d - x) > Math.max(5, Math.round(x * 0.1)) : d !== x;
    if (off) out.push({ metric: k, declared: d, measured: x });
  }
  return out;
}

// ---------- lint ----------

const stateOfFrame = (f) => f.state ?? CAPTURE_RE.exec(basename(f.capture ?? ''))?.[3] ?? null;
const keyOf = (x) => `${x.family}|${x.rule}|${x.state ?? ''}|${normText(x.anchor)}`;

/** Roda texto, tela e estados (e layout, com geometria) nos frames de uma linha. */
export function lintRow(row, { root, cfg, geometry = null, archetypes = {}, index = null }) {
  const out = [];
  const states = new Set();
  const texts = [];
  for (const f of row.frames ?? []) {
    const p = join(root, f.capture ?? '');
    if (!isFile(p)) continue;
    const html = readFileSync(p, 'utf8');
    const st = stateOfFrame(f);
    if (st) states.add(st);
    const where = { frame: f.id, capture: f.capture };
    const doc = parseHtml(html);
    texts.push(normText(visibleText(querySelectorAll(doc, 'body')[0] ?? querySelectorAll(doc, 'html')[0] ?? doc)));
    for (const a of analyzeText(html, cfg, f.capture).findings) {
      // como no registro: texto sem origem no código, ou com a peça acusada vinda de dado, é dado (severidade 0)
      const src = index?.length ? sourceOf(index, a.text, a.piece) : undefined;
      const data = index?.length ? !src || src.location === 'data' : false;
      out.push({ family: 'text', rule: a.rule, severity: data ? 0 : a.severity, anchor: a.text, message: `${a.message}: "${a.text}"`, ...(data ? { probable_data: true } : {}), ...where });
    }
    for (const a of analyzeScreen(html, cfg, f.capture).findings) out.push({ family: 'screen', rule: a.rule, severity: a.severity, anchor: a.message, message: a.message, ...where });
    for (const a of analyzeStateCapture(html, st, cfg, f.capture)) out.push({ family: 'states', rule: a.rule, severity: a.severity, state: a.state, anchor: a.message, message: a.message, ...where });
    const g = geometry?.get(f.capture);
    if (g) {
      let r;
      if (row.is_current) r = analyzeGeometry(g, cfg, archetypes);
      else {
        const card = !g.dialog_open && f.kind === 'screen' && row.archetype ? archetypes[row.archetype] ?? null : null;
        r = analyzeLayout(g, { archetype: card, primary_position: cfg.actions?.['primary-position'] ?? null, limits: limitsFrom(cfg) });
      }
      for (const a of r.findings) out.push({ family: 'layout', rule: a.rule, severity: a.severity, anchor: a.anchor ?? a.message, message: a.message, ...where });
    }
  }
  const by = new Map();
  for (const x of out) { const k = keyOf(x); if (!by.has(k)) by.set(k, { ...x, key: k, frames: [x.frame] }); else by.get(k).frames.push(x.frame); }
  return { findings: [...by.values()], states, texts };
}

const patternOf = (template) => new RegExp(normText(template).split('{}').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*?'));

/**
 * Situação de cada achado que a variante diz resolver: `resolved` (sumiu), `persists` (o detector ainda acha ou o
 * texto citado continua na tela), `unverified` (família que as capturas não medem: fluxo, consistência, layout sem
 * geometria, ou revisão sem texto). `suspect`: resolvido, mas a mesma regra aparece como achado novo com outro texto.
 */
export function checkResolves(ids, registry, lint, { layout = false, fresh = [] } = {}) {
  return ids.map((id) => {
    const it = registry.get(id);
    if (!it) return { id, status: 'unverified', reason: 'achado fora do registro' };
    const base = { id, rule: it.rule, family: it.family, severity: it.severity, text: it.text };
    const same = (x) => x.family === it.family && x.rule === it.rule;
    const textual = [it.text, ...(it.variants ?? [])].filter(Boolean);
    if (it.family === 'flow' || it.family === 'consistency') return { ...base, status: 'unverified', reason: `família ${it.family === 'flow' ? 'fluxo' : 'consistência'}: conferir no mapa e no julgamento` };
    if (it.family === 'layout' && !layout) return { ...base, status: 'unverified', reason: 'layout sem geometria (rode com o Playwright do projeto)' };
    if (it.family === 'states' && it.rule === 'S1') {
      const st = /estado "([^"]+)"/.exec(it.message ?? it.text ?? '')?.[1] ?? String(it.region ?? '').split(' · ')[0];
      return lint.states.has(st) ? { ...base, status: 'resolved', reason: `estado "${st}" capturado` } : { ...base, status: 'persists', reason: `nenhum frame do estado "${st}"` };
    }
    let hit = null;
    if (it.origin !== 'review') {
      hit = lint.findings.find((x) => same(x) && (it.family === 'text' ? textual.some((t) => patternOf(t).test(normText(x.anchor))) : normText(x.anchor) === normText(it.text)));
    }
    if (hit) return { ...base, status: 'persists', reason: `${hit.rule} ainda acusado em ${hit.frames.join(', ')}` };
    if (it.family === 'text' && it.origin === 'review') {
      const still = textual.some((t) => lint.texts.some((s) => patternOf(t).test(s)));
      return still ? { ...base, status: 'persists', reason: 'o texto citado continua na tela' } : { ...base, status: 'resolved', reason: 'o texto citado saiu da tela' };
    }
    if (it.origin === 'review') return { ...base, status: 'unverified', reason: 'achado de revisão: conferir no julgamento' };
    const suspect = fresh.some((x) => same(x));
    return { ...base, status: 'resolved', reason: suspect ? `a regra ${it.rule} reaparece com outro texto: conferir` : 'o detector não acusa mais', ...(suspect ? { suspect: true } : {}) };
  });
}

const SKIP = /^(node_modules|dist|build|coverage|\.git|__pycache__|\.venv|venv)$/;
const SRC = /\.(tsx?|jsx?|mjs|cjs|py|json)$/;
const DATA_FILE = /(^|[._-])(data|fixtures?|mocks?)\.[a-z]+$|^(data|fixtures?|mocks?)\b/i;

/**
 * Índice do código onde o texto nasce, para separar texto de interface de dado fictício (como o registro faz):
 * as pastas de produção (`--code`, padrão `frontend/src`, `backend/shared`, `src`) e as pastas do `code` das
 * variantes e a pasta acima (dados compartilhados). Na pasta das variantes, só arquivo de dados conta como dado.
 */
export function codeIndex(m, { root, code = null } = {}) {
  const prod = (code ?? ['frontend/src', 'backend/shared', 'src']).map((p) => resolve(root, p)).filter(isDir);
  const variantDirs = new Set();
  for (const v of m.variants ?? []) for (const c of v.code ?? []) {
    const fixed = resolve(root, c.slice(0, c.search(/[*?]/) === -1 ? c.length : c.search(/[*?]/)).replace(/[^/]*$/, ''));
    if (isDir(fixed)) { variantDirs.add(fixed); variantDirs.add(dirname(fixed)); }
  }
  const out = new Map();
  const walk = (p, variant) => {
    let st; try { st = statSync(p); } catch { return; }
    if (st.isDirectory()) { if (!SKIP.test(basename(p))) for (const f of readdirSync(p).sort()) walk(join(p, f), variant); return; }
    if (!SRC.test(p) || st.size > 2_000_000 || out.has(p)) return;
    const ix = indexSource(relative(root, p), readFileSync(p, 'utf8'));
    if (variant) ix.test = DATA_FILE.test(basename(p));
    out.set(p, ix);
  };
  for (const d of variantDirs) walk(d, true);
  for (const d of prod) walk(d, false);
  return [...out.values()];
}

/** Mede a geometria dos frames (Playwright). Devolve Map capture → geometria, ou null sem Playwright. */
export async function measureAllGeometry(m, { root, cfg, playwright, width = 1440, height = 900 }) {
  if (!playwright) return null;
  const tmp = mkdtempSync(join(tmpdir(), 'dsx-variations-'));
  const out = new Map();
  try {
    const caps = [...new Set(rowsOf(m).flatMap((r) => (r.frames ?? []).map((f) => f.capture)).filter((c) => c && isFile(join(root, c))))];
    for (const [i, c] of caps.entries()) {
      const dir = join(tmp, String(i));
      const [r] = await measureGeometry([join(root, c)], { outDir: dir, cfg, width, height, playwright });
      out.set(c, JSON.parse(readFileSync(r.out, 'utf8')));
    }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  return out;
}

/**
 * Lint do manifesto inteiro. Para cada variante: achados novos (que hoje não tem), os de severidade ≥ `failAt`
 * bloqueiam, e a situação de cada id de `resolves`.
 */
export function lintManifest(m, { root, cfg, registry = new Map(), geometry = null, failAt = 3, archetypes = archetypeCatalog(), index = codeIndex(m, { root }) }) {
  const rows = rowsOf(m);
  const base = lintRow(rows[0], { root, cfg, geometry, archetypes, index });
  const baseKeys = new Set(base.findings.map((x) => x.key));
  const result = { layout: !!geometry, current: { findings: base.findings }, variants: {} };
  for (const v of rows.slice(1)) {
    const l = lintRow(v, { root, cfg, geometry, archetypes, index });
    const fresh = l.findings.filter((x) => !baseKeys.has(x.key));
    const resolves = checkResolves(v.resolves ?? [], registry, l, { layout: !!geometry, fresh });
    result.variants[v.id] = {
      findings: l.findings, new: fresh.filter((x) => x.severity >= 2), blocking: fresh.filter((x) => x.severity >= failAt), resolves,
      ok: !fresh.some((x) => x.severity >= failAt) && !resolves.some((r) => r.status === 'persists'),
    };
  }
  return result;
}

// ---------- decisão ----------

export function decisionPath(root, m) { return join(root, '.dsx', 'variations', m.module, m.flow, 'decision.json'); }

/** Monta e confere a decisão: variante inteira ou composição por eixo (cada eixo: `current` ou id de variante). */
export function makeDecision(m, { variant = null, compose = null, comment = '', by = 'dono', now = new Date() } = {}) {
  const ids = new Set(rowsOf(m).map((r) => r.id).concat('current'));
  const errors = [];
  let mode;
  if (variant && compose) errors.push('use --variant ou --compose, não os dois');
  if (variant) { mode = 'variant'; if (!ids.has(variant)) errors.push(`variante "${variant}" não existe`); }
  else if (compose) {
    mode = 'compose';
    for (const a of AXES) if (!compose[a]) errors.push(`compor: falta o eixo ${a}`);
    for (const [a, v] of Object.entries(compose)) { if (!AXES.includes(a)) errors.push(`eixo desconhecido "${a}"`); else if (!ids.has(v)) errors.push(`eixo ${a}: variante "${v}" não existe`); }
  } else errors.push('diga a escolha: --variant <id> ou --compose screen=…,flow=…,behavior=…,text=…');
  const at = now.toISOString().slice(0, 10);
  return { errors, decision: { format: FORMAT, module: m.module, flow: m.flow, mode, ...(mode === 'variant' ? { variant } : { compose }), comment: comment || '', by: by || 'dono', at } };
}

export const parseCompose = (s) => Object.fromEntries(String(s).split(',').map((p) => p.split('=').map((x) => x.trim())).filter(([k, v]) => k && v));

export function writeDecision(root, m, decision) {
  const f = decisionPath(root, m);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, `${JSON.stringify(decision, null, 2)}\n`);
  return f;
}

// ---------- imagens ----------

/**
 * Recorte do conteúdo de cada captura, em WebP (qualidade 0,75), com cache pelo conteúdo da captura: a região de
 * conteúdo (`main`, ou a 1ª região do UX.md que não é moldura) sem o cabeçalho e o menu do produto, a 1x, até a
 * altura do conteúdo (no máximo `maxHeight`). Com diálogo aberto, a parte visível da região, com o diálogo por cima.
 * Sem região de conteúdo, a página inteira. Devolve Map captura → { content, width, height }.
 */
export async function shootCaptures(captures, { root, shotsDir, playwright, width = 1440, height = 900, contentSelector = 'main', dialogSelector = '[role=dialog], dialog[open]', maxHeight = 2400, quality = 0.75, log = () => {} }) {
  mkdirSync(shotsDir, { recursive: true });
  const out = new Map();
  const todo = [];
  const have = readdirSync(shotsDir);
  for (const c of captures) {
    const name = sha1(SHOTS_VERSION, width, height, contentSelector, dialogSelector, maxHeight, quality, readFileSync(join(root, c))).slice(0, 16);
    const hit = have.map((f) => new RegExp(`^${name}\\.content\\.(\\d+)x(\\d+)\\.[a-z]+$`).exec(f)).find(Boolean);
    if (hit) out.set(c, { content: hit[0], width: Number(hit[1]), height: Number(hit[2]) }); else todo.push([c, name]);
  }
  if (todo.length && playwright) {
    const browser = await playwright.module.chromium.launch();
    try {
      const page = await browser.newPage({ viewport: { width, height } });
      const encode = await encoder(browser, quality);
      for (const [c, name] of todo) {
        await page.goto(pathToFileURL(join(root, c)).href, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
        const box = await page.evaluate(({ contentSelector, dialogSelector, maxHeight }) => {
          const vis = (e) => { const st = getComputedStyle(e); return st.display !== 'none' && st.visibility !== 'hidden' && e.getClientRects().length > 0; };
          const main = [...document.querySelectorAll(contentSelector)].find(vis);
          const H = Math.min(maxHeight, document.documentElement.scrollHeight);
          if (!main) return { x: 0, y: 0, w: innerWidth, h: Math.max(innerHeight, H) };
          const r = main.getBoundingClientRect();
          const top = r.top + scrollY;
          if ([...document.querySelectorAll(dialogSelector)].some(vis)) return { x: r.left, y: top, w: r.width, h: Math.max(200, Math.min(r.height, innerHeight - r.top)) };
          let bottom = r.top;
          for (const e of main.querySelectorAll('*')) { const b = e.getBoundingClientRect(); if (b.width && b.height && vis(e)) bottom = Math.max(bottom, b.bottom); }
          return { x: r.left, y: top, w: r.width, h: Math.max(200, Math.min(maxHeight, Math.min(r.height, bottom - r.top + 24))) };
        }, { contentSelector, dialogSelector, maxHeight });
        const clip = { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.w), height: Math.round(box.h) };
        const e = await encode(await page.screenshot({ fullPage: true, clip }));
        const file = `${name}.content.${e.width}x${e.height}.${e.ext}`;
        writeFileSync(join(shotsDir, file), Buffer.from(e.b64, 'base64'));
        out.set(c, { content: file, width: e.width, height: e.height });
        log(`${c} → ${file}`);
      }
    } finally { await browser.close(); }
  }
  return out;
}

// ---------- CLI ----------

function context(a) {
  const manifest = typeof a.manifest === 'string' ? resolve(a.manifest) : null;
  const root = resolve(typeof a.root === 'string' ? a.root : manifest ? rootFromManifest(manifest) : process.cwd());
  const file = manifest ?? (typeof a.module === 'string' && typeof a.flow === 'string' ? manifestPath({ root, module: a.module, flow: a.flow }) : null);
  if (!file) { console.error('Diga o manifesto: --root <projeto> --module <m> --flow <f>, ou --manifest <variations.json>'); process.exit(2); }
  if (!isFile(file)) { console.error(`Manifesto não encontrado: ${file}`); process.exit(2); }
  const m = JSON.parse(readFileSync(file, 'utf8'));
  const ux = typeof a.ux === 'string' ? a.ux : isFile(join(root, 'UX.md')) ? join(root, 'UX.md') : null;
  return { root, file, m, cfg: loadConfig(ux), registry: loadRegistry(root, m.module ?? a.module).items };
}

const fmtMetric = (k) => ({ steps: 'passos', clicks_to_done: 'cliques até concluir', dialogs: 'diálogos', primary_actions: 'ações primárias', words_on_screen: 'palavras por tela', decisions: 'decisões' }[k] ?? k);
const STATUS_PT = { resolved: 'resolvido', persists: 'persiste', unverified: 'sem verificação' };

async function main() {
  const a = parseArgs();
  const cmd = a._[0];
  const usage = 'Uso: node tools/ux-lint/variations.mjs <validate|measure|lint|page|decide|import> --root <projeto> --module <m> --flow <f> [opções]';
  if (!['validate', 'measure', 'lint', 'page', 'decide', 'import'].includes(cmd)) { console.error(usage); process.exit(2); }

  if (cmd === 'import') {
    const src = a._[1];
    if (!src || !isFile(src)) { console.error('Uso: node tools/ux-lint/variations.mjs import --root <projeto> <decision.json>'); process.exit(2); }
    const d = JSON.parse(readFileSync(src, 'utf8'));
    const ctx = context({ ...a, module: d.module, flow: d.flow });
    const r = makeDecision(ctx.m, { variant: d.mode === 'variant' ? d.variant : null, compose: d.mode === 'compose' ? d.compose : null, comment: d.comment, by: d.by, now: d.at ? new Date(d.at) : new Date() });
    if (r.errors.length) { console.error(r.errors.join('\n')); process.exit(1); }
    console.log(`decisão gravada em ${writeDecision(ctx.root, ctx.m, r.decision)}`);
    return;
  }

  const ctx = context(a);
  const { root, m, cfg, registry } = ctx;
  const catalogs = loadCatalogs();
  const v = validateManifest(m, { root, catalogs, registry });

  if (cmd === 'validate') {
    if (a.json) console.log(JSON.stringify(v, null, 2));
    else {
      for (const e of v.errors) console.log(`ERRO  ${e}`);
      for (const w of v.warnings) console.log(`AVISO ${w}`);
      console.log(`\n${ctx.file}: ${(m.variants ?? []).length} variante(s), ${v.errors.length} erro(s), ${v.warnings.length} aviso(s)`);
    }
    process.exit(v.errors.length ? 1 : 0);
  }
  if (cmd === 'decide') {
    const r = makeDecision(m, { variant: typeof a.variant === 'string' ? a.variant : null, compose: typeof a.compose === 'string' ? parseCompose(a.compose) : null, comment: typeof a.comment === 'string' ? a.comment : '', by: typeof a.by === 'string' ? a.by : 'dono' });
    if (r.errors.length) { console.error(r.errors.join('\n')); process.exit(1); }
    console.log(`decisão gravada em ${writeDecision(root, m, r.decision)}`);
    return;
  }
  if (cmd === 'measure') {
    const rows = rowsOf(m).map((r) => ({ id: r.id, name: r.name ?? 'Hoje', declared: r.metrics ?? {}, ...measureRow(r, { root, cfg }) }));
    for (const r of rows) r.divergences = divergences(r.declared, r.metrics);
    if (a.json) { console.log(JSON.stringify(rows.map(({ frames, ...r }) => r), null, 2)); return; }
    for (const r of rows) {
      console.log(`${r.is_current ? 'Hoje' : r.id} · ${r.name}`);
      for (const k of METRICS) {
        const d = r.declared[k], x = r.metrics[k];
        const div = r.divergences.find((y) => y.metric === k);
        console.log(`   ${fmtMetric(k).padEnd(22)} declarada ${String(d ?? '—').padStart(5)}  medida ${String(x ?? '—').padStart(5)}${div ? '  ← diverge' : ''}`);
      }
    }
    console.log('\nA medida não sobrescreve o manifesto: corrija a declarada ou explique a diferença na legenda do frame.');
    return;
  }
  if (v.errors.length) { for (const e of v.errors) console.error(`ERRO  ${e}`); console.error('Manifesto inválido: corrija antes de rodar o lint ou a página (validate).'); process.exit(1); }

  const playwright = resolvePlaywright();
  const geometry = a['no-layout'] ? null : await measureAllGeometry(m, { root, cfg, playwright }).catch((e) => { console.error(`geometria não medida: ${String(e.message).split('\n')[0]}`); return null; });
  if (!geometry && !a['no-layout']) console.error('Sem Playwright no diretório atual: o lint roda sem as regras de layout (L).');
  const failAt = Number(a['fail-at'] ?? 3);
  const lint = lintManifest(m, { root, cfg, registry, geometry, failAt });

  if (cmd === 'lint') {
    if (a.json) { console.log(JSON.stringify(lint, null, 2)); process.exit(Object.values(lint.variants).every((x) => x.ok) ? 0 : 1); }
    console.log(`Hoje: ${lint.current.findings.length} achado(s) nos frames · detectores: texto, tela, estados${lint.layout ? ', layout' : ''}`);
    for (const r of rowsOf(m).slice(1)) {
      const x = lint.variants[r.id];
      console.log(`\n${x.ok ? '✓' : '✗'} ${r.id} · ${r.name}`);
      for (const s of x.resolves) console.log(`   ${STATUS_PT[s.status].padEnd(15)} ${s.id} ${s.rule ?? ''} · ${s.reason}`);
      for (const n of x.new) console.log(`   ${n.severity >= failAt ? 'BLOQUEIA' : 'novo    '} ${n.rule} sev ${n.severity} · ${String(n.message).slice(0, 110)} (${n.frames.join(', ')})`);
      if (!x.new.length) console.log('   nenhum achado novo de severidade ≥ 2');
    }
    process.exit(Object.values(lint.variants).every((x) => x.ok) ? 0 : 1);
  }

  // page
  if (typeof a.out !== 'string') { console.error('Diga a saída: --out <pagina.html>'); process.exit(2); }
  const out = resolve(a.out);
  const flowDir = dirname(ctx.file);
  const shotsDir = typeof a.shots === 'string' ? resolve(a.shots) : join(flowDir, 'shots');
  const captures = [...new Set(rowsOf(m).flatMap((r) => (r.frames ?? []).map((f) => f.capture)))];
  let shots = new Map();
  if (!a['no-shots']) {
    if (!playwright) console.error(`${PLAYWRIGHT_MISSING}\nA página sai sem imagens.`);
    const regions = cfg.verification.selectors.regions ?? [];
    const content = regions.includes('main') ? 'main' : regions.find((r) => !/^(header|nav|aside)\b|role=(banner|navigation|complementary)|dialog/.test(r)) ?? 'main';
    shots = await shootCaptures(captures, { root, shotsDir, playwright, contentSelector: content, dialogSelector: cfg.verification.selectors.dialog || '[role=dialog]', log: a.verbose ? console.log : () => {} });
  }
  const measured = Object.fromEntries(rowsOf(m).map((r) => { const x = measureRow(r, { root, cfg }); return [r.id, { metrics: x.metrics, divergences: divergences(r.metrics, x.metrics), frames: x.frames }]; }));
  const pages = renderVariationsPages(m, {
    lint, measured, registry, shots, shotsDir, catalogs, file: basename(out), product: typeof a.product === 'string' ? a.product : '',
    findings_page: typeof a['findings-page'] === 'string' ? a['findings-page'] : null, warnings: v.warnings,
    maxBytes: a['max-page-mb'] ? Number(a['max-page-mb']) * 1024 * 1024 : PAGE_MAX_BYTES, dsx_rel: relative(root, DSX) || '.',
  });
  mkdirSync(dirname(out), { recursive: true });
  for (const p of pages) writeFileSync(join(dirname(out), p.file), p.html);
  console.log(`${pages.map((p) => `${join(dirname(out), p.file)} (${(p.bytes / 1048576).toFixed(1)} MB)`).join('\n')}`);
  console.log(`${(m.variants ?? []).length} variante(s) · ${shots.size} de ${captures.length} captura(s) com imagem${lint.layout ? '' : ' · lint sem layout'}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
