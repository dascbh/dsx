#!/usr/bin/env node
// ux-lint, nível fluxo: aplica as regras F1–F5 do contrato do UX.md (knowledge/fundamentos/ux-md.md)
// sobre o mapa de fluxo de um módulo (.dsx/maps/flows-<module>.json). Sem dependências.
//
// Formato de entrada: { screens: [{id, name, type, route, parent, persona}],
//   transitions: [{id, from, to, trigger: {type, label}, evidence}], journeys: [{id, name, steps, persona_switches}] }
// `type` da tela: page | dialog | tab | panel | drawer (dialog e modal contam como diálogo).
// Passos de jornada podem ser ids de transição ou de tela. O formato antigo (telas, transicoes, jornadas,
// de/para, gatilho, evidencia, passos…) é lido com aviso (lib/legacy.mjs).
//
// Uso: node tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json [--ux UX.md] [--json] [--fail-at 3]
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseCli } from '../lib/legacy-cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { normalizeFlowMap } from './lib/legacy.mjs';

export const SEVERITY = { F1: 3, F2: 1, F3: 2, F4: 2, F5: 3 };
const DIALOG_TYPES = new Set(['dialog', 'modal']);

/**
 * Devolve { findings: [{ rule, severity, screen, message, evidence: [] }], summary, warnings? }.
 * `warnings` lista os nomes antigos lidos no mapa.
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
  const evidenceOf = (trs) => trs.map((t) => `${t.id} (${t.evidence || 'sem evidência'})`);
  const name = (id) => byId.get(id)?.name || id;

  // Referências quebradas: transição para/de tela que não existe (não é regra do contrato; vai como aviso F0).
  for (const tr of transitions) {
    for (const side of ['from', 'to']) {
      if (!byId.has(tr[side])) add('F0', tr[side], `transição ${tr.id} aponta para tela inexistente "${tr[side]}"`, evidenceOf([tr]), 1);
    }
  }

  // F1 — tela (não diálogo) sem nenhuma saída. Transição para a própria tela (ação que fica nela) não é saída.
  const deadEnds = screens.filter((t) => !isDialog(t.id) && !outgoing.get(t.id).some((tr) => tr.to !== t.id));
  const deadEndLimit = Number(cfg.flows['dead-ends'] ?? 0);
  for (const t of deadEnds) {
    add('F1', t.id, `"${t.name}" (${t.type}) não tem nenhuma transição de saída; chega-se por ${incoming.get(t.id).length} transição(ões)`,
      evidenceOf(incoming.get(t.id)), deadEnds.length > deadEndLimit ? SEVERITY.F1 : 1);
  }

  // F2 — tela fora de todas as jornadas (aviso).
  if (journeys.length) {
    const inJourneys = new Set();
    const transitionById = new Map(transitions.map((t) => [t.id, t]));
    for (const j of journeys) for (const p of j.steps || []) {
      const tr = transitionById.get(p);
      if (tr) { inJourneys.add(tr.from); inJourneys.add(tr.to); } else if (byId.has(p)) inJourneys.add(p);
    }
    for (const t of screens) {
      if (!inJourneys.has(t.id)) add('F2', t.id, `"${t.name}" não aparece em nenhuma jornada`, t.component ? [t.component] : []);
    }
  }

  // F3 — jornada longa.
  const maxSteps = Number(cfg.flows['max-journey-steps']);
  for (const j of journeys) {
    const n = (j.steps || []).length;
    if (n > maxSteps) {
      const switches = (j.persona_switches || []).length;
      add('F3', j.id, `jornada "${j.name}" tem ${n} passos (máx. ${maxSteps})${switches ? `, com ${switches} troca(s) de persona` : ''}`, []);
    }
  }

  // F4 — diálogos empilhados: profundidade da cadeia diálogo → diálogo acima do limite. O mapa não diz se o
  // primeiro diálogo fecha antes do segundo abrir; a regra acusa e a evidência permite conferir no código.
  const maxDialogs = Number(cfg.flows['max-stacked-dialogs']);
  // Abertura diálogo → diálogo: não conta ação dentro do mesmo diálogo nem volta para a tela-mãe (B → A
  // quando A é o `pai` de B).
  const stacks = (tr) => isDialog(tr.from) && isDialog(tr.to) && tr.from !== tr.to && byId.get(tr.from)?.parent !== tr.to;
  const openings = transitions.filter(stacks);
  // Profundidade = maior cadeia de aberturas que termina no diálogo (o primeiro diálogo conta 1).
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
    if (!stacks(tr)) continue; // ação dentro do mesmo diálogo, volta ou diálogo aberto a partir de página
    const p = depth(tr.to);
    if (p > maxDialogs) {
      add('F4', tr.to, `diálogo "${name(tr.to)}" abre a partir do diálogo "${name(tr.from)}" (${p} diálogos empilhados; máx. ${maxDialogs})${tr.trigger?.label ? ` — gatilho "${tr.trigger.label}"` : ''}`, evidenceOf([tr]));
    }
  }

  // F5 — tela não raiz (com pai) sem transição de volta para a mãe ou para uma tela de onde se chega a ela.
  if (cfg.navigation.back === 'mandatory') {
    for (const t of screens.filter((t) => t.parent)) {
      // Origem = de onde se chega; filhas que voltam para esta tela (diálogo que fecha) não são origem.
      const origins = new Set(incoming.get(t.id).map((tr) => tr.from).filter((from) => from !== t.id && byId.get(from)?.parent !== t.id));
      const hasBack = outgoing.get(t.id).some((tr) => tr.to === t.parent || origins.has(tr.to));
      if (!hasBack) {
        add('F5', t.id, `"${t.name}" (filha de "${name(t.parent)}") não tem transição de volta para a mãe nem para ${origins.size ? [...origins].map((o) => `"${name(o)}"`).join(', ') : 'nenhuma origem'}`,
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
    console.error('Uso: node tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json [--ux UX.md] [--json] [--fail-at 3]');
    process.exit(2);
  }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const threshold = Number(args['fail-at'] ?? 3);
  const output = args._.map((f) => ({ file: f, ...analyzeFlow(JSON.parse(readFileSync(f, 'utf8')), cfg) }));
  for (const s of output) for (const w of s.warnings ?? []) console.error(`AVISO ${s.file}: ${w}`);
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
      console.log(`\nResumo: ${r.screens} telas, ${r.transitions} transições, ${r.journeys} jornadas; ${r.findings} achados (${Object.entries(r.by_rule).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum'})`);
    }
  }
  process.exit(output.some((s) => s.findings.some((a) => a.severity >= threshold)) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
