#!/usr/bin/env node
// UI/UX quality criteria declared before construction (Forward spec/product-pipeline.md, "UX quality": criterion ID,
// population/job, scenario, baseline or explicitly unknown, target, counter-metric, method, sample, decision rule).
// Criteria live where Forward keeps criteria: the `## Acceptance criteria` section of `cycles/C-<n>/plan.md`, as
// ordinary `- **A<n> — name.**` bullets (so Forward's plan gate, status and promotion see them) followed by indented
// `- key: value` fields. Only bullets with a `kind:` field (ui | ux | ds) are quality criteria.
//
//   node tools/ux-lint/criteria.mjs check <cycles/C-n/plan.md | cycles/C-n> [--json]
//   node tools/ux-lint/criteria.mjs list  <plan> [--json]
//
// Evaluation (value, revision, pass|fail|unknown|not-applicable, labeled evidence) runs inside
// `audit.mjs --criteria <plan>`; this module holds the parser, the validator and the evaluator. No dependencies.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sourceRevision } from '../lib/provenance.mjs';
import { measureCapture } from './variations.mjs';
import { loadConfig } from './lib/config.mjs';
import { normalizeFlowMap } from './lib/legacy.mjs';

const DSX = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const QUALITY_PATH = join(DSX, 'data', 'pipeline-quality.json');
export const VERDICTS = ['pass', 'fail', 'unknown', 'not-applicable'];
export const EVIDENCE = ['observed', 'expert-inferred', 'human', 'synthetic'];

export function loadQuality(path = QUALITY_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ---------- parsing ----------

const CRITERION = /^[-*+]\s+[`*_]*([A-Z]+\d+)\b[`*_]*\s*(?:[—–-]\s*)?(.*)$/;
const FIELD = /^\s+[-*+]\s+([a-z][a-z-]*)\s*:\s*(.*)$/i;
const ALIASES = { 'counter metric': 'counter-metric', countermetric: 'counter-metric', 'decision rule': 'decision', 'decision-rule': 'decision', 'not applicable': 'not-applicable', na: 'not-applicable', dimension: 'metric', check: 'metric', job: 'population', 'job/population': 'population' };

/** Resolves a plan path: a `plan.md`, or a cycle directory holding one. */
export function planPath(p) {
  const abs = resolve(p);
  try { if (statSync(abs).isDirectory()) return join(abs, 'plan.md'); } catch { /* fall through */ }
  return abs;
}

/** Header (`key: value` lines before the first `## `). */
export function planHeader(text) {
  const out = {};
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) break;
    const m = line.match(/^([a-z][\w-]*)\s*:\s*(.*)$/i);
    if (m && !(m[1].toLowerCase() in out)) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

/**
 * Criteria of the `## Acceptance criteria` section: [{ id, title, fields: {…}, line }]. Fields are the indented
 * `- key: value` bullets under a criterion; a field may wrap onto further indented lines.
 */
export function parseCriteria(text) {
  const out = [];
  let inside = false, cur = null, lastKey = null;
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.startsWith('## ')) { inside = line.slice(3).trim().toLowerCase().startsWith('acceptance'); cur = null; return; }
    if (!inside) return;
    const c = line.match(CRITERION);
    if (c) {
      cur = { id: c[1], title: c[2].replace(/\*\*/g, '').trim(), fields: {}, line: i + 1 };
      out.push(cur);
      lastKey = null;
      return;
    }
    if (!cur) return;
    const f = line.match(FIELD);
    if (f) {
      const raw = f[1].toLowerCase();
      const key = ALIASES[raw] ?? raw;
      cur.fields[key] = f[2].trim();
      lastKey = key;
      return;
    }
    if (lastKey && /^\s{4,}\S/.test(line)) { cur.fields[lastKey] += ` ${line.trim()}`; return; }
    if (line.trim() && !/^\s/.test(line)) { cur = null; lastKey = null; }
  });
  return out;
}

