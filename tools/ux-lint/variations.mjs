#!/usr/bin/env node
// UX variations of a flow (rethink-ux skill): checks the manifest, measures the captures, runs the ux-lint detectors on
// each variant's frames against the findings it claims to solve, builds the comparison page and records the owner's
// decision. Manifest contract: skills/rethink-ux/SKILL.md.
//
//   node tools/ux-lint/variations.mjs validate --root <projeto> --module <m> --flow <f> [--manifest <variations.json>] [--json]
//   node tools/ux-lint/variations.mjs measure  --root … --module … --flow … [--ux UX.md] [--json]
//   node tools/ux-lint/variations.mjs lint     --root … --module … --flow … [--ux UX.md] [--no-layout] [--json] [--fail-at 3]
//   node tools/ux-lint/variations.mjs page     --root … --module … --flow … --out <out.html> [--shots <dir>] [--no-shots]
//                                              [--no-layout] [--product …] [--findings-page <url>] [--max-page-mb 10] [--fragment]
//                                              [--lang en|pt-BR]
//   node tools/ux-lint/variations.mjs decide   --root … --module … --flow … (--variant <id> | --compose screen=b,flow=b,behavior=a,text=a)
//                                              [--comment "…"] [--by name]
//   node tools/ux-lint/variations.mjs import   --root … <decision.json>
//   node tools/ux-lint/variations.mjs alternatives --root … --module … --flow … [--out specs/<demand-id>/design/alternatives.md]
// Format 2 manifests carry falsifiable hypotheses per variant (audience, causal_bet, counter_hypothesis,
// falsification_test, expected_metric, guardrail, lens) and the convergence (choice, rejected_tradeoffs); format 1
// manifests still validate, with warnings. `decision.json` carries a `provenance` block (tools/lib/provenance.mjs).
//
// Manifest: <root>/.dsx/variations/<module>/<flow>/variations.json (or --manifest). Captures and `code` paths are
// relative to the project root. Playwright (screen crops and geometry for layout) is resolved from the current
// directory, as in preview.mjs: run it from a project folder that has it (e.g. the front-end folder). Without it, the
// page comes out without the cropped screens and lint does not run the layout rules (L).
// The page comes out as a full document (doctype, <html lang>, charset, viewport); --fragment drops the skeleton of
// page 1 to publish it as an artifact (the host adds the skeleton). --lang picks the page language: en (default) or
// pt-BR (also pt, pt-br, en-US…).
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
import { loadDivergenceRules } from '../forward/lib/snapshot.mjs';
import { analyzeStateCapture, CAPTURE_RE } from './states.mjs';
import { normText } from './findings.mjs';
import { resolvePlaywright, measure as measureGeometry, PLAYWRIGHT_MISSING } from './measure.mjs';
import { analyzeLayout } from './lib/geometry.mjs';
import { archetypeCatalog, analyzeGeometry, limitsFrom } from './layout.mjs';
import { encoder } from './preview.mjs';
import { renderVariationsPages, PAGE_MAX_BYTES } from './lib/variations-page.mjs';
import { pageLang, STRINGS } from './lib/variations-strings.mjs';
import { dataText } from '../lib/data-text.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';
import { buildProvenance } from '../lib/provenance.mjs';

const DSX = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FORMAT = 1;
/** Manifest formats read by `validate`: 1 (legacy: falsifiable hypothesis fields only warn) and 2 (they are required). */
export const MANIFEST_FORMATS = [1, 2];
export const MANIFEST_FORMAT = 2;
/** Forward's lenses (USE-10, fde-design "The five lenses"): alternatives that share a lens count as one. */
// lenses read from the snapshot of Forward's gate (data/forward/bin/fde/design.py); the literal list only applies when the snapshot is missing
const FALLBACK_LENSES = ['subtract', 'invert', 'analogous', 'constraint-first', 'object-first'];
export const LENSES = (() => { try { return loadDivergenceRules().lenses; } catch { return FALLBACK_LENSES; } })();
/** Falsifiable hypothesis per variant (Forward spec/product-pipeline.md, "Hypotheses" stage). */
export const HYPOTHESIS_FIELDS = ['audience', 'causal_bet', 'counter_hypothesis', 'falsification_test', 'expected_metric', 'guardrail', 'lens'];
/** Internal criticism before implementation (Forward "Agent autonomy and internal criticism"); never replaces isolated review. */
export const CRITIQUE_KEYS = ['counter_case', 'unsupported_claims', 'failure_recovery', 'accessibility', 'domain_data', 'security_ops'];
export const CRITIQUE_STATUS = ['resolved', 'limitation', 'measurement'];
export const KINDS = ['screen', 'state', 'behavior'];
export const AXES = ['screen', 'flow', 'behavior', 'text'];
/** Axis names in messages. `AXIS_PT`: pt-BR names, kept for importers of the old export. */
export const AXIS_NAMES = { screen: 'screen', flow: 'flow', behavior: 'behavior', text: 'text' };
export const AXIS_PT = STRINGS['pt-BR'].axis;
export const METRICS = ['steps', 'clicks_to_done', 'dialogs', 'primary_actions', 'words_on_screen', 'decisions'];
/** Metrics the captures measure (the others are only declared by the manifest). */
export const MEASURED = ['dialogs', 'primary_actions', 'words_on_screen'];
const SHOTS_VERSION = 2;
const sha1 = (...p) => createHash('sha1').update(p.map((x) => (typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x))).join('\u0000')).digest('hex');
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

// ---------- manifest ----------

