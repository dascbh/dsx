#!/usr/bin/env node
// Valida o catálogo de arquétipos de tela (archetypes/<id>.md) e gera archetypes/index.json.
// Uso: node tools/lint-archetypes.mjs [--index] [--dir <pasta>]
//   --index  reescreve archetypes/index.json a partir dos cartões (só quando não há erro)
//   --dir    pasta alternativa de cartões (padrão: archetypes/)
// Contrato: knowledge/fundamentos/ux-md.md, seção "Arquétipos de tela".
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { parseArgs } from './lib/cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'archetypes');

export const REQUIRED_KEYS = ['id', 'title', 'summary', 'register', 'when-to-use', 'avoid-when', 'regions',
  'primary-action', 'states', 'patterns', 'variations', 'rules'];
export const LIST_KEYS = ['register', 'regions', 'states', 'patterns', 'variations', 'rules'];
export const REQUIRED_SECTIONS = ['Quando usar', 'Mapa de regiões', 'O que vai em cada região', 'Ações', 'Estados',
  'Variações', 'Anti-padrões', 'Checklist'];
export const REGISTERS = ['operational', 'consumer', 'editorial', 'brand'];
export const POSITIONS = ['top-right', 'bottom-right', 'inline'];
export const RULES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'F1', 'F2', 'F3', 'F4', 'F5'];
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Ids de padrão existentes (patterns/index.json). */
export function loadPatternIds(file = join(ROOT, 'patterns', 'index.json')) {
  return new Set(JSON.parse(readFileSync(file, 'utf8')).map((p) => p.id));
}

/** Lê um cartão a partir do texto. `slug` é o nome do arquivo sem .md. */
export function parseCard(text, slug, file = `${slug}.md`) {
  const { frontMatter, body } = splitFrontMatter(text);
  let fm = null, parseError = null;
  try { fm = frontMatter ? parseYaml(frontMatter) : null; } catch (e) { parseError = e.message; }
  return { file, slug, fm, body, parseError, raw: text };
}

export function loadArchetypes(dir = DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort().map((f) => {
    const file = join(dir, f);
    return parseCard(readFileSync(file, 'utf8'), basename(f, '.md'), relative(ROOT, file) || f);
  });
}

/** Corpo de uma seção `## Título` (até o próximo `## `). */
export function section(body, title) {
  const lines = body.split('\n');
  const start = lines.findIndex((l) => l.replace(/^##\s+/, '').trim() === title && /^##\s/.test(l));
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start + 1, end).join('\n');
}

const asList = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]);

