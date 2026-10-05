#!/usr/bin/env node
// Validates a UX.md against the contract in knowledge/foundations/ux-md.md:
//  - front matter: known keys, types, enum values, required keys
//    (version, name, product.persona, product.register), unfilled placeholders;
//  - version is the document version (semver, e.g. 1.2.0); "alpha" (the format version, up to DSX 0.6) is accepted
//    with a warning; the format goes in `format: alpha`;
//  - deviations (declared deviations, which silence the findings they cover) and per-module glossary;
//  - old Portuguese names (produto, registro, acoes…) are accepted with the WARNING "old name, rename to X"
//    (single table in tools/ux-lint/lib/legacy.mjs);
//  - cited archetypes (front matter and body) exist in the `archetypes/` catalog (or, without the folder,
//    in the fixed list of DSX ids);
//  - body: the 13 sections in order (English names, canonical; the pt-BR names are accepted), empty sections,
//    placeholders, "Do's and Don'ts" with ≥ 3 items in each block, vague text.
// With --score, it also computes the 100-point rubric score (evals/rubrics/ux-md.yaml) and the objective gates;
// --map and --screens give the screen inventory (coverage) and, with git, the date of their last change (freshness).
// What a machine cannot measure (archetype fit, clarity) belongs to the ux-md skill (Mode C) and to the judge.
// Usage: node tools/lint-ux-md.mjs [path/UX.md] [--archetypes <folder>] [--json]
//        [--score [--map .dsx/maps/flows-<m>.json] [--screens <captures>] [--geometry <folder>]]
import { LAYOUT_DEFAULTS } from './ux-lint/lib/geometry.mjs';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { parseCli } from './lib/legacy-cli.mjs';
import { normalizeUxFrontMatter, ARCHETYPE_IDS } from './ux-lint/lib/legacy.mjs';
import { parseDeviations, bodyDeviationIds } from './ux-lint/lib/deviations.mjs';
import { isModuleGlossary, readGlossarySource, glossaryFromMarkdown } from './ux-lint/lib/glossary.mjs';
import { loadInventory, archetypeOf, entryMatches } from './ux-lint/lib/ux-inventory.mjs';
import { analyzeDrift } from './ux-lint/ux-md-drift.mjs';
import { KIT_IDS } from './ux-lint/lib/kits.mjs';
import { PATH_KEYS } from './ux-lint/lib/project-paths.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const ARCHETYPES = [
  'operational-list', 'master-detail', 'document-viewer', 'editor-with-panel',
  'step-wizard', 'monitoring-dashboard', 'library', 'settings',
  'public-decision-page', 'form-dialog', 'confirmation-dialog', 'detail-side-panel',
];

// Body sections, in order; first name = canonical (English), the others = accepted equivalents (pt-BR names of
// DSX ≤ 0.8 included).
export const SECTIONS = [
  ['Overview', 'Visão geral'],
  ['Personas & Tasks', 'Personas and Tasks', 'Personas e tarefas'],
  ['Information Architecture', 'Arquitetura da informação'],
  ['Navigation', 'Navegação'],
  ['Screen Archetypes', 'Arquétipos de tela'],
  ['Layout & Regions', 'Layout and Regions', 'Layout e regiões'],
  ['Actions', 'Ações'],
  ['Feedback & States', 'Feedback and States', 'Feedback e estados'],
  ['Forms', 'Formulários'],
  ['Content & Microcopy', 'Content and Microcopy', 'Conteúdo e microcopy'],
  ['Flows', 'Fluxos'],
  ["Do's and Don'ts", 'Dos and Donts', 'Faça e não faça'],
  ['Agent Instructions', 'Instruções para agentes'],
];

// Types: 'str' | 'int' | 'bool' | 'list' | string[] (enum) | object (nested group).
const STR = 'str', INT = 'int', BOOL = 'bool', LIST = 'list', ARCH = 'archetypes', NUM = 'num', MAP = 'map', DEV = 'deviations', GLOSSARY = 'glossary';
export const SCHEMA = {
  version: STR, format: ['alpha'], name: STR, description: STR, owner: STR, updated: STR,
  product: {
    persona: STR,
    register: ['operational', 'consumer', 'editorial', 'brand'],
    platform: ['desktop', 'mobile', 'both'],
    density: ['low', 'medium', 'high'],
  },
  navigation: { model: STR, 'max-depth': INT, back: STR },
  archetypes: ARCH,
  actions: {
    'primary-per-region': INT,
    'primary-position': ['top-right', 'bottom-right', 'inline'],
    'dialog-order': ['cancel-action', 'action-cancel'],
    'destructive-specific-label': BOOL,
  },
  confirmation: { irreversible: ['dialog', 'type-name'], reversible: ['undo', 'none'] },
  feedback: { success: ['toast', 'inline', 'page'], 'field-error': STR, 'system-error': STR, 'skeleton-after-ms': INT },
  states: LIST,
  forms: {
    label: STR,
    validation: ['on-blur', 'on-submit', 'realtime'],
    required: ['mark-required', 'mark-optional'],
  },
  // language: the product-text language the text detectors judge (tools/ux-lint/lib/lang/); omitted = pt-BR.
  content: { glossary: GLOSSARY, buttons: STR, forbidden: LIST, 'proper-nouns': LIST, language: ['pt-BR', 'en'] },
  flows: { 'max-journey-steps': INT, 'max-stacked-dialogs': INT, 'dead-ends': INT },
  layout: Object.fromEntries(Object.keys(LAYOUT_DEFAULTS).map((k) => [k, NUM])),
  verification: {
    kit: KIT_IDS,
    selectors: { regions: LIST, dialog: STR, 'dialog-footer': STR, primary: STR, destructive: STR, button: STR, field: STR, 'archetype-regions': MAP },
  },
  deviations: DEV,
  // Project paths (tools/ux-lint/lib/project-paths.mjs, docs/project-paths.md); `<module>` is replaced by the module.
  paths: Object.fromEntries(PATH_KEYS.map((k) => [k, k === 'code' ? LIST : STR])),
};

