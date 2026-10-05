// UX.md → design/product.md (Forward's product foundation, fde-design "Foundation"). Only what UX.md really holds is
// exported: product boundary, register, persona, glossary with deny-list and declared deviations (the drift/debt log
// that design/foundation.md keeps). What Forward expects and UX.md does not hold is listed as a gap, never invented.
import { readFileSync } from 'node:fs';
import { parseYaml, splitFrontMatter } from '../../lib/yaml-lite.mjs';
import { configFrom } from '../../ux-lint/lib/config.mjs';
import { glossarySource } from '../../ux-lint/lib/glossary.mjs';
import { parseDeviations } from '../../ux-lint/lib/deviations.mjs';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const one = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const cell = (s) => one(s).replace(/\|/g, '\\|');

/** Glossary rows with meaning: [{ term, meaning, gender, avoid }] from the Markdown tables of a text. */
export function glossaryRows(md) {
  const out = [];
  const lines = String(md ?? '').split('\n');
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  for (let i = 0; i < lines.length - 1; i++) {
    if (!/^\s*\|/.test(lines[i]) || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) continue;
    const head = cells(lines[i]).map(fold);
    const ti = head.findIndex((h) => /^(termo|term|conceito|concept)$/.test(h));
    const ai = head.findIndex((h) => /nunca|evitar|avoid|nao use|nao chamar|sinonimo|synonym|deny/.test(h));
    const mi = head.findIndex((h) => /significado|meaning|definicao|definition|descricao|description/.test(h));
    const gi = head.findIndex((h) => /genero|gender/.test(h));
    if (ti < 0 || ai < 0) continue;
    for (let j = i + 2; j < lines.length && /^\s*\|/.test(lines[j]); j++) {
      const c = cells(lines[j]);
      const term = one((c[ti] ?? '').replace(/\*\*/g, ''));
      if (!term) continue;
      const raw = c[ai] ?? '';
      const quoted = [...raw.matchAll(/["“]([^"”]+)["”]/g)].map((m) => m[1]);
      const avoid = (quoted.length ? quoted : raw.split(/[,;]/)).map((x) => one(x.replace(/[—–].*$/, ''))).filter((x) => x && x !== '—' && x !== '-');
      const val = (k) => (k >= 0 && !/^[—–-]?$/.test(one(c[k])) ? one(c[k]) : '');
      out.push({ term, meaning: val(mi), gender: val(gi), avoid });
    }
  }
  return out;
}

/** Reads a UX.md: { name, version, updated, description, product, forbidden, glossary, deviations, warnings }. */
export function readUxMd(uxPath, { module = null } = {}) {
  const text = readFileSync(uxPath, 'utf8').replace(/\r\n/g, '\n');
  const { frontMatter, body } = splitFrontMatter(text);
  if (!frontMatter) throw new Error(`${uxPath}: no front matter`);
  const raw = parseYaml(frontMatter);
  const cfg = configFrom(raw);
  const { source } = glossarySource(cfg.content?.glossary, module);
  let glossary = [];
  let glossaryFrom = null;
  if (source === 'inline') { glossary = glossaryRows(body); glossaryFrom = 'UX.md (inline)'; }
  else if (typeof source === 'string') {
    const f = resolve(dirname(uxPath), source);
    if (existsSync(f)) { glossary = glossaryRows(readFileSync(f, 'utf8')); glossaryFrom = source; }
  } else if (source && typeof source === 'object') {
    glossary = Object.entries(source).map(([term, avoid]) => ({ term, meaning: '', gender: '', avoid: [].concat(avoid ?? []).map(String) }));
    glossaryFrom = 'UX.md (content.glossary map)';
  }
  const dev = parseDeviations(cfg.deviations);
  return {
    name: raw.name ?? null, version: raw.version ?? null, updated: raw.updated ?? null, description: raw.description ?? null,
    product: cfg.product ?? {}, forbidden: cfg.content?.forbidden ?? [], glossary, glossary_from: glossaryFrom,
    deviations: dev.deviations, warnings: [...(cfg.legacyWarnings ?? []), ...dev.warnings, ...dev.errors],
  };
}

/** design/product.md text from a read UX.md. `source` is the path shown in the provenance line. */
export function renderProductMd(ux, { source = 'UX.md', now = new Date() } = {}) {
  const p = ux.product ?? {};
  const L = [];
  L.push(`# ${one(ux.name) || 'Product'} — product`, '');
  L.push(`<!-- Exported by tools/forward/export.mjs from ${source}${ux.version ? ` v${ux.version}` : ''}${ux.updated ? ` (${ux.updated})` : ''} on ${now.toISOString().slice(0, 10)}. The authored design/product.md wins; re-export never overwrites it. Text in the product's language is kept as written. -->`, '');
  L.push('## What it is', '', one(ux.description) || '_Not declared in UX.md (`description`)._', '');
  L.push('## Register', '');
  L.push(p.register ? `${p.register}${p.platform || p.density ? ` (${[p.platform && `platform: ${p.platform}`, p.density && `density: ${p.density}`].filter(Boolean).join(', ')})` : ''}` : '_Not declared in UX.md (`product.register`)._', '');
  L.push('## Personas', '');
  if (p.persona) L.push('| Persona | Source |', '|---|---|', `| ${cell(p.persona)} | UX.md \`product.persona\` |`, '', 'The task table of UX.md ("Personas and tasks" section) stays the detailed source; copy the rows Forward review needs.', '');
  else L.push('_Not declared in UX.md (`product.persona`)._', '');
  L.push('## Glossary', '');
  if (ux.glossary.length) {
    L.push(`Source: ${ux.glossary_from}. Grammatical gender is not part of the UX.md contract; fill it where the language needs it.`, '');
    L.push('| Term | Meaning | Gender | Deny-list |', '|---|---|---|---|');
    for (const g of ux.glossary) L.push(`| ${cell(g.term)} | ${cell(g.meaning) || '—'} | ${cell(g.gender) || '—'} | ${g.avoid.map((a) => `"${cell(a)}"`).join(', ') || '—'} |`);
    L.push('');
  } else L.push('_No glossary table in UX.md (`content.glossary`)._', '');
  if (ux.forbidden.length) L.push('Product-wide deny-list (`content.forbidden`): ' + ux.forbidden.map((f) => `\`${f}\``).join(', ') + '.', '');
  L.push('## Declared deviations (for the drift/debt log of design/foundation.md)', '');
  if (ux.deviations.length) {
    L.push('| Id | Screens | Rules | Reason | Decided by | Revisit by |', '|---|---|---|---|---|---|');
    for (const d of ux.deviations) L.push(`| ${cell(d.id)} | ${d.screens.map(cell).join(', ')} | ${d.rules.map(cell).join(', ') || '—'} | ${cell(d.reason)} | ${cell(d.decided_by)} | ${d.until ?? '—'} |`);
    L.push('');
  } else L.push('_None declared._', '');
  L.push('## Not in UX.md (Forward expects these here)', '');
  L.push('- The quality-bar sentence every screen is judged against.');
  L.push('- What the product is NOT (negative scope).');
  L.push('- 3–6 ordered tie-breaking principles.');
  L.push('');
  return L.join('\n');
}
