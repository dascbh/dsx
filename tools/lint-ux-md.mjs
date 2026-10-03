#!/usr/bin/env node
// Valida um UX.md contra o contrato de knowledge/fundamentos/ux-md.md:
//  - front matter: chaves conhecidas, tipos, valores dos enums, obrigatórios
//    (version, name, product.persona, product.register), placeholders não preenchidos;
//  - version é a versão do documento (semver, ex.: 1.2.0); "alpha" (versão do formato, até o DSX 0.6) é aceito
//    com aviso — o formato vai em `format: alpha`;
//  - deviations (desvios declarados, que silenciam achados cobertos) e glossário por módulo;
//  - nomes antigos em português (produto, registro, acoes…) são aceitos com AVISO "nome antigo, renomeie para X"
//    (tabela única em tools/ux-lint/lib/legacy.mjs);
//  - arquétipos citados (front matter e corpo) existem no catálogo `archetypes/` (ou, sem a pasta,
//    na lista fixa de ids do DSX);
//  - corpo: as 13 seções na ordem (pt-BR ou equivalente em inglês), seções vazias, placeholders,
//    "Faça e não faça" com ≥ 3 itens em cada bloco, texto vago.
// Com --score, calcula também a nota de 100 pontos da rubrica (evals/rubrics/ux-md.yaml) e os gates objetivos;
// --map e --screens dão o inventário de telas (cobertura) e, com git, a data da última mudança delas (frescor).
// O que a máquina não mede (adequação do arquétipo, clareza) fica com a skill ux-md (Modo C) e com o juiz.
// Uso: node tools/lint-ux-md.mjs [caminho/UX.md] [--archetypes <pasta>] [--json]
//        [--score [--map .dsx/maps/flows-<m>.json] [--screens <capturas>] [--geometry <pasta>]]
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const ARCHETYPES = [
  'operational-list', 'master-detail', 'document-viewer', 'editor-with-panel',
  'step-wizard', 'monitoring-dashboard', 'library', 'settings',
  'public-decision-page', 'form-dialog', 'confirmation-dialog', 'detail-side-panel',
];

// Seções do corpo, na ordem; primeiro nome = canônico (pt-BR), demais = equivalentes aceitos.
export const SECTIONS = [
  ['Visão geral', 'Overview'],
  ['Personas e tarefas', 'Personas & Tasks', 'Personas and Tasks'],
  ['Arquitetura da informação', 'Information Architecture'],
  ['Navegação', 'Navigation'],
  ['Arquétipos de tela', 'Screen Archetypes'],
  ['Layout e regiões', 'Layout & Regions', 'Layout and Regions'],
  ['Ações', 'Actions'],
  ['Feedback e estados', 'Feedback & States', 'Feedback and States'],
  ['Formulários', 'Forms'],
  ['Conteúdo e microcopy', 'Content & Microcopy', 'Content and Microcopy'],
  ['Fluxos', 'Flows'],
  ['Faça e não faça', "Do's and Don'ts", 'Dos and Donts'],
  ['Instruções para agentes', 'Agent Instructions'],
];

// Tipos: 'str' | 'int' | 'bool' | 'list' | string[] (enum) | objeto (grupo aninhado).
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
  content: { glossary: GLOSSARY, buttons: STR, forbidden: LIST, 'proper-nouns': LIST },
  flows: { 'max-journey-steps': INT, 'max-stacked-dialogs': INT, 'dead-ends': INT },
  layout: Object.fromEntries(Object.keys(LAYOUT_DEFAULTS).map((k) => [k, NUM])),
  verification: {
    selectors: { regions: LIST, dialog: STR, 'dialog-footer': STR, primary: STR, destructive: STR, button: STR, field: STR, 'archetype-regions': MAP },
  },
  deviations: DEV,
};

/** Versão do documento: MAJOR.MINOR.PATCH (mudou política ou arquétipo → menor; só texto → patch). */
export const SEMVER = /^\d+\.\d+\.\d+$/;