/** Project folders (lib/project-paths.mjs: flag > .dsx/config.json > UX.md `paths` > default). */
const projectPaths = (root, module = null, config = null) => resolveProjectPaths({ root, module, config });
export const manifestPath = ({ root, module, flow, dir = null, config = null }) => join(dir ?? projectPaths(root, module, config).variations, module, flow, 'variations.json');
/** Project root from the manifest path (`…/<root>/.dsx/variations/<m>/<f>/variations.json`). */
export function rootFromManifest(file) {
  const abs = resolve(file);
  const i = abs.lastIndexOf(`${sep}.dsx${sep}variations${sep}`);
  return i >= 0 ? abs.slice(0, i) : dirname(abs);
}

/** Every row of the comparison: today first, then the variants. */
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
    laws: new Set(Object.keys(dims.laws_index ?? {})), law_cards: Object.fromEntries(Object.entries(dims.laws_index ?? {}).map(([k, v]) => [k, dataText(v, 'name', k)])),
    rules: { ...(dims.rules_index ?? {}), ...(dims.review_rules ?? {}) },
  };
}

/** The module's findings registry: Map id → item (empty when there is no registry). */
export function loadRegistry(root, module, dir = null) {
  const f = join(dir ?? projectPaths(root, module).findings, module, 'findings.json');
  if (!isFile(f)) return { file: null, items: new Map() };
  try { return { file: f, items: new Map((JSON.parse(readFileSync(f, 'utf8')).items ?? []).map((i) => [i.id, i])) }; } catch { return { file: f, items: new Map() }; }
}

const codeExists = (root, p) => {
  if (!/[*?]/.test(p)) return existsSync(join(root, p));
  return isDir(join(root, p.slice(0, p.search(/[*?]/)).replace(/[^/]*$/, '') || '.'));
};

/**
 * Checks the manifest. An error blocks the page and the decision; a warning is a weak variation or missing data that
 * does not break anything. Rules against fake variations: the four changes per axis, own frames (not today's nor
 * another variant's) and at least one cited pattern, archetype or law.
 */
export function validateManifest(m, { root, catalogs = loadCatalogs(), registry = new Map() } = {}) {
  const errors = [], warnings = [];
  const err = (s) => errors.push(s), warn = (s) => warnings.push(s);
  if (!MANIFEST_FORMATS.includes(m.format)) err(`format ${JSON.stringify(m.format)}: expected ${MANIFEST_FORMATS.join(' or ')}`);
  for (const k of ['module', 'flow', 'title']) if (!m[k]) err(`missing "${k}"`);
  for (const k of ['persona', 'task']) if (!m[k]) warn(`missing "${k}": the page opens with the task and the persona`);
  if (!m.current) err('missing "current" (today\'s version)');
  if (!(m.variants ?? []).length) err('no variant in "variants"');
  if ((m.variants ?? []).length && m.variants.length < 2) warn(`${m.variants.length} variant: the method asks for 3, really different ones`);
  const ids = new Set();
  const captureOwner = new Map();
  const currentIds = new Set((m.current?.frames ?? []).map((f) => f.id));
  for (const row of rowsOf(m)) {
    const tag = row.is_current ? 'current' : `variant "${row.id}"`;
    if (ids.has(row.id)) err(`${tag}: duplicate id`);
    ids.add(row.id);
    const frames = row.frames ?? [];
    if (!frames.length) err(`${tag}: no frames`);
    const fids = new Set(frames.map((f) => f.id));
    const seen = new Set();
    for (const f of frames) {
      const ft = `${tag}, frame "${f.id}"`;
      if (!f.id) err(`${tag}: frame without an id`);
      if (seen.has(f.id)) err(`${ft}: duplicate id`);
      seen.add(f.id);
      if (!f.step) err(`${ft}: missing "step"`);
      if (!KINDS.includes(f.kind)) err(`${ft}: kind ${JSON.stringify(f.kind)} (use ${KINDS.join(' | ')})`);
      if (!f.capture) err(`${ft}: missing "capture"`);
      else if (!isFile(join(root, f.capture))) err(`${ft}: capture does not exist (${f.capture})`);
      else if (!row.is_current) {
        const owner = captureOwner.get(f.capture);
        if (owner && owner !== row.id) err(`${ft}: the same capture as "${owner}" (${f.capture}); a variation needs its own frames`);
      }
      if (f.capture) { if (row.is_current) captureOwner.set(f.capture, 'current'); else if (!captureOwner.has(f.capture)) captureOwner.set(f.capture, row.id); }
      if (f.kind === 'behavior') {
        const b = f.behavior ?? {};
        if (!b.action) err(`${ft}: behavior frame without "behavior.action"`);
        for (const k of ['before', 'after']) if (b[k] && !fids.has(b[k])) err(`${ft}: behavior.${k} "${b[k]}" is not a frame of this row`);
        if (!b.before) warn(`${ft}: behavior without "behavior.before"; the page shows only the after`);
      }
    }
    if (row.hero && !fids.has(row.hero)) err(`${tag}: hero "${row.hero}" is not a frame of this row`);
    for (const f of frames) if (f.compare_to && !row.is_current && !currentIds.has(f.compare_to)) err(`${tag}, frame "${f.id}": compare_to "${f.compare_to}" is not a frame of today`);
    for (const f of frames) {
      const c = f.compare_focus;
      if (c === undefined) continue;
      const ok = c && ['x', 'y', 'w', 'h'].every((k) => Number.isFinite(c[k]) && c[k] >= 0 && c[k] <= 1) && c.w > 0 && c.h > 0 && c.x + c.w <= 1.0001 && c.y + c.h <= 1.0001;
      if (!ok) err(`${tag}, frame "${f.id}": compare_focus needs x, y, w, h between 0 and 1 (fractions of the image), within the edges`);
    }
    const metrics = row.metrics ?? {};
    for (const k of METRICS) if (!Number.isFinite(Number(metrics[k])) || metrics[k] === null || metrics[k] === '') err(`${tag}: metric "${k}" missing or not numeric`);
    for (const [k, v] of Object.entries(row.metrics_detail ?? {})) {
      if (k === 'not_comparable') {
        for (const [mk, why] of Object.entries(v ?? {})) {
          if (!METRICS.includes(mk)) err(`${tag}: metrics_detail.not_comparable.${mk} is not a metric (${METRICS.join(', ')})`);
          else if (!String(why ?? '').trim()) err(`${tag}: metrics_detail.not_comparable.${mk} without a reason`);
        }
        continue;
      }
      if (!METRICS.includes(k)) { err(`${tag}: metrics_detail.${k} is not a metric (${METRICS.join(', ')})`); continue; }
      if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || !x.trim())) { err(`${tag}: metrics_detail.${k} must be a list of texts (what was counted, one per item)`); continue; }
      if (Number(metrics[k]) !== v.length) warn(`${tag}: metrics_detail.${k} lists ${v.length} and the metric says ${metrics[k]}`);
    }
    if (row.is_current) continue;
    for (const k of ['name', 'concept', 'hypothesis']) if (!row[k]) err(`${tag}: missing "${k}"`);
    if (!(row.tradeoffs ?? []).length) err(`${tag}: no "tradeoffs" (every variation makes something worse; say what)`);
    const empty = AXES.filter((a) => !String(row.changes?.[a] ?? '').trim());
    if (!row.changes) err(`${tag}: missing "changes"`);
    else if (empty.length >= 3) err(`${tag}: changes only ${AXIS_NAMES[AXES.find((a) => !empty.includes(a))] ?? 'nothing'}; a real variation changes screen, flow, behavior and text`);
    else if (empty.length) warn(`${tag}: no change in ${empty.map((a) => AXIS_NAMES[a]).join(', ')}`);
    if (row.archetype && !catalogs.archetypes.has(row.archetype)) err(`${tag}: archetype "${row.archetype}" does not exist in archetypes/`);
    for (const p of row.patterns ?? []) if (!catalogs.patterns.has(p)) err(`${tag}: pattern "${p}" does not exist in patterns/`);
    for (const l of row.laws ?? []) if (!catalogs.laws.has(l)) err(`${tag}: law "${l}" does not exist in data/ux-dimensions.json (laws_index)`);
    if (!row.archetype && !(row.patterns ?? []).length && !(row.laws ?? []).length) err(`${tag}: no archetype, pattern or law; the variation needs an anchor in the catalog`);
    for (const id of row.resolves ?? []) {
      const it = registry.get(id);
      if (!it) err(`${tag}: finding "${id}" does not exist in the module registry`);
      else if (['fixed', 'ignored'].includes(it.status)) warn(`${tag}: finding "${id}" is already ${it.status}`);
    }
    for (const c of row.code ?? []) if (!codeExists(root, c)) warn(`${tag}: code "${c}" not found`);
  }
  checkHypotheses(m, { err, warn });
  const bySet = new Map();
  for (const v of m.variants ?? []) {
    const k = (v.frames ?? []).map((f) => f.capture).sort().join('|');
    if (k && bySet.has(k)) err(`variants "${bySet.get(k)}" and "${v.id}" have the same frames`);
    bySet.set(k, v.id);
  }
  return { errors, warnings };
}

