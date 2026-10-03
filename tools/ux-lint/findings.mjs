#!/usr/bin/env node
// Registro de achados de UX (contrato: knowledge/fundamentos/achados-de-ux.md). Sem dependências.
// Junta o resultado dos verificadores de texto, tela e fluxo num registro durável por módulo, com id estável,
// decisão do dono separada do resultado da máquina e status calculado entre execuções.
//
//   node tools/ux-lint/findings.mjs register --module <m> [--dir .dsx/findings] [--text t.json] [--screen s.json] [--flow f.json] [--root <repo>] [--include-sev0]
//   node tools/ux-lint/findings.mjs options  --module <m> --from cases.json
//   node tools/ux-lint/findings.mjs decide   --module <m> <id> <índice|ignore|free> [--reason "…"] [--text "…"] [--by nome]
//   node tools/ux-lint/findings.mjs import   --module <m> decisions.json
//   node tools/ux-lint/findings.mjs status   --module <m> [--json]
//   node tools/ux-lint/findings.mjs check    --module <m> [--min 2] [--text …] [--screen …] [--flow …] [--root <repo>]
//   node tools/ux-lint/findings.mjs page     --module <m> <saida.html> [--product …] [--color …]
//
// Arquivos em <dir>/<módulo>/: findings.json (escrito aqui), options.json (opções da skill), decisions.json (dono).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, isAbsolute, basename, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { renderTextPage, normalizeElement, sortCases } from './text-page.mjs';
import { normalizeCases, normalizeDetectorJson } from './lib/legacy.mjs';

/** Verificadores que produzem a entrada de cada família (nomes isolados aqui para renomear sem caçar no código). */
export const DETECTORS = { text: 'tools/ux-lint/text.mjs', screen: 'tools/ux-lint/screen.mjs', flow: 'tools/ux-lint/flow.mjs' };
export const FAMILIES = ['text', 'screen', 'flow'];
const PREFIX = { text: 't', screen: 's', flow: 'f' };
export const STATUSES = ['open', 'decided', 'ignored', 'fixed', 'regression'];
const STATUS_PT = { open: 'aberto', decided: 'decidido', ignored: 'ignorado', fixed: 'corrigido', regression: 'regressão' };

// ---------- normalização ----------

const ZW = /[​-‍﻿]/g;
const clean = (s) => String(s ?? '').replace(ZW, '').replace(/\s+/g, ' ').trim();
/** Troca dado variável (datas, horas, valores, números, marcadores `{nome}`) por `{}`, preservando a caixa. */
export function maskData(s) {
  return clean(s)
    .replace(/\{[^{}]*\}/g, '{}')
    .replace(/\b\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?\b/g, '{}')
    .replace(/\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/g, '{}')
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, '{}')
    .replace(/R\$\s?\{\}/g, '{}')
    .replace(/\d+(?:[.,]\d+)*/g, '{}')
    .replace(/R\$\s?\{\}/g, '{}');
}
export const normText = (s) => maskData(s).toLowerCase();

/** Texto-modelo a partir das variantes: palavras iguais no começo e no fim ficam, o miolo que muda vira `{}`. */
export function templateOf(text, variants = []) {
  const all = [...new Set([text, ...variants].filter((v) => clean(v)).map(maskData))];
  if (all.length <= 1) return all[0] ?? '';
  const toks = all.map((v) => v.split(' '));
  const min = Math.min(...toks.map((t) => t.length));
  let p = 0;
  while (p < min && toks.every((t) => t[p] === toks[0][p])) p++;
  let q = 0;
  while (q < min - p && toks.every((t) => t[t.length - 1 - q] === toks[0][toks[0].length - 1 - q])) q++;
  const out = [...toks[0].slice(0, p), '{}', ...toks[0].slice(toks[0].length - q)];
  return out.join(' ').replace(/(\{\}\s?)+\{\}/g, '{}');
}

const sha = (s) => createHash('sha1').update(s).digest('hex');
const fileOf = (src) => String(src).replace(/:\d+(:\d+)?$/, '');
const isCode = (src) => !/\.html?(:\d+)*$/.test(String(src));

/**
 * Id estável: hash de `family | rule | âncora`. Âncora: arquivo da primeira origem no código (sem linha) + texto
 * normalizado; sem origem no código, tela + região + texto. A família flow ancora sempre na tela do mapa (a
 * evidência dela lista transições de entrada, que mudam sem que o achado mude).
 */