const BASE_STATES = ['loading', 'empty', 'error', 'no-access', 'success'];
const VAGUE = /\b(intuitiv[oa]s?|amigáve(?:l|is)|moderno|moderna|clean|limp[oa]|simples de usar|fácil de usar|f[aá]cil|agradáve(?:l|is)|elegante|fluid[oa]|sem atrito|quando possível|se necessário|quando necessário|adequad[oa]s?|apropriad[oa]s?|etc\.?)(?![\wà-ú])/gi;

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^\d+[.)]?\s*/, '').replace(/[^a-z0-9& ]/g, '').replace(/\s+/g, ' ').trim();
const kindOf = (v) => (Array.isArray(v) ? 'lista' : v === null ? 'vazio' : typeof v === 'object' ? 'grupo' : typeof v);

function validateGroup(obj, schema, prefix, errors, warnings) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    const def = schema[k];
    if (def === undefined) { warnings.push(`Chave desconhecida: ${path} (fora do contrato; será ignorada pelo ux-lint).`); continue; }
    if (def === ARCH || def === DEV) continue; // validados à parte
    if (def === GLOSSARY) {
      if (typeof v === 'string') continue;
      if (kindOf(v) !== 'grupo') { errors.push(`${path}: esperado caminho, "inline", mapa termo → sinônimos ou mapa por módulo { default: …, <módulo>: … }.`); continue; }
      if (isModuleGlossary(v)) for (const [m, src] of Object.entries(v)) {
        if (typeof src !== 'string' && kindOf(src) !== 'grupo') errors.push(`${path}.${m}: esperado caminho, "inline" ou mapa termo → sinônimos.`);
      }
      continue;
    }
    if (def === MAP) { if (kindOf(v) !== 'grupo') errors.push(`${path}: esperado mapa região → seletor.`); continue; }
    if (def === NUM) { if (!Number.isFinite(Number(v)) || Number(v) < 0) errors.push(`${path}: esperado número ≥ 0, veio "${v}".`); continue; }
    if (Array.isArray(def)) {
      if (!def.includes(v)) errors.push(`${path}: valor "${v}" inválido; use um de: ${def.join(' | ')}.`);
    } else if (typeof def === 'object') {
      if (kindOf(v) !== 'grupo') errors.push(`${path}: esperado grupo de chaves, veio ${kindOf(v)}.`);
      else validateGroup(v, def, path, errors, warnings);
    } else if (def === INT) {
      if (!Number.isInteger(v) || v < 0) errors.push(`${path}: esperado inteiro ≥ 0, veio "${v}".`);
    } else if (def === BOOL) {
      if (typeof v !== 'boolean') errors.push(`${path}: esperado true ou false, veio "${v}".`);
    } else if (def === LIST) {
      if (!Array.isArray(v)) errors.push(`${path}: esperado lista [a, b], veio ${kindOf(v)}.`);
    } else if (def === STR) {
      if (typeof v !== 'string' && typeof v !== 'number') errors.push(`${path}: esperado texto, veio ${kindOf(v)}.`);
    }
  }
}

/**
 * Situação de um id de arquétipo: 'ok' (cartão existe, ou id fixo quando não há pasta),
 * 'no-card' (id fixo do DSX cujo cartão ainda não foi escrito na pasta) ou 'unknown'.
 */
function archetypeStatus(id, dir) {
  const hasDir = dir && existsSync(dir);
  if (hasDir && existsSync(join(dir, `${id}.md`))) return 'ok';
  if (ARCHETYPES.includes(id)) return hasDir ? 'no-card' : 'ok';
  return 'unknown';
}

/** Separa o corpo em seções `##` (fora de blocos de código), com linha inicial. */
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