/**
 * Falsifiable hypotheses (format 2 requires them; format 1 only warns, so older manifests keep validating):
 * every variant declares audience, causal bet, counter-hypothesis, falsification test, expected metric, guardrail
 * and a Forward lens, lenses are distinct (USE-10), and the manifest records the convergence (`choice`) and what
 * each discarded variant traded (`rejected_tradeoffs`).
 */
export function checkHypotheses(m, { err, warn }) {
  const strict = m.format === MANIFEST_FORMAT;
  const miss = strict ? err : (s) => warn(`${s} (format 1: warning; required from format ${MANIFEST_FORMAT})`);
  const variants = m.variants ?? [];
  const byLens = new Map();
  for (const v of variants) {
    const tag = `variant "${v.id}"`;
    for (const k of HYPOTHESIS_FIELDS) if (!String(v[k] ?? '').trim()) miss(`${tag}: missing "${k}"`);
    if (v.lens && !LENSES.includes(v.lens)) err(`${tag}: lens "${v.lens}" is not a Forward lens (${LENSES.join(', ')})`);
    if (v.lens && LENSES.includes(v.lens)) {
      if (byLens.has(v.lens)) (strict ? err : warn)(`variants "${byLens.get(v.lens)}" and "${v.id}" share the lens "${v.lens}": alternatives that share a lens count as one (USE-10)`);
      else byLens.set(v.lens, v.id);
    }
    if (v.counter_hypothesis && v.causal_bet && String(v.counter_hypothesis).trim() === String(v.causal_bet).trim()) err(`${tag}: counter_hypothesis repeats causal_bet`);
  }
  const ids = new Set(variants.map((v) => v.id));
  const choice = m.choice;
  if (!choice) miss('missing "choice" ({ "variant": "<id or current>", "why": "…" }): the convergence the designer recommends');
  else {
    const chosen = typeof choice === 'string' ? choice : choice.variant;
    if (!chosen || (chosen !== 'current' && chosen !== (m.current?.id ?? 'current') && !ids.has(chosen))) err(`choice: "${chosen}" is not a variant id or "current"`);
    if (typeof choice === 'object' && !String(choice.why ?? '').trim()) miss('choice: missing "why"');
  }
  const chosen = typeof choice === 'string' ? choice : choice?.variant;
  const rejected = m.rejected_tradeoffs ?? {};
  if (m.rejected_tradeoffs !== undefined && (typeof rejected !== 'object' || Array.isArray(rejected))) { err('rejected_tradeoffs: an object { "<variant id>": "what it traded" }'); return; }
  for (const k of Object.keys(rejected)) if (!ids.has(k)) err(`rejected_tradeoffs: "${k}" is not a variant id`);
  if (chosen && rejected[chosen]) err(`rejected_tradeoffs: "${chosen}" is the choice, not a discard`);
  for (const v of variants) if (v.id !== chosen && !String(rejected[v.id] ?? '').trim()) miss(`rejected_tradeoffs: missing what variant "${v.id}" traded`);
  checkCritique(m.critique, { err, warn: strict ? warn : () => {} });
}

