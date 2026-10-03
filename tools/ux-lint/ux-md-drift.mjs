#!/usr/bin/env node
// Drift UX.md × produto: confronta o UX.md com o mapa de fluxo, as capturas (e a geometria, quando houver) e
// acusa o que o arquivo deixou de descrever. É o par, para o UX.md, da conferência front matter × código do
// DESIGN.md. Sem dependências. Contrato: knowledge/fundamentos/ux-md.md ("Drift UX.md × produto").
//
//   U1 tela do mapa ou das capturas sem arquétipo no UX.md e fora de todo desvio declarado (sev 2)
//   U2 entrada de `archetypes` que não nomeia nenhuma tela do mapa (tela que não existe mais) (sev 2)
//   U3 política do front matter que a maioria das telas de um arquétipo já não segue (sev 2): reaproveita os
//      detectores — T1 (primárias por região), T2 (ordem do diálogo), T5 (rótulo da destrutiva) e, com geometria,
//      L1 (posição da primária). Precisa de ≥ 2 telas do arquétipo; telas cobertas por desvio da regra não contam.
//   U4 estado declarado em `states` que nenhuma captura tem (`<nn>-<tela>.<estado>.html`) (sev 2)
//   U5 `updated` mais velho que a última mudança das telas (git do mapa e das capturas; sem git, data do arquivo) (sev 1)
//   U6 desvio vencido (`until` no passado) ou que cita tela inexistente no mapa (sev 1)
//
// Uso: node tools/ux-lint/ux-md-drift.mjs <UX.md> [--map flows.json] [--screens <capturas>] [--geometry <pasta>]
//        [--module <m> --root <projeto>] [--json] [--fail-at 2]
//      Com --module e --root, os padrões são os da auditoria: <root>/.dsx/maps/flows-<m>.json,
//      <root>/.stitch/<m>/code e <root>/.stitch/<m>/geometry.
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

export const SEVERITY = { U1: 2, U2: 2, U3: 2, U4: 2, U5: 1, U6: 1 };
const PRINCIPAL = new Set(['success', 'open']);
const TRANSIENT = new Set(['running', 'submitting', 'saving']);
/** Regra do detector → política do front matter que ela verifica. */
const POLICY_RULES = {
  T1: { policy: 'actions.primary-per-region', what: 'mais primárias por região que o limite' },
  T2: { policy: 'actions.dialog-order', what: 'a outra ordem de botões no diálogo' },
  T5: { policy: 'actions.destructive-specific-label', what: 'rótulo genérico na ação destrutiva' },
  L1: { policy: 'actions.primary-position', what: 'a primária fora da posição declarada' },
};

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const day = (now) => (now instanceof Date ? now : new Date(now)).toISOString().slice(0, 10);

/** Lê o front matter do UX.md (texto) já com os nomes novos. */
function frontMatterOf(md) {
  const { frontMatter } = splitFrontMatter(String(md).replace(/\r\n/g, '\n'));
  if (!frontMatter) throw new Error('UX.md sem front matter (--- ... ---)');
  return configFrom(parseYaml(frontMatter));
}

/**
 * Analisa o drift. `ux` é o texto do UX.md; `map`, `screens` e `geometry` são caminhos (opcionais).
 * Devolve { findings: [{ rule, severity, screen, policy?, message, evidence }], summary, inventory }.
 */