/** Divide a seção "Faça e não faça" em blocos Faça / Não faça (subtítulo ### ou linha em negrito). */
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
  if (!frontMatter) errors.push('Sem front matter YAML (--- ... ---): as decisões não são verificáveis por máquina.');
  else {
    try { fm = parseYaml(frontMatter); } catch (e) { errors.push(`Front matter inválido: ${e.message}`); }
    const ph = frontMatter.split('\n').filter((l) => /<[^>]+>/.test(l.replace(/\s+#.*$/, '').replace(/^\s*#.*$/, '')));
    if (ph.length) errors.push(`Front matter com ${ph.length} placeholder(s) não preenchido(s), ex.: "${ph[0].trim()}"`);
    // Nomes antigos (transição de 2026-10): converte e avisa.
    const legacy = normalizeUxFrontMatter(fm);
    fm = legacy.frontMatter;
    for (const w of legacy.warnings) warnings.push(`${w[0].toUpperCase()}${w.slice(1)}.`);
  }
  if (frontMatter) {
    if (!fm.version) errors.push('Obrigatório ausente: version (versão do documento, ex.: 1.0.0).');
    else if (fm.version === 'alpha') warnings.push('version "alpha" é a versão do formato (até o DSX 0.6); agora version é a versão deste documento em semver (ex.: 1.0.0) e o formato vai em "format: alpha".');
    else if (!SEMVER.test(String(fm.version))) errors.push(`version "${fm.version}": use semver MAJOR.MINOR.PATCH (mudou política ou arquétipo → sobe o menor; só texto → patch).`);
    if (!fm.name) errors.push('Obrigatório ausente: name.');
    if (!fm.product?.persona) errors.push('Obrigatório ausente: product.persona (quem usa e para quê).');
    if (!fm.product?.register) errors.push('Obrigatório ausente: product.register (operational | consumer | editorial | brand).');
    if (!fm.owner) warnings.push('Sem "owner": defina quem mantém o arquivo.');
    if (!fm.updated) warnings.push('Sem "updated": registre a data da última revisão (AAAA-MM-DD).');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fm.updated))) warnings.push(`updated "${fm.updated}" fora do formato AAAA-MM-DD.`);
    validateGroup(fm, SCHEMA, '', errors, warnings);
    const dev = parseDeviations(fm.deviations);
    errors.push(...dev.errors);
    warnings.push(...dev.warnings);
    info.deviations = dev.deviations.map((d) => d.id);

    if (Array.isArray(fm.states)) {
      const missing = BASE_STATES.filter((e) => !fm.states.includes(e));
      if (missing.length) warnings.push(`states sem ${missing.join(', ')}: toda tela deveria implementar os cinco estados base.`);
    }
    if (!fm.verification?.selectors) warnings.push('Sem verification.selectors: o ux-lint vai usar os seletores padrão, que podem não reconhecer o kit do projeto.');
    if (!fm.archetypes || !Object.keys(fm.archetypes).length) warnings.push('Sem "archetypes": nenhuma tela está mapeada a um tipo de tela.');
  }

  // --- Arquétipos ---------------------------------------------------------
  const arch = fm.archetypes && kindOf(fm.archetypes) === 'grupo' ? fm.archetypes : {};
  if (fm.archetypes !== undefined && kindOf(fm.archetypes) !== 'grupo') errors.push('archetypes: esperado grupo <id-do-arquetipo>: [rotas].');
  for (const [id, routes] of Object.entries(arch)) {
    const st = archetypeStatus(id, archetypesDir);
    if (st === 'unknown') errors.push(`archetypes.${id}: arquétipo inexistente no catálogo (ids válidos: ${ARCHETYPES.join(', ')}).`);
    if (st === 'no-card') warnings.push(`archetypes.${id}: id do DSX sem cartão em archetypes/${id}.md; o arranjo não tem referência até o cartão existir.`);
    if (!Array.isArray(routes)) errors.push(`archetypes.${id}: esperado lista de rotas/telas, ex.: ["/contratos"].`);
    else if (!routes.length) warnings.push(`archetypes.${id}: lista vazia; remova a chave ou mapeie as telas.`);
    info.archetypes[id] = Array.isArray(routes) ? routes.length : 0;
  }
  const seenRoutes = new Map();
  for (const [id, routes] of Object.entries(arch)) for (const r of Array.isArray(routes) ? routes : []) {
    if (seenRoutes.has(r)) warnings.push(`Rota "${r}" mapeada a dois arquétipos (${seenRoutes.get(r)} e ${id}); escolha um ou declare o desvio na seção 5.`);
    else seenRoutes.set(r, id);
  }
  const cleanBody = stripComments(body);
  for (const m of cleanBody.matchAll(/(archetypes|arquetipos)\/([a-z0-9-]+)\.md/g)) {
    const id = m[1] === 'arquetipos' ? ARCHETYPE_IDS[m[2]] ?? m[2] : m[2];
    if (m[1] === 'arquetipos') warnings.push(`Corpo cita o caminho antigo ${m[0]}; renomeie para archetypes/${id}.md.`);
    if (archetypeStatus(id, archetypesDir) === 'unknown') errors.push(`Corpo cita archetypes/${id}.md, que não existe no catálogo.`);
  }

  // --- Seções -------------------------------------------------------------
  const sections = bodySections(body, bodyStartLine);
  info.sections = sections.map((s) => s.title);
  const indexOf = (s) => SECTIONS.findIndex((aliases) => aliases.some((a) => norm(a) === norm(s.title)));
  const found = sections.map((s) => ({ ...s, idx: indexOf(s) })).filter((s) => s.idx >= 0);
  SECTIONS.forEach((aliases, i) => {
    if (!found.some((s) => s.idx === i)) errors.push(`Seção obrigatória ausente: "## ${aliases[0]}" (${i + 1}ª de 13).`);
  });
  for (let i = 1; i < found.length; i++) {
    if (found[i].idx < found[i - 1].idx) errors.push(`Seção fora de ordem: "## ${found[i].title}" (linha ${found[i].line}) deveria vir antes de "## ${found[i - 1].title}".`);
  }
  for (const s of found) {
    const content = stripComments(s.lines.join('\n')).trim();
    if (!content) errors.push(`Seção "${s.title}" (linha ${s.line}) está vazia ou só tem comentário.`);
  }

  // Seção 5 deve mencionar cada arquétipo do front matter
  const sec5 = found.find((s) => s.idx === 4);
  if (sec5) for (const id of Object.keys(arch)) {
    if (!sec5.lines.join('\n').includes(id)) warnings.push(`Arquétipo "${id}" está no front matter mas não aparece na seção "Arquétipos de tela".`);
  }

  // Desvios: a tabela do corpo (D1, D2…) e o bloco `deviations` do front matter falam dos mesmos ids
  const bodyDevs = bodyDeviationIds(cleanBody);
  info.body_deviations = bodyDevs;
  if (frontMatter) {
    const fmDevs = new Set(info.deviations);
    const onlyBody = bodyDevs.filter((d) => !fmDevs.has(d));
    const onlyFm = info.deviations.filter((d) => d && !bodyDevs.includes(d));
    if (onlyBody.length) warnings.push(`Desvio(s) ${onlyBody.join(', ')} só no corpo: declare em "deviations" (screens, rules, reason, decided-by) para o ux-lint aceitar os achados cobertos.`);
    if (onlyFm.length) warnings.push(`Desvio(s) ${onlyFm.join(', ')} só no front matter: acrescente a linha na tabela de desvios da seção "Arquétipos de tela".`);
  }

  // Faça e não faça
  const sec12 = found.find((s) => s.idx === 11);
  if (sec12) {
    const { do: doBlock, dont } = doDontBlocks(sec12.lines);
    if (!doBlock) errors.push('"Faça e não faça" sem o bloco "Faça" (subtítulo ### Faça ou linha **Faça**).');
    else if (countItems(doBlock) < 3) errors.push(`Bloco "Faça" com ${countItems(doBlock)} item(ns); mínimo 3, derivados de problemas reais.`);
    if (!dont) errors.push('"Faça e não faça" sem o bloco "Não faça" (subtítulo ### Não faça ou linha **Não faça**).');
    else if (countItems(dont) < 3) errors.push(`Bloco "Não faça" com ${countItems(dont)} item(ns); mínimo 3, derivados de problemas reais.`);
  }

  // Placeholders e texto vago no corpo
  const bodyText = stripCode(cleanBody);
  const ph = bodyText.match(/<(?!\/?(?:br|kbd|abbr|code|details|summary)\b)[a-zà-ú][^>\n]{0,60}>/gi);
  if (ph) errors.push(`Corpo com ${ph.length} placeholder(s) não preenchido(s), ex.: ${ph[0]}`);
  const vague = [];
  bodyText.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(VAGUE)) vague.push(`${m[0]} (linha ${bodyStartLine + i})`);
  });
  if (vague.length) warnings.push(`Texto vago no corpo: ${vague.slice(0, 6).join(', ')}${vague.length > 6 ? ` e mais ${vague.length - 6}` : ''}. Troque por critério observável (quantidade, posição, limite).`);

  return { ok: errors.length === 0, errors, warnings, info };
}


