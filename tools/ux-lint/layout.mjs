#!/usr/bin/env node
// ux-lint, layout e hierarquia: aplica as regras L1–L9 (knowledge/fundamentos/ux-md.md e hierarquia-visual.md)
// sobre a geometria medida das capturas (tools/ux-lint/measure.mjs → <nome>.geometry.json). Sem dependências e
// sem navegador: só lê os arquivos de geometria, o UX.md e os cartões de arquétipo.
//
// Uso: node tools/ux-lint/layout.mjs <pasta-geometria|arquivos.geometry.json...> [--ux UX.md] [--archetypes <pasta>] [--json] [--fail-at 3]
// A tela é ligada ao arquétipo pelo id no nome da captura (`<nn>-<screen-id>[.<state>]`), comparado com os ids e
// rotas listados em `archetypes` do UX.md (a rota é comparada com o <title> da captura). Do cartão
// `archetypes/<id>.md` vêm as regiões esperadas (L9) e `primary-action.position` (L1); sem arquétipo, vale
// `actions.primary-position` do UX.md. L9 só roda na captura do estado principal (sem sufixo de estado).
// JSON (--json): { summary, screens: [{ file, screen, archetype, dialog_open, findings: [{ rule, severity, region,
// message, anchor, evidence, elements, measure }] }] } — família `layout` no registro (findings.mjs --layout).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { analyzeLayout, screenIdOf, LAYOUT_DEFAULTS } from './lib/geometry.mjs';
import { loadArchetypes } from '../lint-archetypes.mjs';

const DEFAULT_ARCHETYPES = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'archetypes');

/** Cartões de arquétipo → { id: { id, regions, primary_action } }. */
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
 * Arquétipo da tela pelo mapa `archetypes` do UX.md ({ archetype: [ids ou rotas] }). Compara o id da tela
 * (nome da captura sem número e estado) e o título da captura (rota). Devolve o id do arquétipo ou null.
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

/** Estado da captura pelo sufixo (`02-acervo.empty` → `empty`); principal = null. */
export const stateOf = (screenName) => String(screenName).replace(/\.geometry\.json$|\.html?$/, '').split('.').slice(1).join('.') || null;

/** Limites das regras: padrões do DSX + chave `layout` do front matter do UX.md. */
export function limitsFrom(cfg) {
  const over = cfg?.layout && typeof cfg.layout === 'object' ? cfg.layout : {};
  const out = { ...LAYOUT_DEFAULTS };
  for (const [k, v] of Object.entries(over)) if (k in out && Number.isFinite(Number(v))) out[k] = Number(v);
  return out;
}

/** Analisa uma geometria com o contexto do projeto. */
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
    console.error('Uso: node tools/ux-lint/layout.mjs <pasta-geometria|arquivos.geometry.json...> [--ux UX.md] [--archetypes <pasta>] [--json] [--fail-at 3]');
    process.exit(2);
  }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const catalog = archetypeCatalog(typeof args.archetypes === 'string' ? args.archetypes : DEFAULT_ARCHETYPES);
  const files = listGeometry(args._);
  if (!files.length) {
    console.error('Nenhum arquivo .geometry.json. Gere a geometria antes: node tools/ux-lint/measure.mjs <capturas> --out <pasta>');
    process.exit(2);
  }
  const results = files.map((f) => analyzeGeometry(JSON.parse(readFileSync(f, 'utf8')), cfg, catalog));
  const summary = summarize(results);
  const threshold = Number(args['fail-at'] ?? 3);
  if (args.json) console.log(JSON.stringify({ summary, screens: results }, null, 2));
  else {
    for (const r of results) {
      const name = basename(r.file);
      const tag = `${r.archetype ? ` [${r.archetype}]` : ' [sem arquétipo]'}${r.dialog_open ? ' (diálogo aberto)' : ''}`;
      if (!r.findings.length) { console.log(`✓ ${name}${tag}`); continue; }
      console.log(`✗ ${name}${tag}`);
      for (const a of [...r.findings].sort((x, y) => y.severity - x.severity || x.rule.localeCompare(y.rule))) {
        console.log(`   ${a.rule} sev ${a.severity} | ${a.region} | ${a.message}${a.evidence ? `\n      ${a.evidence.split(', ')[0]}` : ''}`);
      }
    }
    const rules = Object.entries(summary.by_rule).sort(([x], [y]) => x.localeCompare(y, 'pt', { numeric: true })).map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum';
    console.log(`\nResumo: ${summary.screens} telas (${summary.screens_without_archetype} sem arquétipo), ${summary.screens_with_findings} com achado, ${summary.findings} achados (${rules}); severidade ${Object.entries(summary.by_severity).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }
  process.exit(results.some((r) => r.findings.some((a) => a.severity >= threshold)) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
