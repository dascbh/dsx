#!/usr/bin/env node
// UX findings register (contract: knowledge/foundations/ux-findings.md). No dependencies.
// Merges the results of the text, screen and flow checkers into a durable register per module, with a stable id,
// the owner's decision kept apart from the machine result, and a status computed across runs.
//
//   node tools/ux-lint/findings.mjs register --module <m> [--dir .dsx/findings] [--text t.json] [--screen s.json] [--flow f.json]
//                                            [--states st.json] [--consistency c.json] [--layout l.json] [--root <repo>] [--ux UX.md] [--include-sev0]
//   node tools/ux-lint/findings.mjs options  --module <m> --from cases.json
//   node tools/ux-lint/findings.mjs decide   --module <m> <id> <index|ignore|free> [--reason "…"] [--text "…"] [--by name]
//   node tools/ux-lint/findings.mjs import   --module <m> decisions.json
//   node tools/ux-lint/findings.mjs status   --module <m> [--json]
//   node tools/ux-lint/findings.mjs check    --module <m> [--min 2] [--text …] [--screen …] [--flow …] [--root <repo>] [--ux UX.md]
//   node tools/ux-lint/findings.mjs page     --module <m> <out.html> [--product …] [--color …] [--previews <dir>] [--preview-files]
//                                            [--no-preview] [--max-page-mb 10] [--lang en|pt-BR]   (pages: <out>.html, <out>-2.html…)
//
// Files in <dir>/<module>/: findings.json (written here), options.json (the skill's options), decisions.json (owner).
// Deviations declared in UX.md (`deviations:`, read from --ux or <root>/UX.md) mark the covered finding as
// `accepted-deviation`; the current copy is kept in findings.json (`deviations`) and the status goes back to `open`
// when the deviation leaves UX.md or expires.
// Reworded messages: screen/flow/states/layout ids hash the detector message; when only the wording changed (e.g. the
// detectors moved to English), `relinkReworded` gives the new item the id of the registered one (same family, rule,
// first screen and region), so status and decision survive.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { parseYaml, splitFrontMatter } from '../lib/yaml-lite.mjs';
import { parseDeviations, coveringDeviation } from './lib/deviations.mjs';
import { join, relative, isAbsolute, basename, resolve, dirname, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { renderTextPages, normalizeElement, sortCases, PAGE_MAX_BYTES, MAX_OUTPUT_FILES } from './text-page.mjs';
import { loadPreviews, attachPreviews, previewKeys, embeddedSize, embedded } from './lib/preview-page.mjs';
import { pageStrings, pageLang } from './lib/page-strings.mjs';
import { normalizeCases, normalizeDetectorJson } from './lib/legacy.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';

/** Checkers that produce each family's input (names kept here so they can be renamed without hunting in the code). */
export const DETECTORS = {
  text: 'tools/ux-lint/text.mjs', screen: 'tools/ux-lint/screen.mjs', flow: 'tools/ux-lint/flow.mjs',
  states: 'tools/ux-lint/states.mjs', consistency: 'tools/ux-lint/consistency.mjs', layout: 'tools/ux-lint/layout.mjs',
};
export const FAMILIES = ['text', 'screen', 'flow', 'states', 'consistency', 'layout'];
const PREFIX = { text: 't', screen: 's', flow: 'f', states: 'st', consistency: 'c', layout: 'l' };
/** Families whose finding compares screens with each other: the id anchor is only the text, no screen or region. */
const CROSS_SCREEN = ['text', 'consistency'];
export const STATUSES = ['open', 'decided', 'ignored', 'accepted-deviation', 'fixed', 'regression'];
/** Status names in CLI output (English; the page uses the dictionary of its --lang). */
const STATUS_LABEL = pageStrings('en').status;
/** Statuses that count as open (debt to handle). `ignored` and `accepted-deviation` do not count. */
export const OPEN_STATUSES = ['open', 'decided', 'regression'];

/** Deviations from the front matter of a UX.md (path). No file → null (the register keeps the ones it had). */
export function deviationsFromUx(uxPath) {
  if (!uxPath || !existsSync(uxPath)) return null;
  const { frontMatter } = splitFrontMatter(readFileSync(uxPath, 'utf8').replace(/\r\n/g, '\n'));
  if (!frontMatter) return [];
  try { return parseDeviations(parseYaml(frontMatter).deviations).deviations; } catch { return []; }
}

// ---------- normalization ----------

const ZW = /[​-‍﻿]/g;
const clean = (s) => String(s ?? '').replace(ZW, '').replace(/\s+/g, ' ').trim();
/** Replaces variable data (dates, times, amounts, numbers, `{name}` markers) with `{}`, keeping the case. */
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

/** Template text from the variants: words equal at the start and end stay, the middle that changes becomes `{}`. */
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
 * Stable id: hash of `family | rule | anchor`. Anchor: file of the first code source (no line) + normalized text;
 * without a code source, screen + region + text. The flow family always anchors on the map screen (its evidence
 * lists incoming transitions, which change without the finding changing).
 */
export function stableId(item) {
  const code = item.family === 'flow' ? null : (item.source ?? []).find(isCode);
  const anchor = code
    ? `${fileOf(code)}|${normText(item.text)}`
    : `${CROSS_SCREEN.includes(item.family) ? '' : (item.screens ?? [])[0] ?? ''}|${item.region ?? ''}|${normText(item.text)}`;
  return `${PREFIX[item.family]}-${sha(`${item.family}|${item.rule}|${anchor}`).slice(0, 8)}`;
}

// ---------- normalization of the detector outputs ----------

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
 * Text checker output (`--json`) → items. Severity 0 (probable data) is left out unless `includeSev0`.
 * The old output, with pt-BR keys, is also read (lib/legacy.mjs); the same holds for every family.
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

/** Screen checker output (`--json`) → items (one per screen, region and message). */
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

/** Flow checker output (`--json`) → items (anchor: the map screen or journey). */
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

/**
 * States checker output (`--json`) → items. The screen is the capture name without the state (`02-library`); the
 * region carries the state (`error · main`), so the same problem in different states does not collapse into one id.
 */
export function fromStates(input, { root = null } = {}) {
  const json = normalizeDetectorJson(input);
  const rel = makeRel(root);
  const out = [];
  for (const t of json.screens ?? []) for (const a of t.findings ?? []) {
    out.push({
      family: 'states', rule: a.rule, severity: a.severity, element: a.rule === 'S3' ? 'alert' : null,
      text: maskData(a.message), variants: maskData(a.message) !== clean(a.message) ? [clean(a.message)] : [],
      screens: [`${t.nn}-${t.screen}`], region: `${a.state ?? ''} · ${a.region ?? ''}`,
      source: [...new Set(String(a.evidence ?? '').split(/,\s*/).filter(Boolean).map((e) => rel(e.replace(/:(\d+):\d+$/, ':$1'))))],
      message: a.message,
    });
  }
  return out;
}

const ELEMENT_FROM_CONSISTENCY_RULE = { C1: 'button', C2: 'button', C3: 'title' };
/** Consistency checker output (`--json`) → items (anchor: the key of the function or concept, no screen). */
export function fromConsistency(input, { root = null } = {}) {
  const json = normalizeDetectorJson(input);
  const rel = makeRel(root);
  return (json.findings ?? []).map((a) => ({
    family: 'consistency', rule: a.rule, severity: a.severity, element: ELEMENT_FROM_CONSISTENCY_RULE[a.rule] ?? null,
    text: clean(a.text ?? a.key), variants: [...new Set((a.occurrences ?? []).map((o) => clean(o.text)))],
    screens: [...new Set((a.occurrences ?? []).flatMap((o) => o.screens ?? []))].sort(), region: '',
    source: [...new Set((a.occurrences ?? []).flatMap((o) => o.evidence ?? []).map((e) => rel(String(e).replace(/:(\d+):\d+$/, ':$1'))))],
    message: a.message,
  }));
}

const ELEMENT_FROM_LAYOUT_RULE = { L1: 'button', L3: 'title', L5: 'label', L6: 'button', L8: 'button' };
/**
 * Layout checker output (`--json`) → items. Id anchor: screen + rule + region + `anchor` (label or element
 * selector, no coordinates); the measurement stays in the message, which can change without changing the id.
 */
export function fromLayout(input) {
  const json = normalizeDetectorJson(input);
  const out = [];
  for (const t of json.screens ?? []) for (const a of t.findings ?? []) {
    out.push({
      family: 'layout', rule: a.rule, severity: a.severity, element: ELEMENT_FROM_LAYOUT_RULE[a.rule] ?? null,
      text: clean(a.anchor ?? a.message), variants: [], screens: [screenName(t.screen ?? t.file)], region: a.region ?? '',
      source: [basename(String(t.file ?? `${t.screen}.html`))], message: a.message,
      // Selector of the element in the capture (measure.mjs path): locates the preview; not part of the id.
      ...(Array.isArray(a.elements) && a.elements.length ? { selectors: a.elements.slice(0, 8) } : {}),
    });
  }
  return out;
}

/** Merges items with the same id within a run (e.g. two texts that differ only by a number). */
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
 * Gives ids to the items of a run. When the computed id is not in the register but a registered item of the same
 * family, rule and file shares a variant (the set of variants changed and the template changed with it), it
 * inherits the registered id.
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

/** Reads the run inputs (JSON files of each family). Returns { items, families }. */
export function collect({ text, screen, flow, states, consistency, layout, root = null, includeSev0 = false }, registry = []) {
  const items = [];
  const families = [];
  const read = (f) => JSON.parse(readFileSync(f, 'utf8'));
  if (text) { items.push(...fromText(read(text), { root, includeSev0 })); families.push('text'); }
  if (screen) { items.push(...fromScreen(read(screen), { root })); families.push('screen'); }
  if (flow) { items.push(...fromFlow(read(flow), { root })); families.push('flow'); }
  if (states) { items.push(...fromStates(read(states), { root })); families.push('states'); }
  if (consistency) { items.push(...fromConsistency(read(consistency), { root })); families.push('consistency'); }
  if (layout) { items.push(...fromLayout(read(layout))); families.push('layout'); }
  return { items: assignIds(items, registry), families };
}

// ---------- reworded messages ----------

/**
 * Families whose id can change when the detector wording changes: screen, flow, states, layout (message or anchor)
 * and consistency (its text carries detector words such as " (dialog)"). Only text is left out.
 */
const MESSAGE_ANCHORED = (it) => it.family !== 'text' && (it.family === 'flow' || it.family === 'consistency' || !(it.source ?? []).some(isCode));
/** Region with the old pt-BR detector words mapped to English (states regions are `<state> · <region>`). */
export const normRegion = (r) => String(r ?? '')
  .replace(/diálogo/g, 'dialog').replace(/\(tela\)/g, '(screen)').replace(/\(fora de região\)/g, '(outside any region)').replace(/º/g, '#')
  .replace(/\s+/g, ' ').trim();
/** Match key: family + rule + first screen + normalized region; consistency (no region) uses the sorted screen list. */
const relinkKey = (it) => (it.family === 'consistency'
  ? `${it.family}|${it.rule}|${[...(it.screens ?? [])].sort().join(',')}`
  : `${it.family}|${it.rule}|${(it.screens ?? [])[0] ?? ''}|${normRegion(it.region)}`);

/**
 * A detector message reworded (same finding, new wording, e.g. after the detectors moved to English) changes the
 * id of message-anchored findings. For each match key (see `relinkKey`): when exactly one new item
 * (id not in the register) and exactly one registered item (not fixed, not a review item, not seen in this run)
 * share the key, the new item takes the registered id. Changes `items` in place; returns [{ from, to }].
 */
export function relinkReworded(reg, items) {
  const known = new Map(reg.items.map((i) => [i.id, i]));
  const seen = new Set(items.map((i) => i.id));
  const fresh = new Map();
  for (const it of items) {
    if (known.has(it.id) || !MESSAGE_ANCHORED(it)) continue;
    const k = relinkKey(it);
    if (!fresh.has(k)) fresh.set(k, []);
    fresh.get(k).push(it);
  }
  const out = [];
  for (const [k, list] of fresh) {
    if (list.length !== 1) continue;
    const cands = reg.items.filter((r) => r.status !== 'fixed' && r.origin !== 'review' && !seen.has(r.id) && MESSAGE_ANCHORED(r) && relinkKey(r) === k);
    if (cands.length !== 1) continue;
    out.push({ from: list[0].id, to: cands[0].id });
    list[0].id = cands[0].id;
    seen.add(cands[0].id);
  }
  return out;
}

// ---------- status ----------

export function statusOf(item, decisions = {}, deviations = [], now = new Date()) {
  const d = decisions.items?.[item.id];
  if (d?.choice === 'ignore') return 'ignored';
  if (!item.present) return 'fixed';
  if (coveringDeviation(item, deviations, now)) return 'accepted-deviation';
  if (item.fixed_at) return 'regression';
  if (d && (typeof d.choice === 'number' || d.choice === 'free')) return 'decided';
  return 'open';
}

/**
 * Recomputes the status of every item. Deviations: the ones passed in `deviations` or, without them, the copy kept
 * in the register (`reg.deviations`). A covered item gets `deviation: { id, reason, decided_by, until }`.
 */
export function restatus(reg, decisions, { deviations = reg.deviations ?? [], now = new Date() } = {}) {
  for (const it of reg.items) {
    const dev = it.present ? coveringDeviation(it, deviations, now) : null;
    it.status = statusOf(it, decisions, deviations, now);
    if (dev && it.status === 'accepted-deviation') it.deviation = { id: dev.id, reason: dev.reason, decided_by: dev.decided_by, until: dev.until };
    else delete it.deviation;
  }
  return reg;
}

// ---------- register on disk ----------

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
 * Merges a run into the register. Only the families present in this run can mark absence; manual review items
 * (`origin: "review"`) are not seen by the checkers and are never marked absent by them. Items whose message was
 * only reworded keep the registered id (`relinkReworded`); the relinks are listed in `run.relinked`.
 */
export function merge(reg, run, { now = new Date(), commit = null, decisions = { items: {} }, deviations = null } = {}) {
  const day = today(now);
  run.relinked = relinkReworded(reg, run.items);
  if (Array.isArray(deviations)) reg.deviations = deviations;
  const byId = new Map(reg.items.map((i) => [i.id, i]));
  const seen = new Set();
  for (const it of run.items) {
    seen.add(it.id);
    const already = byId.get(it.id);
    const fresh = {
      id: it.id, family: it.family, rule: it.rule, severity: it.severity, element: it.element ?? null,
      text: it.text, variants: it.variants ?? [], screens: it.screens ?? [], source: it.source ?? [],
      ...(it.region ? { region: it.region } : {}), message: it.message ?? '', origin: 'detector',
      ...(it.selectors?.length ? { selectors: it.selectors } : {}),
    };
    if (already) {
      if (!fresh.selectors) delete already.selectors;
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
  return restatus(reg, decisions, { now });
}

function gitCommit(root) {
  if (!root) return null;
  try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; } catch { return null; }
}

// ---------- options ----------

const stripMarks = (k) => k.replace(/\{\}/g, ' ').replace(/[—–-]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Does an options case cover the item? Same rule and: text equal (normalized) to one of the variants, in any file
 * (the source noted in the case may be another occurrence of the same text); or one text contained in the other
 * (8+ characters) with a file in common.
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

/** Imports cases with options; returns { matched, manual, links } and changes reg/options. */
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

// ---------- decisions ----------

export function makeDecision(choice, { reason = null, text = null, by = 'owner', now = new Date(), options = null } = {}) {
  let c = choice;
  if (typeof c === 'string' && /^\d+$/.test(c)) c = Number(c);
  if (c !== 'ignore' && c !== 'free' && !Number.isInteger(c)) throw new Error(`invalid choice "${choice}" (use the option index, ignore or free)`);
  if (c === 'ignore' && !clean(reason)) throw new Error('ignore requires --reason');
  if (c === 'free' && !clean(text)) throw new Error('free requires --text');
  if (Number.isInteger(c) && options && !(c >= 0 && c < (options.options ?? []).length)) throw new Error(`index ${c} outside the options (0–${(options.options ?? []).length - 1})`);
  return { choice: c, by: by || 'owner', at: today(now), reason: clean(reason) || null, ...(c === 'free' ? { text: clean(text) } : {}) };
}

/** Imports the JSON exported by the page (`{items:{id:{choice,…}}}`). Returns { ok, unknown, invalid }. */
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

/** Compares a run with the register, without writing. Returns { pass, added, regressions, known, accepted, relinked }. */
export function check(reg, run, { min = 2, decisions = { items: {} }, deviations = reg.deviations ?? [], now = new Date() } = {}) {
  const byId = new Map(reg.items.map((i) => [i.id, i]));
  const relinked = relinkReworded(reg, run.items);
  const added = [], regressions = [], known = [], accepted = [];
  for (const it of run.items) {
    if (coveringDeviation({ ...it, present: true }, deviations, now)) { accepted.push(it); continue; }
    const already = byId.get(it.id);
    if (!already) { if (it.severity >= min) added.push(it); continue; }
    const st = statusOf(already, decisions, deviations, now);
    if (st === 'ignored') continue;
    if (st === 'fixed' || st === 'regression') regressions.push({ ...it, was: st });
    else known.push({ ...it, status: st });
  }
  return { pass: !added.length && !regressions.length, added, regressions, known, accepted, relinked };
}

// ---------- status (summary) ----------

export function summary(reg) {
  const countBy = (f) => reg.items.reduce((o, i) => { const k = f(i); o[k] = (o[k] || 0) + 1; return o; }, {});
  return {
    module: reg.module, updated: reg.updated, runs: reg.runs.length, total: reg.items.length,
    by_status: countBy((i) => i.status), by_family: countBy((i) => i.family), by_rule: countBy((i) => i.rule), by_severity: countBy((i) => i.severity),
    regression: reg.items.filter((i) => i.status === 'regression').map(({ id, rule, text, source, screens }) => ({ id, rule, text, source, screens })),
    decided: reg.items.filter((i) => i.status === 'decided').map(({ id, rule, text, source, screens }) => ({ id, rule, text, source, screens })),
    accepted_deviation: reg.items.filter((i) => i.status === 'accepted-deviation').map(({ id, rule, text, screens, deviation }) => ({ id, rule, text, screens, deviation: deviation?.id ?? null })),
  };
}

// ---------- page ----------

const escH = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Builds the page cases: one per options case (several ids) or per item without options; fixed ones are left out. */
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
      family: it.family, region: it.region ?? '', message: it.message ?? '', selectors: it.selectors ?? [],
      severity: Math.max(...items.map((i) => i.severity)), text: it.text,
      variants: [...new Set(items.flatMap((i) => i.variants.length ? i.variants : [i.text]))],
      source: [...new Set(items.flatMap((i) => i.source))], screens: [...new Set(items.flatMap((i) => i.screens))],
      problem: op?.problem || it.message, options: (op?.options ?? []).map((o) => ({ text: o.text, convention: o.convention, note: o.note, ...(o.preview !== undefined ? { preview: o.preview } : {}) })),
      recommended: op?.recommended ? { index: op.recommended.index, why: op.recommended.why } : null,
      decision: ds.length === items.length && ds.every((d) => JSON.stringify(d.choice) === JSON.stringify(ds[0].choice)) ? ds[0] : null,
      deviation: items.every((i) => i.status === 'accepted-deviation') ? items[0].deviation ?? null : null,
    });
  }
  return sortCases(cases);
}

