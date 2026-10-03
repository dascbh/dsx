#!/usr/bin/env node
// Catálogo de referências de DESIGN.md (biblioteca pública designmd.app, CC BY 4.0) e curadoria do DSX.
//
//   node tools/references.mjs index                   # baixa os metadados de todos os estilos → references/design-md/index.json
//   node tools/references.mjs search [--register operational] [--use "jurídico dashboard"] [--theme light|dark] [--n 10] [--curated]
//   node tools/references.mjs fetch <slug> [...]      # DESIGN.md completo → references/design-md/designmd-app/<slug>.md (com crédito)
//   node tools/references.mjs evaluate <arquivo.md>   # linter do DSX + contraste dos componentes → nota (score) e motivos
//   node tools/references.mjs curate                  # reavalia os curados e regrava references/design-md/curated.json
//
// Nomes antigos (indice, buscar, baixar, avaliar, curar; --registro, --uso, --tema, --curados) ainda funcionam,
// com aviso, durante a transição (tabela única em tools/lib/legacy-cli.mjs; docs/renames-2026-10.md).
// Sem dependências (Node ≥ 20). Respeita o limite da API pública (30 req/min): uma chamada a cada 2,2 s.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintDesignMd } from './lint-design-md.mjs';
import { parseYaml, splitFrontMatter } from './lib/yaml-lite.mjs';
import { contrast } from './lib/color.mjs';
import { parseCli } from './lib/legacy-cli.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'references', 'design-md');
const INDEX = join(DIR, 'index.json');
const CURATED = join(DIR, 'curated.json');
const COPIES = join(DIR, 'designmd-app');
const SITE = 'https://designmd.app';
const WAIT_MS = 2200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- classificação do DSX
// Registro = para que tipo de produto a referência serve. Decide a primeira triagem; o julgamento final é humano.
const RULES = [
  ['operational', /\b(saas|b2b|enterprise|dashboard|admin|backoffice|crm|erp|fintech|financ|bank|banc|legal|jur[ií]dic|compliance|analytics|data|dados|produtiv|productiv|ferrament|tool|dev ?tools?|developer|desenvolvedor|healthcare|sa[uú]de|hospital|gov|governo|logist|log[ií]stic|insurance|seguro|contab|account|tribut|tax|ops)\b/i],
  ['editorial', /\b(editorial|blog|revista|magazine|news|not[ií]cia|jornal|publica|portfolio|portf[oó]lio|documenta|docs|leitura|reading)\b/i],
  ['consumer', /\b(e-?commerce|loja|store|shop|marketplace|app mobile|mobile|social|fitness|food|comida|delivery|travel|viagem|turismo|educa|learning|curso|streaming|music|m[uú]sica|wellness|bem-estar|pet|imobili|real estate)\b/i],
  ['brand', /\b(landing|marketing|campanha|campaign|brand|marca|evento|event|festival|luxury|luxo|fashion|moda|ag[eê]ncia|agency|portfolio criativo)\b/i],
];
const EXPERIMENTAL = /arte|ilustra|retro|pop|brutal|creative|experimental|isometric|3d|futurista|psicod|g[oó]tic|steampunk|rococ|barroc|grunge/i;

// Caso de uso genérico repetido por centenas de estilos não informa nada: fica fora da classificação.
const GENERIC_USE = /^\s*landing pages?,\s*(saas|websites? modernas?)\s*$/i;

export function classify(item) {
  const useCase = GENERIC_USE.test(item.use_case ?? '') ? '' : item.use_case;
  const description = String(item.description ?? '').replace(/ideal (para|for) landing pages?,? (saas|websites? modernas?)\.?/i, '');
  const text = [item.title, description, useCase, item.style_type, item.keywords, item.type].join(' ');
  const registers = RULES.filter(([, re]) => re.test(text)).map(([r]) => r);
  const experimental = EXPERIMENTAL.test(`${item.type} ${item.style_type}`);
  const register = registers[0] ?? (experimental ? 'experimental' : 'brand');
  const ld = String(item.light_dark ?? '');
  const theme = /✓[^/]*\/\s*✓/.test(ld) ? 'light-and-dark' : /dark|escuro/i.test(`${item.style_type} ${item.keywords}`) ? 'dark' : 'light';
  return { register, registers, experimental, theme };
}

