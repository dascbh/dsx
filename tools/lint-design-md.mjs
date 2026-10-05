#!/usr/bin/env node
// Validates a DESIGN.md: structure, references, contrast of the declared pairs and signs of vague text.
// Covers the OBJECTIVE criteria of the rubric (gates 1 and 3 + part of "technical validity" and "accessibility").
// The judgment criteria (intent, fidelity to the source) belong to the design-md skill.
// Usage: node tools/lint-design-md.mjs [path/DESIGN.md] [--json]
import { readFileSync } from 'node:fs';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { contrast } from './lib/color.mjs';
import { parseArgs } from './lib/cli.mjs';

// Required sections (recommended order) and accepted pt-BR synonyms.
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

// Vague adjectives, pt-BR and English.
const VAGUE = /(?<![\p{L}])(moderno|moderna|clean|limpo|limpa|bonito|bonita|elegante|minimalista|intuitivo|intuitiva|amigável|sofisticad[oa]|premium|arrojad[oa]|modern|beautiful|elegant|minimalist|intuitive|friendly|sophisticated|sleek)(?![\p{L}])/giu;
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9& ]/g, '').trim();

export function lintDesignMd(md) {
  const errors = [];
  const warnings = [];
  const info = {};
  const { frontMatter, body } = splitFrontMatter(md);

  // --- Front matter -------------------------------------------------------
  let fm = {};
  if (!frontMatter) warnings.push('No YAML front matter: tokens cannot be checked by machine.');
  else {
    try { fm = parseYaml(frontMatter); } catch (e) { errors.push(`Invalid front matter: ${e.message}`); }
  }
  const colors = fm.colors ?? {};
  if (frontMatter && !fm.colors) errors.push('Front matter without a "colors" group.');
  if (frontMatter && !fm.typography) errors.push('Front matter without a "typography" group.');
  if (frontMatter && !fm.owner) warnings.push('No "owner": state who maintains the file.');
  if (frontMatter && !fm.updated) warnings.push('No "updated": record the date of the last review.');

  const fmPlaceholders = (frontMatter ?? '').split('\n').filter((l) => !/^\s*#/.test(l) && /<[^>]+>/.test(l));
  if (fmPlaceholders.length) errors.push(`Front matter with ${fmPlaceholders.length} unfilled placeholder(s), e.g. "${fmPlaceholders[0].trim()}"`);

  for (const [k, v] of Object.entries(colors)) {
    if (typeof v === 'string' && !v.startsWith('{') && !HEX.test(v) && !/<[^>]+>/.test(v)) errors.push(`colors.${k}: value "${v}" is not a valid hex.`);
  }

  // Resolves {group.key} references
  const lookup = (path) => path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), fm);
  const refs = [];
  const walk = (o, p) => {
    for (const [k, v] of Object.entries(o ?? {})) {
      if (v && typeof v === 'object') walk(v, `${p}.${k}`);
      else if (typeof v === 'string') for (const m of v.matchAll(/\{([^}]+)\}/g)) refs.push({ at: `${p}.${k}`.slice(1), ref: m[1] });
    }
  };
  walk(fm, '');
  for (const r of refs) if (lookup(r.ref) === undefined) errors.push(`Broken reference in ${r.at}: {${r.ref}}`);
  info.references = refs.length;

  // Components with a raw value instead of a reference
  for (const [name, def] of Object.entries(fm.components ?? {})) {
    for (const [prop, v] of Object.entries(def ?? {})) {
      if (/color/i.test(prop) && typeof v === 'string' && HEX.test(v)) warnings.push(`components.${name}.${prop} uses a raw color (${v}); reference {colors.*}.`);
    }
  }

  // --- Contrast ------------------------------------------------------------
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
  info.contrast_pairs = [];
  for (const [fg, bg, min] of pairs) {
    const a = resolveColor(colors[fg]), b = resolveColor(colors[bg]);
    if (!a || !b) continue;
    const ratio = +contrast(a, b).toFixed(2);
    info.contrast_pairs.push({ fg, bg, ratio, min, ok: ratio >= min });
    if (ratio < min) errors.push(`Insufficient contrast: ${fg} on ${bg} = ${ratio}:1 (minimum ${min}:1).`);
  }

  // --- Typography and spacing ---------------------------------------------
  const px = (v) => (typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN);
  const bodyType = fm.typography?.body;
  if (bodyType) {
    if (px(bodyType.fontSize) < 14) warnings.push(`typography.body.fontSize ${bodyType.fontSize} < 14px.`);
    if (Number(bodyType.lineHeight) < 1.4) warnings.push(`typography.body.lineHeight ${bodyType.lineHeight} < 1.4.`);
  } else if (fm.typography) warnings.push('typography without a "body" level.');
  for (const [k, v] of Object.entries(fm.spacing ?? {})) {
    const n = px(v);
    if (!Number.isNaN(n) && n % 4 !== 0 && n !== 2) warnings.push(`spacing.${k} = ${v} off the 4px grid.`);
  }

  // --- Body ----------------------------------------------------------------
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const hasSection = (aliases) => headings.find((h) => aliases.some((a) => norm(h) === norm(a)));
  info.sections = headings;
  for (const aliases of REQUIRED_SECTIONS) if (!hasSection(aliases)) errors.push(`Missing required section: "## ${aliases[0]}"`);
  for (const aliases of RECOMMENDED_SECTIONS) if (!hasSection(aliases)) warnings.push(`Missing recommended section: "## ${aliases[0]}"`);

  // Empty sections (comments only) and placeholders
  const sections = body.split(/^##\s+/m).slice(1);
  for (const s of sections) {
    const [title, ...rest] = s.split('\n');
    const content = rest.join('\n').replace(/<!--[\s\S]*?-->/g, '').trim();
    if (!content || /^(\*\*[^*]+\*\*\s*|-\s*<[^>]+>\s*)+$/.test(content)) errors.push(`Section "${title.trim()}" is empty.`);
  }
  const bodyNoComments = body.replace(/<!--[\s\S]*?-->/g, '').replace(/`[^`]*`/g, '');
  const ph = bodyNoComments.match(/<(?!\/?(?:br|kbd|abbr|code)\b)[a-zà-ú][^>]{1,60}>/gi);
  if (ph) errors.push(`Body with ${ph.length} unfilled placeholder(s), e.g. ${ph[0]}`);

  // Do's / Don'ts with at least 3 items each
  const dd = sections.find((s) => /do|faça/i.test(s.split('\n')[0]) && /don|não faça|evite/i.test(s.split('\n')[0]));
  if (dd) {
    const [dos, donts] = dd.split(/\*\*(?:Não faça|Evite|Don'?ts?)\*\*|^#{3,6}\s*(?:Não faça|Evite|Don'?ts?)\s*$/im);
    const count = (t) => (t ?? '').split('\n').filter((l) => /^\s*[-*]\s+\S/.test(l)).length;
    if (count(dos) < 3) warnings.push(`Do's with ${count(dos)} item(s); ≥ 3 recommended, drawn from real mistakes.`);
    if (donts === undefined) warnings.push('No "**Don\'t**" block found inside Do\'s and Don\'ts.');
    else if (count(donts) < 3) warnings.push(`Don'ts with ${count(donts)} item(s); ≥ 3 recommended.`);
  }

  // Vague adjectives with no criterion
  const vague = [...new Set((bodyNoComments.match(VAGUE) ?? []).map((w) => w.toLowerCase()))];
  if (vague.length) warnings.push(`Vague adjectives in the body (${vague.join(', ')}): replace them with observable criteria.`);

  return { ok: errors.length === 0, errors, warnings, info };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const file = a._[0] ?? 'DESIGN.md';
  const result = lintDesignMd(readFileSync(file, 'utf8'));
  if (a.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`DESIGN.md: ${file}`);
    for (const e of result.errors) console.log(`  ERROR   ${e}`);
    for (const w of result.warnings) console.log(`  WARNING ${w}`);
    const p = result.info.contrast_pairs ?? [];
    console.log(`\n  ${result.info.sections?.length ?? 0} sections · ${result.info.references ?? 0} references · ${p.filter((x) => x.ok).length}/${p.length} contrast pairs OK`);
    console.log(result.ok ? '  Objective gates: PASSED' : `  Objective gates: FAILED (${result.errors.length} error(s))`);
  }
  process.exit(result.ok ? 0 : 1);
}
