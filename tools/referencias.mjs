#!/usr/bin/env node
// Catálogo de referências de DESIGN.md (biblioteca pública designmd.app, CC BY 4.0) e curadoria do DSX.
//
//   node tools/referencias.mjs indice                  # baixa os metadados de todos os estilos → referencias/design-md/indice.json
//   node tools/referencias.mjs buscar [--registro operacional] [--uso "jurídico dashboard"] [--tema claro|escuro] [--n 10] [--curados]
//   node tools/referencias.mjs baixar <slug> [...]     # DESIGN.md completo → referencias/design-md/designmd-app/<slug>.md (com crédito)
//   node tools/referencias.mjs avaliar <arquivo.md>    # linter do DSX + contraste dos componentes → nota e motivos
//   node tools/referencias.mjs curar                   # reavalia os curados e regrava referencias/design-md/curados.json
//
// Sem dependências (Node ≥ 20). Respeita o limite da API pública (30 req/min): uma chamada a cada 2,2 s.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintDesignMd } from './lint-design-md.mjs';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { contrast } from './lib/color.mjs';
import { parseArgs } from './lib/cli.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA = join(RAIZ, 'referencias', 'design-md');
const INDICE = join(PASTA, 'indice.json');
const CURADOS = join(PASTA, 'curados.json');
const COPIAS = join(PASTA, 'designmd-app');
const SITE = 'https://designmd.app';
const ESPERA_MS = 2200;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- classificação do DSX
// Registro = para que tipo de produto a referência serve. Decide a primeira triagem; o julgamento final é humano.
const REGRAS = [
  ['operacional', /\b(saas|b2b|enterprise|dashboard|admin|backoffice|crm|erp|fintech|financ|bank|banc|legal|jur[ií]dic|compliance|analytics|data|dados|produtiv|productiv|ferrament|tool|dev ?tools?|developer|desenvolvedor|healthcare|sa[uú]de|hospital|gov|governo|logist|log[ií]stic|insurance|seguro|contab|account|tribut|tax|ops)\b/i],
  ['editorial', /\b(editorial|blog|revista|magazine|news|not[ií]cia|jornal|publica|portfolio|portf[oó]lio|documenta|docs|leitura|reading)\b/i],
  ['consumo', /\b(e-?commerce|loja|store|shop|marketplace|app mobile|mobile|social|fitness|food|comida|delivery|travel|viagem|turismo|educa|learning|curso|streaming|music|m[uú]sica|wellness|bem-estar|pet|imobili|real estate)\b/i],
  ['marca', /\b(landing|marketing|campanha|campaign|brand|marca|evento|event|festival|luxury|luxo|fashion|moda|ag[eê]ncia|agency|portfolio criativo)\b/i],
];
const EXPERIMENTAL = /arte|ilustra|retro|pop|brutal|creative|experimental|isometric|3d|futurista|psicod|g[oó]tic|steampunk|rococ|barroc|grunge/i;

// Caso de uso genérico repetido por centenas de estilos não informa nada: fica fora da classificação.
const USO_GENERICO = /^\s*landing pages?,\s*(saas|websites? modernas?)\s*$/i;

export function classificar(item) {
  const uso = USO_GENERICO.test(item.use_case ?? '') ? '' : item.use_case;
  const descricao = String(item.description ?? '').replace(/ideal (para|for) landing pages?,? (saas|websites? modernas?)\.?/i, '');
  const texto = [item.title, descricao, uso, item.style_type, item.keywords, item.type].join(' ');
  const registros = REGRAS.filter(([, re]) => re.test(texto)).map(([r]) => r);
  const experimental = EXPERIMENTAL.test(`${item.type} ${item.style_type}`);
  const principal = registros[0] ?? (experimental ? 'experimental' : 'marca');
  const ld = String(item.light_dark ?? '');
  const tema = /✓[^/]*\/\s*✓/.test(ld) ? 'claro-e-escuro' : /dark|escuro/i.test(`${item.style_type} ${item.keywords}`) ? 'escuro' : 'claro';
  return { registro: principal, registros, experimental, tema };
}

