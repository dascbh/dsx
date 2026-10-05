// DSX findings registry (.dsx/findings/<module>/findings.json) ⇄ Forward review record (reviews/<id>/findings.toml).
// Export follows templates/findings.template.toml and fde-review: severity mapped by SEVERITY_TO_FORWARD, every
// finding cites a probe and/or a principle (I8), `blocking` only by a declared criterion, a cap of `max_findings`
// [[finding]] entries per round with every other observation one line in [meta].notes.
import { tomlString, tomlStringList } from './toml-lite.mjs';
import { loadPrinciples } from './snapshot.mjs';
import { loadMatrix, principlesForItem, probeForRule, attributeOf, SEVERITY_TO_FORWARD, SEVERITY_FROM_FORWARD } from './crosswalk.mjs';

export const DEFAULT_STATUSES = ['open', 'decided', 'regression'];
export const DEFAULT_MAX_FINDINGS = 5;
const one = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Evidence text for one item: what violates, where (screens, source lines) and the text involved. */
export function evidenceOf(item) {
  const head = one(item.message) || one(item.text);
  const parts = [/[.!?…]$/.test(head) ? head : `${head}.`];
  // the visible text matters for text and consistency findings; other families carry a masked template of the message
  if (['text', 'consistency'].includes(item.family) && item.text && one(item.text) !== one(item.message)) parts.push(`Text: "${clip(one(item.text), 160)}".`);
  if ((item.screens ?? []).length) parts.push(`Screens: ${item.screens.slice(0, 6).join(', ')}${item.screens.length > 6 ? ` (+${item.screens.length - 6})` : ''}.`);
  if ((item.source ?? []).length) parts.push(`Source: ${item.source.slice(0, 4).join(', ')}${item.source.length > 4 ? ` (+${item.source.length - 4})` : ''}.`);
  if (item.region) parts.push(`Region: ${item.region}.`);
  return parts.filter(Boolean).join(' ');
}

/**
 * Builds the review record from a registry. Options: demandId (required), kind, statuses, minSeverity, maxFindings,
 * criteria (map finding id or rule → declared criterion id), commit, registryPath.
 * Returns { meta, findings, notes, skipped } — `skipped` lists items that could not be exported and why.
 */
export function registryToReview(reg, {
  demandId, kind = 'adversarial', statuses = DEFAULT_STATUSES, minSeverity = 1, maxFindings = DEFAULT_MAX_FINDINGS,
  criteria = {}, commit = null, registryPath = null, matrix = loadMatrix(), principles = loadPrinciples(),
} = {}) {
  if (!demandId) throw new Error('demandId is required (the Forward demand or cycle id the review belongs to)');
  const skipped = [];
  const rows = [];
  for (const it of reg.items ?? []) {
    if (!statuses.includes(it.status)) continue;
    if (!(it.severity >= Math.max(1, minSeverity))) { if (it.severity === 0) skipped.push({ id: it.id, why: 'severity 0 has no Forward equivalent' }); continue; }
    const severity = SEVERITY_TO_FORWARD[it.severity];
    const cited = principlesForItem(it, matrix).filter((p) => principles.has(p));
    const principle = cited[0] ?? null;
    // rules_index rules are executable checks → probe; review_rules (H1…, desc, LAW…) are judgment → principle only
    const probeText = matrix.rules_index?.[it.rule] ? probeForRule(it.rule, matrix) : null;
    const probe = probeText ? `${it.rule}: ${probeText}` : null;
    if (!principle && !probe) { skipped.push({ id: it.id, why: `rule ${it.rule} cites no Forward principle and is not a probe — not a finding under I8` }); continue; }
    const attribute = (principle && attributeOf(principle, principles)) || 'usability_accessibility';
    const criterion = criteria[it.id] ?? criteria[it.rule] ?? null;
    const blocking = !!criterion && (severity === 'critical' || severity === 'high');
    let evidence = evidenceOf(it);
    if (cited.length > 1) evidence += ` Also cites ${cited.slice(1).join(', ')}.`;
    if (it.status === 'regression') evidence += ' Regression: fixed before and present again.';
    if (blocking) evidence += ` Breaks declared criterion ${criterion}.`;
    else if (criterion) evidence += ` Touches declared criterion ${criterion}, but severity ${severity} cannot block.`;
    rows.push({
      id: it.id, attribute, severity, rank: it.severity, ...(principle ? { principle } : {}), ...(probe ? { probe } : {}),
      evidence, blocking, backlog: !blocking && it.severity >= 2, status: it.status,
    });
  }
  rows.sort((a, b) => Number(b.blocking) - Number(a.blocking) || b.rank - a.rank || a.id.localeCompare(b.id));
  const findings = rows.slice(0, maxFindings);
  const notes = rows.slice(maxFindings).map((r) => clip(`${r.id} ${r.severity} ${r.principle ?? r.probe.split(':')[0]}: ${r.evidence}`, 300));
  const lastRun = (reg.runs ?? []).at(-1) ?? null;
  const probed = [
    `DSX findings registry${registryPath ? ` ${registryPath}` : ''} (module ${reg.module ?? '?'}, updated ${reg.updated ?? '?'})`,
    ...(lastRun?.sources?.length ? [`detector families run: ${lastRun.sources.join(', ')}`] : []),
    `filter: status ${statuses.join('|')}, severity >= ${Math.max(1, minSeverity)} (DSX 0–4)`,
    `severity map: 4 critical, 3 high, 2 medium, 1 low (docs/forward-compat.md)`,
  ];
  if (skipped.length) probed.push(`${skipped.length} item(s) not exported: no principle and no probe, or severity 0`);
  return {
    meta: {
      demand_id: demandId, kind, context_policy: 'artifact_only', isolation_mode: 'artifact_and_spec',
      rounds_planned: 1, round: 1, ...(commit ?? lastRun?.commit ? { commit: commit ?? lastRun.commit } : {}), probed, notes,
    },
    findings, notes, skipped,
  };
}