/** Only the quality criteria (with `kind:`), normalized. */
export function qualityCriteria(text) {
  return parseCriteria(text).filter((c) => c.fields.kind).map((c) => ({
    id: c.id, title: c.title, line: c.line, ...c.fields,
    kind: String(c.fields.kind).toLowerCase().trim(),
    metric: String(c.fields.metric ?? '').toLowerCase().trim().replace(/\s+/g, '-').replace(/\//g, '-'),
  }));
}

const isUnknown = (v) => /^unknown\b/i.test(String(v ?? '').trim());

/** Declaration problems: { errors, warnings } (missing fields, unknown metric, scope, unmeasured unknown baseline). */
export function validateCriteria(text, quality = loadQuality()) {
  const errors = [], warnings = [];
  const header = planHeader(text);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(header.date ?? '')) errors.push('plan has no "date: YYYY-MM-DD" header: criteria must be dated before construction (I4)');
  const crit = qualityCriteria(text);
  if (!crit.length) warnings.push('no UI/UX/DS criterion (a criterion bullet with a "kind:" field) under "## Acceptance criteria"');
  const ids = new Set();
  const metricIds = {
    ui: new Set(quality.ui_metrics.map((m) => m.id)),
    ux: new Set(quality.ux_dimensions.map((m) => m.id)),
    ds: new Set(quality.ds_adherence.checks.map((m) => m.id)),
  };
  const req = quality.criterion_fields.required.filter((k) => !['id', 'kind', 'metric'].includes(k));
  for (const c of crit) {
    const tag = `${c.id} (line ${c.line})`;
    if (ids.has(c.id)) errors.push(`${tag}: id repeated`);
    ids.add(c.id);
    if (!quality.criterion_fields.kinds.includes(c.kind)) { errors.push(`${tag}: kind "${c.kind}" (use ui | ux | ds)`); continue; }
    if (!metricIds[c.kind].has(c.metric)) errors.push(`${tag}: metric "${c.metric}" is not a ${c.kind} ${c.kind === 'ds' ? 'adherence check' : c.kind === 'ui' ? 'metric' : 'dimension'} (${[...metricIds[c.kind]].join(', ')})`);
    if (c['not-applicable'] !== undefined) {
      if (!String(c['not-applicable']).trim()) errors.push(`${tag}: not-applicable needs a reason`);
      continue;
    }
    for (const k of req) if (!String(c[k] ?? '').trim()) errors.push(`${tag}: missing "${k}"`);
    const scope = c.kind === 'ux' ? quality.criterion_fields.ux_scope : quality.criterion_fields.ui_scope;
    for (const k of scope) if (!String(c[k] ?? '').trim()) (k === 'viewport' || k === 'state' ? warnings : errors).push(`${tag}: missing "${k}"${k === 'viewport' ? ' (declare the viewport the target holds at, e.g. 1440x900)' : ''}`);
    if (isUnknown(c.baseline) && !/measur|task|count|session|run\b|instrument|probe/i.test(c.baseline)) warnings.push(`${tag}: baseline unknown without a measurement task ("unknown — measure …"): an unknown baseline requires measurement work`);
    if (c.probe && !quality.probes[String(c.probe).split(':')[0]]) errors.push(`${tag}: probe "${c.probe}" is not a DSX probe (${Object.keys(quality.probes).join(', ')})`);
    for (const p of String(c.principles ?? '').split(/[,\s]+/).filter(Boolean)) if (!/^[A-Z]+-\d+$/.test(p)) warnings.push(`${tag}: principle "${p}" is not a Forward principle id (USE-n, DOM-n…)`);
  }
  return { errors, warnings, criteria: crit, header };
}

// ---------- evaluation ----------

const TARGET = /(<=|>=|≤|≥|==|=|<|>)\s*(-?\d+(?:[.,]\d+)?)\s*(%?)/;
const RELATIVE = /baseline\s*([+-])\s*(\d+(?:[.,]\d+)?)\s*(%?)/i;
const num = (s) => Number(String(s).replace(',', '.'));