// ---------------------------------------------------------------- avaliação objetiva
export function avaliar(md) {
  const r = lintDesignMd(md);
  const { frontMatter } = splitFrontMatter(md);
  let fm = {};
  try { fm = frontMatter ? parseYaml(frontMatter) : {}; } catch { /* front matter inválido já sai no linter */ }
  const cores = fm.colors ?? {};
  const resolver = (v) => {
    const m = typeof v === 'string' && v.match(/^\{colors\.([\w-]+)\}$/);
    return m ? cores[m[1]] : v;
  };
  const pares = [];
  for (const [nome, c] of Object.entries(fm.components ?? {})) {
    const fundo = resolver(c?.backgroundColor);
    const texto = resolver(c?.textColor);
    if (/^#[0-9a-f]{6}$/i.test(fundo ?? '') && /^#[0-9a-f]{6}$/i.test(texto ?? '')) {
      pares.push({ componente: nome, razao: Math.round(contrast(texto, fundo) * 100) / 100 });
    }
  }
  const reprovados = pares.filter((p) => p.razao < 4.5);
  const temComponentes = Object.keys(fm.components ?? {}).length > 0;
  const nCores = Object.keys(cores).length;
  const nTipos = Object.keys(fm.typography ?? {}).length;
  let nota = 100 - r.errors.length * 15 - r.warnings.length * 3 - reprovados.length * 15;
  if (!temComponentes) nota -= 10;
  if (nCores < 4) nota -= 5;
  if (nTipos < 3) nota -= 5;
  nota = Math.max(0, Math.min(100, nota));
  return {
    nota, erros: r.errors, avisos: r.warnings, contrasteComponentes: pares, contrasteReprovado: reprovados,
    tokens: { cores: nCores, tipografia: nTipos, componentes: Object.keys(fm.components ?? {}).length },
  };
}