/**
 * `critique`: { <key>: { status: resolved | limitation | measurement, note } } for the six CRITIQUE_KEYS. Missing block
 * is a warning (format 2); a present block must be complete, each entry resolved or turned into a limitation or a
 * measurement task.
 */
export function checkCritique(c, { err, warn }) {
  if (c === undefined) { warn('missing "critique" (internal criticism: counter-case, unsupported claims, failure/recovery, accessibility, domain/data, security/ops)'); return; }
  if (!c || typeof c !== 'object' || Array.isArray(c)) { err('critique: an object keyed by ' + CRITIQUE_KEYS.join(', ')); return; }
  for (const k of CRITIQUE_KEYS) {
    const e = c[k];
    if (!e) { err(`critique: missing "${k}"`); continue; }
    const status = typeof e === 'string' ? null : e.status;
    const note = typeof e === 'string' ? e : e.note;
    if (!CRITIQUE_STATUS.includes(status)) err(`critique.${k}: status ${JSON.stringify(status)} (use ${CRITIQUE_STATUS.join(' | ')})`);
    if (!String(note ?? '').trim()) err(`critique.${k}: missing "note"`);
  }
  for (const k of Object.keys(c)) if (!CRITIQUE_KEYS.includes(k)) warn(`critique: unknown key "${k}"`);
}

/**
 * Forward export: the manifest as `specs/<demand-id>/design/alternatives.md`, in the shape the `divergence` gate
 * reads (`Lens:`, `Hypothesis:`, `Traded:`, `Chose:`). The manifest stays the DSX source; this is its Forward view.
 */
export function toAlternativesMarkdown(m) {
  const L = [];
  // nothing invented: only the declared statements, and with no real choice there is no "Chose:" line (the gate fails,
  // as it should); the exporter (tools/forward/export.mjs) refuses first and lists what is missing
  const hmw = [].concat(m.how_might_we ?? []).filter(Boolean);
  L.push('## How might we…');
  for (const h of hmw) L.push(`- ${/^hmw\b/i.test(h) ? h : `HMW ${h}`}`);
  L.push('', '## Alternatives');
  const chosen = typeof m.choice === 'string' ? m.choice : m.choice?.variant ?? null;
  const letter = (i) => String.fromCharCode(65 + i);
  (m.variants ?? []).forEach((v, i) => {
    L.push(`### ${letter(i)}. ${v.name ?? v.id}`);
    if (v.lens) L.push(`Lens: ${v.lens}`);
    const bet = v.causal_bet ?? v.hypothesis;
    if (bet) L.push(`Hypothesis: ${v.audience ? `for ${v.audience}, ` : ''}${bet}`);
    if (v.counter_hypothesis) L.push(`Counter-hypothesis: ${v.counter_hypothesis}`);
    if (v.falsification_test) L.push(`Falsified if: ${v.falsification_test}`);
    if (v.expected_metric) L.push(`Expected metric: ${v.expected_metric}`);
    if (v.guardrail) L.push(`Guardrail: ${v.guardrail}`);
    const traded = m.rejected_tradeoffs?.[v.id];
    if (v.id !== chosen && traded) L.push(`Traded: ${traded}`);
    L.push('');
  });
  L.push('## Convergence');
  const idx = (m.variants ?? []).findIndex((v) => v.id === chosen);
  const why = typeof m.choice === 'object' ? m.choice?.why : null;
  if (idx >= 0) L.push(`Chose: ${letter(idx)}${why ? ` — ${why}` : ''}`);
  else L.push('<!-- no choice recorded yet: the divergence gate fails until the owner decides -->');
  L.push('', `<!-- generated by dsx tools/ux-lint/variations.mjs alternatives from .dsx/variations/${m.module}/${m.flow}/variations.json -->`);
  return `${L.join('\n')}\n`;
}

// ---------- measurement ----------

const WORD = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;
export const countWords = (s) => (String(s ?? '').match(WORD) ?? []).length;

/**
 * Measures a capture with the UX.md selectors: visible words (with an open dialog, only the dialog; else the content
 * regions, without `header` and `nav`, which are the product shell; excluding `aria-hidden`, `aria-live` and `legend`;
 * including the value of text fields), visible primary actions and open dialog.
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

/** Frames that count as "screen of the path": the `screen` ones (with none, all of them). */
const pathFrames = (row) => { const s = (row.frames ?? []).filter((f) => f.kind === 'screen'); return s.length ? s : row.frames ?? []; };

