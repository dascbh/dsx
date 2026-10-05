#!/usr/bin/env node
// ux-lint, flow level: applies rules F1–F5 of the UX.md contract (knowledge/foundations/ux-md.md)
// to a module's flow map (.dsx/maps/flows-<module>.json). No dependencies.
//
// Input format: { screens: [{id, name, type, route, parent, persona}],
//   transitions: [{id, from, to, trigger: {type, label}, evidence}], journeys: [{id, name, steps, persona_switches}] }
// Screen `type`: page | dialog | tab | panel | drawer (dialog and modal count as a dialog).
// Journey steps may be transition ids or screen ids. The old format (telas, transicoes, jornadas,
// de/para, gatilho, evidencia, passos…) is read with a warning (lib/legacy.mjs).
//
// Usage: node tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json [--ux UX.md] [--json] [--fail-at 3]
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { normalizeFlowMap } from './lib/legacy.mjs';

export const SEVERITY = { F1: 3, F2: 1, F3: 2, F4: 2, F5: 3 };
const DIALOG_TYPES = new Set(['dialog', 'modal']);

/**
 * Returns { findings: [{ rule, severity, screen, message, evidence: [] }], summary, warnings? }.
 * `warnings` lists the old names read in the map.
 */
export function analyzeFlow(input, cfg = configFrom({})) {
  const { map, warnings } = normalizeFlowMap(input);
  const screens = map.screens || [];
  const transitions = map.transitions || [];
  const journeys = map.journeys || [];
  const byId = new Map(screens.map((t) => [t.id, t]));
  const isDialog = (id) => DIALOG_TYPES.has(String(byId.get(id)?.type || '').toLowerCase());
  const outgoing = new Map(screens.map((t) => [t.id, []]));
  const incoming = new Map(screens.map((t) => [t.id, []]));
  for (const tr of transitions) {
    outgoing.get(tr.from)?.push(tr);
    incoming.get(tr.to)?.push(tr);
  }
  const findings = [];
  const add = (rule, screen, message, evidence = [], severity = SEVERITY[rule]) =>
    findings.push({ rule, severity, screen, message, evidence: evidence.filter(Boolean) });
  const evidenceOf = (trs) => trs.map((t) => `${t.id} (${t.evidence || 'no evidence'})`);
  const name = (id) => byId.get(id)?.name || id;

  // Broken references: a transition to/from a screen that does not exist (not a contract rule; reported as warning F0).
  for (const tr of transitions) {
    for (const side of ['from', 'to']) {
      if (!byId.has(tr[side])) add('F0', tr[side], `transition ${tr.id} points to a missing screen "${tr[side]}"`, evidenceOf([tr]), 1);
    }
  }

  // F1: screen (not a dialog) with no way out. A transition to the same screen (an action that stays there) is not a way out.
  const deadEnds = screens.filter((t) => !isDialog(t.id) && !outgoing.get(t.id).some((tr) => tr.to !== t.id));
  const deadEndLimit = Number(cfg.flows['dead-ends'] ?? 0);
  for (const t of deadEnds) {
    add('F1', t.id, `"${t.name}" (${t.type}) has no outgoing transition; it is reached by ${incoming.get(t.id).length} transition(s)`,
      evidenceOf(incoming.get(t.id)), deadEnds.length > deadEndLimit ? SEVERITY.F1 : 1);
  }

  // F2: screen outside every journey (warning).
  if (journeys.length) {
    const inJourneys = new Set();
    const transitionById = new Map(transitions.map((t) => [t.id, t]));
    for (const j of journeys) for (const p of j.steps || []) {
      const tr = transitionById.get(p);
      if (tr) { inJourneys.add(tr.from); inJourneys.add(tr.to); } else if (byId.has(p)) inJourneys.add(p);
    }
    for (const t of screens) {
      if (!inJourneys.has(t.id)) add('F2', t.id, `"${t.name}" does not appear in any journey`, t.component ? [t.component] : []);
    }
  }

  // F3: long journey.
  const maxSteps = Number(cfg.flows['max-journey-steps']);
  for (const j of journeys) {
    const n = (j.steps || []).length;
    if (n > maxSteps) {
      const switches = (j.persona_switches || []).length;
      add('F3', j.id, `journey "${j.name}" has ${n} steps (max. ${maxSteps})${switches ? `, with ${switches} persona switch(es)` : ''}`, []);
    }
  }

  // F4: stacked dialogs: depth of the dialog → dialog chain above the limit. The map does not say whether the
  // first dialog closes before the second opens; the rule flags it and the evidence lets you check in the code.
  const maxDialogs = Number(cfg.flows['max-stacked-dialogs']);
  // Dialog → dialog opening: an action inside the same dialog does not count, nor a return to the parent screen
  // (B → A when A is B's `parent`).
  const stacks = (tr) => isDialog(tr.from) && isDialog(tr.to) && tr.from !== tr.to && byId.get(tr.from)?.parent !== tr.to;
  const openings = transitions.filter(stacks);
  // Depth = longest chain of openings ending at the dialog (the first dialog counts 1).
  const depth = (id, visiting = new Set([id])) => {
    let deepest = 0;
    for (const tr of openings) {
      if (tr.to !== id || visiting.has(tr.from)) continue;
      visiting.add(tr.from);
      deepest = Math.max(deepest, depth(tr.from, visiting));
      visiting.delete(tr.from);
    }
    return 1 + deepest;
  };
  for (const tr of transitions) {
    if (!stacks(tr)) continue; // action inside the same dialog, a return, or a dialog opened from a page
    const p = depth(tr.to);
    if (p > maxDialogs) {
      add('F4', tr.to, `dialog "${name(tr.to)}" opens from dialog "${name(tr.from)}" (${p} stacked dialogs; max. ${maxDialogs})${tr.trigger?.label ? `; trigger "${tr.trigger.label}"` : ''}`, evidenceOf([tr]));
    }
  }

  // F5: non-root screen (with a parent) with no transition back to the parent or to a screen it is reached from.
  if (cfg.navigation.back === 'mandatory') {
    for (const t of screens.filter((t) => t.parent)) {
      // Origin = where it is reached from; children that return to this screen (a dialog that closes) are not origins.
      const origins = new Set(incoming.get(t.id).map((tr) => tr.from).filter((from) => from !== t.id && byId.get(from)?.parent !== t.id));
      const hasBack = outgoing.get(t.id).some((tr) => tr.to === t.parent || origins.has(tr.to));
      if (!hasBack) {
        add('F5', t.id, `"${t.name}" (child of "${name(t.parent)}") has no transition back to the parent nor to ${origins.size ? [...origins].map((o) => `"${name(o)}"`).join(', ') : 'any origin'}`,
          evidenceOf([...incoming.get(t.id), ...outgoing.get(t.id)]));
      }
    }
  }

  const byRule = {};
  for (const a of findings) byRule[a.rule] = (byRule[a.rule] || 0) + 1;
  return {
    findings,
    summary: { screens: screens.length, transitions: transitions.length, journeys: journeys.length, findings: findings.length, by_rule: byRule },
    ...(warnings.length ? { warnings } : {}),
  };
}

