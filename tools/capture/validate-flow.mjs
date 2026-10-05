#!/usr/bin/env node
// Checks a flow map extracted from the code (.dsx/maps/flows-<module>.json) against the code itself.
// Fails (exit 1) when:
//   - a transition points to a screen that does not exist;
//   - a journey step is not a transition or breaks the chain (`to` of one ≠ `from` of the next), unless the journey
//     declares a persona switch at that step (`persona_switches`, step indexes);
//   - an evidence `file:line` does not exist, or the line (±3) contains neither the trigger label nor a navigation
//     signal (target route, `to=`, `href=`, `navigate(`, `onClick=`, `onChange=`, `router.push(`, `routerLink`, `@click`).
// The navigation signals cover React, Vue, Angular and Svelte templates; add your own with --signal.
//
//   node tools/capture/validate-flow.mjs <flows.json> [--root <project>] [--signal "<text>"...] [--json]
// Old Portuguese keys (telas, transicoes, de/para, gatilho, jornadas, passos…) are read with a warning.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeFlowMap } from '../ux-lint/lib/legacy.mjs';

export const NAV_SIGNALS = ['navigate(', 'to=', 'href=', 'onclick=', 'onchange=', 'router.push(', 'routerlink', '@click', 'on:click', 'v-on:click', '(click)'];
const norm = (t) => String(t ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

/** Validates a flow map. Returns { ok, failures[], checked, counts, warnings[] }. */
export function validateFlow(rawMap, { root = process.cwd(), signals = [] } = {}) {
  const { map, warnings } = normalizeFlowMap(rawMap);
  const screens = new Map((map.screens ?? []).map((s) => [s.id, s]));
  const transitions = new Map((map.transitions ?? []).map((t) => [t.id, t]));
  const failures = [];
  for (const t of map.transitions ?? []) for (const side of ['from', 'to']) if (!screens.has(t[side])) failures.push(`${t.id}: ${side}=${JSON.stringify(t[side])} is not a screen`);
  const cache = new Map();
  const allSignals = [...NAV_SIGNALS, ...signals.map(norm)];
  let checked = 0;
  for (const t of map.transitions ?? []) {
    const m = String(t.evidence ?? '').match(/^(.+?):(\d+)$/);
    if (!m) { failures.push(`${t.id}: evidence without file:line (${JSON.stringify(t.evidence ?? '')})`); continue; }
    const file = join(root, m[1]);
    if (!existsSync(file)) { failures.push(`${t.id}: file not found ${m[1]}`); continue; }
    if (!cache.has(file)) cache.set(file, readFileSync(file, 'utf8').split('\n'));
    const lines = cache.get(file);
    const n = Number(m[2]);
    if (n < 1 || n > lines.length) { failures.push(`${t.id}: line ${n} outside ${m[1]} (${lines.length} lines)`); continue; }
    const win = norm(lines.slice(Math.max(0, n - 4), n + 3).join(' '));
    const label = norm(t.trigger?.label);
    const route = norm(String(screens.get(t.to)?.route ?? '').split('?')[0]);
    if ((label && win.includes(label)) || (route && win.includes(route)) || allSignals.some((s) => win.includes(s))) checked++;
    else failures.push(`${t.id}: ${t.evidence} contains neither the label ${JSON.stringify(t.trigger?.label ?? '')} nor a navigation trigger`);
  }
  for (const j of map.journeys ?? []) {
    const sw = new Set(j.persona_switches ?? []);
    let prev = null;
    (j.steps ?? []).forEach((step, i) => {
      if (!transitions.has(step)) { failures.push(`${j.id}: step ${i} ${JSON.stringify(step)} is not a transition`); prev = null; return; }
      if (prev && transitions.get(prev).to !== transitions.get(step).from && !sw.has(i)) failures.push(`${j.id}: step ${i} breaks the chain (${transitions.get(prev).to} → ${transitions.get(step).from})`);
      prev = step;
    });
  }
  return { ok: failures.length === 0, failures, checked, warnings, counts: { screens: screens.size, transitions: transitions.size, journeys: (map.journeys ?? []).length } };
}

function main() {
  const argv = process.argv.slice(2);
  const file = argv.find((x) => !x.startsWith('--') && argv[argv.indexOf(x) - 1] !== '--root' && argv[argv.indexOf(x) - 1] !== '--signal');
  if (!file) { console.error('Usage: node tools/capture/validate-flow.mjs <flows.json> [--root <project>] [--signal "<text>"...] [--json]'); process.exit(2); }
  const root = argv.includes('--root') ? resolve(argv[argv.indexOf('--root') + 1]) : process.cwd();
  const signals = argv.flatMap((x, i) => (x === '--signal' ? [argv[i + 1]] : []));
  const r = validateFlow(JSON.parse(readFileSync(resolve(file), 'utf8')), { root, signals });
  if (argv.includes('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(r.ok ? 0 : 1); }
  for (const w of r.warnings) console.error(`WARNING ${w}`);
  console.log(`screens ${r.counts.screens} · transitions ${r.counts.transitions} · journeys ${r.counts.journeys} · evidence checked ${r.checked}/${r.counts.transitions}`);
  for (const f of r.failures) console.log(`FAIL ${f}`);
  console.log(`RESULT: ${r.ok ? 'APPROVED' : `REJECTED (${r.failures.length})`}`);
  process.exit(r.ok ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