const PAGE_STYLE = `
.meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px}
.meta code{font:11.5px var(--mono);color:var(--muted)}
.st{border-radius:999px;padding:1px 8px;font-weight:600;font-size:12px}
.st-open{background:var(--accent-soft);color:var(--accent)}.st-decided{background:var(--ok-soft);color:var(--ok)}
.st-ignored{background:var(--line);color:var(--muted)}.st-accepted-deviation{background:var(--line);color:var(--fg)}
.desvio{border:1px dashed var(--line);border-radius:10px;padding:10px 12px;margin:0;font-size:13px}.st-regression{background:var(--bad-soft);color:var(--bad)}.st-fixed{background:var(--ok-soft);color:var(--ok)}
.decisao{border:1px dashed var(--line);border-radius:10px;padding:10px 12px;margin:0;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
.decisao legend{font-size:12px;font-weight:600;padding:0 4px}
.decisao label{display:inline-flex;gap:6px;align-items:center;cursor:pointer;min-height:32px}
.decisao input[type=radio]{accent-color:var(--accent);width:18px;height:18px}
.decisao input[type=text]{font:13px var(--sans);flex:1;min-width:200px;padding:6px 8px;border:1px solid var(--control-line);border-radius:8px;background:var(--surface);color:var(--fg)}
.decisao input[type=text][aria-invalid=true]{border-color:var(--bad)}
.ja{font-size:12px;color:var(--ok);font-weight:600}
.acoes{position:sticky;bottom:0;background:var(--bg);border-top:1px solid var(--line);padding:12px 0;display:flex;flex-wrap:wrap;gap:12px;align-items:center;z-index:2}
.acoes button{font:600 14px var(--sans);background:var(--accent);color:var(--on-accent);border:0;border-radius:10px;padding:9px 18px;cursor:pointer;min-height:40px}
.acoes button:focus-visible,.decisao input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.acoes input{font:13px var(--sans);padding:6px 8px;border:1px solid var(--control-line);border-radius:8px;background:var(--surface);color:var(--fg)}
#saida{width:100%;min-height:140px;font:12px var(--mono);border:1px solid var(--control-line);border-radius:8px;background:var(--surface);color:var(--fg);padding:8px}
#aviso{font-size:13px}`;