// ---------------------------------------------------------------- avaliação objetiva
export function evaluate(md) {
  const r = lintDesignMd(md);
  const { frontMatter } = splitFrontMatter(md);
  let fm = {};
  try { fm = frontMatter ? parseYaml(frontMatter) : {}; } catch { /* front matter inválido já sai no linter */ }
  const colors = fm.colors ?? {};
  const resolveRef = (v) => {
    const m = typeof v === 'string' && v.match(/^\{colors\.([\w-]+)\}$/);
    return m ? colors[m[1]] : v;
  };
  const pairs = [];
  for (const [name, c] of Object.entries(fm.components ?? {})) {
    const bg = resolveRef(c?.backgroundColor);
    const fg = resolveRef(c?.textColor);
    if (/^#[0-9a-f]{6}$/i.test(bg ?? '') && /^#[0-9a-f]{6}$/i.test(fg ?? '')) {
      pairs.push({ component: name, ratio: Math.round(contrast(fg, bg) * 100) / 100 });
    }
  }
  const failures = pairs.filter((p) => p.ratio < 4.5);
  const background = colors.background ?? colors.surface;
  const theme = /^#[0-9a-f]{6}$/i.test(background ?? '') ? (contrast(background, '#000000') < contrast(background, '#FFFFFF') ? 'dark' : 'light') : null;
  const hasComponents = Object.keys(fm.components ?? {}).length > 0;
  const nColors = Object.keys(colors).length;
  const nType = Object.keys(fm.typography ?? {}).length;
  let score = 100 - r.errors.length * 15 - r.warnings.length * 3 - failures.length * 15;
  if (!hasComponents) score -= 10;
  if (nColors < 4) score -= 5;
  if (nType < 3) score -= 5;
  score = Math.max(0, Math.min(100, score));
  return {
    score, theme, errors: r.errors, warnings: r.warnings, component_contrast: pairs, contrast_failures: failures,
    tokens: { colors: nColors, typography: nType, components: Object.keys(fm.components ?? {}).length },
  };
}

