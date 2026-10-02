#!/usr/bin/env node
// Ponte DESIGN.md (DSX) ↔ design system do Stitch.
//
//   node tools/stitch/design-system.mjs exportar <DESIGN.md> [-o .stitch/DESIGN.md]
//       → versão do DESIGN.md ajustada para o Stitch, a ser enviada com upload_design_md +
//         create_design_system_from_design_md.
//   node tools/stitch/design-system.mjs conferir <DESIGN.md> <saida-de-list_design_systems.json> [--asset <id>] [--json]
//       → o que o Stitch preservou, mudou ou acrescentou. Sai com 1 se algum papel do DSX sumiu,
//         se a cor da marca mudou ou se raio/fonte divergem.
//
// O que os testes contra o Stitch real mostraram (2026-10-02):
//  - Importar pelo DESIGN.md preserva as cores nomeadas do front matter. Já o `update_design_system`
//    só aceita o modelo Material 3 (cor-semente + overrides) e APAGA as cores nomeadas: nunca use
//    update_design_system para sincronizar o DSX.
//  - O nível de raio do Stitch (4/8/12/total) sai da primeira entrada de `rounded`. Sem um `DEFAULT`,
//    ele pega o menor raio do DSX (sm) e as telas ficam com raio 4px. O export declara
//    `DEFAULT` = raio de controle (botão/campo) do DSX.
//  - O Stitch acrescenta ~40 papéis Material 3 (primary-container, surface-variant…). Eles não existem
//    no DSX: na volta ao código, mapeie para tokens do DSX (veja `mapeamento` no `conferir`).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseYaml, splitFrontMatter } from '../lib/yaml-lite.mjs';
import { parseArgs } from '../lib/cli.mjs';

// Fontes aceitas pelo Stitch (enum do esquema do MCP, sem as depreciadas).
export const FONTES_STITCH = new Set(`BE_VIETNAM_PRO EPILOGUE INTER LEXEND MANROPE NEWSREADER NOTO_SERIF PLUS_JAKARTA_SANS
PUBLIC_SANS SPACE_GROTESK SPLINE_SANS WORK_SANS DOMINE LIBRE_CASLON_TEXT EB_GARAMOND LITERATA SOURCE_SERIF_4 MONTSERRAT
METROPHOBIC SOURCE_SANS_3 NUNITO_SANS ARIMO HANKEN_GROTESK RUBIK GEIST DM_SANS IBM_PLEX_SANS SORA ANYBODY ANTON
ARCHIVO_NARROW ATKINSON_HYPERLEGIBLE_NEXT BARLOW_CONDENSED BEBAS_NEUE BODONI_MODA BRICOLAGE_GROTESQUE CHIVO
CLIMATE_CRISIS COMFORTAA COURIER_PRIME FIRA_SANS GOOGLE_SANS GOOGLE_SANS_CODE GOOGLE_SANS_FLEX GOOGLE_SANS_MONO
GOOGLE_SANS_TEXT IBM_PLEX_SERIF JETBRAINS_MONO KARLA LIBRE_FRANKLIN MERRIWEATHER NOTO_SANS OPEN_SANS OSWALD OUTFIT
PLAYFAIR_DISPLAY POIRET_ONE QUESTRIAL QUICKSAND RALEWAY ROBOTO_FLEX SPACE_MONO SYNE VOLLKORN`.split(/\s+/));
const APELIDOS = { ROBOTO: 'ROBOTO_FLEX', SOURCE_SERIF_FOUR: 'SOURCE_SERIF_4', SOURCE_SANS_THREE: 'SOURCE_SANS_3' };
const NIVEIS_RAIO = [[4, 'ROUND_FOUR'], [8, 'ROUND_EIGHT'], [12, 'ROUND_TWELVE']];

/** Papéis Material 3 do Stitch → token semântico do DSX, para a volta ao código. */
export const MAPEAMENTO_MATERIAL = {
  primary: 'color.action.primary', 'primary-container': 'color.action.primary', 'on-primary': 'color.text.on-action',
  'on-primary-container': 'color.text.on-action', 'surface-tint': 'color.action.primary', 'inverse-primary': 'color.text.link',
  background: 'color.bg.canvas', 'surface-container-lowest': 'color.bg.canvas', 'surface-bright': 'color.bg.canvas',
  surface: 'color.bg.surface', 'surface-container-low': 'color.bg.surface', 'surface-container': 'color.bg.surface',
  'surface-container-high': 'color.bg.sunken', 'surface-container-highest': 'color.bg.sunken', 'surface-variant': 'color.bg.sunken', 'surface-dim': 'color.bg.sunken',
  'on-surface': 'color.text.primary', 'on-background': 'color.text.primary', 'on-surface-variant': 'color.text.secondary',
  outline: 'color.border.strong', 'outline-variant': 'color.border.default',
  error: 'color.action.danger', 'on-error': 'color.text.on-action', 'error-container': 'color.feedback.danger-bg', 'on-error-container': 'color.feedback.danger-text',
  'inverse-surface': 'color.bg.inverse', 'inverse-on-surface': 'color.text.inverse',
  secondary: 'color.text.secondary', 'secondary-container': 'color.action.secondary', 'on-secondary-container': 'color.text.primary',
  // A família tertiary (derivada em laranja a partir do roxo) é usada pelo Stitch para estados de atenção.
  tertiary: 'color.feedback.warning-icon', 'tertiary-container': 'color.feedback.warning-bg', 'on-tertiary-container': 'color.feedback.warning-text',
  'tertiary-fixed': 'color.feedback.warning-bg', 'tertiary-fixed-dim': 'color.feedback.warning-icon', 'on-tertiary-fixed': 'color.feedback.warning-text',
};

