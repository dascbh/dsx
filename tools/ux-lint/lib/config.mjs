// ux-lint configuration: reads the front matter of a UX.md and fills it in with the contract defaults
// (knowledge/foundations/ux-md.md, "Front matter schema"). Omitted = the DSX default applies.
// A front matter with old Portuguese names is accepted (lib/legacy.mjs): converted, with a warning.
// `content.language` is left as declared (omitted = pt-BR, resolved by lib/lang/index.mjs).
import { readFileSync } from 'node:fs';
import { parseYaml, splitFrontMatter } from '../../lib/yaml-lite.mjs';
import { normalizeUxFrontMatter } from './legacy.mjs';
import { kitProfile } from './kits.mjs';

export const DEFAULTS = Object.freeze({
  navigation: { 'max-depth': 3, back: 'mandatory' },
  actions: {
    'primary-per-region': 1,
    'primary-position': 'top-right',
    'dialog-order': 'cancel-action',
    'destructive-specific-label': true,
  },
  forms: { label: 'always-visible', validation: 'on-blur', required: 'mark-required' },
  content: { buttons: 'verb-object', forbidden: [] },
  flows: { 'max-journey-steps': 12, 'max-stacked-dialogs': 1, 'dead-ends': 0 },
  verification: {
    // Component kit (lib/kits.mjs): auto | generic | mui | shadcn | chakra | antd | bootstrap. `primary` and
    // `destructive` come from the kit profile unless declared in `selectors`.
    kit: 'auto',
    selectors: {
      regions: ['header', 'nav', 'aside', 'main', '[role=dialog]'],
      dialog: '[role=dialog]',
      button: 'button, [role=button]',
      field: 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select',
    },
  },
});

const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);

function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) {
    out[k] = isMap(v) && isMap(base[k]) ? merge(base[k], v) : v;
  }
  return out;
}

/**
 * Front matter (object) → full configuration. Old names become the new ones; the warnings go in
 * `legacyWarnings` (non-enumerable property, so it stays out of comparisons and JSON).
 */
export function configFrom(frontMatter = {}) {
  const { frontMatter: fm, warnings } = normalizeUxFrontMatter(frontMatter || {});
  const cfg = merge(structuredClone(DEFAULTS), fm);
  const s = cfg.verification.selectors;
  const kit = kitProfile(cfg.verification.kit);
  if (!s.primary) s.primary = kit.primary;
  if (!s.destructive) s.destructive = kit.destructive;
  // Selectors accept a single string or a list; normalized to a string (comma-separated list).
  for (const k of Object.keys(s)) if (Array.isArray(s[k]) && k !== 'regions') s[k] = s[k].join(', ');
  if (typeof s.regions === 'string') s.regions = s.regions.split(',').map((x) => x.trim()).filter(Boolean);
  if (!Array.isArray(cfg.content.forbidden)) cfg.content.forbidden = [cfg.content.forbidden].filter(Boolean);
  Object.defineProperty(cfg, 'legacyWarnings', { value: warnings, enumerable: false });
  // Resolved kit profile (dialog title/footer, archetype regions, cards, containers) for the detectors.
  Object.defineProperty(cfg, 'kitProfile', { value: kit, enumerable: false });
  return cfg;
}

/** Reads a UX.md (or nothing) and returns the configuration. Old-name warnings go to stderr. */
export function loadConfig(uxPath) {
  if (!uxPath) return configFrom({});
  const { frontMatter } = splitFrontMatter(readFileSync(uxPath, 'utf8'));
  if (!frontMatter) throw new Error(`${uxPath}: no front matter (--- ... ---)`);
  const cfg = configFrom(parseYaml(frontMatter));
  for (const w of cfg.legacyWarnings) console.error(`WARNING ${uxPath}: ${w}`);
  return cfg;
}