function main() {
  const args = parseCli('ux-lint/flow.mjs');
  if (!args._.length) {
    console.error('Usage: node tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json [--ux UX.md] [--json] [--fail-at 3]');
    process.exit(2);
  }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const threshold = Number(args['fail-at'] ?? 3);
  const output = args._.map((f) => ({ file: f, ...analyzeFlow(JSON.parse(readFileSync(f, 'utf8')), cfg) }));
  for (const s of output) for (const w of s.warnings ?? []) console.error(`WARNING ${s.file}: ${w}`);
  if (args.json) console.log(JSON.stringify(output.length === 1 ? output[0] : output, null, 2));
  else {
    for (const s of output) {
      console.log(`${s.file}`);
      for (const a of [...s.findings].sort((x, y) => x.rule.localeCompare(y.rule) || y.severity - x.severity)) {
        console.log(`   ${a.rule} sev ${a.severity} | ${a.screen} | ${a.message}`);
        for (const e of a.evidence.slice(0, 4)) console.log(`      ${e}`);
        if (a.evidence.length > 4) console.log(`      … +${a.evidence.length - 4}`);
      }
      const r = s.summary;
      console.log(`\nSummary: ${r.screens} screens, ${r.transitions} transitions, ${r.journeys} journeys; ${r.findings} findings (${Object.entries(r.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'none'})`);
    }
  }
  process.exit(output.some((s) => s.findings.some((a) => a.severity >= threshold)) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
