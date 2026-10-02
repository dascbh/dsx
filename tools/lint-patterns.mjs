#!/usr/bin/env node
// Valida os cartões de padrão (patterns/<categoria>/<id>.md) e gera o índice patterns/README.md.
// Uso: node tools/lint-patterns.mjs [--index]   (--index: reescreve patterns/README.md e patterns/index.json)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { parseArgs } from './lib/cli.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'patterns');

export const ENUMS = {
  categoria: ['acoes', 'acessibilidade', 'autenticacao', 'busca-filtros', 'conteudo', 'dados', 'ecommerce', 'feedback', 'formularios', 'ia', 'modais', 'navegacao', 'ux-writing'],
  tipo: ['recomendacao', 'antipadrao', 'decisao-contextual', 'acessibilidade'],
  impacto: ['critico', 'alto', 'medio', 'baixo'],
  status: ['recomendado', 'usar-com-cautela', 'evitar'],
  evidencia: ['forte', 'moderada', 'emergente'],
};
const REQUIRED_KEYS = ['id', 'titulo', 'categoria', 'tipo', 'impacto', 'status', 'evidencia', 'relacionados'];
const REQUIRED_SECTIONS = ['Contexto', 'Decisão', 'Quando usar', 'Quando evitar', 'Faça', 'Evite', 'Acessibilidade', 'Checklist de verificação', 'Fundamentação'];
// Termos que nunca devem aparecer no conteúdo (ex.: referência a fontes privadas). Configure em patterns/.forbidden (um por linha).
const forbidden = (() => {
  try { return readFileSync(join(DIR, '.forbidden'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean); } catch { return []; }
})();

export function loadPatterns() {
  const out = [];
  for (const cat of readdirSync(DIR)) {
    const p = join(DIR, cat);
    if (!statSync(p).isDirectory()) continue;
    for (const f of readdirSync(p).filter((x) => x.endsWith('.md'))) {
      const file = join(p, f);
      const md = readFileSync(file, 'utf8');
      const { frontMatter, body } = splitFrontMatter(md);
      let fm = null, parseError = null;
      try { fm = frontMatter ? parseYaml(frontMatter) : null; } catch (e) { parseError = e.message; }
      out.push({ file: file.slice(ROOT.length + 1), dir: cat, slug: basename(f, '.md'), fm, body, parseError });
    }
  }
  return out;
}

export function lintPatterns(patterns) {
  const errors = [];
  const ids = new Set(patterns.map((p) => p.fm?.id).filter(Boolean));
  for (const p of patterns) {
    const e = (msg) => errors.push(`${p.file}: ${msg}`);
    if (p.parseError) { e(`front matter inválido — ${p.parseError}`); continue; }
    if (!p.fm) { e('sem front matter'); continue; }
    for (const k of REQUIRED_KEYS) if (p.fm[k] === undefined || p.fm[k] === '') e(`chave obrigatória ausente: ${k}`);
    for (const [k, vals] of Object.entries(ENUMS)) if (p.fm[k] && !vals.includes(p.fm[k])) e(`${k} "${p.fm[k]}" fora do enum (${vals.join(' | ')})`);
    if (p.fm.id && p.fm.id !== p.slug) e(`id "${p.fm.id}" difere do nome do arquivo "${p.slug}"`);
    if (p.fm.categoria && p.fm.categoria !== p.dir) e(`categoria "${p.fm.categoria}" difere da pasta "${p.dir}"`);
    for (const r of [].concat(p.fm.relacionados ?? [])) if (!ids.has(r)) e(`relacionado inexistente: ${r}`);
    const heads = [...p.body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
    for (const s of REQUIRED_SECTIONS) if (!heads.includes(s)) e(`seção ausente: ## ${s}`);
    if (!/^>\s*\*\*Regra:\*\*/m.test(p.body)) e('falta a linha "> **Regra:**" logo após o título');
    if (/https?:\/\//.test(p.body)) e('contém URL (padrões não devem linkar fontes externas; cite pelo nome)');
    for (const t of forbidden) if (new RegExp(t, 'i').test(p.body + JSON.stringify(p.fm))) e(`contém termo proibido: ${t}`);
    if (!/- \[ \]/.test(p.body)) e('checklist sem itens "- [ ]"');
  }
  return errors;
}

function buildIndex(patterns) {
  const byCat = {};
  for (const p of patterns.filter((x) => x.fm)) (byCat[p.fm.categoria] ??= []).push(p);
  const rule = (body) => (body.match(/^>\s*\*\*Regra:\*\*\s*(.+)$/m)?.[1] ?? '').trim();
  let md = `# Catálogo de padrões\n\n${patterns.length} padrões de interface com regra de decisão, critérios de uso, acessibilidade e checklist.\n` +
    `Gerado por \`node tools/lint-patterns.mjs --index\` — não edite à mão.\n\n` +
    `**Como um agente usa este catálogo:** encontre a decisão que você está tomando na tabela, leia a **Regra** e, se o caso não for trivial, abra o cartão e siga a seção **Decisão**. Antes de entregar, rode o **Checklist de verificação** do cartão.\n\n` +
    `Legenda de status: ✅ recomendado · ⚠️ usar com cautela · ⛔ evitar\n`;
  const icon = { recomendado: '✅', 'usar-com-cautela': '⚠️', evitar: '⛔' };
  for (const cat of Object.keys(byCat).sort()) {
    md += `\n## ${cat}\n\n| Padrão | Regra | Impacto | Status |\n|---|---|---|---|\n`;
    for (const p of byCat[cat].sort((a, b) => a.fm.titulo.localeCompare(b.fm.titulo))) {
      md += `| [${p.fm.titulo}](${p.dir}/${p.slug}.md) | ${rule(p.body).replace(/\|/g, '\\|')} | ${p.fm.impacto} | ${icon[p.fm.status] ?? ''} |\n`;
    }
  }
  const json = patterns.filter((p) => p.fm).map((p) => ({
    id: p.fm.id, titulo: p.fm.titulo, categoria: p.fm.categoria, componentes: p.fm.componentes ?? [],
    tipo: p.fm.tipo, impacto: p.fm.impacto, status: p.fm.status, evidencia: p.fm.evidencia,
    wcag: p.fm.wcag ?? [], relacionados: p.fm.relacionados ?? [], regra: rule(p.body), arquivo: `patterns/${p.dir}/${p.slug}.md`,
  }));
  return { md, json };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const patterns = loadPatterns();
  const errors = lintPatterns(patterns);
  for (const e of errors) console.log(`ERRO  ${e}`);
  console.log(`${patterns.length} padrões verificados, ${errors.length} erro(s).`);
  if (a.index) {
    const { md, json } = buildIndex(patterns);
    writeFileSync(join(DIR, 'README.md'), md);
    writeFileSync(join(DIR, 'index.json'), JSON.stringify(json, null, 2) + '\n');
    console.log('Índice gerado: patterns/README.md e patterns/index.json');
  }
  process.exit(errors.length ? 1 : 0);
}