/**
 * Measured metrics of a row: words_on_screen = average words per screen of the path; primary_actions = highest number
 * of visible primaries on a single screen of the path; dialogs = steps whose frame shows an open dialog.
 * `steps`, `clicks_to_done` and `decisions` depend on the scenario and stay declared only.
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

/** Divergence between declared and measured: words with a 10% tolerance; the others exact. */
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

/** Runs text, screen and states (and layout, with geometry) on the frames of a row. */
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
      // as in the registry: text with no origin in the code, or whose flagged piece comes from data, is data (severity 0)
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
 * Status of each finding the variant claims to solve: `resolved` (gone), `persists` (the detector still finds it or the
 * cited text is still on screen), `unverified` (a family the captures do not measure: flow, consistency, layout without
 * geometry, or review without text). `suspect`: resolved, but the same rule shows up as a new finding with other text.
 */
export function checkResolves(ids, registry, lint, { layout = false, fresh = [] } = {}) {
  return ids.map((id) => {
    const it = registry.get(id);
    if (!it) return { id, status: 'unverified', reason: 'finding not in the registry' };
    const base = { id, rule: it.rule, family: it.family, severity: it.severity, text: it.text };
    const same = (x) => x.family === it.family && x.rule === it.rule;
    const textual = [it.text, ...(it.variants ?? [])].filter(Boolean);
    if (it.family === 'flow' || it.family === 'consistency') return { ...base, status: 'unverified', reason: `${it.family} family: check it on the map and by judgment` };
    if (it.family === 'layout' && !layout) return { ...base, status: 'unverified', reason: 'layout without geometry (run with the project\'s Playwright)' };
    if (it.family === 'states' && it.rule === 'S1') {
      const st = /(?:estado|state) "([^"]+)"/.exec(it.message ?? it.text ?? '')?.[1] ?? String(it.region ?? '').split(' · ')[0];
      return lint.states.has(st) ? { ...base, status: 'resolved', reason: `state "${st}" captured` } : { ...base, status: 'persists', reason: `no frame of the state "${st}"` };
    }
    let hit = null;
    if (it.origin !== 'review') {
      hit = lint.findings.find((x) => same(x) && (it.family === 'text' ? textual.some((t) => patternOf(t).test(normText(x.anchor))) : normText(x.anchor) === normText(it.text)));
    }
    if (hit) return { ...base, status: 'persists', reason: `${hit.rule} still flagged in ${hit.frames.join(', ')}` };
    if (it.family === 'text' && it.origin === 'review') {
      const still = textual.some((t) => lint.texts.some((s) => patternOf(t).test(s)));
      return still ? { ...base, status: 'persists', reason: 'the cited text is still on screen' } : { ...base, status: 'resolved', reason: 'the cited text left the screen' };
    }
    if (it.origin === 'review') return { ...base, status: 'unverified', reason: 'review finding: check it by judgment' };
    const suspect = fresh.some((x) => same(x));
    return { ...base, status: 'resolved', reason: suspect ? `rule ${it.rule} shows up again with other text: check it` : 'the detector no longer flags it', ...(suspect ? { suspect: true } : {}) };
  });
}

const SKIP = /^(node_modules|dist|build|coverage|\.git|__pycache__|\.venv|venv)$/;
const SRC = /\.(tsx?|jsx?|mjs|cjs|py|json)$/;
const DATA_FILE = /(^|[._-])(data|fixtures?|mocks?)\.[a-z]+$|^(data|fixtures?|mocks?)\b/i;

/**
 * Index of the code where text is born, to tell interface text from fictional data (as the registry does): the
 * production folders (`--code`; default: the project's `paths.code` or the folders detected from the stack) and the
 * folders of the variants' `code` plus the folder above (shared data). In the variants' folder, only a data file
 * counts as data.
 */