/** TOML text of a review record, keys in the template's order. */
export function renderReviewToml(review, { header = null } = {}) {
  const m = review.meta;
  const L = [
    '# Review report exported from the DSX findings registry (tools/forward/export.mjs).',
    '# This file is written by the adversarial role and by no one else.',
    ...(header ? [`# ${header}`] : []),
    '',
    '[meta]',
    `demand_id = ${tomlString(m.demand_id)}`,
    `kind = ${tomlString(m.kind)}`,
    `context_policy = ${tomlString(m.context_policy)}`,
    `isolation_mode = ${tomlString(m.isolation_mode)}`,
    `rounds_planned = ${m.rounds_planned}`,
    `round = ${m.round}`,
    ...(m.commit ? [`commit = ${tomlString(m.commit)}`] : []),
    `probed = ${tomlStringList(m.probed ?? [])}`,
    `notes = ${tomlStringList(m.notes ?? [])}`,
  ];
  for (const f of review.findings) {
    L.push('', '[[finding]]', `id = ${tomlString(f.id)}`, `attribute = ${tomlString(f.attribute)}`, `severity = ${tomlString(f.severity)}`);
    if (f.principle) L.push(`principle = ${tomlString(f.principle)}`);
    if (f.probe) L.push(`probe = ${tomlString(f.probe)}`);
    L.push(`evidence = ${tomlString(f.evidence)}`, `blocking = ${f.blocking}`);
    if (!f.blocking) L.push(`backlog = ${f.backlog}`);
  }
  L.push('');
  return L.join('\n');
}

// ---------- import ----------

const DSX_ID = /^(t|s|f|st|c|l)-[0-9a-f]{8}$/;
const FAMILY_OF_PREFIX = { t: 'text', s: 'screen', f: 'flow', st: 'states', c: 'consistency', l: 'layout' };

/**
 * A parsed findings.toml → DSX registry items (origin "forward"). The rule comes from the probe prefix ("X6: …")
 * when the finding was exported by DSX, otherwise it is the principle (or "probe"). A finding with `fixed_in` is
 * `fixed`; the rest are `open`.
 */
export function reviewToItems(parsed, { file = null, matrix = loadMatrix() } = {}) {
  const meta = parsed.meta ?? {};
  return (parsed.finding ?? []).map((f, k) => {
    const pre = String(f.probe ?? '').match(/^([A-Z]+\d+b?):\s/);
    const rule = pre && matrix.rules_index?.[pre[1]] ? pre[1] : (f.principle ?? (f.probe ? 'probe' : 'unknown'));
    const id = String(f.id ?? `F${k + 1}`);
    const family = matrix.rules_index?.[rule]?.family ?? (DSX_ID.test(id) ? FAMILY_OF_PREFIX[id.split('-')[0]] : 'review');
    const sev = SEVERITY_FROM_FORWARD[String(f.severity ?? '').toLowerCase()] ?? 2;
    const evidence = one(f.evidence);
    return {
      id: DSX_ID.test(id) ? id : `${meta.demand_id ?? 'review'}/${id}`, family, rule, severity: sev, element: null,
      text: clip(evidence, 200), variants: [], screens: [], source: file ? [file] : [],
      message: evidence, origin: 'forward', present: !f.fixed_in, status: f.fixed_in ? 'fixed' : 'open',
      forward: {
        demand_id: meta.demand_id ?? null, kind: meta.kind ?? null, attribute: f.attribute ?? null, severity: f.severity ?? null,
        principle: f.principle ?? null, probe: f.probe ?? null, blocking: !!f.blocking, backlog: !!f.backlog, fixed_in: f.fixed_in ?? null,
      },
    };
  });
}