// Decisions cross pages: each choice goes to localStorage (key per module + register version) and "Copy decisions"
// gathers the ones of every page. Without localStorage, only the form of the open page counts. The script's text
// comes from the page language (META.t), so the code is the same in every language.
const PAGE_SCRIPT = `
const hoje=new Date().toISOString().slice(0,10);
const META=JSON.parse(document.getElementById('dsx-decisions').textContent);
const T=META.t;const fmt=(s,o)=>s.replace(/\\{(\\w+)\\}/g,(m,k)=>(k in o?o[k]:m));
let mem={by:'',cases:{}};
function ler(){try{const v=localStorage.getItem(META.key);if(v){const o=JSON.parse(v);if(o&&o.cases)mem=o;}}catch(e){}}
function gravar(){try{localStorage.setItem(META.key,JSON.stringify(mem));}catch(e){}}
ler();
const por=document.getElementById('por');if(mem.by)por.value=mem.by;
por.addEventListener('input',()=>{mem.by=por.value.trim();gravar();});
const sets=[...document.querySelectorAll('fieldset.decisao')];
sets.forEach(f=>{const d=mem.cases[f.dataset.case];const m=f.querySelector('input[type=text]');
if(d){const r=f.querySelector('input[type=radio][value="'+d.choice+'"]');if(r)r.checked=true;m.value=d.reason||'';}
const upd=()=>{const r=f.querySelector('input[type=radio]:checked');if(!r)return;mem.cases[f.dataset.case]={choice:r.value,reason:(m.value||'').trim()||null,ids:f.dataset.ids.split(' ')};gravar();contar();};
f.addEventListener('change',upd);m.addEventListener('input',upd);});
function atual(c){return mem.cases[c.case]||(c.prior!==null?{choice:String(c.prior),reason:c.reason,ids:c.ids}:null);}
function contar(){const n=META.cases.filter(atual).length;document.querySelectorAll('.contador').forEach(e=>{e.textContent=fmt(T.counter,{n,total:META.cases.length});});}
contar();
document.getElementById('copiar').addEventListener('click',async()=>{const aviso=document.getElementById('aviso');const saida=document.getElementById('saida');
const itens={};const erros=[];const quem=(por.value||'').trim()||mem.by||T.owner;
sets.forEach(f=>f.querySelector('input[type=text]').removeAttribute('aria-invalid'));
META.cases.forEach(c=>{const d=atual(c);if(!d)return;
if(d.choice==='ignore'&&!d.reason){erros.push(c.case);const f=document.querySelector('fieldset.decisao[data-case="'+c.case+'"]');if(f)f.querySelector('input[type=text]').setAttribute('aria-invalid','true');return;}
const escolha=d.choice==='ignore'?'ignore':Number(d.choice);c.ids.forEach(id=>{itens[id]={choice:escolha,by:quem,at:hoje,reason:d.reason||null};});});
if(erros.length){aviso.textContent=fmt(T.needReason,{n:erros.length,other:erros.some(e=>!document.querySelector('fieldset.decisao[data-case="'+e+'"]'))?T.otherPages:''});return;}
const n=Object.keys(itens).length;const json=JSON.stringify({items:itens},null,2);saida.value=json;saida.hidden=false;
try{await navigator.clipboard.writeText(json);aviso.textContent=fmt(T.copied,{n});}
catch(e){saida.focus();saida.select();aviso.textContent=fmt(T.selectToCopy,{n});}});`;

