#!/usr/bin/env node
// UX audit: single entry point. No dependencies.
// Checks the prerequisites (captures, flow map, UX.md and whether it is up to date with the product, code), runs the
// detectors of the registry below (the ones that exist), optionally records the result in .dsx/findings/<module>/
// and prints the per-dimension report, read from the data/ux-dimensions.json matrix. With --page, generates the
// decision page.
//
// Usage: node tools/ux-lint/audit.mjs --module <m> --root <project> [--config <file>] [--screens <dir>] [--code <dirs...>]
//        [--map <flows.json>] [--ux UX.md] [--geometry <dir>] [--measure] [--dir <findings>] [--register]
//        [--preview [--min-severity <n>]] [--page <out.html> [--preview-files] [--max-page-mb 10]] [--lang en|pt-BR] [--json]
//        [--criteria <cycles/C-n/plan.md> [--evidence <recorded.json>] [--criteria-out <results.json>]] [--owner-role <role>]
// Quality sections (data/pipeline-quality.json, tools/ux-lint/criteria.mjs): UI quality (5 metrics), UX quality
// (5 dimensions) and design-system adherence, each with its own verdict per declared criterion (pass | fail | unknown |
// not-applicable; unknown is never pass); the 14 dimensions follow as a diagnostic. The JSON carries `provenance`.
// --preview runs tools/ux-lint/preview.mjs before the page (before/after previews taken from the captures; Playwright
// resolved from the current directory). The page comes out paginated: <out>.html, <out>-2.html… (≤ 10 MB each).
// --lang (en | pt-BR, default en) is the language of the page and of the text drawn on the previews; it is passed to
// preview.mjs. The text report and the JSON are English.
// Paths: lib/project-paths.mjs (flag > --config/.dsx/config.json > UX.md `paths` > default; docs/project-paths.md).
// Defaults: --screens <root>/.dsx/captures/<m> · --geometry <root>/.dsx/captures/<m>/geometry (measure.mjs output;
//          with --measure the audit measures first) · --map <root>/.dsx/maps/flows-<m>.json · --ux <root>/UX.md ·
//          --code folders detected from the stack · --dir <root>/.dsx/findings. `.stitch/<m>/code` (legacy) is read with a warning.
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join, resolve, relative, isAbsolute, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as findings from './findings.mjs';
import { analyzeDrift, driftHeadline } from './ux-md-drift.mjs';
import { evaluateForAudit, formatQuality } from './criteria.mjs';
import { buildProvenance } from '../lib/provenance.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';
import { dataText } from '../lib/data-text.mjs';
import { pageLang } from './lib/page-strings.mjs';

const DSX = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const MATRIX_PATH = join(DSX, 'data', 'ux-dimensions.json');

/**
 * Detector registry: family, path (relative to the DSX root), required inputs and arguments.
 * A detector whose file does not exist is tolerated: the audit warns and its dimension loses coverage.
 * All must accept `--json` and return the format described in knowledge/foundations/ux-findings.md.
 */