export function codeIndex(m, { root, code = null } = {}) {
  const prod = (code ?? projectPaths(root).code).map((p) => resolve(root, p)).filter(isDir);
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

/** Measures the geometry of the frames (Playwright). Returns Map capture → geometry, or null without Playwright. */
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
 * Lint of the whole manifest. For each variant: new findings (that today does not have), those with severity ≥
 * `failAt` block, and the status of each id in `resolves`.
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

// ---------- decision ----------

export function decisionPath(root, m) { return join(projectPaths(root, m.module).variations, m.module, m.flow, 'decision.json'); }

/** Builds and checks the decision: whole variant or composition per axis (each axis: `current` or a variant id). */
export function makeDecision(m, { variant = null, compose = null, comment = '', by = 'owner', now = new Date() } = {}) {
  const ids = new Set(rowsOf(m).map((r) => r.id).concat('current'));
  const errors = [];
  let mode;
  if (variant && compose) errors.push('use --variant or --compose, not both');
  if (variant) { mode = 'variant'; if (!ids.has(variant)) errors.push(`variant "${variant}" does not exist`); }
  else if (compose) {
    mode = 'compose';
    for (const a of AXES) if (!compose[a]) errors.push(`compose: missing the ${a} axis`);
    for (const [a, v] of Object.entries(compose)) { if (!AXES.includes(a)) errors.push(`unknown axis "${a}"`); else if (!ids.has(v)) errors.push(`axis ${a}: variant "${v}" does not exist`); }
  } else errors.push('give the choice: --variant <id> or --compose screen=…,flow=…,behavior=…,text=…');
  const at = now.toISOString().slice(0, 10);
  return { errors, decision: { format: FORMAT, module: m.module, flow: m.flow, mode, ...(mode === 'variant' ? { variant } : { compose }), comment: comment || '', by: by || 'owner', at } };
}

export const parseCompose = (s) => Object.fromEntries(String(s).split(',').map((p) => p.split('=').map((x) => x.trim())).filter(([k, v]) => k && v));

export function writeDecision(root, m, decision, { manifest = null, now = new Date() } = {}) {
  const f = decisionPath(root, m);
  mkdirSync(dirname(f), { recursive: true });
  const captures = rowsOf(m).flatMap((r) => (r.frames ?? []).map((x) => x.capture)).filter(Boolean);
  let provenance = null;
  try {
    provenance = buildProvenance({
      root, ownerRole: 'orchestrator', generator: 'dsx tools/ux-lint/variations.mjs decide', now,
      sources: [manifest ?? manifestPath({ root, module: m.module, flow: m.flow }), ...captures],
      criteria: [].concat(m.criteria ?? []), evidenceClass: 'human',
      assumptions: ['variants are test code rendered with fictional data, not production'],
      gaps: (m.variants ?? []).filter((v) => !v.falsification_test).map((v) => `variant ${v.id}: no falsification test`),
      superseded: isFile(f) ? 'previous decision.json (git history)' : null,
    });
  } catch { provenance = null; }
  writeFileSync(f, `${JSON.stringify({ ...decision, ...(provenance ? { provenance } : {}) }, null, 2)}\n`);
  return f;
}

// ---------- images ----------

/**
 * Content crop of each capture, in WebP (quality 0.75), cached by the capture's content: the content region (`main`,
 * or the first UX.md region that is not the shell) without the product header and menu, at 1x, down to the content
 * height (at most `maxHeight`). With an open dialog, the visible part of the region, with the dialog on top. With no
 * content region, the whole page. Returns Map capture → { content, width, height }.
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

/**
 * Regions (px) of what changed between two already-cropped images (before and after a behavior): compares 16 × 16 px
 * blocks on a browser canvas (the per-block average ignores compression noise), merges neighboring blocks into regions
 * and returns the largest. Cached in `shotsDir` by the names of the two images. Returns Map "<before>|<after>" →
 * { boxes: [{ x, y, w, h }], width, height } or null (nothing changed). Without Playwright, only what is cached.
 */
export async function diffShots(pairs, { shotsDir, playwright, block = 16, threshold = 16, maxBoxes = 8 }) {
  const out = new Map();
  const todo = [];
  for (const [a, b] of pairs) {
    const key = `${a}|${b}`;
    if (out.has(key)) continue;
    const f = join(shotsDir, `diff.${sha1(SHOTS_VERSION, 'blocks', a, b, block, threshold).slice(0, 16)}.json`);
    if (isFile(f)) { try { out.set(key, JSON.parse(readFileSync(f, 'utf8')).diff ?? null); continue; } catch { /* redo */ } }
    if (isFile(join(shotsDir, a)) && isFile(join(shotsDir, b))) todo.push([a, b, key, f]);
  }
  if (!todo.length || !playwright) return out;
  const type = (n) => (n.endsWith('.png') ? 'png' : n.endsWith('.webp') ? 'webp' : 'jpeg');
  const uri = (n) => `data:image/${type(n)};base64,${readFileSync(join(shotsDir, n)).toString('base64')}`;
  const browser = await playwright.module.chromium.launch();
  try {
    const page = await browser.newPage();
    for (const [a, b, key, f] of todo) {
      const diff = await page.evaluate(async ({ ua, ub, bs, th, maxBoxes }) => {
        const load = (u) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
        const [A, B] = await Promise.all([load(ua), load(ub)]);
        const W = Math.max(A.width, B.width), H = Math.max(A.height, B.height);
        const px = (img) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0); return x.getImageData(0, 0, W, H).data; };
        const pa = px(A), pb = px(B);
        const cols = Math.ceil(W / bs), rows = Math.ceil(H / bs);
        const hot = new Uint8Array(cols * rows);
        for (let by = 0; by < rows; by++) for (let bx = 0; bx < cols; bx++) {
          let s = 0, c = 0;
          for (let y = by * bs; y < Math.min(H, (by + 1) * bs); y++) for (let x = bx * bs; x < Math.min(W, (bx + 1) * bs); x++) { const i = (y * W + x) * 4; s += Math.abs(pa[i] - pb[i]) + Math.abs(pa[i + 1] - pb[i + 1]) + Math.abs(pa[i + 2] - pb[i + 2]); c++; }
          if (s / c > th) hot[by * cols + bx] = 1;
        }
        // regions: hot blocks up to 2 blocks apart stay in the same region
        const seen = new Uint8Array(cols * rows), boxes = [];
        for (let i = 0; i < hot.length; i++) {
          if (!hot[i] || seen[i]) continue;
          const q = [i]; seen[i] = 1; let x0 = cols, y0 = rows, x1 = -1, y1 = -1, n = 0;
          while (q.length) {
            const k = q.pop(), kx = k % cols, ky = (k - kx) / cols; n++;
            x0 = Math.min(x0, kx); x1 = Math.max(x1, kx); y0 = Math.min(y0, ky); y1 = Math.max(y1, ky);
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
              const nx = kx + dx, ny = ky + dy;
              if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
              const j = ny * cols + nx;
              if (hot[j] && !seen[j]) { seen[j] = 1; q.push(j); }
            }
          }
          if (n >= 2) boxes.push({ x: x0 * bs, y: y0 * bs, w: Math.min(W, (x1 + 1) * bs) - x0 * bs, h: Math.min(H, (y1 + 1) * bs) - y0 * bs, n });
        }
        if (!boxes.length) return null;
        boxes.sort((p, q) => q.n - p.n);
        return { boxes: boxes.slice(0, maxBoxes).map(({ n, ...r }) => r), width: W, height: H };
      }, { ua: uri(a), ub: uri(b), bs: block, th: threshold, maxBoxes });
      writeFileSync(f, JSON.stringify({ diff }));
      out.set(key, diff);
    }
  } finally { await browser.close(); }
  return out;
}

