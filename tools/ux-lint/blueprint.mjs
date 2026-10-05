#!/usr/bin/env node
// UX blueprint check (templates/ux-blueprint.md). The blueprint of one objective lives in the Forward design family of
// the front demand — specs/<demand-id>/design/{intended-model,flow,ia}.md — and is checked against the captures and
// the flow map, in both directions (DOM-5: no orphans, both ways: requirement without screen, screen without
// requirement, criterion without verification, state without representation; DOM-4 for navigation). No dependencies.
//
//   node tools/ux-lint/blueprint.mjs check --design specs/<demand-id>/design [--spec specs/<demand-id>/spec.md]
//        [--root <project>] [--module <m>] [--screens <captures>] [--map <flows.json>] [--journey <id>]
//        [--size XS|S|M|L] [--no-captures] [--owner-role <role>] [--json]
//
// Before UI: run with --no-captures (sections, requirements and scenarios only). After UI: captures and map default to
// the project paths (lib/project-paths.mjs) for --module. Exit 1 when an error-level probe fires.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { loadInventory } from './lib/ux-inventory.mjs';
import { normalizeFlowMap } from './lib/legacy.mjs';
import { resolveProjectPaths } from './lib/project-paths.mjs';
import { buildProvenance } from '../lib/provenance.mjs';

export const FILES = { model: 'intended-model.md', flow: 'flow.md', ia: 'ia.md' };

/** Blueprint sections (Forward "UX blueprint ... describes"), with the heading words that satisfy each. */
// Heading words in English plus Portuguese aliases: projects write their artifacts in their own language.
export const SECTIONS = [
  { id: 'actors', name: 'Actors and jobs', match: /actor|persona|\bjobs?\b|atores|\bator\b|pap[eé]is/i, min: 'S' },
  { id: 'actions', name: 'Primary actions and consequences', match: /primary action|consequence|task sequence|consequ[eê]ncia|a[cç][oõã]es? principa/i, min: 'S' },
  { id: 'scenarios', name: 'Acceptance scenarios', match: /scenario|cen[aá]rio/i, min: 'S' },
  { id: 'structure', name: 'Screens (navigation/object structure)', match: /^screens?\b|navigation|object|^telas?\b|navega[cç][aã]o|objeto/i, min: 'M' },
  { id: 'flow', name: 'Flow (task sequence)', match: /^flow\b|task sequence|^fluxo/i, min: 'M' },
  { id: 'decisions', name: 'Decisions', match: /decision|decis[aã]o|decis[oõ]es/i, min: 'M' },
  { id: 'feedback', name: 'Feedback', match: /feedback|retorno/i, min: 'M' },
  { id: 'permissions', name: 'Permissions', match: /permission|permiss/i, min: 'M' },
  { id: 'errors', name: 'Errors', match: /error|\berros?\b/i, min: 'M' },
  { id: 'empty-loading', name: 'Empty and loading', match: /empty|loading|vazio|carregando/i, min: 'M' },
  { id: 'abandon-resume', name: 'Abandon and resume', match: /abandon|resume|retom/i, min: 'M' },
  { id: 'accessibility', name: 'Accessibility', match: /accessib|a11y|keyboard|focus|acessib|teclado|foco/i, min: 'M' },
];
const SIZE_RANK = { XS: 0, S: 1, M: 2, L: 3 };

