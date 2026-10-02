#!/usr/bin/env node
// Valida um DESIGN.md: estrutura, referências, contraste dos pares declarados e sinais de texto vago.
// Cobre os critérios OBJETIVOS da rubrica (gates 1 e 3 + parte de "validade técnica" e "acessibilidade").
// Os critérios de julgamento (intenção, fidelidade à fonte) ficam com a skill dsx-design-md.
// Uso: node tools/lint-design-md.mjs [caminho/DESIGN.md] [--json]
import { readFileSync } from 'node:fs';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { contrast } from './lib/color.mjs';
import { parseArgs } from './lib/cli.mjs';

// Seções obrigatórias (ordem recomendada) e sinônimos aceitos em pt-BR.
export const REQUIRED_SECTIONS = [
  ['Overview', 'Visão geral'],
  ['Colors', 'Cores'],
  ['Typography', 'Tipografia'],
  ['Layout', 'Layout e espaçamento'],
  ['Elevation & Depth', 'Elevation', 'Elevação', 'Elevação e profundidade'],
  ['Shapes', 'Formas'],
  ['Components', 'Componentes'],
  ["Do's and Don'ts", 'Dos and Donts', 'Faça e não faça', 'Faça e evite'],
];
export const RECOMMENDED_SECTIONS = [
  ['Accessibility', 'Acessibilidade'],
  ['Agent Instructions', 'Instruções para agentes', 'Agent Prompt'],
];

const VAGUE = /\b(moderno|moderna|clean|limpo|limpa|bonito|bonita|elegante|minimalista|intuitivo|intuitiva|amigável|sofisticad[oa]|premium|arrojad[oa])\b/gi;
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9& ]/g, '').trim();