/** Target → { op, value } (absolute or relative to a numeric baseline) or { unknown: reason }. */
export function parseTarget(target, baseline) {
  const t = String(target ?? '');
  const op0 = t.match(/(<=|>=|≤|≥|==|=|<|>)/)?.[1];
  const op = { '≤': '<=', '≥': '>=', '=': '==' }[op0] ?? op0 ?? null;
  const rel = t.match(RELATIVE);
  if (rel || /\bbaseline\b/i.test(t)) {
    if (isUnknown(baseline) || !Number.isFinite(num(String(baseline).match(/-?\d+(?:[.,]\d+)?/)?.[0]))) return { unknown: 'target is relative to a baseline that is unknown: run the measurement task first' };
    const b = num(String(baseline).match(/-?\d+(?:[.,]\d+)?/)[0]);
    if (!rel) return { op: op ?? '<=', value: b };
    const d = num(rel[2]);
    const delta = rel[3] === '%' ? (b * d) / 100 : d;
    return { op: op ?? (rel[1] === '-' ? '<=' : '>='), value: rel[1] === '-' ? b - delta : b + delta };
  }
  const m = t.match(TARGET);
  if (!m) return { unknown: `target "${t}" has no comparable number: record the verdict as human or expert evidence` };
  return { op: { '≤': '<=', '≥': '>=', '=': '==' }[m[1]] ?? m[1], value: num(m[2]) };
}

export function compare(value, { op, value: target }) {
  switch (op) {
    case '<=': return value <= target;
    case '>=': return value >= target;
    case '<': return value < target;
    case '>': return value > target;
    default: return value === target;
  }
}

const CAPTURE_RE = /^(\d+)-([a-z0-9]+(?:-[a-z0-9]+)*)(?:\.([a-z0-9]+(?:-[a-z0-9]+)*))?\.html$/;
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Capture file of a surface (screen id, route or name via the map) in a state (default success). */
export function captureFor(surface, state, { screensDir, map }) {
  if (!screensDir || !existsSync(screensDir)) return null;
  const want = String(surface ?? '').trim();
  const st = !state || /^(success|populated|default|loaded)$/i.test(state) ? null : String(state).trim().toLowerCase();
  const ids = new Set([want]);
  for (const s of map?.screens ?? []) {
    if (s.id === want || (s.route && s.route === want) || (s.name && fold(s.name) === fold(want))) ids.add(s.id);
  }
  for (const f of readdirSync(screensDir).sort()) {
    const m = f.match(CAPTURE_RE);
    if (m && ids.has(m[2]) && (m[3] ?? null) === st) return join(screensDir, f);
  }
  return null;
}

const screenIdOf = (name) => String(name ?? '').replace(/\.html$/, '').replace(/^\d+-/, '').replace(/\..*$/, '');

/**
 * Runs a DSX probe for a criterion. Returns { value, unit, evidence_class: 'observed', source, note } or
 * { unknown: reason }. `ctx`: { screensDir, map, cfg, items, measureCapture, quality, root }.
 */
export function runProbe(c, ctx) {
  const [probe, arg] = String(c.probe ?? '').split(':');
  if (!probe) return { unknown: null };
  const def = ctx.quality.probes[probe];
  if (!def) return { unknown: `probe "${probe}" is not a DSX probe` };
  if (probe === 'journey-steps') {
    const j = (ctx.map?.journeys ?? []).find((x) => x.id === (arg || c.journey) || fold(x.name) === fold(arg || c.journey));
    if (!ctx.map) return { unknown: 'no flow map: journey-steps needs .dsx/maps/flows-<module>.json' };
    if (!j) return { unknown: `journey "${arg || c.journey}" is not in the flow map` };
    return { value: (j.steps ?? []).length, unit: def.unit, evidence_class: 'observed', source: ctx.mapPath, note: `journey ${j.id}` };
  }
  if (probe === 'open-findings') {
    const metric = [...ctx.quality.ui_metrics, ...ctx.quality.ux_dimensions].find((m) => m.id === c.metric);
    const rules = new Set(arg ? arg.split(',').map((x) => x.trim()) : metric?.dsx_rules ?? []);
    const surface = String(c.surface ?? '').trim();
    const open = (ctx.items ?? []).filter((it) => ['open', 'regression', 'new'].includes(it.status ?? 'open') && it.present !== false && rules.has(it.rule)
      && (!surface || surface === '*' || (it.screens ?? []).some((s) => screenIdOf(s) === surface)));
    return { value: open.length, unit: def.unit, evidence_class: 'observed', source: ctx.findingsPath, note: `rules ${[...rules].join(',')}${surface && surface !== '*' ? ` on ${surface}` : ''}` };
  }
  const file = captureFor(c.surface, c.state, ctx);
  if (!file) return { unknown: `no capture for surface "${c.surface}"${c.state ? ` in state "${c.state}"` : ''}` };
  const m = ctx.measureCapture(readFileSync(file, 'utf8'), ctx.cfg);
  const value = probe === 'words' ? m.words : probe === 'primary-actions' ? m.primary_actions : m.dialog_open ? 1 : 0;
  return { value, unit: def.unit, evidence_class: 'observed', source: file, note: c.viewport ? `static probe on the capture; viewport ${c.viewport} not rendered` : 'static probe on the capture' };
}