// ---------------------------------------------------------------- nota (--score)
// Rubrica de 100 pontos do UX.md (evals/rubrics/ux-md.yaml), calculada só com o arquivo e, quando há, o inventário
// de telas (mapa de fluxo e capturas) e o drift. Critérios abertos (o arquétipo casa com a tarefa? a política é o
// que o produto faz?) ficam com o juiz e a revisão humana — entram como gates de julgamento, sem pontos aqui.

export const SCORE_CRITERIA = [
  { id: 'screen-coverage', name_pt: 'Cobertura de telas com arquétipo', weight: 20 },
  { id: 'policies-with-evidence', name_pt: 'Políticas declaradas com evidência', weight: 15 },
  { id: 'declared-states', name_pt: 'Estados declarados e descritos', weight: 10 },
  { id: 'flow-limits', name_pt: 'Fluxos com limites justificados', weight: 10 },
  { id: 'glossary', name_pt: 'Glossário resolvível', weight: 10 },
  { id: 'dos-donts', name_pt: 'Faça e não faça concretos', weight: 10 },
  { id: 'verification-selectors', name_pt: 'Seletores de verificação', weight: 10 },
  { id: 'freshness', name_pt: 'Frescor (version, updated, telas)', weight: 10 },
  { id: 'declared-deviations', name_pt: 'Desvios estruturados', weight: 5 },
];
export const BANDS = [
  { id: 'robust', min: 90, name_pt: 'robusto' },
  { id: 'usable-with-gaps', min: 75, name_pt: 'utilizável com lacunas' },
  { id: 'review-before-use', min: 60, name_pt: 'revisar antes de virar autoridade' },
  { id: 'high-risk', min: 0, name_pt: 'alto risco (o agente vai inventar comportamento)' },
];
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

