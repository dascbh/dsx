#!/usr/bin/env node
// Forward artifacts → shapes the DSX tools read. Read-only on the Forward project. No dependencies.
//
//   node tools/forward/import.mjs findings --from <project> [--demand <id>] [--module <name>] [--out <findings.json>]
//      reviews/*/findings*.toml → a DSX findings registry ({ module, updated, runs, items }); the items carry
//      origin "forward" and the Forward fields under `forward`. `findings.mjs status|page` read it like any registry.
//   node tools/forward/import.mjs alternatives --from <project> [--demand <id>] [--manifest <variations.json>] [--out <file>]
//      specs/*/design/alternatives.md → JSON (framings, alternatives with lens/hypothesis/traded, choice, gate check);
//      with --manifest, a copy of that manifest with `lens` per variant and `how_might_we` filled from the file.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { parseToml } from './lib/toml-lite.mjs';
import { reviewToItems } from './lib/findings-toml.mjs';
import { parseAlternatives, checkAlternatives, matchVariant } from './lib/alternatives.mjs';
import { loadDivergenceRules } from './lib/snapshot.mjs';

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const SIZE_RE = /\*\*(XS|S|M|L)\*\*/;

/** reviews/<id>/findings*.toml files of a project (optionally one demand). */
export function reviewFiles(project, demand = null) {
  const base = join(project, 'reviews');
  if (!isDir(base)) return [];
  const dirs = demand ? [demand] : readdirSync(base).filter((d) => isDir(join(base, d))).sort();
  return dirs.flatMap((d) => (isDir(join(base, d)) ? readdirSync(join(base, d)).filter((f) => /^findings.*\.toml$/.test(f)).sort().map((f) => join(base, d, f)) : []));
}

export function importFindings(project, { demand = null, module = null, now = new Date() } = {}) {
  const items = [], errors = [];
  for (const f of reviewFiles(project, demand)) {
    const rel = relative(project, f);
    try { items.push(...reviewToItems(parseToml(readFileSync(f, 'utf8')), { file: rel })); } catch (e) { errors.push(`${rel}: ${e.message}`); }
  }
  return {
    registry: { module: module ?? (demand ? `forward-${demand}` : 'forward'), updated: now.toISOString().slice(0, 10), runs: [{ at: now.toISOString().replace(/\.\d{3}Z$/, 'Z'), sources: ['forward'] }], items, deviations: [] },
    errors,
  };
}

/** Demand size from the Triage line of specs/<id>/spec.md (the rule design.py uses). */
export function demandSize(specMd) {
  if (!existsSync(specMd)) return null;
  for (const line of readFileSync(specMd, 'utf8').split('\n')) if (/triage/i.test(line)) { const m = line.match(SIZE_RE); return m ? m[1].toLowerCase() : null; }
  return null;
}

export function importAlternatives(project, { demand = null, rules = loadDivergenceRules() } = {}) {
  const base = join(project, 'specs');
  const dirs = !isDir(base) ? [] : (demand ? [demand] : readdirSync(base).filter((d) => isDir(join(base, d))).sort());
  const out = [];
  for (const d of dirs) {
    const f = join(base, d, 'design', 'alternatives.md');
    if (!existsSync(f)) continue;
    const text = readFileSync(f, 'utf8');
    const size = demandSize(join(base, d, 'spec.md'));
    const required = rules.required[size ?? ''] ?? 0;
    out.push({ demand: d, file: relative(project, f), size, required, ...parseAlternatives(text), gate: required ? checkAlternatives(text, required, { lenses: rules.lenses }) : [] });
  }
  return out;
}

/** Copy of a variations manifest with `lens` and `how_might_we` filled from a parsed alternatives.md. */
export function applyToManifest(manifest, parsed) {
  const m = structuredClone(manifest);
  const unmatched = [];
  for (const alt of parsed.alternatives) {
    const v = matchVariant(m, alt);
    if (!v) { unmatched.push(alt.name); continue; }
    if (alt.lens) v.lens = alt.lens;
    if (alt.hypothesis && !v.hypothesis) v.hypothesis = alt.hypothesis;
  }
  if (parsed.how_might_we.length) m.how_might_we = parsed.how_might_we.map((h) => h.replace(/^HMW\s+/i, ''));
  return { manifest: m, unmatched };
}

function main() {
  const [cmd] = process.argv.slice(2);
  const args = parseArgs(process.argv.slice(3));
  if (!['findings', 'alternatives'].includes(cmd) || typeof args.from !== 'string') {
    console.error('Usage: node tools/forward/import.mjs findings|alternatives --from <forward-project> [--demand <id>] [--out <file>] [--manifest <variations.json>]');
    process.exit(2);
  }
  const project = resolve(args.from);
  const demand = typeof args.demand === 'string' ? args.demand : null;
  let data;
  if (cmd === 'findings') {
    const r = importFindings(project, { demand, module: typeof args.module === 'string' ? args.module : null });
    for (const e of r.errors) console.error(`✗ ${e}`);
    console.error(`${r.registry.items.length} finding(s) read`);
    data = r.registry;
  } else {
    const alts = importAlternatives(project, { demand });
    for (const a of alts) for (const b of a.gate) console.error(`✗ ${a.demand}: ${b}`);
    data = alts;
    if (typeof args.manifest === 'string') {
      if (alts.length !== 1) { console.error('--manifest needs exactly one alternatives.md (use --demand)'); process.exit(2); }
      const r = applyToManifest(JSON.parse(readFileSync(resolve(args.manifest), 'utf8')), alts[0]);
      for (const u of r.unmatched) console.error(`! no variant matches alternative "${u}"`);
      data = r.manifest;
    }
  }
  const text = `${JSON.stringify(data, null, 2)}\n`;
  if (typeof args.out === 'string') { mkdirSync(dirname(resolve(args.out)), { recursive: true }); writeFileSync(resolve(args.out), text); console.error(`✓ ${resolve(args.out)}`); }
  else process.stdout.write(text);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
