#!/usr/bin/env node
// Valida um UX.md contra o contrato de knowledge/fundamentos/ux-md.md:
//  - front matter: chaves conhecidas, tipos, valores dos enums, obrigatórios
//    (version, name, product.persona, product.register), placeholders não preenchidos;
//  - nomes antigos em português (produto, registro, acoes…) são aceitos com AVISO "nome antigo, renomeie para X"
//    (tabela única em tools/ux-lint/lib/legacy.mjs);
//  - arquétipos citados (front matter e corpo) existem no catálogo `archetypes/` (ou, sem a pasta,
//    na lista fixa de ids do DSX);
//  - corpo: as 13 seções na ordem (pt-BR ou equivalente em inglês), seções vazias, placeholders,
//    "Faça e não faça" com ≥ 3 itens em cada bloco, texto vago.
// O que a máquina não mede (adequação do arquétipo, clareza) fica com a skill ux-md (Modo C).
// Uso: node tools/lint-ux-md.mjs [caminho/UX.md] [--archetypes <pasta>] [--json]
import { LAYOUT_DEFAULTS } from './ux-lint/lib/geometry.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { parseCli } from './lib/legacy-cli.mjs';
import { normalizeUxFrontMatter, ARCHETYPE_IDS } from './ux-lint/lib/legacy.mjs';

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
const STR = 'str', INT = 'int', BOOL = 'bool', LIST = 'list', ARCH = 'archetypes', NUM = 'num', MAP = 'map';
export const SCHEMA = {
  version: STR, name: STR, description: STR, owner: STR, updated: STR,
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
  content: { glossary: STR, buttons: STR, forbidden: LIST, 'proper-nouns': LIST },
  flows: { 'max-journey-steps': INT, 'max-stacked-dialogs': INT, 'dead-ends': INT },
  layout: Object.fromEntries(Object.keys(LAYOUT_DEFAULTS).map((k) => [k, NUM])),
  verification: {
    selectors: { regions: LIST, dialog: STR, 'dialog-footer': STR, primary: STR, destructive: STR, button: STR, field: STR, 'archetype-regions': MAP },
  },
};

const BASE_STATES = ['loading', 'empty', 'error', 'no-access', 'success'];
const VAGUE = /\b(intuitiv[oa]s?|amigáve(?:l|is)|moderno|moderna|clean|limp[oa]|simples de usar|fácil de usar|f[aá]cil|agradáve(?:l|is)|elegante|fluid[oa]|sem atrito|quando possível|se necessário|quando necessário|adequad[oa]s?|apropriad[oa]s?|etc\.?)(?![\wà-ú])/gi;

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^\d+[.)]?\s*/, '').replace(/[^a-z0-9& ]/g, '').replace(/\s+/g, ' ').trim();
const kindOf = (v) => (Array.isArray(v) ? 'lista' : v === null ? 'vazio' : typeof v === 'object' ? 'grupo' : typeof v);

function validateGroup(obj, schema, prefix, errors, warnings) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    const def = schema[k];
    if (def === undefined) { warnings.push(`Chave desconhecida: ${path} (fora do contrato; será ignorada pelo ux-lint).`); continue; }
    if (def === ARCH) continue; // validado à parte
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
  const info = { archetypes: {}, sections: [] };
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
    if (!fm.version) errors.push('Obrigatório ausente: version.');
    else if (fm.version !== 'alpha') warnings.push(`version "${fm.version}": a versão atual do formato é "alpha".`);
    if (!fm.name) errors.push('Obrigatório ausente: name.');
    if (!fm.product?.persona) errors.push('Obrigatório ausente: product.persona (quem usa e para quê).');
    if (!fm.product?.register) errors.push('Obrigatório ausente: product.register (operational | consumer | editorial | brand).');
    if (!fm.owner) warnings.push('Sem "owner": defina quem mantém o arquivo.');
    if (!fm.updated) warnings.push('Sem "updated": registre a data da última revisão (AAAA-MM-DD).');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fm.updated))) warnings.push(`updated "${fm.updated}" fora do formato AAAA-MM-DD.`);
    validateGroup(fm, SCHEMA, '', errors, warnings);

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseCli('lint-ux-md.mjs');
  const file = a._[0] ?? 'UX.md';
  if (!existsSync(file)) { console.error(`Arquivo não encontrado: ${file}`); process.exit(2); }
  const opts = typeof a.archetypes === 'string' ? { archetypesDir: a.archetypes } : {};
  const result = lintUxMd(readFileSync(file, 'utf8'), opts);
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
