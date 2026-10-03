#!/usr/bin/env node
// Valida um UX.md contra o contrato de knowledge/fundamentos/ux-md.md:
//  - front matter: chaves conhecidas, tipos, valores dos enums, obrigatórios
//    (version, name, produto.persona, produto.registro), placeholders não preenchidos;
//  - arquétipos citados (front matter e corpo) existem no catálogo `arquetipos/` (ou, sem a pasta,
//    na lista fixa de ids do DSX);
//  - corpo: as 13 seções na ordem (pt-BR ou equivalente em inglês), seções vazias, placeholders,
//    "Faça e não faça" com ≥ 3 itens em cada bloco, texto vago.
// O que a máquina não mede (adequação do arquétipo, clareza) fica com a skill ux-md (Modo C).
// Uso: node tools/lint-ux-md.mjs [caminho/UX.md] [--arquetipos <pasta>] [--json]
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { parseArgs } from './lib/cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const ARQUETIPOS = [
  'lista-operacional', 'mestre-detalhe', 'documento-com-visor', 'editor-com-painel',
  'assistente-em-etapas', 'painel-de-acompanhamento', 'biblioteca', 'configuracoes',
  'pagina-publica-de-decisao', 'dialogo-de-formulario', 'dialogo-de-confirmacao', 'painel-lateral-de-detalhe',
];

// Seções do corpo, na ordem; primeiro nome = canônico (pt-BR), demais = equivalentes aceitos.
export const SECOES = [
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
const STR = 'str', INT = 'int', BOOL = 'bool', LIST = 'list';
export const SCHEMA = {
  version: STR, name: STR, description: STR, owner: STR, updated: STR,
  produto: {
    persona: STR,
    registro: ['operacional', 'consumo', 'editorial', 'marca'],
    plataforma: ['desktop', 'mobile', 'ambos'],
    densidade: ['baixa', 'media', 'alta'],
  },
  navegacao: { modelo: STR, 'profundidade-maxima': INT, retorno: STR },
  arquetipos: 'arquetipos',
  acoes: {
    'primarias-por-regiao': INT,
    'posicao-primaria': ['topo-direita', 'rodape-direita', 'junto-ao-conteudo'],
    'ordem-dialogo': ['cancelar-acao', 'acao-cancelar'],
    'destrutiva-rotulo-especifico': BOOL,
  },
  confirmacao: { irreversivel: ['dialogo', 'digitar-nome'], reversivel: ['desfazer', 'nenhuma'] },
  feedback: { sucesso: ['toast', 'inline', 'pagina'], 'erro-de-campo': STR, 'erro-de-sistema': STR, 'esqueleto-acima-de-ms': INT },
  estados: LIST,
  formularios: {
    rotulo: STR,
    validacao: ['ao-sair-do-campo', 'ao-enviar', 'em-tempo-real'],
    obrigatorios: ['marcar-obrigatorios', 'marcar-opcionais'],
  },
  conteudo: { glossario: STR, botoes: STR, proibidos: LIST },
  fluxos: { 'max-passos-jornada': INT, 'max-dialogos-empilhados': INT, 'becos-sem-saida': INT },
  verificacao: { seletores: { regioes: LIST, dialogo: STR, primaria: STR, destrutiva: STR, botao: STR, campo: STR } },
};

const ESTADOS_BASE = ['carregando', 'vazio', 'erro', 'sem-acesso', 'sucesso'];
const VAGO = /\b(intuitiv[oa]s?|amigáve(?:l|is)|moderno|moderna|clean|limp[oa]|simples de usar|fácil de usar|f[aá]cil|agradáve(?:l|is)|elegante|fluid[oa]|sem atrito|quando possível|se necessário|quando necessário|adequad[oa]s?|apropriad[oa]s?|etc\.?)(?![\wà-ú])/gi;

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^\d+[.)]?\s*/, '').replace(/[^a-z0-9& ]/g, '').replace(/\s+/g, ' ').trim();
const tipo = (v) => (Array.isArray(v) ? 'lista' : v === null ? 'vazio' : typeof v === 'object' ? 'grupo' : typeof v);

