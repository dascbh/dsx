// Glossário do produto para o ux-lint (`content.glossary` do UX.md). Sem dependências.
//
// Formas aceitas:
//   content.glossary: docs/glossario.md            # caminho de um .md com tabela (relativo ao UX.md)
//   content.glossary: inline                       # tabela no próprio corpo do UX.md
//   content.glossary: { Minuta: [rascunho] }       # mapa termo → sinônimos a evitar
//   content.glossary:                              # por módulo: escolhido pelo --module do verificador
//     default: design/product.md                   #   (sem --module, ou módulo sem entrada, vale o default)
//     contratos: design/contratos-glossario.md
//
// O mapa é por módulo quando tem a chave `default` ou quando todo valor é um caminho `.md`, `inline` ou um mapa.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { splitFrontMatter } from '../../lib/yaml-lite.mjs';

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isSource = (v) => isMap(v) || (typeof v === 'string' && (v === 'inline' || /\.md$/i.test(v.trim())));

/** O valor de `content.glossary` é um mapa por módulo? */
export function isModuleGlossary(g) {
  if (!isMap(g)) return false;
  const values = Object.values(g);
  return 'default' in g || (values.length > 0 && values.every(isSource));
}

/**
 * Escolhe a fonte do glossário para o módulo: { source, module } — `module` é a chave usada (`default` ou o
 * módulo), ou null quando o glossário é único. Sem glossário, `source` é null.
 */
export function glossarySource(g, module = null) {
  if (g === undefined || g === null || g === '') return { source: null, module: null };
  if (!isModuleGlossary(g)) return { source: g, module: null };
  if (module && Object.prototype.hasOwnProperty.call(g, module)) return { source: g[module], module };
  if ('default' in g) return { source: g.default, module: 'default' };
  return { source: null, module: null };
}

/** Tabelas Markdown com coluna de termo e coluna de sinônimo a evitar → [{ term, avoid: [...] }]. */
export function glossaryFromMarkdown(md) {
  const out = [];
  const lines = String(md ?? '').split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (!/^\s*\|/.test(lines[i]) || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) continue;
    const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const head = cells(lines[i]).map(fold);
    const ti = head.findIndex((h) => /^(termo|term|conceito|concept)$/.test(h));
    const ai = head.findIndex((h) => /nunca|evitar|avoid|nao use|nao chamar|sinonimo|synonym|deny/.test(h));
    if (ti < 0 || ai < 0) continue;
    for (let j = i + 2; j < lines.length && /^\s*\|/.test(lines[j]); j++) {
      const c = cells(lines[j]);
      const term = clean((c[ti] ?? '').replace(/\*\*/g, ''));
      const raw = c[ai] ?? '';
      const quoted = [...raw.matchAll(/["“]([^"”]+)["”]/g)].map((m) => m[1]);
      const avoid = (quoted.length ? quoted : raw.replace(/\*\*[^*]*\*\*/g, '').replace(/\([^)]*\)/g, '').split(/[,;]/))
        .map((x) => clean(x.replace(/[—–].*$/, ''))).filter((x) => x.length >= 3);
      if (term && avoid.length) out.push({ term, avoid });
    }
  }
  return out;
}

/** Lê uma fonte já escolhida (caminho, "inline" ou mapa termo → sinônimos). */
export function readGlossarySource(source, uxPath = null) {
  if (!source) return [];
  if (isMap(source)) return Object.entries(source).map(([term, avoid]) => ({ term, avoid: [].concat(avoid ?? []).map(String) }));
  if (typeof source !== 'string' || !uxPath) return [];
  if (source === 'inline') return glossaryFromMarkdown(splitFrontMatter(readFileSync(uxPath, 'utf8')).body ?? '');
  const file = resolve(dirname(uxPath), source);
  return existsSync(file) ? glossaryFromMarkdown(readFileSync(file, 'utf8')) : [];
}

/** Glossário de `content.glossary` para o módulo (ou o único). */
export function loadGlossary(cfg, uxPath = null, module = null) {
  return readGlossarySource(glossarySource(cfg?.content?.glossary, module).source, uxPath);
}
