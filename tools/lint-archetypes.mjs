#!/usr/bin/env node
// Validates the screen archetype catalog (archetypes/<id>.md) and generates archetypes/index.json.
// Usage: node tools/lint-archetypes.mjs [--index] [--dir <folder>]
//   --index  rewrites archetypes/index.json from the cards (only when there are no errors)
//   --dir    alternative card folder (default: archetypes/)
// Contract: knowledge/foundations/ux-md.md, section "Screen Archetypes".
// Section names are English (canonical); the pt-BR names of DSX ≤ 0.8 are accepted per card.
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
/** Required body sections, in order: [canonical English name, accepted pt-BR name]. */
export const SECTION_ALIASES = [
  ['When to use', 'Quando usar'],
  ['Region map', 'Mapa de regiões'],
  ['What goes in each region', 'O que vai em cada região'],
  ['Actions', 'Ações'],
  ['States', 'Estados'],
  ['Variations', 'Variações'],
  ['Anti-patterns', 'Anti-padrões'],
  ['Checklist'],
];
/** Canonical (English) names of the required sections, in order. */
export const REQUIRED_SECTIONS = SECTION_ALIASES.map((a) => a[0]);
/** A decision sentence: IF … THEN (English) or SE … ENTÃO (legacy pt-BR). */
export const hasDecision = (text) => (/\bIF\b/.test(text) && /\bTHEN\b/.test(text)) || (/\bSE\b/.test(text) && /\bENTÃO\b/.test(text));
export const REGISTERS = ['operational', 'consumer', 'editorial', 'brand'];
export const POSITIONS = ['top-right', 'bottom-right', 'inline'];
export const RULES = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'F1', 'F2', 'F3', 'F4', 'F5',
  'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'S1', 'S2', 'S3', 'C1', 'C2', 'C3',
];
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Existing pattern ids (patterns/index.json). */
export function loadPatternIds(file = join(ROOT, 'patterns', 'index.json')) {
  return new Set(JSON.parse(readFileSync(file, 'utf8')).map((p) => p.id));
}

/** Parses a card from its text. `slug` is the file name without .md. */
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

/** Body of a `## Title` section (up to the next `## `). Any alias of the title is accepted (English or pt-BR). */
export function section(body, title) {
  const names = SECTION_ALIASES.find((a) => a.includes(title)) ?? [title];
  const lines = body.split('\n');
  const start = lines.findIndex((l) => /^##\s/.test(l) && names.includes(l.replace(/^##\s+/, '').trim()));
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start + 1, end).join('\n');
}

const asList = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]);