export function stableId(item) {
  const code = item.family === 'flow' ? null : (item.source ?? []).find(isCode);
  const anchor = code
    ? `${fileOf(code)}|${normText(item.text)}`
    : `${item.family === 'text' ? '' : (item.screens ?? [])[0] ?? ''}|${item.region ?? ''}|${normText(item.text)}`;
  return `${PREFIX[item.family]}-${sha(`${item.family}|${item.rule}|${anchor}`).slice(0, 8)}`;
}

// ---------- normalização das três saídas ----------

const ELEMENT_FROM_TYPE = {
  title: 'title', button: 'button', tab: 'tab', label: 'label', placeholder: 'placeholder', helper: 'helper',
  alert: 'alert', 'accessible-name': 'accessible-name', tooltip: 'tooltip', 'empty-value': 'cell',
};
const ELEMENT_FROM_SCREEN_RULE = { T1: 'button', T2: 'button', T3: 'title', T4: 'label', T5: 'button', T7: 'button' };
const screenName = (f) => basename(String(f)).replace(/\.html?$/, '');

function makeRel(root) {
  return (p) => {
    const s = String(p);
    if (!root || !isAbsolute(s)) return s;
    const r = relative(root, s);
    return r.startsWith('..') ? s : r;
  };
}

/**
 * Saída do verificador de texto (`--json`) → itens. Severidade 0 (provável dado) fica fora salvo `includeSev0`.
 * A saída antiga, com chaves em pt-BR, também é lida (lib/legacy.mjs) — vale para as três famílias.
 */
export function fromText(input, { root = null, includeSev0 = false } = {}) {
  const json = normalizeDetectorJson(input);
  const rel = makeRel(root);
  return (json.findings ?? []).filter((a) => includeSev0 || a.severity > 0).map((a) => {
    const variants = a.variants && a.variants.length > 1 ? a.variants : [];
    const source = (a.source?.occurrences ?? []).map((o) => `${rel(o.file)}:${o.line}`);
    return {
      family: 'text', rule: a.rule, severity: a.severity,
      element: ELEMENT_FROM_TYPE[(a.types ?? [])[0]] ?? null,
      text: variants.length ? templateOf(a.text, variants) : clean(a.text),
      variants, screens: [...new Set((a.screens ?? []).map(screenName))].sort(), source,
      message: a.message ?? '',
    };
  });
}

/** Saída do verificador de tela (`--json`) → itens (um por tela, região e mensagem). */
export function fromScreen(input, { root = null } = {}) {
  const json = normalizeDetectorJson(input);
  const rel = makeRel(root);
  const out = [];
  for (const t of json.screens ?? []) for (const a of t.findings ?? []) {
    const ev = String(a.evidence ?? '').split(/,\s*/).filter(Boolean).map((e) => rel(e.replace(/:(\d+):\d+$/, ':$1')));
    out.push({
      family: 'screen', rule: a.rule, severity: a.severity, element: ELEMENT_FROM_SCREEN_RULE[a.rule] ?? null,
      text: maskData(a.message), variants: maskData(a.message) !== clean(a.message) ? [clean(a.message)] : [],
      screens: [screenName(t.file)], region: a.region ?? '', source: [...new Set(ev)], message: a.message,
    });
  }
  return out;
}

/** Saída do verificador de fluxo (`--json`) → itens (âncora: a tela ou jornada do mapa). */
export function fromFlow(input, { root = null } = {}) {
  const json = normalizeDetectorJson(input);
  const rel = makeRel(root);
  const out = [];
  for (const s of Array.isArray(json) ? json : [json]) for (const a of s.findings ?? []) {
    const source = [];
    for (const e of a.evidence ?? []) {
      const m = String(e).match(/([\w@./-]+\.(?:tsx?|jsx?|mjs|cjs|py|vue|svelte)(?::\d+)?)/);
      if (m && !source.includes(rel(m[1]))) source.push(rel(m[1]));
    }
    out.push({
      family: 'flow', rule: a.rule, severity: a.severity, element: null,
      text: maskData(a.message), variants: maskData(a.message) !== clean(a.message) ? [clean(a.message)] : [],
      screens: [a.screen], source, message: a.message,
    });
  }
  return out;
}