/** Arquivos de contexto de agente do projeto que citam o UX.md. */
export function agentConnections(projectRoot) {
  if (!projectRoot) return null;
  const files = [...AGENT_FILES];
  const rules = join(projectRoot, '.cursor', 'rules');
  if (existsSync(rules)) for (const f of readdirSync(rules)) files.push(join('.cursor', 'rules', f));
  return files.filter((f) => { try { return /UX\.md/.test(readFileSync(join(projectRoot, f), 'utf8')); } catch { return false; } });
}

/**
 * Nota do UX.md. `md` é o texto; opções: `uxPath` (resolve glossário e procura CLAUDE.md/AGENTS.md ao lado),
 * `map`/`screens`/`geometry` (inventário e drift), `now`, `lastChange` (injeta a última mudança das telas; testes),
 * `archetypesDir`. Devolve { score, band, criteria: [{ id, name_pt, weight, points, evidence }], gates, ok, lint, drift }.
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
    criteria.push({ id, name_pt: c.name_pt, weight: c.weight, points: round1(c.weight * clamp01(fraction)), evidence });
  };

  // 1. Cobertura
  const arch = fm.archetypes && typeof fm.archetypes === 'object' && !Array.isArray(fm.archetypes) ? fm.archetypes : {};
  const entries = Object.values(arch).flatMap((v) => [].concat(v ?? []));
  if (hasInventory && inv.screens.size) {
    const all = [...inv.screens.values()];
    const covered = all.filter((s) => archetypeOf(s, arch) || dev.deviations.some((d) => d.screens.some((x) => x === '*' || x === s.id)));
    const mapScreens = all.filter((s) => s.in_map);
    const matched = inv.has_map && entries.length ? entries.filter((e) => mapScreens.some((s) => entryMatches(e, s))).length / entries.length : 1;
    put('screen-coverage', (covered.length / all.length) * matched,
      `${covered.length}/${all.length} telas do inventário com arquétipo ou desvio${inv.has_map ? `; ${Math.round(matched * 100)}% das entradas de archetypes nomeiam tela do mapa` : ''}`);
  } else {
    const sec5 = sec(4);
    const mentioned = Object.keys(arch).filter((id) => sec5.includes(id)).length;
    const f = !Object.keys(arch).length ? 0 : mentioned === Object.keys(arch).length ? 0.5 : 0.25;
    put('screen-coverage', f, `sem mapa nem capturas: cobertura não verificável (máximo 50%); ${Object.keys(arch).length} arquétipo(s), ${entries.length} tela(s) no front matter`);
  }

  // 2. Políticas com evidência
  const declared = POLICY_KEYS.filter((k) => get(fm, k) !== undefined && get(fm, k) !== null && get(fm, k) !== '');
  const refs = new Set([...stripCode(cleanBody).matchAll(CODE_REF), ...cleanBody.matchAll(CODE_REF)].map((m) => m[0]));
  const pats = patternIds();
  const citedPatterns = new Set([...cleanBody.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`|patterns\/[a-z-]+\/([a-z0-9-]+)\.md/g)].map((m) => m[1] ?? m[2]).filter((id) => pats.has(id)));
  const evidence = refs.size + citedPatterns.size;
  put('policies-with-evidence', 0.5 * (declared.length / POLICY_KEYS.length) + 0.5 * Math.min(1, evidence / 15),
    `${declared.length}/${POLICY_KEYS.length} políticas no front matter; ${refs.size} referência(s) arquivo:linha e ${citedPatterns.size} padrão(ões) citado(s) (15 evidências = pontuação cheia)`);

  // 3. Estados
  const states = Array.isArray(fm.states) ? fm.states.map(String) : [];
  const base = BASE_STATES.filter((st) => states.includes(st)).length;
  const sec8 = sec(7);
  const described = Object.values(STATE_WORDS).filter((re) => re.test(sec8)).length;
  put('declared-states', 0.5 * (base / 5) + 0.5 * (described / 5), `${base}/5 estados base em states; ${described}/5 descritos na seção "Feedback e estados"`);

  // 4. Fluxos com limites
  const flowKeys = ['max-journey-steps', 'max-stacked-dialogs', 'dead-ends'].filter((k) => Number.isInteger(fm.flows?.[k]));
  const sec11 = sec(10);
  const rows = sec11.split('\n').filter((l) => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]+\|\s*$/.test(l)).length - 1;
  const journeys = Math.max(rows, countItems(sec11.split('\n')));
  const NUMBER_WORDS = { 0: /\b(nenhum|nenhuma|zero)\b/i, 1: /\b(um|uma|único|única)\b/i, 2: /\b(dois|duas)\b/i };
  const justified = flowKeys.filter((k) => new RegExp(`(?<![\\d.])${fm.flows[k]}(?![\\d.])`).test(sec11) || NUMBER_WORDS[fm.flows[k]]?.test(sec11)).length;
  put('flow-limits', 0.4 * (flowKeys.length / 3) + 0.3 * (journeys >= 2 ? 1 : journeys / 2) + 0.3 * (flowKeys.length ? justified / flowKeys.length : 0),
    `${flowKeys.length}/3 limites em flows; ${Math.max(0, journeys)} jornada(s) na seção "Fluxos"; ${justified}/${flowKeys.length || 0} limite(s) citado(s) e justificado(s) no texto`);

  // 5. Glossário
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
    glossaryNotes.push(`${label}${typeof src === 'string' ? src : 'mapa'} (${resolvable === 1 ? `${terms.length} termo(s) com "evitar"` : resolvable ? 'caminho não conferido sem o arquivo' : 'não resolve'})`);
    return 0.3 + 0.3 * resolvable + 0.4 * Math.min(1, terms.length / 8);
  });
  put('glossary', parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0,
    parts.length ? `content.glossary → ${glossaryNotes.join('; ')} (8 termos com "nunca chamar de" = pontuação cheia)` : 'sem content.glossary');

  // 6. Faça e não faça
  const { do: doBlock, dont } = doDontBlocks(sections.find((s) => s.idx === 11)?.lines ?? []);
  const items = [...(doBlock ?? []), ...(dont ?? [])].filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(l));
  const concrete = items.filter((l) => /`[^`]+`|\d|["“][^"”]+["”]|\.(?:tsx?|jsx?|py|md)\b/.test(l)).length;
  const enough = doBlock && dont && countItems(doBlock) >= 3 && countItems(dont) >= 3;
  put('dos-donts', (enough ? 0.4 : 0) + 0.6 * (items.length ? concrete / items.length : 0),
    `${countItems(doBlock ?? [])} "Faça" e ${countItems(dont ?? [])} "Não faça"; ${concrete}/${items.length} com âncora concreta (tela, arquivo, número ou rótulo exato)`);

  // 7. Seletores
  const sel = fm.verification?.selectors ?? {};
  const selKeys = ['regions', 'dialog', 'primary', 'destructive', 'button', 'field'].filter((k) => sel[k] !== undefined && sel[k] !== '');
  const extra = sel['dialog-footer'] || sel['archetype-regions'] ? 1 : 0;
  put('verification-selectors', 0.8 * (selKeys.length / 6) + 0.2 * extra,
    `${selKeys.length}/6 seletores básicos${extra ? '; com dialog-footer ou archetype-regions' : '; sem dialog-footer nem archetype-regions'}`);

  // 8. Frescor
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
    `version ${fm.version ?? '(ausente)'}${semver ? '' : ' (não é semver)'}; updated ${updated ?? '(ausente)'}${age !== null ? ` (${age} dia(s))` : ''}${behind ? `; telas mudaram em ${drift.summary.last_change.date}, depois do updated` : ''}`);

  // 9. Desvios estruturados
  const bodyDevs = bodyDeviationIds(cleanBody);
  const fmDevs = dev.deviations.map((d) => d.id).filter(Boolean);
  const union = new Set([...bodyDevs, ...fmDevs]);
  const both = bodyDevs.filter((d) => fmDevs.includes(d)).length;
  const withRules = dev.deviations.filter((d) => d.rules.length).length;
  const devFraction = !union.size ? 1 : both / union.size;
  put('declared-deviations', devFraction, !union.size ? 'nenhum desvio no corpo nem no front matter' : `${bodyDevs.length} desvio(s) no corpo, ${fmDevs.length} em deviations (${both} nos dois; ${withRules} com rules, que silenciam achados)`);

  // Gates
  const projRoot = projectRoot ?? (uxPath ? dirname(resolve(uxPath)) : null);
  const conn = agentConnections(projRoot);
  const uncovered = drift ? drift.summary.uncovered : null;
  const policyDrift = drift ? drift.findings.filter((f) => f.rule === 'U3') : null;
  const gates = [
    { id: 'lint', evaluator: 'code', ok: lint.ok, detail: lint.ok ? '0 erros no lint-ux-md' : `${lint.errors.length} erro(s) no lint-ux-md` },
    { id: 'essential-coverage', evaluator: 'code', ok: uncovered ? uncovered.length === 0 : null,
      detail: uncovered ? (uncovered.length ? `${uncovered.length} tela(s) sem arquétipo nem desvio: ${uncovered.slice(0, 5).join(', ')}` : 'toda tela do inventário tem arquétipo ou desvio') : 'não verificado (passe --map e/ou --screens)' },
    { id: 'policy-fidelity', evaluator: policyDrift ? 'code+human' : 'human', ok: policyDrift ? policyDrift.length === 0 : null,
      detail: policyDrift ? (policyDrift.length ? policyDrift.map((f) => `${f.policy} (${f.archetype})`).join('; ') + ' — a maioria das telas não segue' : 'nenhuma política contrariada pela maioria das telas medidas; amostre 5 telas para o resto') : 'amostre 5 telas: as políticas do front matter são o que o produto faz?' },
    { id: 'connected-to-agent', evaluator: 'code', ok: conn ? conn.length > 0 : null,
      detail: conn ? (conn.length ? `citado em ${conn.join(', ')}` : 'nenhum CLAUDE.md/AGENTS.md/regra de ferramenta cita o UX.md') : 'não verificado (sem caminho do projeto)' },
    { id: 'no-conflict', evaluator: 'judge', ok: null, detail: 'juiz: nenhuma regra de ferramenta, DESIGN.md ou doc de produto contradiz o UX.md' },
  ];
  const score = round1(criteria.reduce((sum, c) => sum + c.points, 0));
  const band = BANDS.find((b) => score >= b.min);
  return { score, band: band.id, band_pt: band.name_pt, criteria, gates, ok: gates.every((x) => x.ok !== false), lint, drift: drift ? { findings: drift.findings, summary: drift.summary } : null };
}

const GATE_PT = { lint: 'lint', 'essential-coverage': 'cobertura', 'policy-fidelity': 'fidelidade das políticas', 'connected-to-agent': 'conexão com o agente', 'no-conflict': 'sem conflito' };
const mark = (ok) => (ok === true ? '✔' : ok === false ? '✘' : '?');

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseCli('lint-ux-md.mjs');
  // `--score` não leva valor; se o parser engoliu o caminho como valor dele, devolve ao posicional.
  if (typeof a.score === 'string') { a._.unshift(a.score); a.score = true; }
  const file = a._[0] ?? 'UX.md';
  if (!existsSync(file)) { console.error(`Arquivo não encontrado: ${file}`); process.exit(2); }
  const opts = typeof a.archetypes === 'string' ? { archetypesDir: a.archetypes } : {};
  const md = readFileSync(file, 'utf8');
  if (a.score) {
    const str = (v) => (typeof v === 'string' ? resolve(v) : null);
    const now = process.env.DSX_NOW ? new Date(process.env.DSX_NOW) : new Date();
    const r = scoreUxMd(md, { ...opts, uxPath: file, map: str(a.map), screens: str(a.screens), geometry: str(a.geometry), now });
    if (a.json) console.log(JSON.stringify(r, null, 2));
    else {
      console.log(`UX.md: ${file}`);
      for (const e of r.lint.errors) console.log(`  ERRO   ${e}`);
      console.log(`\n  Gates: ${r.gates.map((g) => `${GATE_PT[g.id] ?? g.id} ${mark(g.ok)}`).join(' · ')}`);
      for (const g of r.gates.filter((x) => x.ok !== true)) console.log(`    ${GATE_PT[g.id] ?? g.id} (${g.evaluator}): ${g.detail}`);
      console.log(`\n  Nota: ${r.score}/100 (${r.band_pt})`);
      for (const c of r.criteria) console.log(`    ${c.name_pt.padEnd(38)} ${String(c.points).padStart(4)}/${c.weight} — ${c.evidence}`);
      if (r.drift?.findings.length) {
        console.log(`\n  Drift (${r.drift.findings.length}):`);
        for (const f of r.drift.findings) console.log(`    ${f.rule} ${f.message}`);
      }
      console.log(r.ok ? '\n  Gates objetivos: APROVADO' : '\n  Gates objetivos: REPROVADO (gate com ✘)');
    }
    process.exit(r.ok ? 0 : 1);
  }
  const result = lintUxMd(md, opts);
  if (a.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`UX.md: ${file}`);
    for (const e of result.errors) console.log(`  ERRO   ${e}`);
    for (const w of result.warnings) console.log(`  AVISO  ${w}`);
    const screens = Object.values(result.info.archetypes).reduce((s, n) => s + n, 0);
    console.log(`\n  ${result.info.sections.length} seções · ${Object.keys(result.info.archetypes).length} arquétipos · ${screens} telas mapeadas`);
    console.log(result.ok ? '  Gates objetivos: APROVADO' : `  Gates objetivos: REPROVADO (${result.errors.length} erro(s))`);
  }
  process.exit(result.ok ? 0 : 1);
}