// ---------------------------------------------------------------- rede
const UA = { 'user-agent': 'dsx-references/1.0 (+https://github.com/dascbh/dsx)' };
async function getJson(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}
async function getText(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

async function fetchIndex() {
  const raw = [];
  for (let page = 1; ; page++) {
    const d = await getJson(`${SITE}/api/styles?page=${page}&limit=50`);
    raw.push(...d.data);
    process.stderr.write(`página ${page}/${d.pagination.totalPages}\r`);
    if (page >= d.pagination.totalPages) break;
    await sleep(WAIT_MS);
  }
  const items = raw.map((x) => {
    let keywords = [];
    try { keywords = JSON.parse(x.keywords ?? '[]'); } catch { keywords = String(x.keywords ?? '').split(','); }
    const base = {
      slug: x.slug, title: x.title, description: x.description, category: x.type, use_case: x.use_case,
      era: x.era, style: x.style_type, keywords, url: `${SITE}/library/${x.slug}`,
    };
    return { ...base, dsx: classify({ ...x, keywords: keywords.join(' ') }) };
  });
  mkdirSync(DIR, { recursive: true });
  writeFileSync(INDEX, JSON.stringify({
    source: `${SITE}/library`, license: 'CC BY 4.0 — crédito obrigatório a designmd.app',
    updated: new Date().toISOString().slice(0, 10), total: items.length, items,
  }, null, 1));
  const byRegister = items.reduce((a, x) => ({ ...a, [x.dsx.register]: (a[x.dsx.register] ?? 0) + 1 }), {});
  console.log(`\n${items.length} estilos → ${INDEX}`);
  console.log(byRegister);
}

function credit(slug, md) {
  const note = `\n\n---\n\n> Referência de terceiros, copiada sem alterações de ${SITE}/library/${slug} — licença CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Crédito: designmd.app. Usar como ponto de partida; adaptar no DESIGN.md do projeto com a skill \`escolher-ds\`.\n`;
  return md.trimEnd() + note;
}

async function fetchCopies(slugs) {
  mkdirSync(COPIES, { recursive: true });
  for (const [i, slug] of slugs.entries()) {
    const md = await getText(`${SITE}/library/${slug}/design.md`);
    if (!md.startsWith('---')) throw new Error(`${slug}: resposta não parece um DESIGN.md`);
    writeFileSync(join(COPIES, `${slug}.md`), credit(slug, md));
    console.log(`${slug} ✓`);
    if (i < slugs.length - 1) await sleep(WAIT_MS);
  }
}

function readIndex() {
  if (!existsSync(INDEX)) throw new Error('Sem índice: rode `node tools/references.mjs index`.');
  return JSON.parse(readFileSync(INDEX, 'utf8'));
}

function search(a) {
  const { items } = readIndex();
  const curated = existsSync(CURATED) ? JSON.parse(readFileSync(CURATED, 'utf8')).items : [];
  const bySlug = Object.fromEntries(curated.map((c) => [c.slug, c]));
  const terms = String(a.use ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const ranked = items
    .filter((x) => !a.register || x.dsx.registers.includes(a.register) || x.dsx.register === a.register)
    .filter((x) => !a.theme || x.dsx.theme.includes(a.theme === 'dark' ? 'dark' : 'light'))
    .filter((x) => !a.curated || bySlug[x.slug])
    .map((x) => {
      const target = [x.title, x.description, x.use_case, x.style, x.keywords.join(' ')].join(' ').toLowerCase();
      const hits = terms.filter((t) => target.includes(t)).length;
      const c = bySlug[x.slug];
      return { ...x, points: hits * 10 + (c ? 5 + c.score / 20 : 0) - (x.dsx.experimental ? 5 : 0), curated_item: c };
    })
    .sort((p, q) => q.points - p.points)
    .slice(0, Number(a.n ?? 10));
  for (const x of ranked) {
    const badge = x.curated_item ? `curado · nota ${x.curated_item.score}` : 'não avaliado';
    console.log(`${x.slug}  [${x.dsx.register} · ${x.dsx.theme} · ${badge}]\n  ${x.title} — ${x.use_case}\n  ${x.url}`);
  }
}

function curate() {
  const index = Object.fromEntries(readIndex().items.map((x) => [x.slug, x]));
  const items = readdirSync(COPIES).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const slug = f.replace(/\.md$/, '');
    const ev = evaluate(readFileSync(join(COPIES, f), 'utf8'));
    const meta = index[slug] ?? {};
    return {
      slug, title: meta.title, register: meta.dsx?.register, theme: ev.theme ?? meta.dsx?.theme, use_case: meta.use_case,
      score: ev.score, tokens: ev.tokens, contrast_failures: ev.contrast_failures.map((p) => `${p.component} ${p.ratio}:1`),
      errors: ev.errors.length, warnings: ev.warnings.length, file: `designmd-app/${f}`, url: meta.url,
    };
  }).sort((p, q) => q.score - p.score);
  writeFileSync(CURATED, JSON.stringify({
    criteria: 'linter do DSX (erros −15, avisos −3) + contraste texto/fundo dos componentes (< 4,5:1 −15) + completude (componentes, ≥ 4 cores, ≥ 3 estilos de texto)',
    updated: new Date().toISOString().slice(0, 10), items,
  }, null, 1));
  console.log(`${items.length} curados → ${CURATED}`);
  for (const x of items) console.log(`${String(x.score).padStart(3)}  ${x.slug}  ${x.contrast_failures.join(', ')}`);
}

async function main() {
  const a = parseCli('references.mjs');
  const [cmd, ...rest] = a._;
  if (cmd === 'index') return fetchIndex();
  if (cmd === 'search') return search(a);
  if (cmd === 'fetch' && rest.length) return fetchCopies(rest);
  if (cmd === 'evaluate' && rest[0]) return console.log(JSON.stringify(evaluate(readFileSync(rest[0], 'utf8')), null, 2));
  if (cmd === 'curate') return curate();
  console.error('Uso: node tools/references.mjs index | search [--register r] [--use "termos"] [--theme light|dark] [--n 10] [--curated] | fetch <slug>… | evaluate <arquivo> | curate');
  process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