/**
 * Evaluates every criterion. `evidence`: { <id>: { value?, verdict?, evidence_class, source?, revision?, note? } }
 * recorded by people or reviewers (human, expert-inferred) — synthetic never passes. Returns one result per criterion.
 */
export function evaluateCriteria(criteria, ctx, evidence = {}) {
  return criteria.map((c) => {
    const base = { id: c.id, title: c.title, kind: c.kind, metric: c.metric, target: c.target ?? null, baseline: c.baseline ?? null,
      scope: c.kind === 'ux' ? { population: c.population ?? null, journey: c.journey ?? null } : { surface: c.surface ?? null, state: c.state ?? null, viewport: c.viewport ?? null } };
    if (c['not-applicable'] !== undefined) return { ...base, value: null, verdict: 'not-applicable', reason: c['not-applicable'], evidence: null };
    const rec = evidence[c.id];
    let measured = null;
    if (rec) {
      const cls = rec.evidence_class ?? rec.class;
      if (!EVIDENCE.includes(cls)) return { ...base, value: rec.value ?? null, verdict: 'unknown', reason: `evidence class "${cls}" is not ${EVIDENCE.join(' | ')}`, evidence: { class: cls ?? null, source: rec.source ?? null, revision: rec.revision ?? null } };
      measured = { value: rec.value ?? null, evidence_class: cls, source: rec.source ?? null, revision: rec.revision ?? null, note: rec.note ?? null, verdict: rec.verdict ?? null };
    } else {
      const p = runProbe(c, ctx);
      if (p.unknown !== undefined) {
        const why = p.unknown ?? (isUnknown(c.baseline) ? 'baseline unknown and no measurement recorded yet' : `not measured yet (method: ${c.method ?? 'undeclared'})`);
        return { ...base, value: null, verdict: 'unknown', reason: why, evidence: null };
      }
      const rev = p.source ? sourceRevision(p.source, { root: ctx.root }) : null;
      measured = { value: p.value, evidence_class: 'observed', source: rev?.path ?? null, revision: rev?.sha ?? null, note: p.note, unit: p.unit };
    }
    const ev = { class: measured.evidence_class, source: measured.source, revision: measured.revision, ...(measured.note ? { note: measured.note } : {}) };
    if (measured.evidence_class === 'synthetic') return { ...base, value: measured.value, verdict: 'unknown', reason: 'synthetic evidence generates hypotheses, never a verdict [synthetic — not evidence]', evidence: ev };
    if (measured.verdict) {
      const v = String(measured.verdict).toLowerCase();
      if (!VERDICTS.includes(v)) return { ...base, value: measured.value, verdict: 'unknown', reason: `recorded verdict "${measured.verdict}" is not ${VERDICTS.join(' | ')}`, evidence: ev };
      return { ...base, value: measured.value, verdict: v, reason: 'recorded verdict', evidence: ev };
    }
    if (!Number.isFinite(Number(measured.value))) return { ...base, value: measured.value, verdict: 'unknown', reason: 'no numeric value recorded', evidence: ev };
    const t = parseTarget(c.target, c.baseline);
    if (t.unknown) return { ...base, value: Number(measured.value), verdict: 'unknown', reason: t.unknown, evidence: ev };
    const ok = compare(Number(measured.value), t);
    return { ...base, value: Number(measured.value), threshold: `${t.op} ${Math.round(t.value * 100) / 100}`, verdict: ok ? 'pass' : 'fail', reason: ok ? 'target met' : 'target missed', evidence: ev };
  });
}

