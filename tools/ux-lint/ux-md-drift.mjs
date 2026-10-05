#!/usr/bin/env node
// UX.md × product drift: compares the UX.md with the flow map, the captures (and the geometry, when present) and
// flags what the file no longer describes. It is the UX.md counterpart of the DESIGN.md front matter × code check.
// No dependencies. Contract: knowledge/foundations/ux-md.md ("UX.md × product drift").
//
//   U1 screen of the map or the captures with no archetype in the UX.md and outside every declared deviation (sev 2)
//   U2 `archetypes` entry that names no screen of the map (a screen that no longer exists) (sev 2)
//   U3 front matter policy that most screens of an archetype no longer follow (sev 2): reuses the detectors:
//      T1 (primaries per region), T2 (dialog order), T5 (destructive label) and, with geometry, L1 (primary
//      position). Needs ≥ 2 screens of the archetype; screens covered by a deviation of the rule do not count.
//   U4 state declared in `states` that no capture has (`<nn>-<screen>.<state>.html`) (sev 2)
//   U5 `updated` older than the screens' last change (git of the map and the captures; without git, file date) (sev 1)
//   U6 expired deviation (`until` in the past) or one citing a screen missing from the map (sev 1)
//
// Usage: node tools/ux-lint/ux-md-drift.mjs <UX.md> [--map flows.json] [--screens <captures>] [--geometry <folder>]
//        [--module <m> --root <project> [--config <file>]] [--json] [--fail-at 2]
//      With --module and --root, the defaults are the audit's (lib/project-paths.mjs): <root>/.dsx/maps/flows-<m>.json,
//      <root>/.dsx/captures/<m> and <root>/.dsx/captures/<m>/geometry (legacy .stitch/<m>/… read with a warning).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { parseYaml, splitFrontMatter } from '../lib/yaml-lite.mjs';
import { configFrom } from './lib/config.mjs';
import { parseDeviations, coversScreen, expired, screenKey } from './lib/deviations.mjs';
import { loadInventory, archetypeOf, entryMatches, lastScreensChange } from './lib/ux-inventory.mjs';
import { analyzeScreen } from './screen.mjs';
import { analyzeGeometry, archetypeCatalog } from './layout.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';

export const SEVERITY = { U1: 2, U2: 2, U3: 2, U4: 2, U5: 1, U6: 1 };
const PRINCIPAL = new Set(['success', 'open']);
const TRANSIENT = new Set(['running', 'submitting', 'saving']);
/** Detector rule → the front matter policy it checks. */
const POLICY_RULES = {
  T1: { policy: 'actions.primary-per-region', what: 'more primaries per region than the limit' },
  T2: { policy: 'actions.dialog-order', what: 'the other button order in the dialog' },
  T5: { policy: 'actions.destructive-specific-label', what: 'a generic label on the destructive action' },
  L1: { policy: 'actions.primary-position', what: 'the primary outside the declared position' },
};

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const day = (now) => (now instanceof Date ? now : new Date(now)).toISOString().slice(0, 10);

/** Reads the UX.md front matter (text), already with the new names. */
function frontMatterOf(md) {
  const { frontMatter } = splitFrontMatter(String(md).replace(/\r\n/g, '\n'));
  if (!frontMatter) throw new Error('UX.md without front matter (--- ... ---)');
  return configFrom(parseYaml(frontMatter));
}

/**
 * Analyzes the drift. `ux` is the UX.md text; `map`, `screens` and `geometry` are paths (optional).
 * Returns { findings: [{ rule, severity, screen, policy?, message, evidence }], summary, inventory }.
 */