// ---------------------------------------------------------------- rede
async function json(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'dsx-referencias/1.0 (+https://github.com/dascbh/dsx)' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}
async function texto(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'dsx-referencias/1.0 (+https://github.com/dascbh/dsx)' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

async function baixarIndice() {
  const itens = [];
  for (let pagina = 1; ; pagina++) {
    const d = await json(`${SITE}/api/styles?page=${pagina}&limit=50`);
    itens.push(...d.data);
    process.stderr.write(`página ${pagina}/${d.pagination.totalPages}\r`);
    if (pagina >= d.pagination.totalPages) break;
    await dormir(ESPERA_MS);
  }
  const lista = itens.map((x) => {
    let palavras = [];
    try { palavras = JSON.parse(x.keywords ?? '[]'); } catch { palavras = String(x.keywords ?? '').split(','); }
    const base = {
      slug: x.slug, titulo: x.title, descricao: x.description, categoria: x.type, uso: x.use_case,
      era: x.era, estilo: x.style_type, palavras, url: `${SITE}/library/${x.slug}`,
    };
    return { ...base, dsx: classificar({ ...x, keywords: palavras.join(' ') }) };
  });
  mkdirSync(PASTA, { recursive: true });
  writeFileSync(INDICE, JSON.stringify({
    fonte: `${SITE}/library`, licenca: 'CC BY 4.0 — crédito obrigatório a designmd.app',
    atualizado: new Date().toISOString().slice(0, 10), total: lista.length, itens: lista,
  }, null, 1));
  const porRegistro = lista.reduce((a, x) => ({ ...a, [x.dsx.registro]: (a[x.dsx.registro] ?? 0) + 1 }), {});
  console.log(`\n${lista.length} estilos → ${INDICE}`);
  console.log(porRegistro);
}

function creditar(slug, md) {
  const nota = `\n\n---\n\n> Referência de terceiros, copiada sem alterações de ${SITE}/library/${slug} — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill \`escolher-ds\`.\n`;
  return md.trimEnd() + nota;
}

async function baixar(slugs) {
  mkdirSync(COPIAS, { recursive: true });
  for (const [i, slug] of slugs.entries()) {
    const md = await texto(`${SITE}/library/${slug}/design.md`);
    if (!md.startsWith('---')) throw new Error(`${slug}: resposta não parece um DESIGN.md`);
    writeFileSync(join(COPIAS, `${slug}.md`), creditar(slug, md));
    console.log(`${slug} ✓`);
    if (i < slugs.length - 1) await dormir(ESPERA_MS);
  }
}

function lerIndice() {
  if (!existsSync(INDICE)) throw new Error('Sem índice: rode `node tools/referencias.mjs indice`.');
  return JSON.parse(readFileSync(INDICE, 'utf8'));
}

function buscar(a) {
  const { itens } = lerIndice();
  const curados = existsSync(CURADOS) ? JSON.parse(readFileSync(CURADOS, 'utf8')).itens : [];
  const porSlug = Object.fromEntries(curados.map((c) => [c.slug, c]));
  const termos = String(a.uso ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const pontuados = itens
    .filter((x) => !a.registro || x.dsx.registros.includes(a.registro) || x.dsx.registro === a.registro)
    .filter((x) => !a.tema || x.dsx.tema.includes(a.tema === 'escuro' ? 'escuro' : 'claro'))
    .filter((x) => !a.curados || porSlug[x.slug])
    .map((x) => {
      const alvo = [x.titulo, x.descricao, x.uso, x.estilo, x.palavras.join(' ')].join(' ').toLowerCase();
      const acertos = termos.filter((t) => alvo.includes(t)).length;
      const c = porSlug[x.slug];
      return { ...x, pontos: acertos * 10 + (c ? 5 + c.nota / 20 : 0) - (x.dsx.experimental ? 5 : 0), curado: c };
    })
    .sort((p, q) => q.pontos - p.pontos)
    .slice(0, Number(a.n ?? 10));
  for (const x of pontuados) {
    const selo = x.curado ? `curado · nota ${x.curado.nota}` : 'não avaliado';
    console.log(`${x.slug}  [${x.dsx.registro} · ${x.dsx.tema} · ${selo}]\n  ${x.titulo} — ${x.uso}\n  ${x.url}`);
  }
}

function curar() {
  const indice = Object.fromEntries(lerIndice().itens.map((x) => [x.slug, x]));
  const itens = readdirSync(COPIAS).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const slug = f.replace(/\.md$/, '');
    const av = avaliar(readFileSync(join(COPIAS, f), 'utf8'));
    const meta = indice[slug] ?? {};
    return {
      slug, titulo: meta.titulo, registro: meta.dsx?.registro, tema: meta.dsx?.tema, uso: meta.uso,
      nota: av.nota, tokens: av.tokens, contrasteReprovado: av.contrasteReprovado.map((p) => `${p.componente} ${p.razao}:1`),
      erros: av.erros.length, avisos: av.avisos.length, arquivo: `designmd-app/${f}`, url: meta.url,
    };
  }).sort((p, q) => q.nota - p.nota);
  writeFileSync(CURADOS, JSON.stringify({
    criterio: 'linter do DSX (erros −15, avisos −3) + contraste texto/fundo dos componentes (< 4,5:1 −15) + completude (componentes, ≥ 4 cores, ≥ 3 estilos de texto)',
    atualizado: new Date().toISOString().slice(0, 10), itens,
  }, null, 1));
  console.log(`${itens.length} curados → ${CURADOS}`);
  for (const x of itens) console.log(`${String(x.nota).padStart(3)}  ${x.slug}  ${x.contrasteReprovado.join(', ')}`);
}

async function main() {
  const a = parseArgs();
  const [cmd, ...resto] = a._;
  if (cmd === 'indice') return baixarIndice();
  if (cmd === 'buscar') return buscar(a);
  if (cmd === 'baixar' && resto.length) return baixar(resto);
  if (cmd === 'avaliar' && resto[0]) return console.log(JSON.stringify(avaliar(readFileSync(resto[0], 'utf8')), null, 2));
  if (cmd === 'curar') return curar();
  console.error('Uso: node tools/referencias.mjs indice | buscar [--registro r] [--uso "termos"] [--tema claro|escuro] [--n 10] [--curados] | baixar <slug>… | avaliar <arquivo> | curar');
  process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