function validarGrupo(obj, schema, prefixo, errors, warnings) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const caminho = prefixo ? `${prefixo}.${k}` : k;
    const def = schema[k];
    if (def === undefined) { warnings.push(`Chave desconhecida: ${caminho} (fora do contrato; será ignorada pelo ux-lint).`); continue; }
    if (def === 'arquetipos') continue; // validado à parte
    if (Array.isArray(def)) {
      if (!def.includes(v)) errors.push(`${caminho}: valor "${v}" inválido; use um de: ${def.join(' | ')}.`);
    } else if (typeof def === 'object') {
      if (tipo(v) !== 'grupo') errors.push(`${caminho}: esperado grupo de chaves, veio ${tipo(v)}.`);
      else validarGrupo(v, def, caminho, errors, warnings);
    } else if (def === INT) {
      if (!Number.isInteger(v) || v < 0) errors.push(`${caminho}: esperado inteiro ≥ 0, veio "${v}".`);
    } else if (def === BOOL) {
      if (typeof v !== 'boolean') errors.push(`${caminho}: esperado true ou false, veio "${v}".`);
    } else if (def === LIST) {
      if (!Array.isArray(v)) errors.push(`${caminho}: esperado lista [a, b], veio ${tipo(v)}.`);
    } else if (def === STR) {
      if (typeof v !== 'string' && typeof v !== 'number') errors.push(`${caminho}: esperado texto, veio ${tipo(v)}.`);
    }
  }
}

/**
 * Situação de um id de arquétipo: 'ok' (cartão existe, ou id fixo quando não há pasta),
 * 'sem-cartao' (id fixo do DSX cujo cartão ainda não foi escrito na pasta) ou 'inexistente'.
 */
function situacaoArquetipo(id, pasta) {
  const temPasta = pasta && existsSync(pasta);
  if (temPasta && existsSync(join(pasta, `${id}.md`))) return 'ok';
  if (ARQUETIPOS.includes(id)) return temPasta ? 'sem-cartao' : 'ok';
  return 'inexistente';
}