export function analyzeDrift(ux, { map = null, screens = null, geometry = null, root = null, now = new Date(), lastChange, archetypesDir } = {}) {
  const cfg = frontMatterOf(ux);
  const { deviations } = parseDeviations(cfg.deviations);
  const inv = loadInventory({ map, screens });
  const findings = [];
  const add = (rule, screen, message, evidence, extra = {}) => findings.push({ rule, severity: SEVERITY[rule], screen, ...extra, message, evidence });
  const archetypes = cfg.archetypes ?? {};
  const inDeviation = (id) => deviations.some((d) => !expired(d, now) && coversScreen(d, id));

  // U1: screen without an archetype or deviation.
  let covered = 0;
  const uncovered = [];
  for (const s of inv.screens.values()) {
    if (archetypeOf(s, archetypes) || inDeviation(s.id)) { covered++; continue; }
    uncovered.push(s);
    const where = s.in_map ? `map${s.captures.length ? ' and captures' : ''}` : 'captures';
    add('U1', s.id, `screen "${s.id}"${s.name ? ` (${s.name})` : ''} is in the ${where} and has no archetype in the UX.md nor a declared deviation`, s.captures[0] ?? (inv.map ? basename(inv.map) : null));
  }

  // U2: archetypes entry that names no screen of the map.
  const stale = [];
  if (inv.has_map) {
    const mapScreens = [...inv.screens.values()].filter((s) => s.in_map);
    for (const [arch, entries] of Object.entries(archetypes)) for (const e of [].concat(entries ?? [])) {
      if (mapScreens.some((s) => entryMatches(e, s))) continue;
      stale.push(`${arch}: ${e}`);
      add('U2', String(e), `archetypes.${arch} cites "${e}", which is not a screen of the map (removed or renamed?)`, basename(inv.map));
    }
  }

  // U3: policy that most screens of the archetype do not follow.
  const groups = new Map(); // archetype → rule → { eligible: [], violating: [] }
  const tally = (arch, rule, id, violates) => {
    if (!arch) return;
    if (deviations.some((d) => !expired(d, now) && d.rules.includes(rule) && coversScreen(d, id))) return;
    const g = groups.get(arch) ?? new Map();
    groups.set(arch, g);
    const r = g.get(rule) ?? { eligible: [], violating: [] };
    g.set(rule, r);
    r.eligible.push(id);
    if (violates) r.violating.push(id);
  };
  if (inv.has_captures) {
    for (const s of inv.screens.values()) {
      const main = s.captures.find((f) => !/^\d+-[a-z0-9-]+\.[a-z0-9-]+\.html$/.test(f));
      if (!main) continue;
      const arch = archetypeOf(s, archetypes);
      let res;
      try { res = analyzeScreen(readFileSync(join(inv.screens_dir, main), 'utf8'), cfg, main); } catch { continue; }
      const rules = new Set(res.findings.map((f) => f.rule));
      tally(arch, 'T1', s.id, rules.has('T1'));
      if (res.dialog_open) tally(arch, 'T2', s.id, rules.has('T2'));
      if (arch === 'confirmation-dialog') tally(arch, 'T5', s.id, rules.has('T5'));
    }
  }
  if (geometry && isDir(geometry)) {
    const catalog = archetypeCatalog(archetypesDir);
    for (const f of readdirSync(geometry).filter((x) => x.endsWith('.geometry.json') && !/^\d+-[a-z0-9-]+\.[a-z0-9-]+\.geometry\.json$/.test(x))) {
      let geom;
      try { geom = JSON.parse(readFileSync(join(geometry, f), 'utf8')); } catch { continue; }
      const id = screenKey(f);
      const s = inv.screens.get(id) ?? { id, name: null, route: geom.title ?? null };
      const arch = archetypeOf(s, archetypes);
      if (!(geom.elements ?? []).some((e) => e.is_primary)) continue;
      let res;
      try { res = analyzeGeometry(geom, cfg, catalog); } catch { continue; }
      tally(arch, 'L1', id, res.findings.some((x) => x.rule === 'L1'));
    }
  }
  for (const [arch, g] of groups) for (const [rule, r] of g) {
    if (r.eligible.length < 2 || r.violating.length * 2 <= r.eligible.length) continue;
    const p = POLICY_RULES[rule];
    const value = p.policy.split('.').reduce((o, k) => o?.[k], cfg);
    add('U3', null, `${p.policy}: ${value}; ${r.violating.length} of ${r.eligible.length} ${arch} screens already show ${p.what} (${rule}): ${r.violating.slice(0, 6).join(', ')}${r.violating.length > 6 ? ', …' : ''}. Change the policy or fix the screens`, `${rule} × ${arch}`, { policy: p.policy, archetype: arch });
  }

  // U4: declared state with no capture.
  const missingStates = [];
  if (inv.has_captures) {
    const captured = new Set([...inv.screens.values()].flatMap((s) => [...s.states]));
    for (const st of [].concat(cfg.states ?? []).map(String)) {
      if (PRINCIPAL.has(st) || TRANSIENT.has(st) || captured.has(st)) continue;
      missingStates.push(st);
      add('U4', null, `states declares "${st}", but no capture has that state (<nn>-<screen>.${st}.html): capture the state or take it off the list`, inv.screens_dir ? basename(inv.screens_dir) : null);
    }
  }

  // U5: updated older than the screens.
  const change = lastChange !== undefined ? lastChange : lastScreensChange({ map: inv.map, screens: inv.screens_dir, root });
  const updated = cfg.updated ? String(cfg.updated) : null;
  if (change && (!updated || updated < change.date)) {
    add('U5', null, `updated ${updated ?? '(missing)'} is earlier than the screens' last change (${change.date}, ${change.source === 'git' ? 'last commit of the map/captures' : 'date of the newest file; no git'}): review the UX.md and bump version/updated`, change.paths.map((p) => basename(p)).join(', '));
  }

  // U6: expired deviation or one citing a missing screen.
  for (const d of deviations) {
    if (expired(d, now)) add('U6', null, `deviation ${d.id} expired on ${d.until}: renew it (new until with a reason) or fix the screens; the findings it covered are open again`, `deviations.${d.id}`);
    if (inv.has_map) {
      const ghost = d.screens.filter((x) => x !== '*' && !inv.screens.has(screenKey(x)));
      if (ghost.length) add('U6', null, `deviation ${d.id} cites screen(s) missing from the map: ${ghost.join(', ')}`, `deviations.${d.id}`);
    }
  }

  const byRule = {};
  for (const f of findings) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
  return {
    findings,
    summary: {
      screens: inv.screens.size, covered, uncovered: uncovered.map((s) => s.id), stale_entries: stale,
      missing_states: missingStates, updated, last_change: change ?? null,
      has_map: inv.has_map, has_captures: inv.has_captures, has_geometry: !!(geometry && isDir(geometry)),
      deviations: deviations.length, findings: findings.length, by_rule: byRule, checked_at: day(now),
    },
  };
}