/** Pairs (before image, after image) of the behavior frames, for `diffShots`. */
export function behaviorPairs(m, shots) {
  const pairs = [];
  for (const r of rowsOf(m)) {
    const byId = new Map((r.frames ?? []).map((f) => [f.id, f]));
    for (const f of r.frames ?? []) {
      if (f.kind !== 'behavior') continue;
      const b = shots.get(byId.get(f.behavior?.before)?.capture), a = shots.get((byId.get(f.behavior?.after) ?? f).capture);
      if (a?.content && b?.content) pairs.push([b.content, a.content]);
    }
  }
  return pairs;
}

// ---------- CLI ----------

function context(a) {
  const manifest = typeof a.manifest === 'string' ? resolve(a.manifest) : null;
  const root = resolve(typeof a.root === 'string' ? a.root : manifest ? rootFromManifest(manifest) : process.cwd());
  const config = typeof a.config === 'string' ? a.config : null;
  const paths = resolveProjectPaths({ root, module: typeof a.module === 'string' ? a.module : null, config, flags: { ux: typeof a.ux === 'string' ? resolve(a.ux) : null } });
  for (const w of paths.warnings) console.error(`WARNING ${w}`);
  const file = manifest ?? (typeof a.module === 'string' && typeof a.flow === 'string' ? manifestPath({ root, module: a.module, flow: a.flow, dir: paths.variations }) : null);
  if (!file) { console.error('Give the manifest: --root <project> --module <m> --flow <f>, or --manifest <variations.json>'); process.exit(2); }
  if (!isFile(file)) { console.error(`Manifest not found: ${file}`); process.exit(2); }
  const m = JSON.parse(readFileSync(file, 'utf8'));
  const ux = isFile(paths.ux) ? paths.ux : null;
  return { root, file, m, cfg: loadConfig(ux), registry: loadRegistry(root, m.module ?? a.module, paths.findings).items };
}

const fmtMetric = (k) => ({ steps: 'steps', clicks_to_done: 'clicks to finish', dialogs: 'dialogs', primary_actions: 'primary actions', words_on_screen: 'words per screen', decisions: 'decisions' }[k] ?? k);
const STATUS_LABEL = { resolved: 'resolved', persists: 'persists', unverified: 'unverified' };