/** Junta itens de mesmo id dentro de uma execução (ex.: dois textos que só diferem por um número). */
function collapse(items) {
  const by = new Map();
  for (const it of items) {
    const already = by.get(it.id);
    if (!already) { by.set(it.id, { ...it }); continue; }
    already.severity = Math.max(already.severity, it.severity);
    already.screens = [...new Set([...already.screens, ...it.screens])].sort();
    already.source = [...new Set([...already.source, ...it.source])];
    already.variants = [...new Set([...(already.variants.length ? already.variants : []), ...(it.variants ?? [])])];
  }
  return [...by.values()];
}

const textKeys = (it) => new Set([it.text, ...(it.variants ?? [])].filter(Boolean).map(normText));

/**
 * Dá id aos itens de uma execução. Quando o id calculado não existe no registro mas um item registrado da mesma
 * família, regra e arquivo tem uma variante em comum (o conjunto de variantes mudou e o modelo mudou junto),
 * herda o id registrado.
 */
export function assignIds(items, registry = []) {
  const known = new Set(registry.map((r) => r.id));
  for (const it of items) {
    it.id = stableId(it);
    if (known.has(it.id) || it.family !== 'text') continue;
    const file = (it.source ?? []).find(isCode);
    const keys = textKeys(it);
    const match = registry.find((r) => r.family === it.family && r.rule === it.rule && r.origin !== 'review'
      && (r.source ?? []).find(isCode) && fileOf((r.source ?? []).find(isCode)) === (file ? fileOf(file) : null)
      && [...textKeys(r)].some((k) => keys.has(k)));
    if (match) it.id = match.id;
  }
  return collapse(items);
}

/** Lê as entradas da execução (arquivos JSON de cada família). Devolve { items, families }. */
export function collect({ text, screen, flow, root = null, includeSev0 = false }, registry = []) {
  const items = [];
  const families = [];
  const read = (f) => JSON.parse(readFileSync(f, 'utf8'));
  if (text) { items.push(...fromText(read(text), { root, includeSev0 })); families.push('text'); }
  if (screen) { items.push(...fromScreen(read(screen), { root })); families.push('screen'); }
  if (flow) { items.push(...fromFlow(read(flow), { root })); families.push('flow'); }
  return { items: assignIds(items, registry), families };
}

// ---------- status ----------

export function statusOf(item, decisions = {}) {
  const d = decisions.items?.[item.id];
  if (d?.choice === 'ignore') return 'ignored';
  if (!item.present) return 'fixed';
  if (item.fixed_at) return 'regression';
  if (d && (typeof d.choice === 'number' || d.choice === 'free')) return 'decided';
  return 'open';
}

export function restatus(reg, decisions) {
  for (const it of reg.items) it.status = statusOf(it, decisions);
  return reg;
}

// ---------- registro em disco ----------

const today = (now) => (now ?? new Date()).toISOString().slice(0, 10);
export function paths(dir, module) {
  const base = join(dir, module);
  return { base, findings: join(base, 'findings.json'), options: join(base, 'options.json'), decisions: join(base, 'decisions.json') };
}
const readJson = (f, vazio) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : vazio);
const writeJson = (f, data) => { mkdirSync(join(f, '..'), { recursive: true }); writeFileSync(f, `${JSON.stringify(data, null, 2)}\n`); };
export const load = (p, module) => ({
  findings: readJson(p.findings, { module, updated: null, runs: [], items: [] }),
  options: readJson(p.options, { items: {} }),
  decisions: readJson(p.decisions, { items: {} }),
});

/**
 * Funde uma execução no registro. Só as famílias que vieram nesta execução podem marcar ausência; itens de
 * revisão manual (`origin: "review"`) não são vistos pelos verificadores e nunca ficam ausentes por eles.
 */