/** Document version: MAJOR.MINOR.PATCH (policy or archetype changed → minor; text only → patch). */
export const SEMVER = /^\d+\.\d+\.\d+$/;

const BASE_STATES = ['loading', 'empty', 'error', 'no-access', 'success'];
// pt-BR and English (the UX.md may be in either)
const VAGUE = /\b(intuitive|user-friendly|seamless(?:ly)?|easy to use|when possible|if needed|as needed|intuitiv[oa]s?|amigáve(?:l|is)|moderno|moderna|clean|limp[oa]|simples de usar|fácil de usar|f[aá]cil|agradáve(?:l|is)|elegante|fluid[oa]|sem atrito|quando possível|se necessário|quando necessário|adequad[oa]s?|apropriad[oa]s?|etc\.?)(?![\wà-ú])/gi;

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^\d+[.)]?\s*/, '').replace(/[^a-z0-9& ]/g, '').replace(/\s+/g, ' ').trim();
const kindOf = (v) => (Array.isArray(v) ? 'list' : v === null ? 'empty' : typeof v === 'object' ? 'group' : typeof v);

function validateGroup(obj, schema, prefix, errors, warnings) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    const def = schema[k];
    if (def === undefined) { warnings.push(`Unknown key: ${path} (outside the contract; ux-lint will ignore it).`); continue; }
    if (def === ARCH || def === DEV) continue; // validated separately
    if (def === GLOSSARY) {
      if (typeof v === 'string') continue;
      if (kindOf(v) !== 'group') { errors.push(`${path}: expected a path, "inline", a term → synonyms map or a per-module map { default: …, <module>: … }.`); continue; }
      if (isModuleGlossary(v)) for (const [m, src] of Object.entries(v)) {
        if (typeof src !== 'string' && kindOf(src) !== 'group') errors.push(`${path}.${m}: expected a path, "inline" or a term → synonyms map.`);
      }
      continue;
    }
    if (def === MAP) { if (kindOf(v) !== 'group') errors.push(`${path}: expected a region → selector map.`); continue; }
    if (def === NUM) { if (!Number.isFinite(Number(v)) || Number(v) < 0) errors.push(`${path}: expected a number ≥ 0, got "${v}".`); continue; }
    if (Array.isArray(def)) {
      if (!def.includes(v)) errors.push(`${path}: invalid value "${v}"; use one of: ${def.join(' | ')}.`);
    } else if (typeof def === 'object') {
      if (kindOf(v) !== 'group') errors.push(`${path}: expected a group of keys, got ${kindOf(v)}.`);
      else validateGroup(v, def, path, errors, warnings);
    } else if (def === INT) {
      if (!Number.isInteger(v) || v < 0) errors.push(`${path}: expected an integer ≥ 0, got "${v}".`);
    } else if (def === BOOL) {
      if (typeof v !== 'boolean') errors.push(`${path}: expected true or false, got "${v}".`);
    } else if (def === LIST) {
      if (!Array.isArray(v)) errors.push(`${path}: expected a list [a, b], got ${kindOf(v)}.`);
    } else if (def === STR) {
      if (typeof v !== 'string' && typeof v !== 'number') errors.push(`${path}: expected text, got ${kindOf(v)}.`);
    }
  }
}

/**
 * Status of an archetype id: 'ok' (the card exists, or a fixed id when there is no folder),
 * 'no-card' (fixed DSX id whose card is not yet in the folder) or 'unknown'.
 */
function archetypeStatus(id, dir) {
  const hasDir = dir && existsSync(dir);
  if (hasDir && existsSync(join(dir, `${id}.md`))) return 'ok';
  if (ARCHETYPES.includes(id)) return hasDir ? 'no-card' : 'ok';
  return 'unknown';
}

/** Splits the body into `##` sections (outside code blocks), with their starting line. */
function bodySections(body, firstLine) {
  const out = [];
  let inCode = false;
  body.split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) inCode = !inCode;
    const m = !inCode && line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m) out.push({ title: m[1].trim(), line: firstLine + i, lines: [] });
    else if (out.length) out.at(-1).lines.push(line);
  });
  return out;
}