/**
 * Decision pages. Returns [{ file, html, cases, bytes }] (one page when it fits).
 * opts: { product, color, file, previews: manifest from lib/preview-page.mjs (null = no preview), previewFiles:
 *         relative path from the page to the previews folder (references instead of embedding), maxBytes, maxCases,
 *         lang (page language, en | pt-BR; default en) }.
 */
export function renderPages(reg, options, decisions, { product = '', color = '#2B59C3', file = 'page.html', previews = null, previewFiles = null, maxBytes, maxCases, lang } = {}) {
  const L = pageLang(lang);
  const S = pageStrings(L);
  const cases = pageCases(reg, options, decisions);
  if (previews) attachPreviews(cases, previews, { lang: L });
  const fixed = reg.items.filter((i) => i.status === 'fixed').length;
  const acceptedCount = reg.items.filter((i) => i.status === 'accepted-deviation').length;
  const header = (c) => `<span class="meta">${[...new Set(c.statuses)].map((s) => `<span class="st st-${s}">${S.status[s] ?? s}</span>`).join('')}<code>${c.ids.slice(0, 4).map(escH).join(' ')}${c.ids.length > 4 ? ` +${c.ids.length - 4}` : ''}</code></span>`;
  const footer = (c) => {
    if (c.deviation) {
      const v = c.deviation;
      return `<p class="desvio">${S.deviation(escH(v.id), v.decided_by ? escH(v.decided_by) : null, v.until ? escH(v.until) : null, escH(v.reason))}</p>`;
    }
    const d = c.decision;
    const checked = (v) => (d && String(d.choice) === String(v) ? ' checked' : '');
    const ops = c.options.map((_, i) => `<label><input type="radio" name="d-${escH(c.id)}" value="${i}"${checked(i)}> ${String.fromCharCode(65 + i)}</label>`).join('');
    const already = d ? `<span class="ja">${S.decided(d.choice === 'ignore' ? S.decidedIgnore : d.choice === 'free' ? S.decidedFree(escH(d.text)) : S.decidedOption(String.fromCharCode(65 + d.choice)), d.by ? escH(d.by) : null, d.at ? escH(d.at) : null)}</span>` : '';
    return `<fieldset class="decisao" data-ids="${escH(c.ids.join(' '))}" data-case="${escH(c.id)}"><legend>${escH(S.yourDecision)}</legend>${ops}<label><input type="radio" name="d-${escH(c.id)}" value="ignore"${checked('ignore')}> ${escH(S.ignore)}</label><input type="text" aria-label="${escH(S.reason)}" placeholder="${escH(S.reasonPlaceholder)}" value="${escH(d?.reason ?? '')}">${already}</fieldset>`;
  };
  const meta = {
    key: `dsx-findings:${reg.module}:${reg.updated ?? ''}#${reg.runs?.length ?? 0}`,
    cases: cases.filter((c) => !c.deviation).map((c) => ({ case: c.id, ids: c.ids, prior: c.decision && c.decision.choice !== 'free' ? c.decision.choice : null, reason: c.decision?.reason ?? null })),
    t: S.script,
  };
  const bottom = `<div class="acoes"><label>${escH(S.whoDecides)} <input id="por" type="text" autocomplete="name"></label><button type="button" id="copiar">${escH(S.copyDecisions)}</button><span class="contador" aria-live="polite"></span><span id="aviso" role="status" aria-live="polite"></span>
  <textarea id="saida" hidden readonly aria-label="${escH(S.decisionsJson)}"></textarea></div>
  <script type="application/json" id="dsx-decisions">${JSON.stringify(meta).replace(/</g, '\\u003c')}</script>`;
  const withPreview = cases.some((c) => c.preview);
  const pv = withPreview
    ? (previewFiles !== null && previewFiles !== undefined
      ? { mode: 'files', href: (k) => `${previewFiles ? `${previewFiles.replace(/\/$/, '')}/` : ''}${k}` }
      : { mode: 'embed', sizeOf: (k) => embeddedSize(previews.dir, k), embedded: (k) => embedded(previews.dir, k) })
    : null;
  return renderTextPages(cases, {
    title: S.findingsTitle(reg.module), product, color, eyebrow: S.findingsEyebrow, file, lang: L,
    lede: S.findingsLede(withPreview, fixed, acceptedCount),
    top: '<p class="contador" aria-live="polite"></p>',
    card: { header, footer }, style: PAGE_STYLE, script: PAGE_SCRIPT, bottom, previews: pv, maxBytes, maxCases,
  });
}