export function analyzeDrift(ux, { map = null, screens = null, geometry = null, root = null, now = new Date(), lastChange, archetypesDir } = {}) {
  const cfg = frontMatterOf(ux);
  const { deviations } = parseDeviations(cfg.deviations);
  const inv = loadInventory({ map, screens });
  const findings = [];
  const add = (rule, screen, message, evidence, extra = {}) => findings.push({ rule, severity: SEVERITY[rule], screen, ...extra, message, evidence });
  const archetypes = cfg.archetypes ?? {};
  const inDeviation = (id) => deviations.some((d) => !expired(d, now) && coversScreen(d, id));

  // U1 — tela sem arquétipo nem desvio.
  let covered = 0;
  const uncovered = [];
  for (const s of inv.screens.values()) {
    if (archetypeOf(s, archetypes) || inDeviation(s.id)) { covered++; continue; }
    uncovered.push(s);
    const where = s.in_map ? `mapa${s.captures.length ? ' e capturas' : ''}` : 'capturas';
    add('U1', s.id, `tela "${s.id}"${s.name ? ` (${s.name})` : ''} está no ${where} e não tem arquétipo no UX.md nem desvio declarado`, s.captures[0] ?? (inv.map ? basename(inv.map) : null));
  }

  // U2 — entrada de archetypes que não nomeia tela do mapa.
  const stale = [];
  if (inv.has_map) {
    const mapScreens = [...inv.screens.values()].filter((s) => s.in_map);
    for (const [arch, entries] of Object.entries(archetypes)) for (const e of [].concat(entries ?? [])) {
      if (mapScreens.some((s) => entryMatches(e, s))) continue;
      stale.push(`${arch}: ${e}`);
      add('U2', String(e), `archetypes.${arch} cita "${e}", que não é tela do mapa (removida ou renomeada?)`, basename(inv.map));
    }
  }

  // U3 — política que a maioria das telas do arquétipo não segue.
  const groups = new Map(); // arquétipo → regra → { eligible: [], violating: [] }
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
    add('U3', null, `${p.policy}: ${value} — ${r.violating.length} de ${r.eligible.length} telas de ${arch} já mostram ${p.what} (${rule}): ${r.violating.slice(0, 6).join(', ')}${r.violating.length > 6 ? ', …' : ''}. Mude a política ou corrija as telas`, `${rule} × ${arch}`, { policy: p.policy, archetype: arch });
  }

  // U4 — estado declarado sem nenhuma captura.
  const missingStates = [];
  if (inv.has_captures) {
    const captured = new Set([...inv.screens.values()].flatMap((s) => [...s.states]));
    for (const st of [].concat(cfg.states ?? []).map(String)) {
      if (PRINCIPAL.has(st) || TRANSIENT.has(st) || captured.has(st)) continue;
      missingStates.push(st);
      add('U4', null, `states declara "${st}", mas nenhuma captura tem esse estado (<nn>-<tela>.${st}.html): capture o estado ou tire-o da lista`, inv.screens_dir ? basename(inv.screens_dir) : null);
    }
  }

  // U5 — updated mais velho que as telas.
  const change = lastChange !== undefined ? lastChange : lastScreensChange({ map: inv.map, screens: inv.screens_dir, root });
  const updated = cfg.updated ? String(cfg.updated) : null;
  if (change && (!updated || updated < change.date)) {
    add('U5', null, `updated ${updated ?? '(ausente)'} é anterior à última mudança das telas (${change.date}, ${change.source === 'git' ? 'último commit do mapa/capturas' : 'data do arquivo mais novo; sem git'}): revise o UX.md e suba version/updated`, change.paths.map((p) => basename(p)).join(', '));
  }

  // U6 — desvio vencido ou com tela inexistente.
  for (const d of deviations) {
    if (expired(d, now)) add('U6', null, `desvio ${d.id} venceu em ${d.until}: renove (novo until com motivo) ou corrija as telas — os achados cobertos voltaram a abrir`, `deviations.${d.id}`);
    if (inv.has_map) {
      const ghost = d.screens.filter((x) => x !== '*' && !inv.screens.has(screenKey(x)));
      if (ghost.length) add('U6', null, `desvio ${d.id} cita tela(s) fora do mapa: ${ghost.join(', ')}`, `deviations.${d.id}`);
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

/** Uma linha por regra, para o aviso de pré-requisito da auditoria ("UX.md desatualizado: …"). */
export function driftHeadline(result) {
  const s = result.summary;
  const parts = [];
  if (s.uncovered.length) parts.push(`${s.uncovered.length} tela(s) sem arquétipo (${s.uncovered.slice(0, 4).join(', ')}${s.uncovered.length > 4 ? ', …' : ''})`);
  if (s.stale_entries.length) parts.push(`${s.stale_entries.length} arquétipo(s) atribuído(s) a tela que não existe`);
  const u3 = result.findings.filter((f) => f.rule === 'U3');
  if (u3.length) parts.push(`${u3.length} política(s) que a maioria das telas não segue (${[...new Set(u3.map((f) => f.policy))].join(', ')})`);
  if (s.missing_states.length) parts.push(`estado(s) declarado(s) sem captura: ${s.missing_states.join(', ')}`);
  const u5 = result.findings.find((f) => f.rule === 'U5');
  if (u5) parts.push(`updated ${s.updated ?? '(ausente)'} anterior às telas (${s.last_change.date})`);
  const u6 = result.findings.filter((f) => f.rule === 'U6');
  if (u6.length) parts.push(`${u6.length} desvio(s) vencido(s) ou com tela fora do mapa`);
  return parts.join('; ');
}

const USAGE = 'Uso: node tools/ux-lint/ux-md-drift.mjs <UX.md> [--map flows.json] [--screens <capturas>] [--geometry <pasta>] [--module <m> --root <projeto>] [--json] [--fail-at 2]';

function main() {
  const a = parseCli('ux-lint/ux-md-drift.mjs');
  const file = a._[0];
  if (!file || !existsSync(file)) { console.error(USAGE); process.exit(2); }
  const root = typeof a.root === 'string' ? resolve(a.root) : null;
  const mod = typeof a.module === 'string' ? a.module : null;
  const pick = (flag, def) => (typeof a[flag] === 'string' ? resolve(a[flag]) : root && mod ? def : null);
  const map = pick('map', root && mod ? join(root, '.dsx', 'maps', `flows-${mod}.json`) : null);
  const screens = pick('screens', root && mod ? join(root, '.stitch', mod, 'code') : null);
  const geometry = pick('geometry', root && mod ? join(root, '.stitch', mod, 'geometry') : null);
  const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
  const r = analyzeDrift(readFileSync(file, 'utf8'), { map, screens, geometry, root, now });
  const failAt = Number(a['fail-at'] ?? 2);
  if (a.json) console.log(JSON.stringify({ file, ...r }, null, 2));
  else {
    const s = r.summary;
    console.log(`Drift UX.md × produto: ${file}`);
    console.log(`  insumos: mapa ${s.has_map ? '✓' : '—'} · capturas ${s.has_captures ? '✓' : '—'} · geometria ${s.has_geometry ? '✓' : '—'} · ${s.deviations} desvio(s) declarado(s)`);
    for (const f of r.findings) console.log(`  ${f.rule} sev ${f.severity}${f.screen ? ` | ${f.screen}` : ''} | ${f.message}${f.evidence ? `\n      ${f.evidence}` : ''}`);
    console.log(`\n  ${s.screens} telas no inventário, ${s.covered} com arquétipo ou desvio; ${s.findings} achado(s) de drift (${Object.entries(s.by_rule).map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum'})`);
    console.log(r.findings.length ? `  UX.md desatualizado: ${driftHeadline(r)}` : '  UX.md em dia com o mapa e as capturas.');
  }
  process.exit(r.findings.some((f) => f.severity >= failAt) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