const stripComments = (t) => t.replace(/<!--[\s\S]*?-->/g, '');
const stripCode = (t) => t.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
const countItems = (lines) => lines.filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(l)).length;

/** Splits the "Do's and Don'ts" section into Do / Don't blocks (### subheading or bold line; pt-BR names accepted). */
function doDontBlocks(lines) {
  const blocks = { do: null, dont: null };
  let current = null;
  for (const l of stripComments(lines.join('\n')).split('\n')) {
    const t = l.trim().replace(/^#{3,6}\s+/, '').replace(/^\*\*(.+?)\*\*:?\s*$/, '$1');
    const heading = /^#{3,6}\s+/.test(l.trim()) || /^\*\*.+\*\*:?\s*$/.test(l.trim());
    if (heading) {
      const n = norm(t);
      if (/^(nao faca|nao faco|evite|donts?|dont|do not)\b/.test(n)) { current = 'dont'; blocks.dont = []; continue; }
      if (/^(faca|do|dos)\b/.test(n)) { current = 'do'; blocks.do = []; continue; }
      current = null;
      continue;
    }
    if (current) blocks[current].push(l);
  }
  return blocks;
}

export function lintUxMd(md, { archetypesDir = join(ROOT, 'archetypes') } = {}) {
  const errors = [];
  const warnings = [];
  const info = { archetypes: {}, sections: [], deviations: [] };
  const { frontMatter, body, bodyStartLine } = splitFrontMatter(md.replace(/\r\n/g, '\n'));

  // --- Front matter -------------------------------------------------------
  let fm = {};
  if (!frontMatter) errors.push('No YAML front matter (--- ... ---): the decisions cannot be checked by machine.');
  else {
    try { fm = parseYaml(frontMatter); } catch (e) { errors.push(`Invalid front matter: ${e.message}`); }
    // `<module>` in `paths` is a path variable (docs/project-paths.md), not a placeholder
    const ph = frontMatter.split('\n').filter((l) => /<[^>]+>/.test(l.replace(/\s+#.*$/, '').replace(/^\s*#.*$/, '').replace(/<module>/g, '')));
    if (ph.length) errors.push(`Front matter with ${ph.length} unfilled placeholder(s), e.g. "${ph[0].trim()}"`);
    // Old names (2026-10 transition): converted, with a warning.
    const legacy = normalizeUxFrontMatter(fm);
    fm = legacy.frontMatter;
    for (const w of legacy.warnings) warnings.push(`${w[0].toUpperCase()}${w.slice(1)}.`);
  }
  if (frontMatter) {
    if (!fm.version) errors.push('Missing required key: version (document version, e.g. 1.0.0).');
    else if (fm.version === 'alpha') warnings.push('version "alpha" is the format version (up to DSX 0.6); version is now the version of this document in semver (e.g. 1.0.0) and the format goes in "format: alpha".');
    else if (!SEMVER.test(String(fm.version))) errors.push(`version "${fm.version}": use semver MAJOR.MINOR.PATCH (policy or archetype changed → bump the minor; text only → patch).`);
    if (!fm.name) errors.push('Missing required key: name.');
    if (!fm.product?.persona) errors.push('Missing required key: product.persona (who uses it and what for).');
    if (!fm.product?.register) errors.push('Missing required key: product.register (operational | consumer | editorial | brand).');
    if (!fm.owner) warnings.push('No "owner": state who maintains the file.');
    if (!fm.updated) warnings.push('No "updated": record the date of the last review (YYYY-MM-DD).');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fm.updated))) warnings.push(`updated "${fm.updated}" is not in the YYYY-MM-DD format.`);
    validateGroup(fm, SCHEMA, '', errors, warnings);
    const dev = parseDeviations(fm.deviations);
    errors.push(...dev.errors);
    warnings.push(...dev.warnings);
    info.deviations = dev.deviations.map((d) => d.id);

    if (Array.isArray(fm.states)) {
      const missing = BASE_STATES.filter((e) => !fm.states.includes(e));
      if (missing.length) warnings.push(`states without ${missing.join(', ')}: every screen should implement the five base states.`);
    }
    if (!fm.verification?.selectors) warnings.push('No verification.selectors: ux-lint will use the default selectors, which may not recognize the project kit.');
    if (!fm.archetypes || !Object.keys(fm.archetypes).length) warnings.push('No "archetypes": no screen is mapped to a screen type.');
  }

  // --- Archetypes ---------------------------------------------------------
  const arch = fm.archetypes && kindOf(fm.archetypes) === 'group' ? fm.archetypes : {};
  if (fm.archetypes !== undefined && kindOf(fm.archetypes) !== 'group') errors.push('archetypes: expected a group <archetype-id>: [routes].');
  for (const [id, routes] of Object.entries(arch)) {
    const st = archetypeStatus(id, archetypesDir);
    if (st === 'unknown') errors.push(`archetypes.${id}: archetype not in the catalog (valid ids: ${ARCHETYPES.join(', ')}).`);
    if (st === 'no-card') warnings.push(`archetypes.${id}: DSX id without a card in archetypes/${id}.md; the arrangement has no reference until the card exists.`);
    if (!Array.isArray(routes)) errors.push(`archetypes.${id}: expected a list of routes/screens, e.g. ["/orders"].`);
    else if (!routes.length) warnings.push(`archetypes.${id}: empty list; remove the key or map the screens.`);
    info.archetypes[id] = Array.isArray(routes) ? routes.length : 0;
  }
  const seenRoutes = new Map();
  for (const [id, routes] of Object.entries(arch)) for (const r of Array.isArray(routes) ? routes : []) {
    if (seenRoutes.has(r)) warnings.push(`Route "${r}" mapped to two archetypes (${seenRoutes.get(r)} and ${id}); pick one or declare the deviation in section 5.`);
    else seenRoutes.set(r, id);
  }
  const cleanBody = stripComments(body);
  for (const m of cleanBody.matchAll(/(archetypes|arquetipos)\/([a-z0-9-]+)\.md/g)) {
    const id = m[1] === 'arquetipos' ? ARCHETYPE_IDS[m[2]] ?? m[2] : m[2];
    if (m[1] === 'arquetipos') warnings.push(`The body cites the old path ${m[0]}; rename it to archetypes/${id}.md.`);
    if (archetypeStatus(id, archetypesDir) === 'unknown') errors.push(`The body cites archetypes/${id}.md, which is not in the catalog.`);
  }

  // --- Sections -----------------------------------------------------------
  const sections = bodySections(body, bodyStartLine);
  info.sections = sections.map((s) => s.title);
  const indexOf = (s) => SECTIONS.findIndex((aliases) => aliases.some((a) => norm(a) === norm(s.title)));
  const found = sections.map((s) => ({ ...s, idx: indexOf(s) })).filter((s) => s.idx >= 0);
  SECTIONS.forEach((aliases, i) => {
    if (!found.some((s) => s.idx === i)) errors.push(`Missing required section: "## ${aliases[0]}" (${i + 1} of 13).`);
  });
  for (let i = 1; i < found.length; i++) {
    if (found[i].idx < found[i - 1].idx) errors.push(`Section out of order: "## ${found[i].title}" (line ${found[i].line}) should come before "## ${found[i - 1].title}".`);
  }
  for (const s of found) {
    const content = stripComments(s.lines.join('\n')).trim();
    if (!content) errors.push(`Section "${s.title}" (line ${s.line}) is empty or only has a comment.`);
  }

  // Section 5 must mention every archetype of the front matter
  const sec5 = found.find((s) => s.idx === 4);
  if (sec5) for (const id of Object.keys(arch)) {
    if (!sec5.lines.join('\n').includes(id)) warnings.push(`Archetype "${id}" is in the front matter but does not appear in the "Screen Archetypes" section.`);
  }

  // Deviations: the body table (D1, D2…) and the front matter `deviations` block talk about the same ids
  const bodyDevs = bodyDeviationIds(cleanBody);
  info.body_deviations = bodyDevs;
  if (frontMatter) {
    const fmDevs = new Set(info.deviations);
    const onlyBody = bodyDevs.filter((d) => !fmDevs.has(d));
    const onlyFm = info.deviations.filter((d) => d && !bodyDevs.includes(d));
    if (onlyBody.length) warnings.push(`Deviation(s) ${onlyBody.join(', ')} only in the body: declare them in "deviations" (screens, rules, reason, decided-by) so ux-lint accepts the findings they cover.`);
    if (onlyFm.length) warnings.push(`Deviation(s) ${onlyFm.join(', ')} only in the front matter: add the row to the deviations table of the "Screen Archetypes" section.`);
  }

  // Do's and Don'ts
  const sec12 = found.find((s) => s.idx === 11);
  if (sec12) {
    const { do: doBlock, dont } = doDontBlocks(sec12.lines);
    if (!doBlock) errors.push('"Do\'s and Don\'ts" without the "Do" block (### Do subheading or **Do** line).');
    else if (countItems(doBlock) < 3) errors.push(`"Do" block with ${countItems(doBlock)} item(s); minimum 3, drawn from real problems.`);
    if (!dont) errors.push('"Do\'s and Don\'ts" without the "Don\'t" block (### Don\'t subheading or **Don\'t** line).');
    else if (countItems(dont) < 3) errors.push(`"Don't" block with ${countItems(dont)} item(s); minimum 3, drawn from real problems.`);
  }

  // Placeholders and vague text in the body
  const bodyText = stripCode(cleanBody);
  const ph = bodyText.match(/<(?!\/?(?:br|kbd|abbr|code|details|summary)\b)[a-zà-ú][^>\n]{0,60}>/gi);
  if (ph) errors.push(`Body with ${ph.length} unfilled placeholder(s), e.g. ${ph[0]}`);
  const vague = [];
  bodyText.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(VAGUE)) vague.push(`${m[0]} (line ${bodyStartLine + i})`);
  });
  if (vague.length) warnings.push(`Vague text in the body: ${vague.slice(0, 6).join(', ')}${vague.length > 6 ? ` and ${vague.length - 6} more` : ''}. Replace it with an observable criterion (quantity, position, limit).`);

  return { ok: errors.length === 0, errors, warnings, info };
}