/** Probes of this tool: id → { severity, principle, what }. Error when severity ≥ 3. */
export const PROBES = {
  BP0: { severity: 3, principle: 'DOM-5', what: 'blueprint section missing for the size' },
  BP1: { severity: 3, principle: 'DOM-5', what: 'blueprint screen with no capture (requirement without screen)' },
  BP2: { severity: 2, principle: 'DOM-4', what: 'blueprint screen not in the flow map' },
  BP3: { severity: 3, principle: 'DOM-5', what: 'captured or mapped screen in scope that the blueprint does not declare (screen without requirement)' },
  BP4: { severity: 3, principle: 'DOM-5', what: 'blueprint screen with no requirement' },
  BP5: { severity: 3, principle: 'DOM-5', what: 'requirement of the spec with no screen in the blueprint' },
  BP6: { severity: 3, principle: 'DOM-5', what: 'declared state with no capture (state without representation)' },
  BP7: { severity: 1, principle: 'DOM-5', what: 'captured state the blueprint does not declare' },
  BP8: { severity: 2, principle: 'DOM-4', what: 'blueprint flow edge between screens with no transition in the flow map' },
  BP9: { severity: 2, principle: 'DOM-5', what: 'flow-map transition in scope that the blueprint flow does not draw' },
  BP10: { severity: 3, principle: 'DOM-5', what: 'acceptance scenario with no verification (criterion without verification)' },
  BP11: { severity: 2, principle: 'DOM-5', what: 'requirement with no acceptance scenario' },
  BP12: { severity: 2, principle: 'DOM-5', what: 'acceptance scenario naming a screen the blueprint does not declare' },
};

// ---------- parsing ----------

const R_ID = /\bR\d+\b/g;
const splitList = (s) => String(s ?? '').split(/[,;]+/).map((x) => x.trim()).filter(Boolean);
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

