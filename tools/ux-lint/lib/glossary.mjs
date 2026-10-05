// Product glossary for ux-lint (`content.glossary` in UX.md). No dependencies.
//
// Accepted forms:
//   content.glossary: docs/glossary.md             # path of a .md with a table (relative to the UX.md)
//   content.glossary: inline                       # table in the UX.md body itself
//   content.glossary: { Order: [ticket] }          # term → synonyms-to-avoid map
//   content.glossary:                              # per module: picked by the detector's --module
//     default: design/product.md                   #   (no --module, or a module with no entry: default)
//     purchasing: design/purchasing-glossary.md
//
// The map is per module when it has a `default` key or when every value is a `.md` path, `inline` or a map.
// Table headers are matched in English or Portuguese (term/termo, never call it/nunca chamar de, avoid/evitar…).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { splitFrontMatter } from '../../lib/yaml-lite.mjs';

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isSource = (v) => isMap(v) || (typeof v === 'string' && (v === 'inline' || /\.md$/i.test(v.trim())));

/** Is the `content.glossary` value a per-module map? */
export function isModuleGlossary(g) {
  if (!isMap(g)) return false;
  const values = Object.values(g);
  return 'default' in g || (values.length > 0 && values.every(isSource));
}

/**
 * Picks the glossary source for the module: { source, module }; `module` is the key used (`default` or the
 * module), or null when there is a single glossary. Without a glossary, `source` is null.
 */
export function glossarySource(g, module = null) {
  if (g === undefined || g === null || g === '') return { source: null, module: null };
  if (!isModuleGlossary(g)) return { source: g, module: null };
  if (module && Object.prototype.hasOwnProperty.call(g, module)) return { source: g[module], module };
  if ('default' in g) return { source: g.default, module: 'default' };
  return { source: null, module: null };
}

/** Markdown tables with a term column and a synonym-to-avoid column → [{ term, avoid: [...] }]. */
export function glossaryFromMarkdown(md) {
  const out = [];
  const lines = String(md ?? '').split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (!/^\s*\|/.test(lines[i]) || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) continue;
    const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const head = cells(lines[i]).map(fold);
    const ti = head.findIndex((h) => /^(termo|term|conceito|concept)$/.test(h));
    const ai = head.findIndex((h) => /nunca|never|evitar|avoid|nao use|do not use|dont use|nao chamar|sinonimo|synonym|deny/.test(h));
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

/** Reads an already picked source (path, "inline" or term → synonyms map). */
export function readGlossarySource(source, uxPath = null) {
  if (!source) return [];
  if (isMap(source)) return Object.entries(source).map(([term, avoid]) => ({ term, avoid: [].concat(avoid ?? []).map(String) }));
  if (typeof source !== 'string' || !uxPath) return [];
  if (source === 'inline') return glossaryFromMarkdown(splitFrontMatter(readFileSync(uxPath, 'utf8')).body ?? '');
  const file = resolve(dirname(uxPath), source);
  return existsSync(file) ? glossaryFromMarkdown(readFileSync(file, 'utf8')) : [];
}

/** Glossary of `content.glossary` for the module (or the single one). */
export function loadGlossary(cfg, uxPath = null, module = null) {
  return readGlossarySource(glossarySource(cfg?.content?.glossary, module).source, uxPath);
}