/** Verdict of a group: fail beats unknown beats pass; none declared is unknown; all not-applicable is not-applicable. */
export function groupVerdict(results) {
  if (!results.length) return 'unknown';
  if (results.some((r) => r.verdict === 'fail')) return 'fail';
  if (results.every((r) => r.verdict === 'not-applicable')) return 'not-applicable';
  if (results.some((r) => r.verdict === 'unknown')) return 'unknown';
  return 'pass';
}

const SEVS = [4, 3, 2, 1];

/**
 * Quality report: UI (5 metrics), UX (5 dimensions), DS adherence (separate), each with its criteria verdicts and a
 * diagnostic of open DSX findings of the rules that feed it (counts are diagnostics, never verdicts).
 */
export function qualityReport(quality, results, items = []) {
  const open = items.filter((it) => ['open', 'regression', 'new'].includes(it.status ?? 'open') && it.present !== false);
  const diag = (rules) => {
    const by = { 4: 0, 3: 0, 2: 0, 1: 0 };
    let n = 0;
    for (const it of open) if (rules.includes(it.rule)) { n++; by[it.severity] = (by[it.severity] ?? 0) + 1; }
    return { open: n, by_severity: by };
  };
  const section = (defs, kind) => defs.map((d) => {
    const crit = results.filter((r) => r.kind === kind && r.metric === d.id);
    const verdict = groupVerdict(crit);
    return { id: d.id, name: d.name, gate_question: d.gate_question, verification: d.verification, principles: d.principles ?? [],
      verdict, reason: crit.length ? null : 'no criterion declared before construction', criteria: crit, diagnostic: { rules: d.dsx_rules ?? [], ...diag(d.dsx_rules ?? []) } };
  });
  const ds = quality.ds_adherence.checks.map((d) => {
    const crit = results.filter((r) => r.kind === 'ds' && r.metric === d.id);
    return { id: d.id, name: d.name, verdict: groupVerdict(crit), reason: crit.length ? null : 'no criterion declared before construction', criteria: crit, tools: d.dsx_tools, diagnostic: { rules: d.dsx_rules, ...diag(d.dsx_rules) } };
  });
  return {
    ui: section(quality.ui_metrics, 'ui'),
    ux: section(quality.ux_dimensions, 'ux'),
    // Overall DS verdict over the checks: a check with no criterion is unknown, so the whole is never silently pass.
    ds: { verdict: groupVerdict(ds.map((x) => ({ verdict: x.verdict }))), checks: ds, rule: quality.ds_adherence.rule },
    counts: Object.fromEntries(VERDICTS.map((v) => [v, results.filter((r) => r.verdict === v).length])),
  };
}

const sevLine = (s) => SEVS.map((k) => `s${k} ${s[k] ?? 0}`).join(' · ');
const MARK = { pass: 'PASS', fail: 'FAIL', unknown: 'UNKNOWN', 'not-applicable': 'N/A' };