/** Headings (any level) of a markdown text. */
export const headingsOf = (text) => [...String(text).matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((m) => m[1].trim());

/** Markdown table under the heading matching `re` → [{ <lowercased header>: cell }]. */
export function tableUnder(text, re) {
  const lines = String(text).split('\n');
  let i = lines.findIndex((l) => /^#{1,6}\s/.test(l) && re.test(l.replace(/^#+\s*/, '')));
  if (i < 0) return [];
  const rows = [];
  let header = null;
  for (i += 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^#{1,6}\s/.test(l)) break;
    if (!l.startsWith('|')) { if (header && l) break; continue; }
    const cells = l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (!header) { header = cells.map((c) => c.toLowerCase()); continue; }
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    rows.push(Object.fromEntries(header.map((h, k) => [h, cells[k] ?? ''])));
  }
  return rows;
}

/** Mermaid edges of the first ```mermaid block: [{ from, to, label }] and node labels. */
export function mermaidEdges(text) {
  const block = String(text).match(/```mermaid\s*\n([\s\S]*?)```/);
  if (!block) return { edges: [], nodes: new Map() };
  const nodes = new Map();
  const edges = [];
  const NODE = /\b([A-Za-z0-9_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)(\(\(|\(\[|\[\[|\[|\{|\()([^\]\)\}]*)[\]\)\}]+/g;
  for (const raw of block[1].split('\n')) {
    const line = raw.trim();
    if (!line || /^(flowchart|graph|subgraph|end\b|classDef|class |style |%%)/.test(line)) continue;
    for (const m of line.matchAll(NODE)) nodes.set(m[1], { label: m[3].trim(), shape: m[2] });
    const plain = line.replace(NODE, '$1');
    const EDGE = /([A-Za-z0-9_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?)\s*(?:--\s+([^>|]+?)\s+--+>|(?:--+>|==+>|-\.+->)\s*(?:\|([^|]*)\|)?)\s*([A-Za-z0-9_-]+)/g;
    let m;
    while ((m = EDGE.exec(plain))) {
      edges.push({ from: m[1], to: m[4], label: (m[2] ?? m[3] ?? '').trim() });
      EDGE.lastIndex = m.index + m[0].length - m[4].length; // chains: A --> B --> C
    }
  }
  return { edges, nodes };
}

/** Reads the blueprint files of a design directory. */
export function loadBlueprint(designDir) {
  const out = { dir: designDir, files: {}, text: '' };
  for (const [k, f] of Object.entries(FILES)) {
    const p = join(designDir, f);
    if (isFile(p)) { out.files[k] = p; out.text += `\n${readFileSync(p, 'utf8')}`; }
  }
  const col = (r, ...keys) => { for (const k of keys) if (r[k] !== undefined) return r[k]; return undefined; };
  const screens = tableUnder(out.text, /^screens?\b|^telas?\b/i).map((r) => ({
    id: String(col(r, 'id') ?? '').replace(/`/g, ''), name: col(r, 'name', 'nome') ?? '', route: col(r, 'route', 'rota') ?? '',
    requirements: [...String(col(r, 'requirements', 'requirement', 'r#', 'requisitos', 'requisito') ?? '').matchAll(R_ID)].map((m) => m[0]),
    states: splitList(col(r, 'states', 'estados') ?? 'success').map((s) => s.toLowerCase()),
  })).filter((s) => s.id);
  const scenarios = tableUnder(out.text, /acceptance scenario|cen[aá]rios? de aceite/i).map((r) => ({
    id: col(r, 'id') ?? '', requirements: [...String(col(r, 'requirement', 'requirements', 'requisito', 'requisitos') ?? '').matchAll(R_ID)].map((m) => m[0]),
    scenario: col(r, 'scenario', 'cenário', 'cenario') ?? '', screens: splitList(col(r, 'screens', 'screen', 'telas', 'tela') ?? '').map((x) => x.replace(/\..*$/, '')),
    verified: String(col(r, 'verified by', 'verification', 'verificado por', 'verificação') ?? '').trim(),
  })).filter((s) => s.id || s.scenario);
  const flowText = out.files.flow ? readFileSync(out.files.flow, 'utf8') : out.text;
  const { edges, nodes } = mermaidEdges(flowText);
  return { ...out, screens, scenarios, edges, nodes, headings: headingsOf(out.text) };
}

/** Requirement ids of a demand spec (R1, R2…), or [] without one. */
export function specRequirements(specPath) {
  if (!specPath || !isFile(specPath)) return [];
  return [...new Set([...readFileSync(specPath, 'utf8').matchAll(R_ID)].map((m) => m[0]))];
}

// ---------- check ----------

/**
 * Coverage check. `inv` is the screens inventory (lib/ux-inventory.mjs) or null before UI; `map` the normalized flow
 * map or null; `journey` restricts the map side to the screens and transitions of one journey.
 */
export function checkBlueprint(bp, { requirements = [], inv = null, map = null, journey = null, size = null } = {}) {
  const findings = [];
  const add = (rule, subject, message) => findings.push({ rule, severity: PROBES[rule].severity, principle: PROBES[rule].principle, subject, message });
  const sz = size ?? (bp.files.ia ? 'L' : bp.files.flow ? 'M' : 'S');
  for (const s of SECTIONS) {
    if (bp.headings.some((h) => s.match.test(h))) continue;
    if (SIZE_RANK[sz] >= SIZE_RANK[s.min]) add('BP0', s.id, `section "${s.name}" is missing (size ${sz})`);
  }
  const screens = bp.screens.length ? bp.screens
    : [...new Set(bp.scenarios.flatMap((x) => x.screens))].map((id) => ({ id, name: '', route: '', requirements: bp.scenarios.filter((x) => x.screens.includes(id)).flatMap((x) => x.requirements), states: ['success'] }));
  const declared = new Map(screens.map((s) => [s.id, s]));
  const matchInv = (s) => {
    if (!inv) return null;
    if (inv.screens.has(s.id)) return inv.screens.get(s.id);
    for (const e of inv.screens.values()) if ((s.route && e.route && s.route === e.route) || (s.name && e.name && s.name.toLowerCase() === e.name.toLowerCase())) return e;
    return null;
  };
  for (const s of screens) {
    if (!s.requirements.length) add('BP4', s.id, `screen "${s.id}" serves no requirement`);
    const e = matchInv(s);
    if (inv?.has_captures && !(e?.captures ?? []).length) add('BP1', s.id, `screen "${s.id}" has no capture`);
    if (inv?.has_map && !e?.in_map) add('BP2', s.id, `screen "${s.id}" is not in the flow map`);
    if (inv?.has_captures && e?.captures.length) {
      for (const st of s.states) if (!e.states.has(st === 'populated' ? 'success' : st)) add('BP6', `${s.id}.${st}`, `state "${st}" of "${s.id}" has no capture (<nn>-${e.id}.${st}.html)`);
      for (const st of e.states) if (!s.states.includes(st) && !(st === 'success' && s.states.includes('populated'))) add('BP7', `${s.id}.${st}`, `captured state "${st}" of "${s.id}" is not declared`);
    }
  }
  // scope of the other direction: the journey's screens, else every captured screen
  let scope = null, scopedTransitions = [];
  if (map) {
    const j = journey ? (map.journeys ?? []).find((x) => x.id === journey) : null;
    if (journey && !j) add('BP3', journey, `journey "${journey}" is not in the flow map`);
    const ts = (map.transitions ?? []);
    scopedTransitions = j ? ts.filter((t) => (j.steps ?? []).includes(t.id)) : ts.filter((t) => declared.has(t.from) && declared.has(t.to));
    if (j) scope = new Set(scopedTransitions.flatMap((t) => [t.from, t.to]));
  }
  if (!scope && inv?.has_captures) scope = new Set([...inv.screens.values()].filter((e) => e.captures.length).map((e) => e.id));
  const declaredIds = new Set([...declared.keys(), ...screens.map((s) => matchInv(s)?.id).filter(Boolean)]);
  for (const id of scope ?? []) if (!declaredIds.has(id)) add('BP3', id, `screen "${id}" is in scope (${journey ? `journey ${journey}` : 'captures'}) but the blueprint does not declare it`);
  for (const r of requirements) if (!screens.some((s) => s.requirements.includes(r))) add('BP5', r, `requirement ${r} has no screen in the blueprint`);
  const reqs = new Set([...requirements, ...screens.flatMap((s) => s.requirements)]);
  for (const r of reqs) if (!bp.scenarios.some((x) => x.requirements.includes(r))) add('BP11', r, `requirement ${r} has no acceptance scenario`);
  for (const sc of bp.scenarios) {
    if (!sc.verified || /^(—|-|tbd|todo|none)$/i.test(sc.verified)) add('BP10', sc.id || sc.scenario, `scenario ${sc.id || `"${sc.scenario}"`} has no verification (journey, eval, capture or human session)`);
    for (const s of sc.screens) if (bp.screens.length && !declared.has(s)) add('BP12', sc.id, `scenario ${sc.id} names screen "${s}", not declared in Screens`);
  }
  if (map && bp.edges.length) {
    const has = new Set((map.transitions ?? []).map((t) => `${t.from}>${t.to}`));
    const screenEdges = bp.edges.filter((e) => declared.has(e.from) && declared.has(e.to) && e.from !== e.to);
    for (const e of screenEdges) {
      const a = matchInv(declared.get(e.from))?.id ?? e.from, b = matchInv(declared.get(e.to))?.id ?? e.to;
      if (!has.has(`${a}>${b}`)) add('BP8', `${e.from}>${e.to}`, `flow edge ${e.from} → ${e.to}${e.label ? ` ("${e.label}")` : ''} has no transition in the flow map`);
    }
    const drawn = new Set(bp.edges.map((e) => `${e.from}>${e.to}`));
    const reach = (from, to) => drawn.has(`${from}>${to}`) || bp.edges.some((e) => e.from === from && !declared.has(e.to) && bp.edges.some((f) => f.from === e.to && f.to === to));
    for (const t of scopedTransitions) if (declared.has(t.from) && declared.has(t.to) && t.from !== t.to && !reach(t.from, t.to)) add('BP9', t.id ?? `${t.from}>${t.to}`, `map transition ${t.from} → ${t.to}${t.trigger?.label ? ` ("${t.trigger.label}")` : ''} is not drawn in the blueprint flow`);
  }
  const errors = findings.filter((f) => f.severity >= 3).length;
  return { size: sz, screens: screens.length, scenarios: bp.scenarios.length, requirements: [...reqs], findings, errors, warnings: findings.length - errors };
}

export function formatBlueprint(r) {
  const L = [`UX blueprint check · ${r.design} · size ${r.size} · ${r.screens} screen(s), ${r.scenarios} scenario(s), ${r.requirements.length} requirement(s)`];
  L.push(`  inputs: captures ${r.inputs.captures ?? '—'} · map ${r.inputs.map ?? '—'}${r.inputs.journey ? ` · journey ${r.inputs.journey}` : ''} · spec ${r.inputs.spec ?? '—'}`);
  const by = new Map();
  for (const f of r.findings) by.set(f.rule, [...(by.get(f.rule) ?? []), f]);
  for (const [rule, list] of [...by.entries()].sort((a, b) => b[1][0].severity - a[1][0].severity)) {
    L.push(`\n${rule} sev ${PROBES[rule].severity} (${PROBES[rule].principle}) · ${PROBES[rule].what} · ${list.length}`);
    for (const f of list.slice(0, 25)) L.push(`  - ${f.message}`);
    if (list.length > 25) L.push(`  … ${list.length - 25} more`);
  }
  L.push(`\n${r.errors} error(s) · ${r.warnings} warning(s)${r.errors ? '' : ' · no orphans at error level'}`);
  return L.join('\n');
}

function main() {
  const a = parseArgs();
  if (a._[0] !== 'check' || typeof a.design !== 'string') {
    console.error('Usage: node tools/ux-lint/blueprint.mjs check --design specs/<demand-id>/design [--spec <spec.md>] [--root <project>] [--module <m>] [--screens <dir>] [--map <flows.json>] [--journey <id>] [--size XS|S|M|L] [--no-captures] [--owner-role <role>] [--json]');
    process.exit(2);
  }
  const root = resolve(typeof a.root === 'string' ? a.root : process.cwd());
  const design = resolve(root, a.design);
  if (!existsSync(design)) { console.error(`no design directory at ${design}`); process.exit(2); }
  const spec = typeof a.spec === 'string' ? resolve(root, a.spec) : (isFile(join(dirname(design), 'spec.md')) ? join(dirname(design), 'spec.md') : null);
  const noCaptures = a['no-captures'] === true;
  const paths = typeof a.module === 'string' || a.screens || a.map
    ? resolveProjectPaths({ root, module: typeof a.module === 'string' ? a.module : null, flags: { screens: typeof a.screens === 'string' ? a.screens : null, map: typeof a.map === 'string' ? a.map : null } })
    : null;
  const screens = noCaptures ? null : paths?.captures ?? null;
  const mapPath = noCaptures ? null : (paths?.map && isFile(paths.map) ? paths.map : null);
  const bp = loadBlueprint(design);
  const inv = screens || mapPath ? loadInventory({ map: mapPath, screens }) : null;
  const map = mapPath ? normalizeFlowMap(JSON.parse(readFileSync(mapPath, 'utf8'))).map : null;
  const size = typeof a.size === 'string' ? a.size.toUpperCase() : null;
  const r = checkBlueprint(bp, { requirements: specRequirements(spec), inv, map, journey: typeof a.journey === 'string' ? a.journey : null, size });
  const out = {
    design: basename(dirname(design)) + '/' + basename(design), ...r,
    inputs: { captures: inv?.has_captures ? screens : null, map: mapPath, journey: typeof a.journey === 'string' ? a.journey : null, spec },
    provenance: buildProvenance({
      root, ownerRole: typeof a['owner-role'] === 'string' ? a['owner-role'] : 'orchestrator', generator: 'dsx tools/ux-lint/blueprint.mjs check',
      sources: [...Object.values(bp.files), spec, inv?.has_captures ? screens : null, mapPath], criteria: r.requirements,
      evidenceClass: 'observed', assumptions: ['screen ids of the blueprint match the flow map and capture ids'],
      gaps: [...(inv?.has_captures ? [] : ['no captures: realized coverage not checked']), ...(map ? [] : ['no flow map: navigation not checked'])],
    }),
  };
  if (a.json) console.log(JSON.stringify(out, null, 2));
  else console.log(formatBlueprint(out));
  process.exit(r.errors ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