export function merge(reg, run, { now = new Date(), commit = null, decisions = { items: {} } } = {}) {
  const day = today(now);
  const byId = new Map(reg.items.map((i) => [i.id, i]));
  const seen = new Set();
  for (const it of run.items) {
    seen.add(it.id);
    const already = byId.get(it.id);
    const fresh = {
      id: it.id, family: it.family, rule: it.rule, severity: it.severity, element: it.element ?? null,
      text: it.text, variants: it.variants ?? [], screens: it.screens ?? [], source: it.source ?? [],
      ...(it.region ? { region: it.region } : {}), message: it.message ?? '', origin: 'detector',
    };
    if (already) {
      Object.assign(already, fresh, { first_seen: already.first_seen, last_seen: day, present: true });
    } else {
      const item = { ...fresh, first_seen: day, last_seen: day, present: true, status: 'open' };
      reg.items.push(item);
      byId.set(item.id, item);
    }
  }
  for (const it of reg.items) {
    if (!run.families.includes(it.family) || seen.has(it.id) || it.origin === 'review') continue;
    if (it.present) { it.present = false; it.fixed_at = day; }
  }
  reg.updated = day;
  reg.runs.push({ at: now.toISOString().replace(/\.\d{3}Z$/, 'Z'), sources: run.families, ...(commit ? { commit } : {}) });
  reg.items.sort((a, b) => FAMILIES.indexOf(a.family) - FAMILIES.indexOf(b.family) || b.severity - a.severity || a.rule.localeCompare(b.rule, 'pt', { numeric: true }) || a.id.localeCompare(b.id));
  return restatus(reg, decisions);
}

function gitCommit(root) {
  if (!root) return null;
  try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; } catch { return null; }
}

// ---------- opções ----------