export function lintDesignMd(md) {
  const errors = [];
  const warnings = [];
  const info = {};
  const { frontMatter, body } = splitFrontMatter(md);

  // --- Front matter -------------------------------------------------------
  let fm = {};
  if (!frontMatter) warnings.push('Sem front matter YAML: tokens não são verificáveis por máquina.');
  else {
    try { fm = parseYaml(frontMatter); } catch (e) { errors.push(`Front matter inválido: ${e.message}`); }
  }
  const colors = fm.colors ?? {};
  if (frontMatter && !fm.colors) errors.push('Front matter sem grupo "colors".');
  if (frontMatter && !fm.typography) errors.push('Front matter sem grupo "typography".');
  if (frontMatter && !fm.owner) warnings.push('Sem "owner": defina quem mantém o arquivo.');
  if (frontMatter && !fm.updated) warnings.push('Sem "updated": registre a data da última revisão.');

  const placeholdersFm = (frontMatter ?? '').split('\n').filter((l) => !/^\s*#/.test(l) && /<[^>]+>/.test(l));
  if (placeholdersFm.length) errors.push(`Front matter com ${placeholdersFm.length} placeholder(s) não preenchido(s), ex.: "${placeholdersFm[0].trim()}"`);

  for (const [k, v] of Object.entries(colors)) {
    if (typeof v === 'string' && !v.startsWith('{') && !HEX.test(v) && !/<[^>]+>/.test(v)) errors.push(`colors.${k}: valor "${v}" não é hex válido.`);
  }

  // Resolve referências {grupo.chave}
  const lookup = (path) => path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), fm);
  const refs = [];
  const walk = (o, p) => {
    for (const [k, v] of Object.entries(o ?? {})) {
      if (v && typeof v === 'object') walk(v, `${p}.${k}`);
      else if (typeof v === 'string') for (const m of v.matchAll(/\{([^}]+)\}/g)) refs.push({ at: `${p}.${k}`.slice(1), ref: m[1] });
    }
  };
  walk(fm, '');
  for (const r of refs) if (lookup(r.ref) === undefined) errors.push(`Referência quebrada em ${r.at}: {${r.ref}}`);
  info.referencias = refs.length;

  // Componentes com valor cru em vez de referência
  for (const [name, def] of Object.entries(fm.components ?? {})) {
    for (const [prop, v] of Object.entries(def ?? {})) {
      if (/color/i.test(prop) && typeof v === 'string' && HEX.test(v)) warnings.push(`components.${name}.${prop} usa cor crua (${v}); referencie {colors.*}.`);
    }
  }

  // --- Contraste ----------------------------------------------------------
  const resolveColor = (v) => {
    for (let i = 0; i < 5 && typeof v === 'string' && v.startsWith('{'); i++) v = lookup(v.slice(1, -1));
    return typeof v === 'string' && HEX.test(v) && v.length <= 7 ? v : null;
  };
  const pairs = [];
  for (const k of Object.keys(colors)) {
    const m = k.match(/^on-(.+)$/);
    if (m && colors[m[1]]) pairs.push([k, m[1], 4.5]);
  }
  const bgs = ['canvas', 'background', 'surface'].filter((b) => colors[b]);
  for (const t of Object.keys(colors).filter((k) => /^text-|^link$/.test(k))) for (const b of bgs) pairs.push([t, b, 4.5]);
  for (const ui of ['border-strong', 'focus', 'primary'].filter((k) => colors[k])) for (const b of bgs.slice(0, 1)) pairs.push([ui, b, 3]);
  info.paresContraste = [];
  for (const [fg, bg, min] of pairs) {
    const a = resolveColor(colors[fg]), b = resolveColor(colors[bg]);
    if (!a || !b) continue;
    const ratio = +contrast(a, b).toFixed(2);
    info.paresContraste.push({ fg, bg, ratio, min, ok: ratio >= min });
    if (ratio < min) errors.push(`Contraste insuficiente: ${fg} sobre ${bg} = ${ratio}:1 (mínimo ${min}:1).`);
  }

  // --- Tipografia e espaçamento -------------------------------------------
  const px = (v) => (typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN);
  const bodyType = fm.typography?.body;
  if (bodyType) {
    if (px(bodyType.fontSize) < 14) warnings.push(`typography.body.fontSize ${bodyType.fontSize} < 14px.`);
    if (Number(bodyType.lineHeight) < 1.4) warnings.push(`typography.body.lineHeight ${bodyType.lineHeight} < 1.4.`);
  } else if (fm.typography) warnings.push('typography sem nível "body".');
  for (const [k, v] of Object.entries(fm.spacing ?? {})) {
    const n = px(v);
    if (!Number.isNaN(n) && n % 4 !== 0 && n !== 2) warnings.push(`spacing.${k} = ${v} fora da grade de 4px.`);
  }

  // --- Corpo --------------------------------------------------------------
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const hasSection = (aliases) => headings.find((h) => aliases.some((a) => norm(h) === norm(a)));
  info.secoes = headings;
  for (const aliases of REQUIRED_SECTIONS) if (!hasSection(aliases)) errors.push(`Seção obrigatória ausente: "## ${aliases[0]}"`);
  for (const aliases of RECOMMENDED_SECTIONS) if (!hasSection(aliases)) warnings.push(`Seção recomendada ausente: "## ${aliases[0]}"`);

  // Seções vazias (só comentários) e placeholders
  const sections = body.split(/^##\s+/m).slice(1);
  for (const s of sections) {
    const [title, ...rest] = s.split('\n');
    const content = rest.join('\n').replace(/<!--[\s\S]*?-->/g, '').trim();
    if (!content || /^(\*\*[^*]+\*\*\s*|-\s*<[^>]+>\s*)+$/.test(content)) errors.push(`Seção "${title.trim()}" está vazia.`);
  }
  const bodyNoComments = body.replace(/<!--[\s\S]*?-->/g, '').replace(/`[^`]*`/g, '');
  const ph = bodyNoComments.match(/<(?!\/?(?:br|kbd|abbr|code)\b)[a-zà-ú][^>]{1,60}>/gi);
  if (ph) errors.push(`Corpo com ${ph.length} placeholder(s) não preenchido(s), ex.: ${ph[0]}`);

  // Do's / Don'ts com pelo menos 3 itens cada
  const dd = sections.find((s) => /do|faça/i.test(s.split('\n')[0]) && /don|não faça|evite/i.test(s.split('\n')[0]));
  if (dd) {
    const [dos, donts] = dd.split(/\*\*(?:Não faça|Evite|Don'?ts?)\*\*/i);
    const count = (t) => (t ?? '').split('\n').filter((l) => /^\s*[-*]\s+\S/.test(l)).length;
    if (count(dos) < 3) warnings.push(`Do's com ${count(dos)} item(ns); recomendado ≥ 3, derivados de erros reais.`);
    if (donts === undefined) warnings.push('Não encontrei o bloco "**Não faça**" dentro de Do\'s and Don\'ts.');
    else if (count(donts) < 3) warnings.push(`Don'ts com ${count(donts)} item(ns); recomendado ≥ 3.`);
  }

  // Adjetivos vagos sem critério
  const vague = [...new Set((bodyNoComments.match(VAGUE) ?? []).map((w) => w.toLowerCase()))];
  if (vague.length) warnings.push(`Adjetivos vagos no corpo (${vague.join(', ')}): troque por critérios observáveis.`);

  return { ok: errors.length === 0, errors, warnings, info };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const file = a._[0] ?? 'DESIGN.md';
  const result = lintDesignMd(readFileSync(file, 'utf8'));
  if (a.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`DESIGN.md: ${file}`);
    for (const e of result.errors) console.log(`  ERRO   ${e}`);
    for (const w of result.warnings) console.log(`  AVISO  ${w}`);
    const p = result.info.paresContraste ?? [];
    console.log(`\n  ${result.info.secoes?.length ?? 0} seções · ${result.info.referencias ?? 0} referências · ${p.filter((x) => x.ok).length}/${p.length} pares de contraste OK`);
    console.log(result.ok ? '  Gates objetivos: APROVADO' : `  Gates objetivos: REPROVADO (${result.errors.length} erro(s))`);
  }
  process.exit(result.ok ? 0 : 1);
}