/** Valida um cartão; devolve lista de mensagens de erro (vazia = válido). */
export function lintCard(card, patternIds) {
  const errors = [];
  const e = (msg) => errors.push(`${card.file}: ${msg}`);
  if (card.parseError) { e(`front matter inválido — ${card.parseError}`); return errors; }
  if (!card.fm) { e('sem front matter'); return errors; }
  const fm = card.fm;

  for (const k of REQUIRED_KEYS) if (fm[k] === undefined || fm[k] === '' || fm[k] === null) e(`chave obrigatória ausente: ${k}`);
  for (const k of LIST_KEYS) if (fm[k] !== undefined && !Array.isArray(fm[k])) e(`${k} deve ser lista ([a, b])`);
  for (const k of LIST_KEYS) if (Array.isArray(fm[k]) && fm[k].length === 0) e(`${k} não pode ser lista vazia`);
  if (fm.id && fm.id !== card.slug) e(`id "${fm.id}" difere do nome do arquivo "${card.slug}"`);
  if (fm.id && !ID_RE.test(fm.id)) e(`id "${fm.id}" não é kebab-case`);

  for (const r of asList(fm.register)) if (!REGISTERS.includes(r)) e(`register "${r}" fora do enum (${REGISTERS.join(' | ')})`);
  for (const k of ['regions', 'states', 'variations']) for (const v of asList(fm[k])) if (!ID_RE.test(String(v))) e(`${k}: "${v}" não é kebab-case`);
  for (const k of ['regions', 'states', 'variations', 'patterns', 'rules']) {
    const vals = asList(fm[k]);
    const dup = vals.filter((v, i) => vals.indexOf(v) !== i);
    if (dup.length) e(`${k} com item repetido: ${[...new Set(dup)].join(', ')}`);
  }

  for (const p of asList(fm.patterns)) if (!patternIds.has(p)) e(`padrão inexistente em patterns/index.json: ${p}`);
  for (const r of asList(fm.rules)) if (!RULES.includes(r)) e(`regra "${r}" fora de T1–T7/F1–F5`);
  if (Array.isArray(fm.variations) && fm.variations.length < 2) e(`variations precisa de ao menos 2 (tem ${fm.variations.length})`);

  const ap = fm['primary-action'];
  if (ap !== undefined) {
    if (typeof ap !== 'object' || Array.isArray(ap) || ap === null) e('primary-action deve ser mapa { region: x, position: y, max: n }');
    else {
      if (!ap.region) e('primary-action sem region');
      else if (Array.isArray(fm.regions) && !fm.regions.includes(ap.region)) e(`primary-action.region "${ap.region}" não está em regions`);
      if (!POSITIONS.includes(ap.position)) e(`primary-action.position "${ap.position}" fora do enum (${POSITIONS.join(' | ')})`);
      if (!Number.isInteger(ap.max) || ap.max < 0) e(`primary-action.max deve ser inteiro ≥ 0 (tem "${ap.max}")`);
    }
  }
  for (const k of ['when-to-use', 'avoid-when', 'summary', 'title']) if (fm[k] !== undefined && typeof fm[k] !== 'string') e(`${k} deve ser texto`);
  if (typeof fm['when-to-use'] === 'string' && !(/\bSE\b/.test(fm['when-to-use']) && /\bENTÃO\b/.test(fm['when-to-use']))) e('when-to-use deve ser frase SE … ENTÃO …');

  // Corpo
  const heads = [...card.body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  for (const s of REQUIRED_SECTIONS) if (!heads.includes(s)) e(`seção ausente: ## ${s}`);
  const order = REQUIRED_SECTIONS.map((s) => heads.indexOf(s)).filter((i) => i >= 0);
  if (order.some((v, i) => i > 0 && v < order[i - 1])) e(`seções fora da ordem (${REQUIRED_SECTIONS.join(' → ')})`);
  const whenToUse = section(card.body, 'Quando usar');
  if (whenToUse !== null && !(/\bSE\b/.test(whenToUse) && /\bENTÃO\b/.test(whenToUse))) e('## Quando usar sem decisão SE → ENTÃO');
  const regionMap = section(card.body, 'Mapa de regiões');
  if (regionMap !== null && !/```[\s\S]+?```/.test(regionMap)) e('## Mapa de regiões sem diagrama em bloco de código');
  const perRegion = section(card.body, 'O que vai em cada região');
  if (perRegion !== null) for (const r of asList(fm.regions)) if (!perRegion.includes(`**${r}**`)) e(`região "${r}" não descrita em ## O que vai em cada região (esperado "**${r}**")`);
  const statesSection = section(card.body, 'Estados');
  if (statesSection !== null) for (const s of asList(fm.states)) if (!statesSection.includes(`**${s}**`)) e(`estado "${s}" não descrito em ## Estados (esperado "**${s}**")`);
  const variationsSection = section(card.body, 'Variações');
  if (variationsSection !== null) {
    const blocks = variationsSection.split(/^###\s+/m).slice(1);
    const byId = Object.fromEntries(blocks.map((b) => [b.split('\n')[0].trim().split(/\s+/)[0].replace(/`/g, ''), b]));
    for (const v of asList(fm.variations)) {
      const b = byId[v];
      if (!b) { e(`variação "${v}" sem bloco "### ${v}" em ## Variações`); continue; }
      if (!/\*\*Favorece:\*\*/.test(b)) e(`variação "${v}" sem linha **Favorece:**`);
      if (!/\*\*Piora:\*\*/.test(b)) e(`variação "${v}" sem linha **Piora:**`);
    }
  }
  const checklist = section(card.body, 'Checklist');
  if (checklist !== null && !/^- \[ \]/m.test(checklist)) e('## Checklist sem itens "- [ ]"');
  if (/https?:\/\/|www\./i.test(card.raw)) e('contém URL (arquétipos não linkam fontes externas; cite pelo nome)');
  return errors;
}

export function lintArchetypes(cards, patternIds) {
  const errors = cards.flatMap((c) => lintCard(c, patternIds));
  const ids = cards.map((c) => c.fm?.id).filter(Boolean);
  for (const id of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) errors.push(`id repetido no catálogo: ${id}`);
  return errors;
}

export function buildIndex(cards) {
  return cards.filter((c) => c.fm).map((c) => ({
    id: c.fm.id, title: c.fm.title, summary: c.fm.summary, register: c.fm.register, regions: c.fm.regions,
    primary_action: c.fm['primary-action'], states: c.fm.states, patterns: c.fm.patterns, variations: c.fm.variations,
    rules: c.fm.rules, file: `archetypes/${c.slug}.md`,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const dir = a.dir ? join(process.cwd(), a.dir) : DIR;
  const cards = loadArchetypes(dir);
  const errors = lintArchetypes(cards, loadPatternIds());
  for (const err of errors) console.log(`ERRO  ${err}`);
  console.log(`${cards.length} arquétipo(s) verificado(s), ${errors.length} erro(s).`);
  if (a.index) {
    if (errors.length) console.log('Índice NÃO gerado: corrija os erros antes.');
    else {
      writeFileSync(join(dir, 'index.json'), JSON.stringify(buildIndex(cards), null, 2) + '\n');
      console.log(`Índice gerado: ${relative(ROOT, join(dir, 'index.json'))}`);
    }
  }
  process.exit(errors.length ? 1 : 0);
}