// ---------------------------------------------------------------- score (--score)
// 100-point rubric of the UX.md (evals/rubrics/ux-md.yaml), computed from the file alone and, when available, the
// screen inventory (flow map and captures) and the drift. Open criteria (does the archetype fit the task? is the
// policy what the product does?) belong to the judge and human review: they enter as judgment gates, with no points here.
// `name` is the English label; `name_pt` is kept as a legacy alias (same value) for readers of DSX ≤ 0.8 output.

export const SCORE_CRITERIA = [
  { id: 'screen-coverage', name: "Screen coverage by archetype", weight: 20 },
  { id: 'policies-with-evidence', name: "Declared policies with evidence", weight: 15 },
  { id: 'declared-states', name: "States declared and described", weight: 10 },
  { id: 'flow-limits', name: "Flows with justified limits", weight: 10 },
  { id: 'glossary', name: "Resolvable glossary", weight: 10 },
  { id: 'dos-donts', name: "Concrete Do's and Don'ts", weight: 10 },
  { id: 'verification-selectors', name: "Verification selectors", weight: 10 },
  { id: 'freshness', name: "Freshness (version, updated, screens)", weight: 10 },
  { id: 'declared-deviations', name: "Structured deviations", weight: 5 },
].map((c) => ({ ...c, name_pt: c.name }));
export const BANDS = [
  { id: 'robust', min: 90, name: 'robust' },
  { id: 'usable-with-gaps', min: 75, name: 'usable with gaps' },
  { id: 'review-before-use', min: 60, name: 'review before it becomes the authority' },
  { id: 'high-risk', min: 0, name: 'high risk (the agent will invent behavior)' },
].map((b) => ({ ...b, name_pt: b.name }));
export const POLICY_KEYS = [
  'navigation.model', 'navigation.max-depth', 'navigation.back',
  'actions.primary-per-region', 'actions.primary-position', 'actions.dialog-order', 'actions.destructive-specific-label',
  'confirmation.irreversible', 'confirmation.reversible',
  'feedback.success', 'feedback.field-error', 'feedback.system-error',
  'forms.label', 'forms.validation', 'forms.required',
];
const STATE_WORDS = {
  loading: /carregando|loading|esqueleto|skeleton/i, empty: /\bvazio|\bempty/i, error: /\berro\b|\berror/i,
  'no-access': /sem acesso|no-access|no access|permiss/i, success: /sucesso|success/i,
};
const CODE_REF = /[\w@./-]+\.(?:tsx?|jsx?|mjs|cjs|py|vue|svelte|css|html)(?::\d+(?:-\d+)?)/g;
const AGENT_FILES = ['CLAUDE.md', 'AGENTS.md', '.github/copilot-instructions.md'];
const round1 = (n) => Math.round(n * 10) / 10;
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const get = (o, path) => path.split('.').reduce((x, k) => (x && typeof x === 'object' ? x[k] : undefined), o);

