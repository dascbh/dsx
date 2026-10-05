// Language packs of the text detectors: the product-text vocabulary (verbs, vague openings, stop words, dashes,
// title case, empty/error wording, verb groups). UX.md `content.language` picks the pack; omitted = pt-BR, so
// results do not change for projects that already use DSX. Tool messages are always English; only the words the
// detectors look for in the product's own text depend on the pack.
//
// Selection rules:
// - text.mjs (X1–X11): the declared pack only.
// - states.mjs and consistency.mjs: the vocabulary that was always bilingual (empty text, guidance verbs, failure-only
//   wording, dismiss buttons, verb groups, action stop/destination words) is the union of every pack, so a screen in
//   either language is recognized; known synonyms and the singular rule come from the declared pack.
// - option text (cases.json, variations): instruction verbs of every pack.
import ptBR from './pt-BR.mjs';
import en from './en.mjs';

export const PACKS = Object.freeze({ 'pt-BR': ptBR, en });
export const LANGS = Object.freeze(Object.keys(PACKS));
export const DEFAULT_LANG = 'pt-BR';

/** Normalizes a language tag: `pt`, `pt-br`, `pt_BR` → `pt-BR`; `en`, `en-US`, `en-GB` → `en`. Unknown → null. */
export function resolveLang(tag) {
  const t = String(tag ?? '').trim().replace('_', '-').toLowerCase();
  if (!t) return null;
  if (t === 'pt' || t.startsWith('pt-')) return 'pt-BR';
  if (t === 'en' || t.startsWith('en-')) return 'en';
  return null;
}

/** Pack for a tag or a config (`cfg.content.language`); unknown or omitted → pt-BR. */
export function langPack(tagOrCfg) {
  const tag = typeof tagOrCfg === 'object' && tagOrCfg ? tagOrCfg.content?.language : tagOrCfg;
  return PACKS[resolveLang(tag) ?? DEFAULT_LANG];
}

const uniq = (xs) => [...new Set(xs)];

/** Union of a list key across every pack (lowercase strings). */
export function unionList(key) {
  return uniq(Object.values(PACKS).flatMap((p) => p[key] ?? []));
}

/** Union of the verb groups of every pack: { group: [verbs…] }. */
export function unionVerbGroups() {
  const out = {};
  for (const p of Object.values(PACKS)) for (const [g, vs] of Object.entries(p.verbGroups)) out[g] = uniq([...(out[g] ?? []), ...vs]);
  return out;
}

/** Any pack's empty-state wording matches. */
export const anyEmptyText = (text) => Object.values(PACKS).some((p) => p.emptyText.test(text));
