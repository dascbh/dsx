// DSX rules → Forward principles. The matrix (data/ux-dimensions.json) carries `principles` and `probe` on every rule
// of rules_index and review_rules, and `principles` on every law of laws_index; the principle ids come from Forward's
// catalog (data/forward/spec/dimensions/quality-attributes.toml). This module is the one place that reads that
// crosswalk, so the report, the variations page and the exporters cite principles the same way.
import { dataText } from '../../lib/data-text.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DSX_ROOT, loadPrinciples, loadDivergenceRules } from './snapshot.mjs';

export const MATRIX_PATH = join(DSX_ROOT, 'data', 'ux-dimensions.json');
export const loadMatrix = (file = MATRIX_PATH) => JSON.parse(readFileSync(file, 'utf8'));

/**
 * DSX severity (Nielsen 0–4) → Forward severity. 0 ("not a usability problem") has no Forward equivalent and is not
 * exported. The table is the contract documented in docs/forward-compat.md.
 */
export const SEVERITY_TO_FORWARD = Object.freeze({ 4: 'critical', 3: 'high', 2: 'medium', 1: 'low' });
export const SEVERITY_FROM_FORWARD = Object.freeze({ critical: 4, high: 3, medium: 2, low: 1 });

/** Rule entry from rules_index or review_rules (null when unknown). */
export function ruleEntry(rule, matrix = loadMatrix()) {
  return matrix.rules_index?.[rule] ?? matrix.review_rules?.[rule] ?? null;
}

/** Principles a rule cites, in order (the first is the primary one). */
export function principlesForRule(rule, matrix = loadMatrix()) {
  return [...(ruleEntry(rule, matrix)?.principles ?? [])];
}

/** The probe text of a rule (English, one line), or null. */
export function probeForRule(rule, matrix = loadMatrix()) {
  return ruleEntry(rule, matrix)?.probe ?? null;
}

/** Principles of a law of laws_index. */
export function principlesForLaw(law, matrix = loadMatrix()) {
  return [...(matrix.laws_index?.[law]?.principles ?? [])];
}

/** Laws of laws_index named in a text (by id, its name or a legacy alias), in order of appearance. */
export function lawsIn(text, matrix = loadMatrix()) {
  const s = String(text ?? '').toLowerCase();
  const hits = [];
  for (const [id, l] of Object.entries(matrix.laws_index ?? {})) {
    const names = [id, id.replace(/-/g, ' '), dataText(l, 'name'), l.name_pt, ...(l.aliases ?? [])].filter(Boolean).map((x) => String(x).toLowerCase());
    const at = Math.min(...names.map((n) => { const k = s.indexOf(n); return k < 0 ? Infinity : k; }));
    if (at !== Infinity) hits.push([at, id]);
  }
  return hits.sort((a, b) => a[0] - b[0]).map(([, id]) => id);
}

/**
 * Principles for one registry item: the rule's own; for the LAW review rule, the principles of the law the item
 * cites (message or text). Empty when nothing maps (a rule mapped to [] on purpose stays empty: its laws are not a
 * back door) — such a finding is still exported with its probe, never with an invented principle.
 */
export function principlesForItem(item, matrix = loadMatrix()) {
  const own = principlesForRule(item.rule, matrix);
  if (own.length) return own;
  if (item.rule === 'LAW') return [...new Set(lawsIn(`${item.message ?? ''} ${item.text ?? ''}`, matrix).flatMap((l) => principlesForLaw(l, matrix)))];
  return [];
}

/** Forward attribute that owns a principle (usability_accessibility for USE-*, functional_correctness for DOM-*…). */
export function attributeOf(principle, principles = loadPrinciples()) {
  return principles.get(principle)?.attribute ?? null;
}

/**
 * Problems in the crosswalk: a cited principle missing from the snapshot, a rule without the `principles`/`probe`
 * fields, a law without `principles`. Returns { problems, unmapped: { rules: [...], laws: [...] } }.
 */
export function checkCrosswalk(matrix = loadMatrix(), principles = loadPrinciples()) {
  const problems = [];
  const unmapped = { rules: [], laws: [] };
  for (const [section, table] of [['rules_index', matrix.rules_index ?? {}], ['review_rules', matrix.review_rules ?? {}]]) {
    for (const [id, r] of Object.entries(table)) {
      if (!Array.isArray(r.principles)) problems.push(`${section}.${id}: no "principles" list`);
      if (typeof r.probe !== 'string' || !r.probe.trim()) problems.push(`${section}.${id}: no "probe"`);
      for (const p of r.principles ?? []) if (!principles.has(p)) problems.push(`${section}.${id}: principle ${p} is not in the Forward catalog`);
      if (Array.isArray(r.principles) && !r.principles.length) unmapped.rules.push(id);
    }
  }
  for (const [id, l] of Object.entries(matrix.laws_index ?? {})) {
    if (!Array.isArray(l.principles)) problems.push(`laws_index.${id}: no "principles" list`);
    for (const p of l.principles ?? []) if (!principles.has(p)) problems.push(`laws_index.${id}: principle ${p} is not in the Forward catalog`);
    if (Array.isArray(l.principles) && !l.principles.length) unmapped.laws.push(id);
  }
  return { problems, unmapped };
}

/**
 * Lens check for a variations manifest (skill rethink-ux), against the divergence gate's own lens list.
 * Variants may carry `lens`; the manifest may carry `how_might_we` (list). Returns { errors, warnings, lenses }.
 * Meant to be called by tools/ux-lint/variations.mjs `validate`; it never edits the manifest.
 */
export function lensCheck(manifest, { rules = loadDivergenceRules(), size = null } = {}) {
  const errors = [], warnings = [];
  const variants = manifest?.variants ?? [];
  const given = variants.filter((v) => v.lens);
  for (const v of given) if (!rules.lenses.includes(v.lens)) errors.push(`variant "${v.id}": lens "${v.lens}" is not one of ${rules.lenses.join(', ')}`);
  const distinct = new Set(given.map((v) => v.lens).filter((l) => rules.lenses.includes(l)));
  const seen = new Map();
  for (const v of given) { if (seen.has(v.lens)) warnings.push(`variants "${seen.get(v.lens)}" and "${v.id}" share the lens "${v.lens}": they count as one alternative (USE-10)`); else seen.set(v.lens, v.id); }
  const missing = variants.filter((v) => !v.lens).map((v) => v.id);
  if (missing.length) warnings.push(`no "lens" on variant(s) ${missing.join(', ')}: the Forward export needs one per variant (${rules.lenses.join(', ')})`);
  const hmw = manifest?.how_might_we ?? [];
  if (hmw.length < 2) warnings.push(`"how_might_we" has ${hmw.length} framing(s); Forward's divergence gate needs at least 2 (USE-12)`);
  const need = size ? rules.required[String(size).toLowerCase()] ?? 0 : 0;
  if (need && distinct.size < need) errors.push(`${distinct.size} distinct lens(es), size ${String(size).toUpperCase()} requires ${need}`);
  return { errors, warnings, lenses: rules.lenses };
}