function patternIds() {
  try { return new Set(JSON.parse(readFileSync(join(ROOT, 'patterns', 'index.json'), 'utf8')).map((p) => p.id)); } catch { return new Set(); }
}

/** Agent context files of the project that cite the UX.md. */
export function agentConnections(projectRoot) {
  if (!projectRoot) return null;
  const files = [...AGENT_FILES];
  const rules = join(projectRoot, '.cursor', 'rules');
  if (existsSync(rules)) for (const f of readdirSync(rules)) files.push(join('.cursor', 'rules', f));
  return files.filter((f) => { try { return /UX\.md/.test(readFileSync(join(projectRoot, f), 'utf8')); } catch { return false; } });
}

/**
 * Score of the UX.md. `md` is the text; options: `uxPath` (resolves the glossary and looks for CLAUDE.md/AGENTS.md
 * next to it), `map`/`screens`/`geometry` (inventory and drift), `now`, `lastChange` (injects the screens' last change;
 * tests), `archetypesDir`. Returns { score, band, band_name, band_pt, criteria: [{ id, name, name_pt, weight, points,
 * evidence }], gates, ok, lint, drift } (`band_pt`/`name_pt` = legacy aliases of `band_name`/`name`).
 */
export function scoreUxMd(md, { uxPath = null, map = null, screens = null, geometry = null, now = new Date(), lastChange, archetypesDir, projectRoot } = {}) {
  const text = md.replace(/\r\n/g, '\n');
  const lint = lintUxMd(text, archetypesDir ? { archetypesDir } : {});
  const { frontMatter, body, bodyStartLine } = splitFrontMatter(text);
  let fm = {};
  try { fm = frontMatter ? normalizeUxFrontMatter(parseYaml(frontMatter)).frontMatter : {}; } catch { fm = {}; }
  const sections = bodySections(stripComments(body), bodyStartLine).map((s) => ({ ...s, idx: SECTIONS.findIndex((al) => al.some((a) => norm(a) === norm(s.title))) }));
  const sec = (i) => sections.find((s) => s.idx === i)?.lines.join('\n') ?? '';
  const cleanBody = stripComments(body);
  const dev = parseDeviations(fm.deviations);
  const inv = loadInventory({ map, screens });
  const hasInventory = inv.has_map || inv.has_captures;
  const criteria = [];
  const put = (id, fraction, evidence) => {
    const c = SCORE_CRITERIA.find((x) => x.id === id);
    criteria.push({ id, name: c.name, name_pt: c.name, weight: c.weight, points: round1(c.weight * clamp01(fraction)), evidence });
  };

  // 1. Coverage
  const arch = fm.archetypes && typeof fm.archetypes === 'object' && !Array.isArray(fm.archetypes) ? fm.archetypes : {};
  const entries = Object.values(arch).flatMap((v) => [].concat(v ?? []));
  if (hasInventory && inv.screens.size) {
    const all = [...inv.screens.values()];
    const covered = all.filter((s) => archetypeOf(s, arch) || dev.deviations.some((d) => d.screens.some((x) => x === '*' || x === s.id)));
    const mapScreens = all.filter((s) => s.in_map);
    const matched = inv.has_map && entries.length ? entries.filter((e) => mapScreens.some((s) => entryMatches(e, s))).length / entries.length : 1;
    put('screen-coverage', (covered.length / all.length) * matched,
      `${covered.length}/${all.length} inventory screens with an archetype or deviation${inv.has_map ? `; ${Math.round(matched * 100)}% of the archetypes entries name a map screen` : ''}`);
  } else {
    const sec5 = sec(4);
    const mentioned = Object.keys(arch).filter((id) => sec5.includes(id)).length;
    const f = !Object.keys(arch).length ? 0 : mentioned === Object.keys(arch).length ? 0.5 : 0.25;
    put('screen-coverage', f, `no map or captures: coverage cannot be checked (50% at most); ${Object.keys(arch).length} archetype(s), ${entries.length} screen(s) in the front matter`);
  }

  // 2. Policies with evidence
  const declared = POLICY_KEYS.filter((k) => get(fm, k) !== undefined && get(fm, k) !== null && get(fm, k) !== '');
  const refs = new Set([...stripCode(cleanBody).matchAll(CODE_REF), ...cleanBody.matchAll(CODE_REF)].map((m) => m[0]));
  const pats = patternIds();
  const citedPatterns = new Set([...cleanBody.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`|patterns\/[a-z-]+\/([a-z0-9-]+)\.md/g)].map((m) => m[1] ?? m[2]).filter((id) => pats.has(id)));
  const evidence = refs.size + citedPatterns.size;
  put('policies-with-evidence', 0.5 * (declared.length / POLICY_KEYS.length) + 0.5 * Math.min(1, evidence / 15),
    `${declared.length}/${POLICY_KEYS.length} policies in the front matter; ${refs.size} file:line reference(s) and ${citedPatterns.size} pattern(s) cited (15 pieces of evidence = full score)`);

  // 3. States
  const states = Array.isArray(fm.states) ? fm.states.map(String) : [];
  const base = BASE_STATES.filter((st) => states.includes(st)).length;
  const sec8 = sec(7);
  const described = Object.values(STATE_WORDS).filter((re) => re.test(sec8)).length;
  put('declared-states', 0.5 * (base / 5) + 0.5 * (described / 5), `${base}/5 base states in states; ${described}/5 described in the "Feedback & States" section`);

  // 4. Flows with limits
  const flowKeys = ['max-journey-steps', 'max-stacked-dialogs', 'dead-ends'].filter((k) => Number.isInteger(fm.flows?.[k]));
  const sec11 = sec(10);
  const rows = sec11.split('\n').filter((l) => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]+\|\s*$/.test(l)).length - 1;
  const journeys = Math.max(rows, countItems(sec11.split('\n')));
  const NUMBER_WORDS = { 0: /\b(nenhum|nenhuma|zero|no|none)\b/i, 1: /\b(um|uma|único|única|one|single)\b/i, 2: /\b(dois|duas|two)\b/i };
  const justified = flowKeys.filter((k) => new RegExp(`(?<![\\d.])${fm.flows[k]}(?![\\d.])`).test(sec11) || NUMBER_WORDS[fm.flows[k]]?.test(sec11)).length;
  put('flow-limits', 0.4 * (flowKeys.length / 3) + 0.3 * (journeys >= 2 ? 1 : journeys / 2) + 0.3 * (flowKeys.length ? justified / flowKeys.length : 0),
    `${flowKeys.length}/3 limits in flows; ${Math.max(0, journeys)} journey(s) in the "Flows" section; ${justified}/${flowKeys.length || 0} limit(s) cited and justified in the text`);

  // 5. Glossary
  const g = fm.content?.glossary;
  const sources = !g ? [] : isModuleGlossary(g) ? Object.entries(g) : [[null, g]];
  const glossaryNotes = [];
  const parts = sources.map(([mod, src]) => {
    const label = mod ? `${mod}: ` : '';
    let terms = [];
    let resolvable = 0;
    if (src && typeof src === 'object') { terms = readGlossarySource(src); resolvable = 1; }
    else if (src === 'inline') { terms = glossaryFromMarkdown(body); resolvable = terms.length ? 1 : 0; }
    else if (typeof src === 'string' && uxPath) { resolvable = existsSync(resolve(dirname(uxPath), src)) ? 1 : 0; terms = resolvable ? readGlossarySource(src, uxPath) : []; }
    else if (typeof src === 'string') resolvable = 0.5;
    glossaryNotes.push(`${label}${typeof src === 'string' ? src : 'map'} (${resolvable === 1 ? `${terms.length} term(s) with "avoid"` : resolvable ? 'path not checked without the file' : 'does not resolve'})`);
    return 0.3 + 0.3 * resolvable + 0.4 * Math.min(1, terms.length / 8);
  });
  put('glossary', parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0,
    parts.length ? `content.glossary → ${glossaryNotes.join('; ')} (8 terms with "never call it" = full score)` : 'no content.glossary');

  // 6. Do's and Don'ts
  const { do: doBlock, dont } = doDontBlocks(sections.find((s) => s.idx === 11)?.lines ?? []);
  const items = [...(doBlock ?? []), ...(dont ?? [])].filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(l));
  const concrete = items.filter((l) => /`[^`]+`|\d|["“][^"”]+["”]|\.(?:tsx?|jsx?|py|md)\b/.test(l)).length;
  const enough = doBlock && dont && countItems(doBlock) >= 3 && countItems(dont) >= 3;
  put('dos-donts', (enough ? 0.4 : 0) + 0.6 * (items.length ? concrete / items.length : 0),
    `${countItems(doBlock ?? [])} "Do" and ${countItems(dont ?? [])} "Don't"; ${concrete}/${items.length} with a concrete anchor (screen, file, number or exact label)`);

  // 7. Selectors
  const sel = fm.verification?.selectors ?? {};
  // a declared kit (verification.kit, other than `auto`) provides primary and destructive (tools/ux-lint/lib/kits.mjs)
  const kitDeclared = KIT_IDS.includes(fm.verification?.kit) && fm.verification.kit !== 'auto';
  const selKeys = ['regions', 'dialog', 'primary', 'destructive', 'button', 'field'].filter((k) => (sel[k] !== undefined && sel[k] !== '') || (kitDeclared && (k === 'primary' || k === 'destructive')));
  const extra = sel['dialog-footer'] || sel['archetype-regions'] ? 1 : 0;
  put('verification-selectors', 0.8 * (selKeys.length / 6) + 0.2 * extra,
    `${selKeys.length}/6 basic selectors${extra ? '; with dialog-footer or archetype-regions' : '; without dialog-footer or archetype-regions'}`);

  // 8. Freshness
  const semver = SEMVER.test(String(fm.version ?? ''));
  const updated = /^\d{4}-\d{2}-\d{2}$/.test(String(fm.updated ?? '')) ? String(fm.updated) : null;
  const today = (now instanceof Date ? now : new Date(now)).toISOString().slice(0, 10);
  const age = updated ? Math.round((Date.parse(today) - Date.parse(updated)) / 86400000) : null;
  let ageFactor = age === null ? 0 : age <= 90 ? 1 : age >= 365 ? 0 : 1 - (age - 90) / 275;
  let drift = null;
  if (hasInventory) drift = analyzeDrift(text, { map: inv.map, screens: inv.screens_dir, geometry, root: projectRoot ?? (uxPath ? dirname(uxPath) : null), now, lastChange, archetypesDir });
  const behind = drift?.findings.find((f) => f.rule === 'U5');
  if (behind) ageFactor = 0;
  put('freshness', (semver ? 0.3 : 0) + (updated ? 0.2 : 0) + 0.5 * ageFactor,
    `version ${fm.version ?? '(missing)'}${semver ? '' : ' (not semver)'}; updated ${updated ?? '(missing)'}${age !== null ? ` (${age} day(s))` : ''}${behind ? `; screens changed on ${drift.summary.last_change.date}, after updated` : ''}`);

  // 9. Structured deviations
  const bodyDevs = bodyDeviationIds(cleanBody);
  const fmDevs = dev.deviations.map((d) => d.id).filter(Boolean);
  const union = new Set([...bodyDevs, ...fmDevs]);
  const both = bodyDevs.filter((d) => fmDevs.includes(d)).length;
  const withRules = dev.deviations.filter((d) => d.rules.length).length;
  const devFraction = !union.size ? 1 : both / union.size;
  put('declared-deviations', devFraction, !union.size ? 'no deviation in the body or the front matter' : `${bodyDevs.length} deviation(s) in the body, ${fmDevs.length} in deviations (${both} in both; ${withRules} with rules, which silence findings)`);

  // Gates
  const projRoot = projectRoot ?? (uxPath ? dirname(resolve(uxPath)) : null);
  const conn = agentConnections(projRoot);
  const uncovered = drift ? drift.summary.uncovered : null;
  const policyDrift = drift ? drift.findings.filter((f) => f.rule === 'U3') : null;
  const gates = [
    { id: 'lint', evaluator: 'code', ok: lint.ok, detail: lint.ok ? '0 errors in lint-ux-md' : `${lint.errors.length} error(s) in lint-ux-md` },
    { id: 'essential-coverage', evaluator: 'code', ok: uncovered ? uncovered.length === 0 : null,
      detail: uncovered ? (uncovered.length ? `${uncovered.length} screen(s) without an archetype or deviation: ${uncovered.slice(0, 5).join(', ')}` : 'every inventory screen has an archetype or deviation') : 'not checked (pass --map and/or --screens)' },
    { id: 'policy-fidelity', evaluator: policyDrift ? 'code+human' : 'human', ok: policyDrift ? policyDrift.length === 0 : null,
      detail: policyDrift ? (policyDrift.length ? policyDrift.map((f) => `${f.policy} (${f.archetype})`).join('; ') + ': most screens do not follow it' : 'no policy contradicted by most measured screens; sample 5 screens for the rest') : 'sample 5 screens: are the front matter policies what the product does?' },
    { id: 'connected-to-agent', evaluator: 'code', ok: conn ? conn.length > 0 : null,
      detail: conn ? (conn.length ? `cited in ${conn.join(', ')}` : 'no CLAUDE.md/AGENTS.md/tool rule cites the UX.md') : 'not checked (no project path)' },
    { id: 'no-conflict', evaluator: 'judge', ok: null, detail: 'judge: no tool rule, DESIGN.md or product doc contradicts the UX.md' },
  ];
  const score = round1(criteria.reduce((sum, c) => sum + c.points, 0));
  const band = BANDS.find((b) => score >= b.min);
  return { score, band: band.id, band_name: band.name, band_pt: band.name, criteria, gates, ok: gates.every((x) => x.ok !== false), lint, drift: drift ? { findings: drift.findings, summary: drift.summary } : null };
}

const GATE_LABEL = { lint: 'lint', 'essential-coverage': 'coverage', 'policy-fidelity': 'policy fidelity', 'connected-to-agent': 'connected to the agent', 'no-conflict': 'no conflict' };
const mark = (ok) => (ok === true ? '✔' : ok === false ? '✘' : '?');

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseCli('lint-ux-md.mjs');
  // `--score` takes no value; if the parser swallowed the path as its value, give it back to the positionals.
  if (typeof a.score === 'string') { a._.unshift(a.score); a.score = true; }
  const file = a._[0] ?? 'UX.md';
  if (!existsSync(file)) { console.error(`File not found: ${file}`); process.exit(2); }
  const opts = typeof a.archetypes === 'string' ? { archetypesDir: a.archetypes } : {};
  const md = readFileSync(file, 'utf8');
  if (a.score) {
    const str = (v) => (typeof v === 'string' ? resolve(v) : null);
    const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
    const r = scoreUxMd(md, { ...opts, uxPath: file, map: str(a.map), screens: str(a.screens), geometry: str(a.geometry), now });
    if (a.json) console.log(JSON.stringify(r, null, 2));
    else {
      console.log(`UX.md: ${file}`);
      for (const e of r.lint.errors) console.log(`  ERROR   ${e}`);
      console.log(`\n  Gates: ${r.gates.map((g) => `${GATE_LABEL[g.id] ?? g.id} ${mark(g.ok)}`).join(' · ')}`);
      for (const g of r.gates.filter((x) => x.ok !== true)) console.log(`    ${GATE_LABEL[g.id] ?? g.id} (${g.evaluator}): ${g.detail}`);
      console.log(`\n  Score: ${r.score}/100 (${r.band_name})`);
      for (const c of r.criteria) console.log(`    ${c.name.padEnd(38)} ${String(c.points).padStart(4)}/${c.weight} — ${c.evidence}`);
      if (r.drift?.findings.length) {
        console.log(`\n  Drift (${r.drift.findings.length}):`);
        for (const f of r.drift.findings) console.log(`    ${f.rule} ${f.message}`);
      }
      console.log(r.ok ? '\n  Objective gates: PASSED' : '\n  Objective gates: FAILED (gate with ✘)');
    }
    process.exit(r.ok ? 0 : 1);
  }
  const result = lintUxMd(md, opts);
  if (a.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`UX.md: ${file}`);
    for (const e of result.errors) console.log(`  ERROR   ${e}`);
    for (const w of result.warnings) console.log(`  WARNING ${w}`);
    const screens = Object.values(result.info.archetypes).reduce((s, n) => s + n, 0);
    console.log(`\n  ${result.info.sections.length} sections · ${Object.keys(result.info.archetypes).length} archetypes · ${screens} screens mapped`);
    console.log(result.ok ? '  Objective gates: PASSED' : `  Objective gates: FAILED (${result.errors.length} error(s))`);
  }
  process.exit(result.ok ? 0 : 1);
}