export const DETECTOR_REGISTRY = [
  { family: 'text', path: 'tools/ux-lint/text.mjs', needs: ['screens'],
    args: (c) => ['--screens', c.screens, ...(c.code.length ? ['--code', ...c.code] : []), ...(c.ux ? ['--ux', c.ux] : []), ...(c.module ? ['--module', c.module] : []), '--json'] },
  { family: 'screen', path: 'tools/ux-lint/screen.mjs', needs: ['screens'],
    args: (c) => [c.screens, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'flow', path: 'tools/ux-lint/flow.mjs', needs: ['map'],
    args: (c) => [c.map, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'layout', path: 'tools/ux-lint/layout.mjs', needs: ['geometry'],
    args: (c) => [c.geometry, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'states', path: 'tools/ux-lint/states.mjs', needs: ['screens'],
    args: (c) => [c.screens, ...(c.ux ? ['--ux', c.ux] : []), '--json'] },
  { family: 'consistency', path: 'tools/ux-lint/consistency.mjs', needs: ['screens'],
    args: (c) => [c.screens, ...(c.ux ? ['--ux', c.ux] : []), ...(c.module ? ['--module', c.module] : []), '--json'] },
];

const COVERAGE_LABEL = { automated: 'automated', partial: 'partial', judgment: 'judgment', reference: 'reference' };
const FAMILY_LABEL = { text: 'text (X)', screen: 'screen (T)', flow: 'flow (F)', layout: 'layout (L)', states: 'states (S)', consistency: 'consistency (C)' };
const OPEN = new Set(findings.OPEN_STATUSES);

export function loadMatrix(path = MATRIX_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ---------- arguments ----------

/** Parses argv; `--code` takes several folders up to the next flag. */
export function parseAuditArgs(argv) {
  const out = { code: [] };
  const flags = new Set(['register', 'json', 'measure', 'preview', 'preview-files']);
  let current = null;
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split('=');
      if (flags.has(k)) { out[k] = true; current = null; continue; }
      if (inline !== undefined) { if (k === 'code') out.code.push(inline); else out[k] = inline; current = null; continue; }
      current = k;
      continue;
    }
    if (current === 'code') { out.code.push(a); continue; }
    if (current) { out[current] = a; current = null; continue; }
    (out._ ??= []).push(a);
  }
  return out;
}

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

/** Fills the paths with the project defaults. */
export function resolveOptions(o) {
  const p = resolveProjectPaths({
    root: o.root, module: o.module, config: typeof o.config === 'string' ? o.config : null,
    flags: { screens: o.screens, geometry: o.geometry, map: o.map, ux: o.ux, dir: o.dir, code: o.code },
  });
  return {
    module: o.module, root: p.root,
    screens: p.captures, geometry: p.geometry, measure: !!o.measure, map: p.map, ux: p.ux,
    code: p.code, codeDefaulted: p.codeDefaulted, dir: p.findings, pathWarnings: p.warnings, pathSources: p.sources,
    register: !!o.register, page: o.page ? resolve(o.page) : null, json: !!o.json,
    preview: !!o.preview, previewFiles: !!o['preview-files'], minSeverity: o['min-severity'] !== undefined ? Number(o['min-severity']) : null,
    maxPageMb: o['max-page-mb'] !== undefined ? Number(o['max-page-mb']) : null,
    lang: pageLang(o.lang),
  };
}

// ---------- prerequisites ----------

const STATE_CAPTURE = /^\d+-[\w-]+\.[\w-]+\.html$/;

/**
 * Checks what the audit needs. Returns [{ id, ok, path, detail, fix? }]; `fix` says how to produce what is missing.
 * Also returns `available` (inputs usable by the detectors).
 */
export function checkPrerequisites(opt) {
  const rel = (p) => { const r = relative(opt.root, p); return r && !r.startsWith('..') && !isAbsolute(r) ? r : p; };
  const items = [];
  const html = isDir(opt.screens) ? readdirSync(opt.screens).filter((f) => f.endsWith('.html')) : [];
  const states = html.filter((f) => STATE_CAPTURE.test(f));
  items.push(html.length
    ? { id: 'screens', ok: true, path: opt.screens, detail: `${rel(opt.screens)} (${html.length - states.length} screens, ${states.length} state captures)` }
    : { id: 'screens', ok: false, path: opt.screens, detail: `no HTML captures in ${rel(opt.screens)}`,
      fix: `capture the screens from the project code (DSX capture-from-code skill, or the project's capture harness) into ${rel(opt.screens)}; states as <nn>-<screen>.<state>.html next to the main capture` });
  for (const w of opt.pathWarnings ?? []) items.push({ id: 'paths', ok: false, warning: true, path: null, detail: w });
  items.push(isFile(opt.map)
    ? { id: 'map', ok: true, path: opt.map, detail: rel(opt.map) }
    : { id: 'map', ok: false, path: opt.map, detail: `no flow map in ${rel(opt.map)}`,
      fix: `generate the map with the map-ux skill (flow-mapper) in the format of knowledge/foundations/ux-md.md, check it with the confirm-maps skill and save it to ${rel(opt.map)}` });
  items.push(isFile(opt.ux)
    ? { id: 'ux', ok: true, path: opt.ux, detail: rel(opt.ux) }
    : { id: 'ux', ok: false, path: opt.ux, detail: `no UX.md in ${rel(opt.ux)} (DSX defaults apply)`,
      fix: `extract the UX.md with the ux-md skill and validate it: node ${join(DSX, 'tools', 'lint-ux-md.mjs')} ${rel(opt.ux)}` });
  let drift = null;
  if (isFile(opt.ux)) {
    try {
      drift = analyzeDrift(readFileSync(opt.ux, 'utf8'), { map: isFile(opt.map) ? opt.map : null, screens: html.length ? opt.screens : null, geometry: isDir(opt.geometry) ? opt.geometry : null, root: opt.root, now: opt.now ?? new Date() });
      const tool = join(DSX, 'tools', 'ux-lint', 'ux-md-drift.mjs');
      items.push(drift.findings.length
        ? { id: 'ux-fresh', ok: false, warning: true, path: opt.ux, detail: `UX.md out of date: ${driftHeadline(drift)}`,
          fix: `update the UX.md (ux-md skill, Mode C) and bump version/updated in the same commit; details: node ${tool} ${rel(opt.ux)} --module ${opt.module} --root ${opt.root}` }
        : { id: 'ux-fresh', ok: true, path: opt.ux, detail: 'UX.md up to date with the map and the captures (archetypes, policies, states, updated)' });
    } catch (e) {
      items.push({ id: 'ux-fresh', ok: false, warning: true, path: opt.ux, detail: `UX.md drift not computed: ${e.message}` });
    }
  }
  const geo = isDir(opt.geometry) ? readdirSync(opt.geometry).filter((f) => f.endsWith('.geometry.json')) : [];
  const newest = (dir, files) => Math.max(0, ...files.map((f) => statSync(join(dir, f)).mtimeMs));
  const stale = geo.length && html.length && newest(opt.screens, html) > newest(opt.geometry, geo);
  items.push(geo.length
    ? { id: 'geometry', ok: !stale, path: opt.geometry, detail: `${rel(opt.geometry)} (${geo.length} screens measured)${stale ? '; older than the captures' : ''}`,
      ...(stale ? { fix: `measure again: node ${join(DSX, 'tools', 'ux-lint', 'measure.mjs')} ${rel(opt.screens)} --out ${rel(opt.geometry)} --ux UX.md (or run the audit with --measure)` } : {}) }
    : { id: 'geometry', ok: false, path: opt.geometry, detail: `no measured geometry in ${rel(opt.geometry)} (layout and hierarchy L rules do not run)`,
      fix: `node ${join(DSX, 'tools', 'ux-lint', 'measure.mjs')} ${rel(opt.screens)} --out ${rel(opt.geometry)} --ux UX.md (needs Playwright in the project), or run the audit with --measure` });
  const code = opt.code.filter(isDir);
  items.push(code.length
    ? { id: 'code', ok: true, path: code.join(' '), detail: code.map(rel).join(', ') }
    : { id: 'code', ok: false, path: null, detail: 'no code folders: text findings do not point to the source file:line',
      fix: 'pass --code <front-end and text-constant folders>' });
  return {
    items, drift,
    available: { screens: html.length ? opt.screens : null, geometry: geo.length ? opt.geometry : null, map: isFile(opt.map) ? opt.map : null, ux: isFile(opt.ux) ? opt.ux : null, code, module: opt.module },
  };
}

// ---------- detectors ----------

/** Collects { rule, severity } from any output shape (count fallback for a family that cannot be registered). */
export function extractRuleHits(json) {
  const out = [];
  // Grouped output (text.mjs): counts the groups, not the occurrences per screen.
  if (json && !Array.isArray(json) && Array.isArray(json.findings)) json = json.findings;
  const walk = (v, ctx) => {
    if (Array.isArray(v)) { for (const x of v) walk(x, ctx); return; }
    if (!v || typeof v !== 'object') return;
    if (typeof v.rule === 'string' && Number.isFinite(v.severity) && !v.probable_data) {
      out.push({ rule: v.rule, severity: v.severity, screen: v.screen ?? ctx.screen ?? null, message: v.message ?? '' });
      return;
    }
    const next = v.file ? { screen: basename(String(v.file)).replace(/\.html?$/, '') } : ctx;
    for (const [k, x] of Object.entries(v)) if (k !== 'summary' && k !== 'ranking' && k !== 'screens_index') walk(x, next);
  };
  walk(json, {});
  return out;
}

/** Runs the registry detectors. Returns [{ family, path, status, file?, count?, hits?, error?, reason? }]. */
export function runDetectors(available, { root, registry = DETECTOR_REGISTRY, workDir }) {
  const results = [];
  for (const d of registry) {
    const path = isAbsolute(d.path) ? d.path : join(DSX, d.path);
    if (!existsSync(path)) { results.push({ family: d.family, path: d.path, status: 'missing' }); continue; }
    const lacking = d.needs.filter((n) => !available[n]);
    if (lacking.length) { results.push({ family: d.family, path: d.path, status: 'skipped', reason: `missing ${lacking.join(', ')}` }); continue; }
    const ctx = { ...available, code: available.code ?? [] };
    const r = spawnSync(process.execPath, [path, ...d.args(ctx)], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    let json = null;
    try { json = JSON.parse(r.stdout); } catch { /* no JSON */ }
    if (!json || (r.status !== 0 && r.status !== 1)) {
      results.push({ family: d.family, path: d.path, status: 'error', error: (r.stderr || r.error?.message || `exit ${r.status}`).trim().split('\n').slice(-3).join(' ') });
      continue;
    }
    const file = join(workDir, `${d.family}.json`);
    writeFileSync(file, JSON.stringify(json));
    const hits = extractRuleHits(json);
    results.push({ family: d.family, path: d.path, status: 'ran', file, count: hits.length, hits });
  }
  return results;
}

// ---------- register ----------

const clone = (x) => JSON.parse(JSON.stringify(x));

/**
 * Merges the results into the register (in memory; writes only with `write`). Families findings.mjs does not know
 * yet stay out of the register and enter the report only as a count for this run.
 */
export function mergeRun(detectors, opt, { write = false, now = new Date() } = {}) {
  const p = findings.paths(opt.dir, opt.module);
  const st = findings.load(p, opt.module);
  const before = clone(st.findings);
  const known = new Set(findings.FAMILIES);
  const inputs = { root: opt.root };
  const unregistered = [];
  for (const d of detectors.filter((x) => x.status === 'ran')) {
    if (known.has(d.family)) inputs[d.family] = d.file;
    else unregistered.push(d.family);
  }
  const ran = Object.keys(inputs).filter((k) => k !== 'root');
  let commit = null;
  if (ran.length) {
    const run = findings.collect(inputs, st.findings.items);
    st.findings.module = opt.module;
    try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: opt.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null; } catch { /* no git */ }
    findings.merge(st.findings, run, { now, commit, decisions: st.decisions, deviations: findings.deviationsFromUx(opt.ux) });
    if (write) {
      mkdirSync(p.base, { recursive: true });
      writeFileSync(p.findings, `${JSON.stringify(st.findings, null, 2)}\n`);
    }
  }
  return { paths: p, before, after: st.findings, options: st.options, decisions: st.decisions, unregistered, registeredFamilies: ran };
}

// ---------- per-dimension report ----------

const ruleDimension = (matrix, item) => {
  if (item.dimension && matrix.dimensions.some((d) => d.id === item.dimension)) return item.dimension;
  if (matrix.rules_index[item.rule]) return matrix.rules_index[item.rule].dimension;
  return matrix.review_rules?.[item.rule]?.dimension ?? null;
};

/**
 * Per-dimension report: coverage (by design and effective), open by severity, new, fixed and regressions in this
 * run, findings of a family that cannot be registered, and gaps. Text fields come from the matrix (`name`, `gaps`;
 * the legacy `*_pt` keys are read too); the JSON keeps `name_pt`/`gaps_pt` as aliases for compatibility.
 */
export function dimensionReport(matrix, merged, detectors) {
  const beforeById = new Map((merged.before.items ?? []).map((i) => [i.id, i]));
  const status = new Map(detectors.map((d) => [d.family, d.status]));
  const out = [];
  const empty = () => ({ open: 0, by_severity: { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 }, added: 0, fixed: 0, regressions: 0, accepted: 0, review: 0, unregistered: 0, unregistered_by_severity: { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 } });
  const buckets = new Map(matrix.dimensions.map((d) => [d.id, empty()]));
  buckets.set('(none)', empty());
  for (const it of merged.after.items ?? []) {
    const b = buckets.get(ruleDimension(matrix, it) ?? '(none)');
    const prev = beforeById.get(it.id);
    if (OPEN.has(it.status)) { b.open++; b.by_severity[it.severity] = (b.by_severity[it.severity] ?? 0) + 1; }
    if (it.origin === 'review' && OPEN.has(it.status)) b.review++;
    if (!prev && it.present) b.added++;
    if (prev?.present && !it.present) b.fixed++;
    if (it.status === 'regression') b.regressions++;
    if (it.status === 'accepted-deviation') b.accepted++;
  }
  for (const d of detectors.filter((x) => x.status === 'ran' && merged.unregistered.includes(x.family))) {
    for (const h of d.hits) {
      const b = buckets.get(ruleDimension(matrix, h) ?? '(none)');
      b.unregistered++;
      b.unregistered_by_severity[h.severity] = (b.unregistered_by_severity[h.severity] ?? 0) + 1;
    }
  }
  for (const dim of matrix.dimensions) {
    const families = [...new Set(dim.rules.map((r) => matrix.rules_index[r]?.family).filter(Boolean))];
    const missing = families.filter((f) => status.get(f) !== 'ran');
    let effective = dim.coverage;
    if (families.length && missing.length === families.length) effective = 'judgment';
    else if (missing.length && dim.coverage === 'automated') effective = 'partial';
    out.push({
      id: dim.id, name: dataText(dim, 'name'), name_pt: dataText(dim, 'name'), coverage: dim.coverage, effective_coverage: effective,
      families, missing_families: missing.map((f) => ({ family: f, status: status.get(f) ?? 'missing' })),
      rules: dim.rules, heuristics: dim.heuristics, knowledge: dim.knowledge,
      ...buckets.get(dim.id), gaps: dataText(dim, 'gaps'), gaps_pt: dataText(dim, 'gaps'),
    });
  }
  const none = buckets.get('(none)');
  if (none.open || none.unregistered) {
    const name = 'No dimension (rule outside the matrix)', gaps = 'Add the rule to data/ux-dimensions.json (rules_index and the dimension).';
    out.push({ id: '(none)', name, name_pt: name, coverage: null, effective_coverage: null, families: [], missing_families: [], rules: [], heuristics: [], knowledge: [], ...none, gaps, gaps_pt: gaps });
  }
  return out;
}

const sevLine = (s) => [4, 3, 2, 1].map((k) => `s${k} ${s[k] ?? 0}`).join(' · ');

export function formatReport(r) {
  const L = [];
  L.push(`UX audit · module ${r.module} · ${r.root}`);
  L.push('\nPrerequisites');
  for (const p of r.prerequisites) {
    L.push(`  ${p.ok ? '✓' : p.warning ? '!' : '✗'} ${p.id}: ${p.detail}`);
    if (!p.ok && p.fix) L.push(`      how to produce: ${p.fix}`);
  }
  L.push('\nDetectors');
  for (const d of r.detectors) {
    const what = FAMILY_LABEL[d.family] ?? d.family;
    if (d.status === 'ran') L.push(`  ✓ ${what}: ${d.count} finding(s)${r.unregistered.includes(d.family) ? ' (family findings.mjs cannot register yet: count only)' : ''}`);
    else if (d.status === 'missing') L.push(`  – ${what}: detector missing (${d.path}); its dimensions fall back to judgment`);
    else if (d.status === 'skipped') L.push(`  – ${what}: did not run (${d.reason})`);
    else L.push(`  ✗ ${what}: error (${d.error})`);
  }
  if (r.ux_drift?.findings.length) {
    L.push(`\nUX.md × product (${r.ux_drift.findings.length} drift finding(s))`);
    for (const f of r.ux_drift.findings) L.push(`  ${f.rule} sev ${f.severity}${f.screen ? ` | ${f.screen}` : ''} | ${f.message}`);
  }
  L.push(`\nRegister: ${r.registered ? `written to ${r.findings_file}` : `not written (use --register); compared with ${r.findings_file}`}`);
  if (r.quality) {
    for (const p of r.quality.problems ?? []) L.push(`\nWARNING criteria: ${p}`);
    for (const e of r.quality.validation?.errors ?? []) L.push(`\nWARNING criteria: ${e}`);
    L.push(formatQuality(r.quality, { criteriaFile: r.quality.plan }));
    if (r.quality.out) L.push(`  results: ${r.quality.out}`);
    L.push('\nDiagnostic — 14 dimensions (raw counts; a count is not a verdict)');
  }
  L.push('\nPer-dimension report');
  for (const d of r.dimensions) {
    const cov = d.coverage ? `${COVERAGE_LABEL[d.coverage]}${d.effective_coverage !== d.coverage ? ` → ${COVERAGE_LABEL[d.effective_coverage]} in this run` : ''}` : '';
    const miss = d.missing_families.length ? ` · no detector: ${d.missing_families.map((m) => m.family).join(', ')}` : '';
    L.push(`\n${d.name ?? d.name_pt} [${d.id}] · coverage ${cov}${miss}`);
    L.push(`  open ${d.open} (${sevLine(d.by_severity)})${d.review ? `, ${d.review} from review` : ''} · new ${d.added} · fixed ${d.fixed} · regressions ${d.regressions}${d.accepted ? ` · ${d.accepted} accepted deviation(s)` : ''}${d.unregistered ? ` · ${d.unregistered} outside the register (${sevLine(d.unregistered_by_severity)})` : ''}`);
    if (d.coverage !== 'automated' || d.missing_families.length) L.push(`  gaps: ${d.gaps ?? d.gaps_pt}`);
    if (['judgment', 'reference'].includes(d.effective_coverage) && d.knowledge.length) L.push(`  review with: ${d.knowledge.join(', ')}`);
  }
  const t = r.totals;
  L.push(`\nTotal: ${t.open} open (${sevLine(t.by_severity)}) · ${t.added} new · ${t.fixed} fixed · ${t.regressions} regressions${t.accepted ? ` · ${t.accepted} accepted deviations (not counted)` : ''}${t.unregistered ? ` · ${t.unregistered} outside the register (family findings.mjs does not register yet)` : ''}`);
  if (r.preview) {
    const p = r.preview;
    if (!p.summary) L.push(`Previews: ${p.detail}`);
    else {
      L.push(`Previews: ${p.summary.cases} case(s) · ${p.stats.generated} generated, ${p.stats.cached} from cache, ${p.stats.failed} without preview · in ${p.out}${p.detail ? ` (${p.detail})` : ''}`);
      L.push(`  by operation: ${Object.entries(p.summary.by_op).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'}`);
      for (const [k, v] of Object.entries(p.summary.without)) L.push(`  without preview (${v}): ${k}`);
    }
  }
  for (const w of r.page_warnings ?? []) L.push(`WARNING: ${w}`);
  if (r.pages?.length > 1) { L.push(`Decision page: ${r.pages.length} pages`); for (const p of r.pages) L.push(`  ${p.file} · ${p.cases} case(s) · ${(p.bytes / 1048576).toFixed(2)} MB`); }
  else if (r.page) L.push(`Decision page: ${r.page}${r.pages?.[0] ? ` · ${(r.pages[0].bytes / 1048576).toFixed(2)} MB` : ''}`);
  return L.join('\n');
}

// ---------- document tables (knowledge/foundations/ux-dimensions.md) ----------

const VERIFIED = { automated: 'automated rule', partial: 'automated rule + judgment', judgment: 'judgment', reference: 'reference only' };
const cell = (s) => String(s).replace(/\|/g, '\\|');

/** Dimensions table, generated from the matrix; the document contains it literally (test in tools/test/ux-dimensions.test.mjs). */
export function renderDimensionsTable(matrix) {
  const rows = ['| Dimension | Question | Rules | Verification | Heuristics | Gaps |', '|---|---|---|---|---|---|'];
  for (const d of matrix.dimensions) {
    rows.push(`| ${dataText(d, 'name')} (\`${d.id}\`) | ${cell(dataText(d, 'question'))} | ${d.rules.length ? d.rules.join(', ') : '—'} | ${VERIFIED[d.coverage]} | ${d.heuristics.length ? d.heuristics.map((h) => `H${h}`).join(', ') : '—'} | ${cell(dataText(d, 'gaps'))} |`);
  }
  return rows.join('\n');
}

/** Rules table (rules_index), generated from the matrix. */
export function renderRulesTable(matrix) {
  const name = new Map(matrix.dimensions.map((d) => [d.id, dataText(d, 'name')]));
  const rows = ['| Rule | Family | Dimension | Sev | Heuristics | What it flags |', '|---|---|---|---|---|---|'];
  for (const [id, r] of Object.entries(matrix.rules_index)) {
    rows.push(`| ${id} | ${r.family} | ${name.get(r.dimension) ?? r.dimension} | ${r.severity} | ${r.heuristics.length ? r.heuristics.map((h) => `H${h}`).join(', ') : '—'} | ${cell(dataText(r, 'summary'))} |`);
  }
  return rows.join('\n');
}

// ---------- orchestration ----------

/** Runs measure.mjs (when it exists and there are captures) to produce the geometry for the L rules. */
export function measureGeometry(opt) {
  const tool = join(DSX, 'tools', 'ux-lint', 'measure.mjs');
  if (!existsSync(tool)) return { id: 'measure', ok: false, path: null, detail: 'measure.mjs does not exist in this DSX version' };
  if (!isDir(opt.screens)) return { id: 'measure', ok: false, path: null, detail: 'no captures to measure' };
  const r = spawnSync(process.execPath, [tool, opt.screens, '--out', opt.geometry, ...(isFile(opt.ux) ? ['--ux', opt.ux] : [])], { cwd: opt.root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status === 0) return { id: 'measure', ok: true, path: opt.geometry, detail: 'geometry measured in this run' };
  const why = (r.stderr || r.stdout || '').trim().split('\n').slice(-2).join(' ');
  return { id: 'measure', ok: false, path: null, detail: `measurement failed (exit ${r.status}): ${why}`, fix: r.status === 3 ? 'install Playwright in the project (npm i -D playwright && npx playwright install chromium)' : undefined };
}

/**
 * Runs preview.mjs (child process, in the current directory, where the project's Playwright is resolved from) on this
 * run's register, written to a temporary directory to carry the selectors the layout has just measured.
 */
export function runPreviewTool(merged, opt, workDir, previewsDir) {
  const tool = join(DSX, 'tools', 'ux-lint', 'preview.mjs');
  if (!existsSync(tool)) return { ok: false, detail: 'preview.mjs does not exist in this DSX version' };
  const tmp = join(workDir, 'registry');
  const base = join(tmp, opt.module);
  mkdirSync(base, { recursive: true });
  writeFileSync(join(base, 'findings.json'), JSON.stringify(merged.after));
  writeFileSync(join(base, 'options.json'), JSON.stringify(merged.options));
  writeFileSync(join(base, 'decisions.json'), JSON.stringify(merged.decisions));
  const args = [tool, '--module', opt.module, '--root', opt.root, '--dir', tmp, '--out', previewsDir, '--screens', opt.screens, '--map', opt.map, '--lang', opt.lang ?? 'en', '--json',
    ...(opt.minSeverity !== null && opt.minSeverity !== undefined ? ['--min-severity', String(opt.minSeverity)] : [])];
  const r = spawnSync(process.execPath, args, { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let json = null;
  try { json = JSON.parse(r.stdout); } catch { /* no JSON */ }
  const why = (r.stderr || '').trim().split('\n').slice(0, 3).join(' ');
  if (!json) return { ok: false, detail: `preview.mjs failed (exit ${r.status}): ${why}` };
  return { ok: r.status === 0, playwright: r.status !== 3, out: json.out, stats: json.stats, summary: json.summary, detail: r.status === 3 ? 'Playwright not available: only the flow diagrams came out; run from a project folder that has Playwright' : null };
}

/** Runs the audit. `registry` lets tests swap the detector registry. */
export function runAudit(raw, { registry = DETECTOR_REGISTRY, matrix = loadMatrix(), now = new Date() } = {}) {
  const opt = { ...resolveOptions(raw), now };
  const measured = opt.measure ? measureGeometry(opt) : null;
  const pre = checkPrerequisites(opt);
  if (measured) pre.items.push(measured);
  const workDir = mkdtempSync(join(tmpdir(), 'dsx-audit-'));
  try {
    const detectors = runDetectors(pre.available, { root: opt.root, registry, workDir });
    const merged = mergeRun(detectors, opt, { write: opt.register, now });
    const dimensions = dimensionReport(matrix, merged, detectors);
    const totals = dimensions.reduce((t, d) => {
      t.open += d.open; t.added += d.added; t.fixed += d.fixed; t.regressions += d.regressions; t.unregistered += d.unregistered; t.accepted += d.accepted;
      for (const k of [4, 3, 2, 1]) t.by_severity[k] += d.by_severity[k] ?? 0;
      return t;
    }, { open: 0, added: 0, fixed: 0, regressions: 0, unregistered: 0, accepted: 0, by_severity: { 4: 0, 3: 0, 2: 0, 1: 0 } });
    const quality = evaluateForAudit({
      criteria: typeof raw.criteria === 'string' ? raw.criteria : null, evidence: typeof raw.evidence === 'string' ? raw.evidence : null,
      screens: pre.available.screens, map: pre.available.map, ux: pre.available.ux, items: merged.after.items ?? [], findingsPath: merged.paths.findings, root: opt.root,
    });
    const provenance = buildProvenance({
      root: opt.root, ownerRole: typeof raw['owner-role'] === 'string' ? raw['owner-role'] : 'orchestrator', generator: 'dsx tools/ux-lint/audit.mjs', now,
      sources: [pre.available.screens, pre.available.map, pre.available.ux, pre.available.geometry, quality.plan, quality.evidence],
      criteria: quality.results.map((r) => r.id),
      evidenceClass: [...new Set(['observed', ...quality.results.map((r) => r.evidence?.class).filter(Boolean)])],
      assumptions: ['captures render the real components with fictional data; static probes do not render the declared viewport'],
      gaps: [...pre.items.filter((p) => !p.ok).map((p) => `${p.id}: ${p.detail}`), ...quality.problems, ...(quality.results.filter((r) => r.verdict === 'unknown').map((r) => `${r.id} unknown: ${r.reason}`))],
    });
    if (typeof raw['criteria-out'] === 'string') {
      const out = resolve(raw['criteria-out']);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, `${JSON.stringify({ format: 1, plan: quality.plan, provenance, validation: quality.validation, criteria: quality.results, report: quality.report }, null, 2)}\n`);
      quality.out = out;
    }
    let page = null, pages = null, preview = null, pageWarnings = [];
    const previewsDir = join(opt.dir, opt.module, 'previews');
    if (opt.preview) preview = runPreviewTool(merged, opt, workDir, previewsDir);
    if (opt.page) {
      findings.restatus(merged.after, merged.decisions);
      const w = findings.writePages(merged.after, merged.options, merged.decisions, opt.page, {
        product: raw.product ?? '', color: raw.color ?? '#2B59C3', previewsDir, screensDir: opt.screens, previewFiles: opt.previewFiles,
        noPreview: !opt.preview && !existsSync(join(previewsDir, 'previews.json')), ...(opt.maxPageMb ? { maxBytes: opt.maxPageMb * 1048576 } : {}), lang: opt.lang,
      });
      page = opt.page;
      pages = w.pages;
      pageWarnings = w.warnings;
    }
    return {
      module: opt.module, root: opt.root, registered: opt.register && merged.registeredFamilies.length > 0,
      findings_file: merged.paths.findings, prerequisites: pre.items, ux_drift: pre.drift ? { findings: pre.drift.findings, summary: pre.drift.summary } : null,
      detectors: detectors.map(({ hits, file, ...d }) => d), unregistered: merged.unregistered,
      dimensions, totals, page, pages, page_warnings: pageWarnings, preview,
      quality: { plan: quality.plan, out: quality.out ?? null, validation: quality.validation, problems: quality.problems, criteria: quality.results, ...quality.report },
      provenance,
    };
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

const USAGE = 'Usage: node tools/ux-lint/audit.mjs --module <m> --root <project> [--config <file>] [--screens <dir>] [--code <dirs...>] [--map <flows.json>] [--ux UX.md] [--geometry <dir>] [--measure] [--dir <findings>] [--register] [--preview [--min-severity <n>]] [--page <out.html> [--preview-files] [--max-page-mb 10] [--lang en|pt-BR]] [--criteria <cycles/C-n/plan.md> [--evidence <file.json>] [--criteria-out <file.json>]] [--owner-role <role>] [--json]';

function main() {
  const a = parseAuditArgs(process.argv.slice(2));
  if (!a.module || a.module === true) { console.error(USAGE); process.exit(2); }
  const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
  try { pageLang(a.lang); } catch (e) { console.error(e.message); process.exit(2); }
  const r = runAudit(a, { now });
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else console.log(formatReport(r));
  process.exit(r.detectors.some((d) => d.status === 'ran') ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