/** Plain-text sections for the audit report. */
export function formatQuality(q, { criteriaFile = null } = {}) {
  const L = [];
  const crit = (r) => {
    const val = r.value === null || r.value === undefined ? '—' : `${r.value}${r.threshold ? ` (target ${r.threshold})` : ''}`;
    const ev = r.evidence ? ` · evidence ${r.evidence.class}${r.evidence.revision ? ` @ ${r.evidence.revision}` : ''}${r.evidence.source ? ` (${r.evidence.source})` : ''}` : '';
    return `    ${r.id} ${MARK[r.verdict]} · value ${val}${ev}${r.reason && r.verdict !== 'pass' ? ` · ${r.reason}` : ''}`;
  };
  const block = (title, rows) => {
    L.push(`\n${title}`);
    for (const m of rows) {
      L.push(`  ${m.name} [${m.id}] · ${MARK[m.verdict]}${m.reason ? ` (${m.reason})` : ''} · verified by ${m.verification}`);
      for (const r of m.criteria) L.push(crit(r));
      L.push(`    diagnostic (not a verdict): ${m.diagnostic.open} open DSX finding(s) in ${m.diagnostic.rules.join(', ') || 'no rule'} (${sevLine(m.diagnostic.by_severity)})`);
    }
  };
  L.push(`\nQuality criteria: ${criteriaFile ?? 'none given (--criteria cycles/C-<n>/plan.md); every metric is unknown'} · ${Object.entries(q.counts).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  L.push('  No score: each metric has its own verdict; unknown is never pass.');
  block('UI quality (5 metrics)', q.ui);
  block('UX quality (5 dimensions)', q.ux);
  L.push(`\nDesign-system adherence (separate verdict) · ${MARK[q.ds.verdict]}`);
  for (const c of q.ds.checks) {
    L.push(`  ${c.name} [${c.id}] · ${MARK[c.verdict]}${c.reason ? ` (${c.reason})` : ''} · tools: ${c.tools.join(', ')}`);
    for (const r of c.criteria) L.push(crit(r));
    if (c.diagnostic.rules.length) L.push(`    diagnostic (not a verdict): ${c.diagnostic.open} open finding(s) in ${c.diagnostic.rules.join(', ')}`);
  }
  L.push(`  ${q.ds.rule}`);
  return L.join('\n');
}

const safeConfig = (ux) => { try { return loadConfig(ux && existsSync(ux) ? ux : null); } catch { return loadConfig(null); } };

/**
 * Glue for audit.mjs: reads the plan, the recorded evidence and the project inputs, evaluates every criterion and
 * builds the quality report. Without a plan every metric is unknown ("no criterion declared").
 */
export function evaluateForAudit({ criteria = null, evidence = null, screens = null, map = null, ux = null, items = [], findingsPath = null, root = process.cwd(), quality = loadQuality() } = {}) {
  let declared = [], validation = null, plan = null, recorded = {};
  const problems = [];
  if (criteria) {
    plan = planPath(criteria);
    if (!existsSync(plan)) problems.push(`no plan at ${plan}`);
    else {
      validation = validateCriteria(readFileSync(plan, 'utf8'), quality);
      declared = validation.criteria;
    }
  }
  if (evidence) {
    try { recorded = JSON.parse(readFileSync(resolve(evidence), 'utf8')); recorded = recorded.criteria ?? recorded; } catch (e) { problems.push(`evidence file not read: ${e.message}`); }
  }
  let flow = null;
  if (map && existsSync(map)) { try { flow = normalizeFlowMap(JSON.parse(readFileSync(map, 'utf8'))).map; } catch { flow = null; } }
  const ctx = { screensDir: screens, map: flow, mapPath: map, cfg: safeConfig(ux), items, findingsPath, measureCapture, quality, root };
  const results = evaluateCriteria(declared, ctx, recorded);
  return { plan, evidence: evidence ? resolve(evidence) : null, validation: validation ? { errors: validation.errors, warnings: validation.warnings } : null, problems, results, report: qualityReport(quality, results, items) };
}

// ---------- CLI ----------

function main() {
  const [cmd, file, ...rest] = process.argv.slice(2);
  const json = rest.includes('--json');
  if (!['check', 'list'].includes(cmd) || !file) {
    console.error('Usage: node tools/ux-lint/criteria.mjs check|list <cycles/C-n/plan.md | cycles/C-n> [--json]');
    process.exit(2);
  }
  const p = planPath(file);
  if (!existsSync(p)) { console.error(`no plan at ${p}`); process.exit(2); }
  const r = validateCriteria(readFileSync(p, 'utf8'));
  if (json) { console.log(JSON.stringify({ plan: p, ...r }, null, 2)); process.exit(r.errors.length ? 1 : 0); }
  console.log(`Quality criteria · ${basename(dirname(p))}/${basename(p)} · date ${r.header.date ?? '—'} · ${r.criteria.length} criterion(s)`);
  if (cmd === 'list') for (const c of r.criteria) console.log(`  ${c.id} ${c.kind}/${c.metric} · ${c.title} · baseline ${c.baseline ?? '—'} · target ${c.target ?? '—'}`);
  for (const e of r.errors) console.log(`  ERROR ${e}`);
  for (const w of r.warnings) console.log(`  warning ${w}`);
  if (!r.errors.length) console.log('  declarations ok');
  process.exit(r.errors.length ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