/** Single page (the first one, when there are several). */
export function renderPage(reg, options, decisions, opts = {}) {
  return renderPages(reg, options, decisions, opts)[0].html;
}

/**
 * Writes the pages to `out` (the first with the given name, the others `<name>-2.html`…). Previews: read from
 * `previewsDir` (preview.mjs manifest); `previewFiles` references the images instead of embedding them. Returns
 * { pages: [{ file, bytes, cases }], warnings }.
 */
export function writePages(reg, options, decisions, out, { product = '', color = '#2B59C3', previewsDir = null, screensDir = null, previewFiles = false, noPreview = false, maxBytes, maxCases, lang } = {}) {
  const warnings = [];
  const L = pageLang(lang);
  const outDir = dirname(resolve(out));
  const previews = !noPreview && previewsDir ? loadPreviews(previewsDir, { screensDir }) : null;
  if (previews && (previews.lang ?? 'pt-BR') !== L) warnings.push(`the previews were generated with --lang ${previews.lang ?? 'pt-BR'} and the page uses ${L}; the text drawn on the images stays in ${previews.lang ?? 'pt-BR'} (run preview.mjs --lang ${L})`);
  let rel = null;
  if (previews && previewFiles) { rel = relative(outDir, previewsDir).split(sep).join('/'); }
  const pages = renderPages(reg, options, decisions, { product, color, file: basename(out), previews, previewFiles: previews && previewFiles ? rel : null, maxBytes, maxCases, lang: L });
  if (previews && previewFiles) {
    const keys = new Set(pages.flatMap((p) => p.cases.flatMap(previewKeys)));
    if (pages.length + keys.size > MAX_OUTPUT_FILES) warnings.push(`${pages.length} page(s) + ${keys.size} image(s) exceed ${MAX_OUTPUT_FILES} files; to publish, prefer embedded images (without --preview-files) or raise --min-severity in preview.mjs`);
  }
  if (pages.length > MAX_OUTPUT_FILES) warnings.push(`${pages.length} pages exceed ${MAX_OUTPUT_FILES} files`);
  for (const p of pages) if (p.bytes > (maxBytes ?? PAGE_MAX_BYTES) * 1.1) warnings.push(`${p.file} is ${(p.bytes / 1048576).toFixed(1)} MB (a single case is over the per-page limit)`);
  mkdirSync(outDir, { recursive: true });
  // pages from an earlier run with more pages would be left orphaned
  const stem = basename(out).replace(/\.html?$/, '');
  for (const f of readdirSync(outDir)) {
    const m = f.match(new RegExp(`^${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.html$`));
    if (m && Number(m[1]) > pages.length) rmSync(join(outDir, f));
  }
  for (const p of pages) writeFileSync(join(outDir, p.file), p.html);
  return { pages: pages.map((p) => ({ file: join(outDir, p.file), bytes: p.bytes, cases: p.cases.length })), warnings, previews: !!previews };
}