async function main() {
  const a = parseArgs();
  const cmd = a._[0];
  const usage = 'Usage: node tools/ux-lint/variations.mjs <validate|measure|lint|page|decide|import|alternatives> --root <project> --module <m> --flow <f> [options]';
  if (!['validate', 'measure', 'lint', 'page', 'decide', 'import', 'alternatives'].includes(cmd)) { console.error(usage); process.exit(2); }

  if (cmd === 'import') {
    const src = a._[1];
    if (!src || !isFile(src)) { console.error('Usage: node tools/ux-lint/variations.mjs import --root <project> <decision.json>'); process.exit(2); }
    const d = JSON.parse(readFileSync(src, 'utf8'));
    const ctx = context({ ...a, module: d.module, flow: d.flow });
    const r = makeDecision(ctx.m, { variant: d.mode === 'variant' ? d.variant : null, compose: d.mode === 'compose' ? d.compose : null, comment: d.comment, by: d.by, now: d.at ? new Date(d.at) : new Date() });
    if (r.errors.length) { console.error(r.errors.join('\n')); process.exit(1); }
    console.log(`decision written to ${writeDecision(ctx.root, ctx.m, r.decision, { manifest: ctx.file })}`);
    return;
  }

  const ctx = context(a);
  const { root, m, cfg, registry } = ctx;
  const catalogs = loadCatalogs();
  const v = validateManifest(m, { root, catalogs, registry });

  if (cmd === 'validate') {
    if (a.json) console.log(JSON.stringify(v, null, 2));
    else {
      for (const e of v.errors) console.log(`ERROR   ${e}`);
      for (const w of v.warnings) console.log(`WARNING ${w}`);
      console.log(`\n${ctx.file}: ${(m.variants ?? []).length} variant(s), ${v.errors.length} error(s), ${v.warnings.length} warning(s)`);
    }
    process.exit(v.errors.length ? 1 : 0);
  }
  if (cmd === 'alternatives') {
    // Forward view of the manifest: specs/<demand-id>/design/alternatives.md (stdout, or --out <file>).
    const md = toAlternativesMarkdown(m);
    if (typeof a.out === 'string') { mkdirSync(dirname(resolve(a.out)), { recursive: true }); writeFileSync(resolve(a.out), md); console.log(`alternatives written to ${resolve(a.out)}${v.errors.length ? ` (manifest has ${v.errors.length} validation error(s))` : ''}`); }
    else process.stdout.write(md);
    return;
  }
  if (cmd === 'decide') {
    const r = makeDecision(m, { variant: typeof a.variant === 'string' ? a.variant : null, compose: typeof a.compose === 'string' ? parseCompose(a.compose) : null, comment: typeof a.comment === 'string' ? a.comment : '', by: typeof a.by === 'string' ? a.by : 'owner' });
    if (r.errors.length) { console.error(r.errors.join('\n')); process.exit(1); }
    console.log(`decision written to ${writeDecision(root, m, r.decision, { manifest: ctx.file })}`);
    return;
  }
  if (cmd === 'measure') {
    const rows = rowsOf(m).map((r) => ({ id: r.id, name: r.name ?? 'Today', declared: r.metrics ?? {}, ...measureRow(r, { root, cfg }) }));
    for (const r of rows) r.divergences = divergences(r.declared, r.metrics);
    if (a.json) { console.log(JSON.stringify(rows.map(({ frames, ...r }) => r), null, 2)); return; }
    for (const r of rows) {
      console.log(`${r.is_current ? 'Today' : r.id} · ${r.name}`);
      for (const k of METRICS) {
        const d = r.declared[k], x = r.metrics[k];
        const div = r.divergences.find((y) => y.metric === k);
        console.log(`   ${fmtMetric(k).padEnd(22)} declared ${String(d ?? '—').padStart(5)}  measured ${String(x ?? '—').padStart(5)}${div ? '  ← differs' : ''}`);
      }
    }
    console.log('\nThe measurement does not overwrite the manifest: fix the declared value or explain the difference in the frame caption.');
    return;
  }
  if (v.errors.length) { for (const e of v.errors) console.error(`ERROR   ${e}`); console.error('Invalid manifest: fix it before running lint or page (validate).'); process.exit(1); }

  const playwright = resolvePlaywright();
  const geometry = a['no-layout'] ? null : await measureAllGeometry(m, { root, cfg, playwright }).catch((e) => { console.error(`geometry not measured: ${String(e.message).split('\n')[0]}`); return null; });
  if (!geometry && !a['no-layout']) console.error('No Playwright in the current directory: lint runs without the layout rules (L).');
  const failAt = Number(a['fail-at'] ?? 3);
  const lint = lintManifest(m, { root, cfg, registry, geometry, failAt });

  if (cmd === 'lint') {
    if (a.json) { console.log(JSON.stringify(lint, null, 2)); process.exit(Object.values(lint.variants).every((x) => x.ok) ? 0 : 1); }
    console.log(`Today: ${lint.current.findings.length} finding(s) in the frames · detectors: text, screen, states${lint.layout ? ', layout' : ''}`);
    for (const r of rowsOf(m).slice(1)) {
      const x = lint.variants[r.id];
      console.log(`\n${x.ok ? '✓' : '✗'} ${r.id} · ${r.name}`);
      for (const s of x.resolves) console.log(`   ${STATUS_LABEL[s.status].padEnd(15)} ${s.id} ${s.rule ?? ''} · ${s.reason}`);
      for (const n of x.new) console.log(`   ${n.severity >= failAt ? 'BLOCKS' : 'new   '} ${n.rule} sev ${n.severity} · ${String(n.message).slice(0, 110)} (${n.frames.join(', ')})`);
      if (!x.new.length) console.log('   no new finding of severity ≥ 2');
    }
    process.exit(Object.values(lint.variants).every((x) => x.ok) ? 0 : 1);
  }

  // page
  if (typeof a.out !== 'string') { console.error('Give the output: --out <page.html>'); process.exit(2); }
  const lang = pageLang(a.lang === true ? '' : a.lang);
  if (!lang) { console.error(`Unknown --lang ${JSON.stringify(a.lang)}: use en or pt-BR`); process.exit(2); }
  const out = resolve(a.out);
  const flowDir = dirname(ctx.file);
  const shotsDir = typeof a.shots === 'string' ? resolve(a.shots) : join(flowDir, 'shots');
  const captures = [...new Set(rowsOf(m).flatMap((r) => (r.frames ?? []).map((f) => f.capture)))];
  let shots = new Map();
  if (!a['no-shots']) {
    if (!playwright) console.error(`${PLAYWRIGHT_MISSING}\nThe page comes out without images.`);
    const regions = cfg.verification.selectors.regions ?? [];
    const content = regions.includes('main') ? 'main' : regions.find((r) => !/^(header|nav|aside)\b|role=(banner|navigation|complementary)|dialog/.test(r)) ?? 'main';
    shots = await shootCaptures(captures, { root, shotsDir, playwright, contentSelector: content, dialogSelector: cfg.verification.selectors.dialog || '[role=dialog]', log: a.verbose ? console.log : () => {} });
  }
  const diffs = shots.size ? await diffShots(behaviorPairs(m, shots), { shotsDir, playwright }).catch((e) => { console.error(`before/after difference not computed: ${String(e.message).split('\n')[0]}`); return new Map(); }) : new Map();
  const measured = Object.fromEntries(rowsOf(m).map((r) => { const x = measureRow(r, { root, cfg }); return [r.id, { metrics: x.metrics, divergences: divergences(r.metrics, x.metrics), frames: x.frames }]; }));
  const pages = renderVariationsPages(m, {
    lint, measured, registry, shots, diffs, shotsDir, catalogs, file: basename(out), product: typeof a.product === 'string' ? a.product : '', fragment: !!a.fragment,
    findings_page: typeof a['findings-page'] === 'string' ? a['findings-page'] : null, warnings: v.warnings,
    maxBytes: a['max-page-mb'] ? Number(a['max-page-mb']) * 1024 * 1024 : PAGE_MAX_BYTES, dsx_rel: relative(root, DSX) || '.', lang,
  });
  mkdirSync(dirname(out), { recursive: true });
  for (const p of pages) writeFileSync(join(dirname(out), p.file), p.html);
  console.log(`${pages.map((p) => `${join(dirname(out), p.file)} (${(p.bytes / 1048576).toFixed(1)} MB)`).join('\n')}`);
  console.log(`${(m.variants ?? []).length} variant(s) · ${shots.size} of ${captures.length} capture(s) with an image${lint.layout ? '' : ' · lint without layout'}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