/** Validates a card; returns a list of error messages (empty = valid). */
export function lintCard(card, patternIds) {
  const errors = [];
  const e = (msg) => errors.push(`${card.file}: ${msg}`);
  if (card.parseError) { e(`invalid front matter: ${card.parseError}`); return errors; }
  if (!card.fm) { e('no front matter'); return errors; }
  const fm = card.fm;

  for (const k of REQUIRED_KEYS) if (fm[k] === undefined || fm[k] === '' || fm[k] === null) e(`missing required key: ${k}`);
  for (const k of LIST_KEYS) if (fm[k] !== undefined && !Array.isArray(fm[k])) e(`${k} must be a list ([a, b])`);
  for (const k of LIST_KEYS) if (Array.isArray(fm[k]) && fm[k].length === 0) e(`${k} cannot be an empty list`);
  if (fm.id && fm.id !== card.slug) e(`id "${fm.id}" differs from the file name "${card.slug}"`);
  if (fm.id && !ID_RE.test(fm.id)) e(`id "${fm.id}" is not kebab-case`);

  for (const r of asList(fm.register)) if (!REGISTERS.includes(r)) e(`register "${r}" outside the enum (${REGISTERS.join(' | ')})`);
  for (const k of ['regions', 'states', 'variations']) for (const v of asList(fm[k])) if (!ID_RE.test(String(v))) e(`${k}: "${v}" is not kebab-case`);
  for (const k of ['regions', 'states', 'variations', 'patterns', 'rules']) {
    const vals = asList(fm[k]);
    const dup = vals.filter((v, i) => vals.indexOf(v) !== i);
    if (dup.length) e(`${k} has a repeated item: ${[...new Set(dup)].join(', ')}`);
  }

  for (const p of asList(fm.patterns)) if (!patternIds.has(p)) e(`pattern not found in patterns/index.json: ${p}`);
  for (const r of asList(fm.rules)) if (!RULES.includes(r)) e(`rule "${r}" outside T1–T7/F1–F5/L1–L9/S1–S3/C1–C3`);
  if (Array.isArray(fm.variations) && fm.variations.length < 2) e(`variations needs at least 2 (has ${fm.variations.length})`);

  const ap = fm['primary-action'];
  if (ap !== undefined) {
    if (typeof ap !== 'object' || Array.isArray(ap) || ap === null) e('primary-action must be a map { region: x, position: y, max: n }');
    else {
      if (!ap.region) e('primary-action without region');
      else if (Array.isArray(fm.regions) && !fm.regions.includes(ap.region)) e(`primary-action.region "${ap.region}" is not in regions`);
      if (!POSITIONS.includes(ap.position)) e(`primary-action.position "${ap.position}" outside the enum (${POSITIONS.join(' | ')})`);
      if (!Number.isInteger(ap.max) || ap.max < 0) e(`primary-action.max must be an integer ≥ 0 (has "${ap.max}")`);
    }
  }
  for (const k of ['when-to-use', 'avoid-when', 'summary', 'title']) if (fm[k] !== undefined && typeof fm[k] !== 'string') e(`${k} must be text`);
  if (typeof fm['when-to-use'] === 'string' && !hasDecision(fm['when-to-use'])) e('when-to-use must be an IF … THEN … sentence');

  // Body
  const heads = [...card.body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const at = (aliases) => heads.findIndex((h) => aliases.includes(h));
  for (const aliases of SECTION_ALIASES) if (at(aliases) < 0) e(`missing section: ## ${aliases[0]}`);
  const order = SECTION_ALIASES.map(at).filter((i) => i >= 0);
  if (order.some((v, i) => i > 0 && v < order[i - 1])) e(`sections out of order (${REQUIRED_SECTIONS.join(' → ')})`);
  const whenToUse = section(card.body, 'When to use');
  if (whenToUse !== null && !hasDecision(whenToUse)) e('## When to use without an IF → THEN decision');
  const regionMap = section(card.body, 'Region map');
  if (regionMap !== null && !/```[\s\S]+?```/.test(regionMap)) e('## Region map without a diagram in a code block');
  const perRegion = section(card.body, 'What goes in each region');
  if (perRegion !== null) for (const r of asList(fm.regions)) if (!perRegion.includes(`**${r}**`)) e(`region "${r}" not described in ## What goes in each region (expected "**${r}**")`);
  const statesSection = section(card.body, 'States');
  if (statesSection !== null) for (const s of asList(fm.states)) if (!statesSection.includes(`**${s}**`)) e(`state "${s}" not described in ## States (expected "**${s}**")`);
  const variationsSection = section(card.body, 'Variations');
  if (variationsSection !== null) {
    const blocks = variationsSection.split(/^###\s+/m).slice(1);
    const byId = Object.fromEntries(blocks.map((b) => [b.split('\n')[0].trim().split(/\s+/)[0].replace(/`/g, ''), b]));
    for (const v of asList(fm.variations)) {
      const b = byId[v];
      if (!b) { e(`variation "${v}" without a "### ${v}" block in ## Variations`); continue; }
      if (!/\*\*(Favors|Favorece):\*\*/.test(b)) e(`variation "${v}" without a **Favors:** line`);
      if (!/\*\*(Worsens|Piora):\*\*/.test(b)) e(`variation "${v}" without a **Worsens:** line`);
    }
  }
  const checklist = section(card.body, 'Checklist');
  if (checklist !== null && !/^- \[ \]/m.test(checklist)) e('## Checklist without "- [ ]" items');
  if (/https?:\/\/|www\./i.test(card.raw)) e('contains a URL (archetypes do not link external sources; cite them by name)');
  return errors;
}

export function lintArchetypes(cards, patternIds) {
  const errors = cards.flatMap((c) => lintCard(c, patternIds));
  const ids = cards.map((c) => c.fm?.id).filter(Boolean);
  for (const id of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) errors.push(`repeated id in the catalog: ${id}`);
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
  for (const err of errors) console.log(`ERROR  ${err}`);
  console.log(`${cards.length} archetype(s) checked, ${errors.length} error(s).`);
  if (a.index) {
    if (errors.length) console.log('Index NOT generated: fix the errors first.');
    else {
      writeFileSync(join(dir, 'index.json'), JSON.stringify(buildIndex(cards), null, 2) + '\n');
      console.log(`Index generated: ${relative(ROOT, join(dir, 'index.json'))}`);
    }
  }
  process.exit(errors.length ? 1 : 0);
}