/** Separa o corpo em seções `##` (fora de blocos de código), com linha inicial. */
function secoesDoCorpo(body, linhaInicial) {
  const out = [];
  let emCodigo = false;
  body.split('\n').forEach((linha, i) => {
    if (/^\s*```/.test(linha)) emCodigo = !emCodigo;
    const m = !emCodigo && linha.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m) out.push({ titulo: m[1].trim(), linha: linhaInicial + i, linhas: [] });
    else if (out.length) out.at(-1).linhas.push(linha);
  });
  return out;
}

const semComentarios = (t) => t.replace(/<!--[\s\S]*?-->/g, '');
const semCodigo = (t) => t.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
const contarItens = (linhas) => linhas.filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(l)).length;

/** Divide a seção "Faça e não faça" em blocos Faça / Não faça (subtítulo ### ou linha em negrito). */
function blocosFacaNaoFaca(linhas) {
  const blocos = { faca: null, naoFaca: null };
  let atual = null;
  for (const l of semComentarios(linhas.join('\n')).split('\n')) {
    const t = l.trim().replace(/^#{3,6}\s+/, '').replace(/^\*\*(.+?)\*\*:?\s*$/, '$1');
    const cab = /^#{3,6}\s+/.test(l.trim()) || /^\*\*.+\*\*:?\s*$/.test(l.trim());
    if (cab) {
      const n = norm(t);
      if (/^(nao faca|nao faco|evite|donts?|dont|do not)\b/.test(n)) { atual = 'naoFaca'; blocos.naoFaca = []; continue; }
      if (/^(faca|do|dos)\b/.test(n)) { atual = 'faca'; blocos.faca = []; continue; }
      atual = null;
      continue;
    }
    if (atual) blocos[atual].push(l);
  }
  return blocos;
}

export function lintUxMd(md, { arquetiposDir = join(ROOT, 'arquetipos') } = {}) {
  const errors = [];
  const warnings = [];
  const info = { arquetipos: {}, secoes: [] };
  const { frontMatter, body, bodyStartLine } = splitFrontMatter(md.replace(/\r\n/g, '\n'));

  // --- Front matter -------------------------------------------------------
  let fm = {};
  if (!frontMatter) errors.push('Sem front matter YAML (--- ... ---): as decisões não são verificáveis por máquina.');
  else {
    try { fm = parseYaml(frontMatter); } catch (e) { errors.push(`Front matter inválido: ${e.message}`); }
    const ph = frontMatter.split('\n').filter((l) => /<[^>]+>/.test(l.replace(/\s+#.*$/, '').replace(/^\s*#.*$/, '')));
    if (ph.length) errors.push(`Front matter com ${ph.length} placeholder(s) não preenchido(s), ex.: "${ph[0].trim()}"`);
  }
  if (frontMatter) {
    if (!fm.version) errors.push('Obrigatório ausente: version.');
    else if (fm.version !== 'alpha') warnings.push(`version "${fm.version}": a versão atual do formato é "alpha".`);
    if (!fm.name) errors.push('Obrigatório ausente: name.');
    if (!fm.produto?.persona) errors.push('Obrigatório ausente: produto.persona (quem usa e para quê).');
    if (!fm.produto?.registro) errors.push('Obrigatório ausente: produto.registro (operacional | consumo | editorial | marca).');
    if (!fm.owner) warnings.push('Sem "owner": defina quem mantém o arquivo.');
    if (!fm.updated) warnings.push('Sem "updated": registre a data da última revisão (AAAA-MM-DD).');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fm.updated))) warnings.push(`updated "${fm.updated}" fora do formato AAAA-MM-DD.`);
    validarGrupo(fm, SCHEMA, '', errors, warnings);

    if (Array.isArray(fm.estados)) {
      const faltam = ESTADOS_BASE.filter((e) => !fm.estados.includes(e));
      if (faltam.length) warnings.push(`estados sem ${faltam.join(', ')}: toda tela deveria implementar os cinco estados base.`);
    }
    if (!fm.verificacao?.seletores) warnings.push('Sem verificacao.seletores: o ux-lint vai usar os seletores padrão, que podem não reconhecer o kit do projeto.');
    if (!fm.arquetipos || !Object.keys(fm.arquetipos).length) warnings.push('Sem "arquetipos": nenhuma tela está mapeada a um tipo de tela.');
  }

  // --- Arquétipos ---------------------------------------------------------
  const arq = fm.arquetipos && tipo(fm.arquetipos) === 'grupo' ? fm.arquetipos : {};
  if (fm.arquetipos !== undefined && tipo(fm.arquetipos) !== 'grupo') errors.push('arquetipos: esperado grupo <id-do-arquetipo>: [rotas].');
  for (const [id, rotas] of Object.entries(arq)) {
    const sit = situacaoArquetipo(id, arquetiposDir);
    if (sit === 'inexistente') errors.push(`arquetipos.${id}: arquétipo inexistente no catálogo (ids válidos: ${ARQUETIPOS.join(', ')}).`);
    if (sit === 'sem-cartao') warnings.push(`arquetipos.${id}: id do DSX sem cartão em arquetipos/${id}.md; o arranjo não tem referência até o cartão existir.`);
    if (!Array.isArray(rotas)) errors.push(`arquetipos.${id}: esperado lista de rotas/telas, ex.: ["/contratos"].`);
    else if (!rotas.length) warnings.push(`arquetipos.${id}: lista vazia; remova a chave ou mapeie as telas.`);
    info.arquetipos[id] = Array.isArray(rotas) ? rotas.length : 0;
  }
  const rotasVistas = new Map();
  for (const [id, rotas] of Object.entries(arq)) for (const r of Array.isArray(rotas) ? rotas : []) {
    if (rotasVistas.has(r)) warnings.push(`Rota "${r}" mapeada a dois arquétipos (${rotasVistas.get(r)} e ${id}); escolha um ou declare o desvio na seção 5.`);
    else rotasVistas.set(r, id);
  }
  const corpoLimpo = semComentarios(body);
  for (const m of corpoLimpo.matchAll(/arquetipos\/([a-z0-9-]+)\.md/g)) {
    if (situacaoArquetipo(m[1], arquetiposDir) === 'inexistente') errors.push(`Corpo cita arquetipos/${m[1]}.md, que não existe no catálogo.`);
  }

  // --- Seções -------------------------------------------------------------
  const secoes = secoesDoCorpo(body, bodyStartLine);
  info.secoes = secoes.map((s) => s.titulo);
  const indiceDe = (s) => SECOES.findIndex((aliases) => aliases.some((a) => norm(a) === norm(s.titulo)));
  const achadas = secoes.map((s) => ({ ...s, idx: indiceDe(s) })).filter((s) => s.idx >= 0);
  SECOES.forEach((aliases, i) => {
    if (!achadas.some((s) => s.idx === i)) errors.push(`Seção obrigatória ausente: "## ${aliases[0]}" (${i + 1}ª de 13).`);
  });
  for (let i = 1; i < achadas.length; i++) {
    if (achadas[i].idx < achadas[i - 1].idx) errors.push(`Seção fora de ordem: "## ${achadas[i].titulo}" (linha ${achadas[i].linha}) deveria vir antes de "## ${achadas[i - 1].titulo}".`);
  }
  for (const s of achadas) {
    const conteudo = semComentarios(s.linhas.join('\n')).trim();
    if (!conteudo) errors.push(`Seção "${s.titulo}" (linha ${s.linha}) está vazia ou só tem comentário.`);
  }

  // Seção 5 deve mencionar cada arquétipo do front matter
  const sec5 = achadas.find((s) => s.idx === 4);
  if (sec5) for (const id of Object.keys(arq)) {
    if (!sec5.linhas.join('\n').includes(id)) warnings.push(`Arquétipo "${id}" está no front matter mas não aparece na seção "Arquétipos de tela".`);
  }

  // Faça e não faça
  const sec12 = achadas.find((s) => s.idx === 11);
  if (sec12) {
    const { faca, naoFaca } = blocosFacaNaoFaca(sec12.linhas);
    if (!faca) errors.push('"Faça e não faça" sem o bloco "Faça" (subtítulo ### Faça ou linha **Faça**).');
    else if (contarItens(faca) < 3) errors.push(`Bloco "Faça" com ${contarItens(faca)} item(ns); mínimo 3, derivados de problemas reais.`);
    if (!naoFaca) errors.push('"Faça e não faça" sem o bloco "Não faça" (subtítulo ### Não faça ou linha **Não faça**).');
    else if (contarItens(naoFaca) < 3) errors.push(`Bloco "Não faça" com ${contarItens(naoFaca)} item(ns); mínimo 3, derivados de problemas reais.`);
  }

  // Placeholders e texto vago no corpo
  const corpoTexto = semCodigo(corpoLimpo);
  const ph = corpoTexto.match(/<(?!\/?(?:br|kbd|abbr|code|details|summary)\b)[a-zà-ú][^>\n]{0,60}>/gi);
  if (ph) errors.push(`Corpo com ${ph.length} placeholder(s) não preenchido(s), ex.: ${ph[0]}`);
  const vagos = [];
  corpoTexto.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(VAGO)) vagos.push(`${m[0]} (linha ${bodyStartLine + i})`);
  });
  if (vagos.length) warnings.push(`Texto vago no corpo: ${vagos.slice(0, 6).join(', ')}${vagos.length > 6 ? ` e mais ${vagos.length - 6}` : ''}. Troque por critério observável (quantidade, posição, limite).`);

  return { ok: errors.length === 0, errors, warnings, info };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const file = a._[0] ?? 'UX.md';
  if (!existsSync(file)) { console.error(`Arquivo não encontrado: ${file}`); process.exit(2); }
  const opts = a.arquetipos ? { arquetiposDir: a.arquetipos } : {};
  const result = lintUxMd(readFileSync(file, 'utf8'), opts);
  if (a.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`UX.md: ${file}`);
    for (const e of result.errors) console.log(`  ERRO   ${e}`);
    for (const w of result.warnings) console.log(`  AVISO  ${w}`);
    const telas = Object.values(result.info.arquetipos).reduce((s, n) => s + n, 0);
    console.log(`\n  ${result.info.secoes.length} seções · ${Object.keys(result.info.arquetipos).length} arquétipos · ${telas} telas mapeadas`);
    console.log(result.ok ? '  Gates objetivos: APROVADO' : `  Gates objetivos: REPROVADO (${result.errors.length} erro(s))`);
  }
  process.exit(result.ok ? 0 : 1);
}