// ---------- CLI ----------

const USO = `Usage: node tools/ux-lint/findings.mjs <register|options|decide|import|status|check|page> --module <m> [options]
  register --text t.json --screen s.json --flow f.json --states st.json --consistency c.json --layout l.json [--root <repo>] [--ux UX.md] [--include-sev0]
  options  --from cases.json
  decide   <id> <index|ignore|free> [--reason "…"] [--text "…"] [--by name]
  import   decisions.json
  status   [--json]
  check    [--min 2] --text … --screen … --flow … --states … --consistency … --layout … [--root <repo>] [--ux UX.md]
  page     <out.html> [--product …] [--color …] [--previews <dir>] [--preview-files] [--no-preview] [--max-page-mb 10] [--lang en|pt-BR]
  (--dir default: the project's paths.findings, else <root or current directory>/.dsx/findings; --config <file>; inputs come from ${Object.values(DETECTORS).join(', ')} with --json)`;

function main() {
  const a = parseArgs();
  const [cmd, ...pos] = a._;
  if (!cmd || !a.module || a.module === true) { console.error(USO); process.exit(2); }
  const root = typeof a.root === 'string' ? resolve(a.root) : null;
  // project paths: lib/project-paths.mjs (flag > --config/.dsx/config.json > UX.md `paths` > default)
  const pp = resolveProjectPaths({ root: root ?? process.cwd(), module: a.module, config: typeof a.config === 'string' ? a.config : null,
    flags: { dir: typeof a.dir === 'string' ? resolve(a.dir) : null, ux: typeof a.ux === 'string' ? resolve(a.ux) : null, screens: typeof a.screens === 'string' ? resolve(a.screens) : null } });
  const dir = pp.findings;
  const p = paths(dir, a.module);
  const st = load(p, a.module);
  const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
  const str = (v) => (typeof v === 'string' ? v : null);
  const inputs = { text: str(a.text), screen: str(a.screen), flow: str(a.flow), states: str(a.states), consistency: str(a.consistency), layout: str(a.layout), root, includeSev0: !!a['include-sev0'] };
  const loc = (i) => (i.source?.[0] ?? (i.screens ?? []).join(', '));
  const uxPath = str(a.ux) ? resolve(a.ux) : root && existsSync(pp.ux) ? pp.ux : null;
  const uxDeviations = deviationsFromUx(uxPath);

  if (cmd === 'register') {
    if (!FAMILIES.some((f) => inputs[f])) { console.error(`register: give at least one input (${FAMILIES.map((f) => `--${f}`).join(', ')})`); process.exit(2); }
    const run = collect(inputs, st.findings.items);
    st.findings.module = a.module;
    merge(st.findings, run, { now, commit: gitCommit(root), decisions: st.decisions, deviations: uxDeviations });
    writeJson(p.findings, st.findings);
    const s = summary(st.findings);
    for (const r of run.relinked ?? []) console.error(`relinked ${r.to} (message reworded; new id would be ${r.from})`);
    console.log(`${relative(process.cwd(), p.findings) || p.findings} · ${run.items.length} finding(s) in this run (${run.families.join(', ')}); register with ${s.total}: ${Object.entries(s.by_status).map(([k, v]) => `${STATUS_LABEL[k] ?? k} ${v}`).join(', ')}`);
    return;
  }
  if (cmd === 'options') {
    if (!str(a.from)) { console.error('options: give --from cases.json'); process.exit(2); }
    const { data, warnings } = normalizeCases(JSON.parse(readFileSync(a.from, 'utf8')));
    for (const w of warnings) console.error(`WARNING ${a.from}: ${w}`);
    const cases = (Array.isArray(data) ? data : data?.cases) ?? [];
    const r = importOptions(st.findings, st.options, cases, { now });
    restatus(st.findings, st.decisions);
    writeJson(p.findings, st.findings);
    writeJson(p.options, st.options);
    console.log(`${cases.length} case(s): ${r.matched} matched findings in the register (${r.links.filter((l) => l.ids.length && l.ids.length > 1).length} covering more than one id); ${r.manual} became manual review findings.`);
    return;
  }
  if (cmd === 'decide') {
    const [id, choice] = pos;
    if (!id || choice === undefined) { console.error(USO); process.exit(2); }
    if (!st.findings.items.some((i) => i.id === id)) { console.error(`id ${id} is not in the register`); process.exit(1); }
    try {
      st.decisions.items[id] = makeDecision(choice, { reason: str(a.reason), text: str(a.text), by: str(a.by) ?? 'owner', now, options: st.options.items[id] });
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
    console.log(`${r.ok} decision(s) imported${r.unknown.length ? `; ${r.unknown.length} id(s) not in the register: ${r.unknown.join(', ')}` : ''}${r.invalid.length ? `; invalid: ${r.invalid.join('; ')}` : ''}`);
    process.exit(r.invalid.length ? 1 : 0);
  }
  if (cmd === 'status') {
    const s = summary(st.findings);
    if (a.json) { console.log(JSON.stringify(s, null, 2)); return; }
    const line = (o, f = (k) => k) => Object.entries(o).sort().map(([k, v]) => `${f(k)} ${v}`).join(' · ') || 'none';
    console.log(`Module ${s.module} · ${s.total} finding(s) · ${s.runs} run(s) · updated ${s.updated ?? '-'}`);
    console.log(`  status: ${line(s.by_status, (k) => STATUS_LABEL[k] ?? k)}`);
    console.log(`  family: ${line(s.by_family)}`);
    console.log(`  rule: ${Object.entries(s.by_rule).sort(([x], [y]) => x.localeCompare(y, 'pt', { numeric: true })).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
    console.log(`  severity: ${line(s.by_severity)}`);
    for (const [label, l] of [['Regressions', s.regression], ['Decided, not applied yet', s.decided], ['Accepted deviations (UX.md)', s.accepted_deviation]]) {
      console.log(`\n${label} (${l.length})`);
      for (const i of l) console.log(`  ${i.id} ${i.rule}${i.deviation ? ` [${i.deviation}]` : ''} "${String(i.text).slice(0, 80)}" · ${loc(i)}`);
    }
    return;
  }
  if (cmd === 'check') {
    if (!FAMILIES.some((f) => inputs[f])) { console.error(`check: give at least one input (${FAMILIES.map((f) => `--${f}`).join(', ')})`); process.exit(2); }
    const run = collect(inputs, st.findings.items);
    const min = Number(a.min ?? 2);
    const r = check(st.findings, run, { min, decisions: st.decisions, now, ...(uxDeviations ? { deviations: uxDeviations } : {}) });
    for (const i of r.added) console.log(`NEW ${i.id} ${i.rule} sev ${i.severity} "${String(i.text).slice(0, 80)}" · ${loc(i)}`);
    for (const i of r.regressions) console.log(`REGRESSION ${i.id} ${i.rule} (was ${STATUS_LABEL[i.was]}) "${String(i.text).slice(0, 80)}" · ${loc(i)}`);
    console.log(`${r.pass ? 'Passed' : 'Failed'}: ${r.added.length} new of severity ≥ ${min}, ${r.regressions.length} regression(s), ${r.known.length} known open tolerated, ${r.accepted.length} covered by a declared deviation.`);
    process.exit(r.pass ? 0 : 1);
  }
  if (cmd === 'page') {
    if (!pos[0]) { console.error(USO); process.exit(2); }
    let lang;
    try { lang = pageLang(a.lang); } catch (e) { console.error(e.message); process.exit(2); }
    restatus(st.findings, st.decisions);
    const r = writePages(st.findings, st.options, st.decisions, pos[0], {
      product: str(a.product) ?? '', color: str(a.color) ?? '#2B59C3', previewsDir: str(a.previews) ? resolve(a.previews) : join(p.base, 'previews'),
      screensDir: str(a.screens) || root ? pp.captures : null,
      previewFiles: !!a['preview-files'], noPreview: !!a['no-preview'], maxBytes: a['max-page-mb'] ? Number(a['max-page-mb']) * 1048576 : undefined, lang,
    });
    for (const w of r.warnings) console.error(`WARNING: ${w}`);
    console.log(`${r.pages.length} page(s), ${pageCases(st.findings, st.options, st.decisions).length} case(s)${r.previews ? ', with previews' : ''}:`);
    for (const pg of r.pages) console.log(`  ${pg.file} · ${pg.cases} case(s) · ${(pg.bytes / 1048576).toFixed(2)} MB`);
    return;
  }
  console.error(USO);
  process.exit(2);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
