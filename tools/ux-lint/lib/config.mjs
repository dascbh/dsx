// Configuração do ux-lint: lê o front matter de um UX.md e completa com os padrões do contrato
// (knowledge/fundamentos/ux-md.md, "Schema do front matter"). Omitido = vale o padrão do DSX.
// Front matter com nomes antigos em português é aceito (lib/legacy.mjs): convertido, com aviso.
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
 * Front matter (objeto) → configuração completa. Nomes antigos viram os novos; os avisos ficam em
 * `legacyWarnings` (propriedade não enumerável, para não entrar em comparações nem no JSON).
 */
export function configFrom(frontMatter = {}) {
  const { frontMatter: fm, warnings } = normalizeUxFrontMatter(frontMatter || {});
  const cfg = merge(structuredClone(DEFAULTS), fm);
  const s = cfg.verification.selectors;
  const kit = kitProfile(cfg.verification.kit);
  if (!s.primary) s.primary = kit.primary;
  if (!s.destructive) s.destructive = kit.destructive;
  // Seletores aceitam string única ou lista; normaliza para string (lista com vírgula).
  for (const k of Object.keys(s)) if (Array.isArray(s[k]) && k !== 'regions') s[k] = s[k].join(', ');
  if (typeof s.regions === 'string') s.regions = s.regions.split(',').map((x) => x.trim()).filter(Boolean);
  if (!Array.isArray(cfg.content.forbidden)) cfg.content.forbidden = [cfg.content.forbidden].filter(Boolean);
  Object.defineProperty(cfg, 'legacyWarnings', { value: warnings, enumerable: false });
  // Resolved kit profile (dialog title/footer, archetype regions, cards, containers) for the detectors.
  Object.defineProperty(cfg, 'kitProfile', { value: kit, enumerable: false });
  return cfg;
}

/** Lê um UX.md (ou nada) e devolve a configuração. Avisos de nome antigo vão para stderr. */
export function loadConfig(uxPath) {
  if (!uxPath) return configFrom({});
  const { frontMatter } = splitFrontMatter(readFileSync(uxPath, 'utf8'));
  if (!frontMatter) throw new Error(`${uxPath}: sem front matter (--- ... ---)`);
  const cfg = configFrom(parseYaml(frontMatter));
  for (const w of cfg.legacyWarnings) console.error(`AVISO ${uxPath}: ${w}`);
  return cfg;
}
