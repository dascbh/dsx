#!/usr/bin/env node
// ux-lint, layout and hierarchy: applies rules L1–L9 (knowledge/foundations/ux-md.md and visual-hierarchy.md)
// to the measured geometry of the captures (tools/ux-lint/measure.mjs → <name>.geometry.json). No dependencies and
// no browser: it only reads the geometry files, the UX.md and the archetype cards.
//
// Usage: node tools/ux-lint/layout.mjs <geometry-folder|files.geometry.json...> [--ux UX.md] [--archetypes <folder>] [--json] [--fail-at 3]
// A screen is linked to its archetype by the id in the capture name (`<nn>-<screen-id>[.<state>]`), compared with the
// ids and routes listed under `archetypes` in the UX.md (the route is compared with the capture's <title>). The card
// `archetypes/<id>.md` gives the expected regions (L9) and `primary-action.position` (L1); without an archetype,
// `actions.primary-position` from the UX.md applies. L9 runs only on the main-state capture (no state suffix).
// JSON (--json): { summary, screens: [{ file, screen, archetype, dialog_open, findings: [{ rule, severity, region,
// message, anchor, evidence, elements, measure }] }] } (family `layout` in the registry, findings.mjs --layout).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { analyzeLayout, screenIdOf, LAYOUT_DEFAULTS } from './lib/geometry.mjs';
import { loadArchetypes } from '../lint-archetypes.mjs';

const DEFAULT_ARCHETYPES = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'archetypes');

/** Archetype cards → { id: { id, regions, primary_action } }. */
export function archetypeCatalog(dir = DEFAULT_ARCHETYPES) {
  const out = {};
  for (const c of loadArchetypes(dir)) {
    if (!c.fm?.id) continue;
    out[c.fm.id] = { id: c.fm.id, regions: c.fm.regions ?? [], primary_action: c.fm['primary-action'] ?? null };
  }
  return out;
}

const normRoute = (s) => String(s ?? '').trim().replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();

/**
 * Archetype of a screen from the UX.md `archetypes` map ({ archetype: [ids or routes] }). Compares the screen id
 * (capture name without number and state) and the capture title (route). Returns the archetype id or null.
 */
export function resolveArchetype(screenName, title, archetypesMap = {}) {
  const sid = screenIdOf(screenName);
  const route = normRoute(title);
  for (const [arch, entries] of Object.entries(archetypesMap || {})) {
    for (const e of [].concat(entries ?? [])) {
      const v = String(e).trim();
      if (v === sid) return arch;
      if (v.startsWith('/') && route && normRoute(v) === route) return arch;
    }
  }
  return null;
}

/** Capture state from its suffix (`02-acervo.empty` → `empty`); main = null. */
export const stateOf = (screenName) => String(screenName).replace(/\.geometry\.json$|\.html?$/, '').split('.').slice(1).join('.') || null;

/** Rule thresholds: DSX defaults + the `layout` key of the UX.md front matter. */
export function limitsFrom(cfg) {
  const over = cfg?.layout && typeof cfg.layout === 'object' ? cfg.layout : {};
  const out = { ...LAYOUT_DEFAULTS };
  for (const [k, v] of Object.entries(over)) if (k in out && Number.isFinite(Number(v))) out[k] = Number(v);
  return out;
}

/** Analyzes one geometry with the project context. */
export function analyzeGeometry(geom, cfg = configFrom({}), catalog = {}) {
  const archId = resolveArchetype(geom.screen ?? geom.file ?? '', geom.title, cfg.archetypes);
  const card = archId ? catalog[archId] ?? { id: archId, regions: [], primary_action: null } : null;
  const principal = !stateOf(geom.screen ?? geom.file ?? '');
  const archetype = card ? { ...card, regions: principal ? card.regions : [] } : null;
  return analyzeLayout(geom, { archetype, primary_position: cfg.actions?.['primary-position'] ?? null, limits: limitsFrom(cfg) });
}

export function listGeometry(inputs) {
  const out = [];
  for (const e of inputs) {
    if (statSync(e).isDirectory()) {
      for (const f of readdirSync(e).sort()) if (f.endsWith('.geometry.json')) out.push(join(e, f));
    } else out.push(e);
  }
  return out;
}

export function summarize(results) {
  const byRule = {};
  const bySeverity = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of results) for (const a of r.findings) {
    byRule[a.rule] = (byRule[a.rule] || 0) + 1;
    bySeverity[a.severity]++;
  }
  return {
    screens: results.length,
    screens_with_findings: results.filter((r) => r.findings.length).length,
    screens_without_archetype: results.filter((r) => !r.archetype).length,
    findings: results.reduce((s, r) => s + r.findings.length, 0),
    by_rule: byRule,
    by_severity: bySeverity,
  };
}

function main() {
  const args = parseCli('ux-lint/layout.mjs');
  if (!args._.length) {
    console.error('Usage: node tools/ux-lint/layout.mjs <geometry-folder|files.geometry.json...> [--ux UX.md] [--archetypes <folder>] [--json] [--fail-at 3]');
    process.exit(2);
  }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const catalog = archetypeCatalog(typeof args.archetypes === 'string' ? args.archetypes : DEFAULT_ARCHETYPES);
  const files = listGeometry(args._);
  if (!files.length) {
    console.error('No .geometry.json file. Generate the geometry first: node tools/ux-lint/measure.mjs <captures> --out <folder>');
    process.exit(2);
  }
  const results = files.map((f) => analyzeGeometry(JSON.parse(readFileSync(f, 'utf8')), cfg, catalog));
  const summary = summarize(results);
  const threshold = Number(args['fail-at'] ?? 3);
  if (args.json) console.log(JSON.stringify({ summary, screens: results }, null, 2));
  else {
    for (const r of results) {
      const name = basename(r.file);
      const tag = `${r.archetype ? ` [${r.archetype}]` : ' [no archetype]'}${r.dialog_open ? ' (dialog open)' : ''}`;
      if (!r.findings.length) { console.log(`✓ ${name}${tag}`); continue; }
      console.log(`✗ ${name}${tag}`);
      for (const a of [...r.findings].sort((x, y) => y.severity - x.severity || x.rule.localeCompare(y.rule))) {
        console.log(`   ${a.rule} sev ${a.severity} | ${a.region} | ${a.message}${a.evidence ? `\n      ${a.evidence.split(', ')[0]}` : ''}`);
      }
    }
    const rules = Object.entries(summary.by_rule).sort(([x], [y]) => x.localeCompare(y, 'en', { numeric: true })).map(([k, v]) => `${k}=${v}`).join(' ') || 'none';
    console.log(`\nSummary: ${summary.screens} screens (${summary.screens_without_archetype} without an archetype), ${summary.screens_with_findings} with findings, ${summary.findings} findings (${rules}); severity ${Object.entries(summary.by_severity).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }
  process.exit(results.some((r) => r.findings.some((a) => a.severity >= threshold)) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