/** One line per rule, for the audit's prerequisite warning ("UX.md out of date: …"). */
export function driftHeadline(result) {
  const s = result.summary;
  const parts = [];
  if (s.uncovered.length) parts.push(`${s.uncovered.length} screen(s) without an archetype (${s.uncovered.slice(0, 4).join(', ')}${s.uncovered.length > 4 ? ', …' : ''})`);
  if (s.stale_entries.length) parts.push(`${s.stale_entries.length} archetype(s) assigned to a screen that does not exist`);
  const u3 = result.findings.filter((f) => f.rule === 'U3');
  if (u3.length) parts.push(`${u3.length} polic(ies) most screens do not follow (${[...new Set(u3.map((f) => f.policy))].join(', ')})`);
  if (s.missing_states.length) parts.push(`declared state(s) with no capture: ${s.missing_states.join(', ')}`);
  const u5 = result.findings.find((f) => f.rule === 'U5');
  if (u5) parts.push(`updated ${s.updated ?? '(missing)'} earlier than the screens (${s.last_change.date})`);
  const u6 = result.findings.filter((f) => f.rule === 'U6');
  if (u6.length) parts.push(`${u6.length} deviation(s) expired or citing a screen missing from the map`);
  return parts.join('; ');
}

const USAGE = 'Usage: node tools/ux-lint/ux-md-drift.mjs <UX.md> [--map flows.json] [--screens <captures>] [--geometry <folder>] [--module <m> --root <project> [--config <file>]] [--json] [--fail-at 2]';

function main() {
  const a = parseCli('ux-lint/ux-md-drift.mjs');
  const file = a._[0];
  if (!file || !existsSync(file)) { console.error(USAGE); process.exit(2); }
  const root = typeof a.root === 'string' ? resolve(a.root) : null;
  const mod = typeof a.module === 'string' ? a.module : null;
  const pp = root && mod ? resolveProjectPaths({ root, module: mod, config: typeof a.config === 'string' ? a.config : null, flags: { ux: resolve(file) } }) : null;
  for (const w of pp?.warnings ?? []) console.error(`WARNING ${w}`);
  const pick = (flag, def) => (typeof a[flag] === 'string' ? resolve(a[flag]) : pp ? def : null);
  const map = pick('map', pp?.map);
  const screens = pick('screens', pp?.captures);
  const geometry = pick('geometry', pp?.geometry);
  const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
  const r = analyzeDrift(readFileSync(file, 'utf8'), { map, screens, geometry, root, now });
  const failAt = Number(a['fail-at'] ?? 2);
  if (a.json) console.log(JSON.stringify({ file, ...r }, null, 2));
  else {
    const s = r.summary;
    console.log(`UX.md × product drift: ${file}`);
    console.log(`  inputs: map ${s.has_map ? '✓' : '—'} · captures ${s.has_captures ? '✓' : '—'} · geometry ${s.has_geometry ? '✓' : '—'} · ${s.deviations} declared deviation(s)`);
    for (const f of r.findings) console.log(`  ${f.rule} sev ${f.severity}${f.screen ? ` | ${f.screen}` : ''} | ${f.message}${f.evidence ? `\n      ${f.evidence}` : ''}`);
    console.log(`\n  ${s.screens} screens in the inventory, ${s.covered} with an archetype or deviation; ${s.findings} drift finding(s) (${Object.entries(s.by_rule).map(([k, v]) => `${k}=${v}`).join(' ') || 'none'})`);
    console.log(r.findings.length ? `  UX.md out of date: ${driftHeadline(r)}` : '  UX.md up to date with the map and the captures.');
  }
  process.exit(r.findings.some((f) => f.severity >= failAt) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