const stripMarks = (k) => k.replace(/\{\}/g, ' ').replace(/[—–-]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Um caso de opções cobre o item? Mesma regra e: texto igual (normalizado) a uma das variantes, em qualquer
 * arquivo (a origem anotada no caso pode ser outra ocorrência do mesmo texto); ou um texto contido no outro
 * (8+ caracteres) com arquivo em comum.
 */
export function caseMatches(entry, item) {
  if (item.family !== 'text' || item.rule !== entry.rule || item.origin === 'review') return false;
  const a = textKeys({ text: entry.text, variants: entry.variants });
  const b = textKeys(item);
  if ([...a].some((k) => b.has(k))) return true;
  const cf = new Set((entry.source ?? []).map(fileOf));
  const itf = (item.source ?? []).map(fileOf);
  if (cf.size && itf.length && !itf.some((f) => cf.has(f))) return false;
  const sa = [...a].map(stripMarks).filter((k) => k.length >= 8);
  const sb = [...b].map(stripMarks).filter((k) => k.length >= 8);
  return sa.some((x) => sb.some((y) => x === y || x.includes(y) || y.includes(x)));
}

/** Importa casos com opções; devolve { matched, manual, links } e altera reg/options. */
export function importOptions(reg, options, input, { now = new Date() } = {}) {
  const cases = normalizeCases(input).data ?? [];
  const day = today(now);
  let matched = 0, manual = 0;
  const links = [];
  for (const entry of cases) {
    let ids = reg.items.filter((it) => caseMatches(entry, it)).map((it) => it.id);
    if (ids.length) matched++;
    else {
      const item = {
        family: 'text', rule: entry.rule ?? 'desc', severity: entry.severity ?? 1, element: normalizeElement(entry.element),
        text: maskData(entry.text), variants: (entry.variants ?? []).filter(Boolean),
        screens: (entry.screens ?? []).map(screenName), source: entry.source ?? [], message: entry.problem ?? '',
      };
      item.id = stableId(item);
      const already = reg.items.find((i) => i.id === item.id);
      if (already) Object.assign(already, item, { origin: 'review', present: true, last_seen: day });
      else reg.items.push({ ...item, origin: 'review', first_seen: day, last_seen: day, present: true, status: 'open' });
      ids = [item.id];
      manual++;
    }
    for (const id of ids) {
      options.items[id] = {
        problem: entry.problem ?? '',
        options: (entry.options ?? []).map((o) => ({ text: o.text, convention: o.convention ?? '', note: o.note ?? '' })),
        recommended: entry.recommended ? { index: entry.recommended.index, why: entry.recommended.why ?? '' } : null,
        ...(entry.id ? { case: entry.id } : {}),
      };
    }
    links.push({ case: entry.id ?? null, ids });
  }
  return { matched, manual, links };
}

// ---------- decisões ----------

export function makeDecision(choice, { reason = null, text = null, by = 'dono', now = new Date(), options = null } = {}) {
  let c = choice;
  if (typeof c === 'string' && /^\d+$/.test(c)) c = Number(c);
  if (c !== 'ignore' && c !== 'free' && !Number.isInteger(c)) throw new Error(`escolha inválida "${choice}" (use o índice da opção, ignore ou free)`);
  if (c === 'ignore' && !clean(reason)) throw new Error('ignore exige --reason');
  if (c === 'free' && !clean(text)) throw new Error('free exige --text');
  if (Number.isInteger(c) && options && !(c >= 0 && c < (options.options ?? []).length)) throw new Error(`índice ${c} fora das opções (0–${(options.options ?? []).length - 1})`);
  return { choice: c, by: by || 'dono', at: today(now), reason: clean(reason) || null, ...(c === 'free' ? { text: clean(text) } : {}) };
}

/** Importa o JSON exportado pela página (`{items:{id:{choice,…}}}`). Devolve { ok, unknown, invalid }. */
export function importDecisions(reg, decisions, data, { now = new Date() } = {}) {
  const known = new Set(reg.items.map((i) => i.id));
  const out = { ok: 0, unknown: [], invalid: [] };
  for (const [id, d] of Object.entries(data.items ?? {})) {
    if (!known.has(id)) { out.unknown.push(id); continue; }
    try {
      const dec = makeDecision(d.choice, { reason: d.reason, text: d.text, by: d.by, now: d.at ? new Date(`${d.at}T12:00:00Z`) : now });
      decisions.items[id] = dec;
      out.ok++;
    } catch (e) { out.invalid.push(`${id}: ${e.message}`); }
  }
  return out;
}

// ---------- check ----------

/** Compara uma execução com o registro, sem gravar. Devolve { pass, added, regressions, known }. */
export function check(reg, run, { min = 2, decisions = { items: {} } } = {}) {
  const byId = new Map(reg.items.map((i) => [i.id, i]));
  const added = [], regressions = [], known = [];
  for (const it of run.items) {
    const already = byId.get(it.id);
    if (!already) { if (it.severity >= min) added.push(it); continue; }
    const st = statusOf(already, decisions);
    if (st === 'ignored') continue;
    if (st === 'fixed' || st === 'regression') regressions.push({ ...it, was: st });
    else known.push({ ...it, status: st });
  }
  return { pass: !added.length && !regressions.length, added, regressions, known };
}

// ---------- status (resumo) ----------

export function summary(reg) {
  const countBy = (f) => reg.items.reduce((o, i) => { const k = f(i); o[k] = (o[k] || 0) + 1; return o; }, {});
  return {
    module: reg.module, updated: reg.updated, runs: reg.runs.length, total: reg.items.length,
    by_status: countBy((i) => i.status), by_family: countBy((i) => i.family), by_rule: countBy((i) => i.rule), by_severity: countBy((i) => i.severity),
    regression: reg.items.filter((i) => i.status === 'regression').map(({ id, rule, text, source, screens }) => ({ id, rule, text, source, screens })),
    decided: reg.items.filter((i) => i.status === 'decided').map(({ id, rule, text, source, screens }) => ({ id, rule, text, source, screens })),
  };
}

// ---------- página ----------

const escH = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Monta os casos da página: um por caso de opções (vários ids) ou por item sem opções; corrigidos ficam fora. */
export function pageCases(reg, options, decisions) {
  const alive = reg.items.filter((i) => i.status !== 'fixed');
  const groups = new Map();
  for (const it of alive) {
    const op = options.items?.[it.id];
    const k = op ? `op:${op.case ?? it.id}` : `id:${it.id}`;
    if (!groups.has(k)) groups.set(k, { items: [], op });
    groups.get(k).items.push(it);
  }
  const cases = [];
  for (const [k, { items, op }] of groups) {
    const it = items[0];
    const ds = items.map((i) => decisions.items?.[i.id]).filter(Boolean);
    cases.push({
      id: k.replace(/^(op|id):/, 'case-'), ids: items.map((i) => i.id), statuses: items.map((i) => i.status),
      element: it.element ?? (it.family === 'text' ? 'accessible-name' : it.family), rule: it.rule,
      severity: Math.max(...items.map((i) => i.severity)), text: it.text,
      variants: [...new Set(items.flatMap((i) => i.variants.length ? i.variants : [i.text]))],
      source: [...new Set(items.flatMap((i) => i.source))], screens: [...new Set(items.flatMap((i) => i.screens))],
      problem: op?.problem || it.message, options: (op?.options ?? []).map((o) => ({ text: o.text, convention: o.convention, note: o.note })),
      recommended: op?.recommended ? { index: op.recommended.index, why: op.recommended.why } : null,
      decision: ds.length === items.length && ds.every((d) => JSON.stringify(d.choice) === JSON.stringify(ds[0].choice)) ? ds[0] : null,
    });
  }
  return sortCases(cases);
}

const PAGE_STYLE = `
.meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px}
.meta code{font:11.5px var(--mono);color:var(--muted)}
.st{border-radius:999px;padding:1px 8px;font-weight:600;font-size:12px}
.st-open{background:var(--accent-soft);color:var(--accent)}.st-decided{background:var(--ok-soft);color:var(--ok)}
.st-ignored{background:var(--line);color:var(--muted)}.st-regression{background:var(--bad-soft);color:var(--bad)}.st-fixed{background:var(--ok-soft);color:var(--ok)}
.decisao{border:1px dashed var(--line);border-radius:10px;padding:10px 12px;margin:0;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
.decisao legend{font-size:12px;font-weight:600;padding:0 4px}
.decisao label{display:inline-flex;gap:6px;align-items:center;cursor:pointer;min-height:32px}
.decisao input[type=radio]{accent-color:var(--accent);width:18px;height:18px}
.decisao input[type=text]{font:13px var(--sans);flex:1;min-width:200px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg)}
.decisao input[type=text][aria-invalid=true]{border-color:var(--bad)}
.ja{font-size:12px;color:var(--ok);font-weight:600}
.acoes{position:sticky;bottom:0;background:var(--bg);border-top:1px solid var(--line);padding:12px 0;display:flex;flex-wrap:wrap;gap:12px;align-items:center;z-index:2}
.acoes button{font:600 14px var(--sans);background:var(--accent);color:#fff;border:0;border-radius:10px;padding:9px 18px;cursor:pointer;min-height:40px}
.acoes button:focus-visible,.decisao input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.acoes input{font:13px var(--sans);padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg)}
#saida{width:100%;min-height:140px;font:12px var(--mono);border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg);padding:8px}
#aviso{font-size:13px}`;

const PAGE_SCRIPT = `
const hoje=new Date().toISOString().slice(0,10);
function coletar(){const itens={};const erros=[];const por=(document.getElementById('por').value||'').trim()||'dono';
document.querySelectorAll('fieldset.decisao').forEach(f=>{const r=f.querySelector('input[type=radio]:checked');const m=f.querySelector('input[type=text]');m.removeAttribute('aria-invalid');
if(!r)return;const motivo=(m.value||'').trim()||null;
if(r.value==='ignore'&&!motivo){erros.push(f.dataset.case);m.setAttribute('aria-invalid','true');return;}
const escolha=r.value==='ignore'?'ignore':Number(r.value);
f.dataset.ids.split(' ').forEach(id=>{itens[id]={choice:escolha,by:por,at:hoje,reason:motivo};});});
return {itens,erros};}
document.getElementById('copiar').addEventListener('click',async()=>{const {itens,erros}=coletar();const aviso=document.getElementById('aviso');const saida=document.getElementById('saida');
if(erros.length){aviso.textContent='Para ignorar, escreva o motivo ('+erros.length+' caso(s) sem motivo, marcados em vermelho).';return;}
const n=Object.keys(itens).length;const json=JSON.stringify({items:itens},null,2);saida.value=json;saida.hidden=false;
try{await navigator.clipboard.writeText(json);aviso.textContent=n+' decisão(ões) copiadas. Cole em decisions.json ou no chat.';}
catch(e){saida.focus();saida.select();aviso.textContent=n+' decisão(ões) no campo abaixo, já selecionadas: copie com Ctrl+C ou Cmd+C.';}});`;

export function renderPage(reg, options, decisions, { product = '', color = '#0E71B8' } = {}) {
  const cases = pageCases(reg, options, decisions);
  const fixed = reg.items.filter((i) => i.status === 'fixed').length;
  const header = (c) => `<span class="meta">${[...new Set(c.statuses)].map((s) => `<span class="st st-${s}">${STATUS_PT[s] ?? s}</span>`).join('')}<code>${c.ids.slice(0, 4).map(escH).join(' ')}${c.ids.length > 4 ? ` +${c.ids.length - 4}` : ''}</code></span>`;
  const footer = (c) => {
    const d = c.decision;
    const checked = (v) => (d && String(d.choice) === String(v) ? ' checked' : '');
    const ops = c.options.map((_, i) => `<label><input type="radio" name="d-${escH(c.id)}" value="${i}"${checked(i)}> ${String.fromCharCode(65 + i)}</label>`).join('');
    const already = d ? `<span class="ja">Decidido: ${d.choice === 'ignore' ? 'ignorar' : d.choice === 'free' ? `texto livre "${escH(d.text)}"` : `opção ${String.fromCharCode(65 + d.choice)}`}${d.by ? ` por ${escH(d.by)}` : ''}${d.at ? ` em ${escH(d.at)}` : ''}</span>` : '';
    return `<fieldset class="decisao" data-ids="${escH(c.ids.join(' '))}" data-case="${escH(c.id)}"><legend>Sua decisão</legend>${ops}<label><input type="radio" name="d-${escH(c.id)}" value="ignore"${checked('ignore')}> Ignorar</label><input type="text" aria-label="Motivo" placeholder="Motivo (obrigatório para ignorar)" value="${escH(d?.reason ?? '')}">${already}</fieldset>`;
  };
  const bottom = `<div class="acoes"><label>Quem decide <input id="por" type="text" autocomplete="name"></label><button type="button" id="copiar">Copiar decisões</button><span id="aviso" role="status" aria-live="polite"></span>
  <textarea id="saida" hidden readonly aria-label="Decisões em JSON"></textarea></div>`;
  return renderTextPage(cases, {
    title: `Achados de UX · ${reg.module}`, product, color, eyebrow: 'Registro de achados de UX',
    lede: `Cada caso mostra o elemento como aparece hoje e as opções. Escolha uma opção ou "Ignorar" (com motivo) e use "Copiar decisões" no fim da página: o JSON vai para decisions.json pelo comando import. ${fixed} achado(s) corrigido(s) ficaram fora da lista.`,
    card: { header, footer }, style: PAGE_STYLE, script: PAGE_SCRIPT, bottom,
  });
}

// ---------- CLI ----------

const USO = `Uso: node tools/ux-lint/findings.mjs <register|options|decide|import|status|check|page> --module <m> [opções]
  register --text t.json --screen s.json --flow f.json [--root <repo>] [--include-sev0]
  options  --from cases.json
  decide   <id> <índice|ignore|free> [--reason "…"] [--text "…"] [--by nome]
  import   decisions.json
  status   [--json]
  check    [--min 2] --text … --screen … --flow … [--root <repo>]
  page     <saida.html> [--product …] [--color …]
  (--dir padrão: <root ou diretório atual>/.dsx/findings; entradas vêm de ${Object.values(DETECTORS).join(', ')} com --json)`;

function main() {
  const a = parseArgs();
  const [cmd, ...pos] = a._;
  if (!cmd || !a.module || a.module === true) { console.error(USO); process.exit(2); }
  const root = typeof a.root === 'string' ? resolve(a.root) : null;
  const dir = typeof a.dir === 'string' ? resolve(a.dir) : join(root ?? process.cwd(), '.dsx', 'findings');
  const p = paths(dir, a.module);
  const st = load(p, a.module);
  const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
  const str = (v) => (typeof v === 'string' ? v : null);
  const inputs = { text: str(a.text), screen: str(a.screen), flow: str(a.flow), root, includeSev0: !!a['include-sev0'] };
  const loc = (i) => (i.source?.[0] ?? (i.screens ?? []).join(', '));

  if (cmd === 'register') {
    if (!inputs.text && !inputs.screen && !inputs.flow) { console.error('register: informe ao menos --text, --screen ou --flow'); process.exit(2); }
    const run = collect(inputs, st.findings.items);
    st.findings.module = a.module;
    merge(st.findings, run, { now, commit: gitCommit(root), decisions: st.decisions });
    writeJson(p.findings, st.findings);
    const s = summary(st.findings);
    console.log(`${relative(process.cwd(), p.findings) || p.findings} · ${run.items.length} achados nesta execução (${run.families.join(', ')}); registro com ${s.total}: ${Object.entries(s.by_status).map(([k, v]) => `${STATUS_PT[k]} ${v}`).join(', ')}`);
    return;
  }
  if (cmd === 'options') {
    if (!str(a.from)) { console.error('options: informe --from cases.json'); process.exit(2); }
    const { data, warnings } = normalizeCases(JSON.parse(readFileSync(a.from, 'utf8')));
    for (const w of warnings) console.error(`AVISO ${a.from}: ${w}`);
    const cases = (Array.isArray(data) ? data : data?.cases) ?? [];
    const r = importOptions(st.findings, st.options, cases, { now });
    restatus(st.findings, st.decisions);
    writeJson(p.findings, st.findings);
    writeJson(p.options, st.options);
    console.log(`${cases.length} casos: ${r.matched} casaram com achados do registro (${r.links.filter((l) => l.ids.length && l.ids.length > 1).length} cobrindo mais de um id); ${r.manual} viraram achado de revisão manual.`);
    return;
  }
  if (cmd === 'decide') {
    const [id, choice] = pos;
    if (!id || choice === undefined) { console.error(USO); process.exit(2); }
    if (!st.findings.items.some((i) => i.id === id)) { console.error(`id ${id} não está no registro`); process.exit(1); }
    try {
      st.decisions.items[id] = makeDecision(choice, { reason: str(a.reason), text: str(a.text), by: str(a.by) ?? 'dono', now, options: st.options.items[id] });
    } catch (e) { console.error(e.message); process.exit(2); }
    restatus(st.findings, st.decisions);
    writeJson(p.decisions, st.decisions);
    writeJson(p.findings, st.findings);
    console.log(`${id}: ${st.findings.items.find((i) => i.id === id).status}`);
    return;
  }
  if (cmd === 'import') {
    if (!pos[0]) { console.error(USO); process.exit(2); }
    const r = importDecisions(st.findings, st.decisions, JSON.parse(readFileSync(pos[0], 'utf8')), { now });
    restatus(st.findings, st.decisions);
    writeJson(p.decisions, st.decisions);
    writeJson(p.findings, st.findings);
    console.log(`${r.ok} decisão(ões) importadas${r.unknown.length ? `; ${r.unknown.length} id(s) fora do registro: ${r.unknown.join(', ')}` : ''}${r.invalid.length ? `; inválidas: ${r.invalid.join('; ')}` : ''}`);
    process.exit(r.invalid.length ? 1 : 0);
  }
  if (cmd === 'status') {
    const s = summary(st.findings);
    if (a.json) { console.log(JSON.stringify(s, null, 2)); return; }
    const line = (o, f = (k) => k) => Object.entries(o).sort().map(([k, v]) => `${f(k)} ${v}`).join(' · ') || 'nenhum';
    console.log(`Módulo ${s.module} · ${s.total} achados · ${s.runs} execução(ões) · atualizado ${s.updated ?? '-'}`);
    console.log(`  status: ${line(s.by_status, (k) => STATUS_PT[k] ?? k)}`);
    console.log(`  família: ${line(s.by_family)}`);
    console.log(`  regra: ${Object.entries(s.by_rule).sort(([x], [y]) => x.localeCompare(y, 'pt', { numeric: true })).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
    console.log(`  severidade: ${line(s.by_severity)}`);
    for (const [label, l] of [['Regressões', s.regression], ['Decididos, falta aplicar', s.decided]]) {
      console.log(`\n${label} (${l.length})`);
      for (const i of l) console.log(`  ${i.id} ${i.rule} "${String(i.text).slice(0, 80)}" · ${loc(i)}`);
    }
    return;
  }
  if (cmd === 'check') {
    if (!inputs.text && !inputs.screen && !inputs.flow) { console.error('check: informe ao menos --text, --screen ou --flow'); process.exit(2); }
    const run = collect(inputs, st.findings.items);
    const min = Number(a.min ?? 2);
    const r = check(st.findings, run, { min, decisions: st.decisions });
    for (const i of r.added) console.log(`NOVO ${i.id} ${i.rule} sev ${i.severity} "${String(i.text).slice(0, 80)}" · ${loc(i)}`);
    for (const i of r.regressions) console.log(`REGRESSÃO ${i.id} ${i.rule} (estava ${STATUS_PT[i.was]}) "${String(i.text).slice(0, 80)}" · ${loc(i)}`);
    console.log(`${r.pass ? 'Passou' : 'Reprovou'}: ${r.added.length} novo(s) de severidade ≥ ${min}, ${r.regressions.length} regressão(ões), ${r.known.length} conhecido(s) em aberto tolerado(s).`);
    process.exit(r.pass ? 0 : 1);
  }
  if (cmd === 'page') {
    if (!pos[0]) { console.error(USO); process.exit(2); }
    restatus(st.findings, st.decisions);
    writeFileSync(pos[0], renderPage(st.findings, st.options, st.decisions, { product: str(a.product) ?? '', color: str(a.color) ?? '#0E71B8' }));
    console.log(`${pos[0]} · ${pageCases(st.findings, st.options, st.decisions).length} casos`);
    return;
  }
  console.error(USO);
  process.exit(2);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