const px = (v) => (typeof v === 'number' ? v : parseFloat(String(v)) * (/rem$/.test(String(v)) ? 16 : 1));

export function lerDesignMd(texto) {
  const { frontMatter } = splitFrontMatter(texto);
  if (!frontMatter) throw new Error('DESIGN.md sem front matter: rode tools/lint-design-md.mjs primeiro.');
  const fm = parseYaml(frontMatter);
  const resolver = (v) => {
    for (let i = 0; i < 5 && typeof v === 'string' && /^\{.+\}$/.test(v); i++) v = v.slice(1, -1).split('.').reduce((o, k) => o?.[k], fm);
    return v;
  };
  return { fm, resolver };
}

export function fonteStitch(familia) {
  if (!familia) return null;
  const k = String(familia).split(',')[0].trim().replace(/["']/g, '').toUpperCase().replace(/[\s-]+/g, '_');
  const v = APELIDOS[k] ?? k;
  return FONTES_STITCH.has(v) ? v : null;
}

export function raioStitch(valor) {
  const n = px(valor);
  if (!Number.isFinite(n)) return null;
  if (n >= 999) return 'ROUND_FULL';
  return NIVEIS_RAIO.reduce((m, r) => (Math.abs(r[0] - n) < Math.abs(m[0] - n) ? r : m))[1];
}

/** Raio de controle do DSX: o do botão primário, senão rounded.md. */
function raioControle(fm, resolver) {
  return resolver(fm.components?.['button-primary']?.rounded) ?? resolver(fm.rounded?.md) ?? resolver(fm.rounded?.DEFAULT) ?? null;
}

/** DESIGN.md do DSX → DESIGN.md para o Stitch, com avisos do que não tem equivalente lá. */
export function exportar(texto) {
  const { fm, resolver } = lerDesignMd(texto);
  const avisos = [];
  if (!fm.colors?.primary) throw new Error('DESIGN.md sem colors.primary.');
  let saida = texto;
  const ctrl = raioControle(fm, resolver);
  if (ctrl && fm.rounded && !('DEFAULT' in fm.rounded)) {
    const m = saida.match(/^rounded:[ \t]*\n/m);
    if (m) saida = saida.replace(m[0], `${m[0]}  DEFAULT: ${ctrl}\n`);
  }
  const nivel = raioStitch(ctrl);
  if (ctrl && nivel && px(ctrl) !== { ROUND_FOUR: 4, ROUND_EIGHT: 8, ROUND_TWELVE: 12, ROUND_FULL: 9999 }[nivel]) {
    avisos.push(`Raio de controle ${ctrl} não existe no Stitch; vira ${nivel}.`);
  }
  avisos.push('O Stitch deriva a escala de raios a partir de um único nível; raios de card/modal do DSX valem só no código.');
  for (const [nivelTipo, t] of Object.entries(fm.typography ?? {})) {
    const fam = resolver(t?.fontFamily);
    if (fam && !fonteStitch(fam)) avisos.push(`Fonte "${fam}" (${nivelTipo}) não existe no Stitch; ele vai substituir. Mantenha-a só no código.`);
  }
  return { texto: saida, avisos, esperado: { roundness: nivel ?? 'ROUND_EIGHT' } };
}

/** Extrai um design system de uma resposta de list_design_systems (objeto, texto MCP ou saída de cliente). */
export function lerListaStitch(entrada, asset) {
  let d = typeof entrada === 'string' ? JSON.parse(entrada) : entrada;
  if (d?.content?.[0]) d = typeof d.content[0] === 'string' ? JSON.parse(d.content[0]) : JSON.parse(d.content[0].text);
  if (d?.structuredContent) d = d.structuredContent;
  const lista = d.designSystems ?? [d];
  const alvo = asset ? lista.find((x) => String(x.name ?? '').endsWith(asset)) : lista.at(-1);
  if (!alvo) throw new Error(`Design system ${asset} não encontrado na listagem.`);
  return alvo.designSystem ?? alvo;
}

export function conferir(texto, stitch) {
  const { fm, resolver } = lerDesignMd(texto);
  const th = stitch.theme ?? {};
  const nc = Object.fromEntries(Object.entries(th.namedColors ?? {}).map(([k, v]) => [k.replace(/_/g, '-'), String(v).toLowerCase()]));
  const nossas = Object.fromEntries(Object.entries(fm.colors ?? {}).map(([k, v]) => [k, String(resolver(v) ?? '').toLowerCase()]));
  const preservadas = [], alteradas = [], ausentes = [];
  for (const [k, v] of Object.entries(nossas)) {
    if (!nc[k]) ausentes.push(k); else if (nc[k] === v) preservadas.push(k); else alteradas.push({ papel: k, dsx: v, stitch: nc[k] });
  }
  const extras = Object.keys(nc).filter((k) => !(k in nossas));
  const { esperado } = exportar(texto);
  const problemas = [], avisos = [];
  if (!Object.keys(nc).length) problemas.push('o design system ainda não tem paleta (o Stitch processa de forma assíncrona: liste de novo em ~10 s)');
  else if (ausentes.length) problemas.push(`${ausentes.length} papel(éis) do DSX sumiram (${ausentes.slice(0, 5).join(', ')}${ausentes.length > 5 ? '…' : ''}) — foi usado update_design_system? Reimporte pelo DESIGN.md exportado`);
  if (nc.primary && nossas.primary && nc.primary !== nossas.primary) {
    if (nc['primary-container'] === nossas.primary) avisos.push(`a marca ${nossas.primary} ficou em primary-container; primary = ${nc.primary}. Na volta, os dois → color.action.primary`);
    else problemas.push(`cor da marca alterada: primary ${nossas.primary} → ${nc.primary}`);
  }
  for (const x of alteradas.filter((a) => a.papel !== 'primary')) avisos.push(`papel ${x.papel} alterado pelo Stitch: ${x.dsx} → ${x.stitch} (papel com o mesmo nome no Material 3); use o valor do DSX no código`);
  if (th.roundness && th.roundness !== esperado.roundness) problemas.push(`raio = ${th.roundness}, esperado ${esperado.roundness} — importe o DESIGN.md gerado por \`exportar\` (declara DEFAULT)`);
  const fontes = { headlineFont: resolver(fm.typography?.h1?.fontFamily) ?? resolver(fm.typography?.display?.fontFamily), bodyFont: resolver(fm.typography?.body?.fontFamily) };
  for (const [campo, fam] of Object.entries(fontes)) {
    const f = fonteStitch(fam);
    if (f && th[campo] && th[campo] !== f) problemas.push(`${campo} = ${th[campo]}, esperado ${f}`);
  }
  const mapeamento = Object.fromEntries(extras.filter((k) => MAPEAMENTO_MATERIAL[k]).map((k) => [k, MAPEAMENTO_MATERIAL[k]]));
  const semMapa = extras.filter((k) => !MAPEAMENTO_MATERIAL[k]);
  return { ok: problemas.length === 0, problemas, avisos, preservadas, alteradas, ausentes, extras, mapeamento, semMapa, roundness: th.roundness };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const [cmd, arq, lista] = a._;
  if (cmd === 'exportar' && arq) {
    const r = exportar(readFileSync(arq, 'utf8'));
    const destino = a.o ?? a.out;
    if (destino) { mkdirSync(dirname(destino), { recursive: true }); writeFileSync(destino, r.texto); console.error(`Gravado: ${destino}`); }
    else process.stdout.write(r.texto);
    for (const w of r.avisos) console.error(`AVISO  ${w}`);
  } else if (cmd === 'conferir' && arq && lista) {
    const r = conferir(readFileSync(arq, 'utf8'), lerListaStitch(readFileSync(lista, 'utf8'), a.asset));
    if (a.json) console.log(JSON.stringify(r, null, 2));
    else {
      const total = r.preservadas.length + r.alteradas.length + r.ausentes.length;
      console.log(`Cores do DSX preservadas: ${r.preservadas.length}/${total} · raio: ${r.roundness ?? '—'}`);
      for (const x of r.alteradas) console.log(`  ALTERADA  ${x.papel}: DSX ${x.dsx} → Stitch ${x.stitch}`);
      if (r.ausentes.length) console.log(`  AUSENTES  ${r.ausentes.join(', ')}`);
      console.log(`Papéis só do Stitch: ${r.extras.length} (${Object.keys(r.mapeamento).length} com mapeamento para o DSX; sem mapa: ${r.semMapa.length})`);
      for (const w of r.avisos) console.log(`  AVISO  ${w}`);
      console.log(r.ok ? 'Design system: CONFORME' : `Design system: DIVERGENTE\n  - ${r.problemas.join('\n  - ')}`);
    }
    process.exit(r.ok ? 0 : 1);
  } else {
    console.error('Uso:\n  node tools/stitch/design-system.mjs exportar <DESIGN.md> [-o .stitch/DESIGN.md]\n  node tools/stitch/design-system.mjs conferir <DESIGN.md> <list_design_systems.json> [--asset <id>] [--json]');
    process.exit(2);
  }
}
