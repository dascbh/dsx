// Semantic color roles and type roles of a DESIGN.md, for the Node tools (lab.mjs). The theme adapters carry the
// same tables in TypeScript (templates/theme-adapters/design-md.ts: ROLE_KEYS, TYPE_KEYS, rolesOf); a parity test
// (tools/test/design-lab.test.mjs) runs both and fails when they drift. Change both, in the same commit.
import { contrast, luminance } from '../../lib/color.mjs';

const BACKGROUND_KEYS = ['canvas', 'background', 'bg', 'surface-container-lowest'];

/** Role → keys tried in order. DSX names first; then names common in the DESIGN.md library and Material 3. */
export const ROLE_KEYS = {
  background: BACKGROUND_KEYS,
  surface: ['surface', 'paper', 'card', 'surface-container', 'background'],
  surfaceVariant: ['surface-variant', 'surface-sunken', 'sunken', 'surface-container-high', 'muted'],
  text: ['text-primary', 'text', 'foreground', 'on-background', 'on-surface', 'ink'],
  textSecondary: ['text-secondary', 'text-muted', 'muted-foreground', 'on-surface-variant', 'subtle'],
  link: ['link', 'text-link'],
  border: ['border', 'divider', 'outline-variant', 'line', 'border-subtle'],
  borderStrong: ['border-strong', 'outline', 'input', 'border-input'],
  focus: ['focus', 'ring', 'focus-ring'],
  primary: ['primary', 'brand', 'accent'],
  primaryHover: ['primary-hover', 'primary-strong', 'primary-dark'],
  onPrimary: ['on-primary', 'primary-foreground', 'on-brand', 'on-accent'],
  secondary: ['secondary'],
  onSecondary: ['on-secondary', 'secondary-foreground'],
  danger: ['danger', 'error', 'destructive', 'critical'],
  onDanger: ['on-danger', 'on-error', 'destructive-foreground'],
  tableHeader: ['table-header'],
  onTableHeader: ['on-table-header'],
  tableZebra: ['table-zebra', 'table-stripe'],
  tableHover: ['table-hover', 'table-row-hover'],
};

/** Typography role → level names tried in order. */
export const TYPE_KEYS = {
  h1: ['h1', 'display', 'display-lg', 'headline-xl', 'heading-1'],
  h2: ['h2', 'headline-lg', 'display-md', 'heading-2'],
  h3: ['h3', 'headline-md', 'heading-3'],
  h4: ['h4', 'headline-sm', 'title-lg', 'heading-4'],
  h5: ['h5', 'title-md', 'heading-5'],
  h6: ['h6', 'title-sm', 'title', 'heading-6'],
  body: ['body', 'body-md', 'body-base', 'text', 'paragraph', 'body-lg'],
  bodySmall: ['body-sm', 'small', 'body-small', 'body-xs'],
  label: ['label', 'label-md', 'label-caps', 'overline'],
  caption: ['caption', 'label-sm', 'footnote'],
  button: ['button', 'label-md', 'label'],
  code: ['code', 'mono', 'code-md'],
};

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const pick = (palette, keys) => { for (const k of keys) if (palette[k]) return palette[k]; return undefined; };

function status(palette, name) {
  const alt = name === 'error' ? ['error', 'danger'] : [name];
  const first = (suffixes) => pick(palette, alt.flatMap((n) => suffixes.map((s) => s.replace('*', n))));
  return {
    main: first(['*', '*-main']),
    container: first(['*-container', '*-bg', '*-background', '*-surface']),
    onContainer: first(['on-*-container', 'on-*-bg', '*-text', '*-foreground']),
    border: first(['*-border']),
  };
}

/** Resolves {colors.x} references inside a color group (values of other groups are looked up in fm). */
export function resolvedColors(fm, group = 'colors') {
  const lookup = (path) => path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), fm);
  const out = {};
  for (const [k, v0] of Object.entries(fm?.[group] ?? {})) {
    let v = v0;
    for (let i = 0; i < 5 && typeof v === 'string' && /^\{[^}]+\}$/.test(v); i++) v = lookup(v.slice(1, -1));
    if (v !== null && v !== undefined && typeof v !== 'object') out[k] = String(v);
  }
  return out;
}

/** Light palette, dark palette (colors + colors-dark, or null) and the schemes a front matter supports. */
export function palettes(fm) {
  const light = resolvedColors(fm, 'colors');
  const over = resolvedColors(fm, 'colors-dark');
  const natural = isDark(pick(light, BACKGROUND_KEYS)) ? 'dark' : 'light';
  const dark = natural === 'light' && Object.keys(over).length ? { ...light, ...over } : null;
  return { light, dark, darkOverrides: dark ? over : {}, schemes: dark ? ['light', 'dark'] : [natural] };
}

export function isDark(color) {
  if (!color || !HEX.test(color)) return false;
  return luminance(color) < 0.2;
}

/** Semantic roles of a palette. Undeclared roles stay undefined. */
export function rolesOf(palette) {
  const out = { success: status(palette, 'success'), warning: status(palette, 'warning'), error: status(palette, 'error'), info: status(palette, 'info') };
  for (const [role, keys] of Object.entries(ROLE_KEYS)) out[role] = pick(palette, keys);
  return out;
}

/** Roles taken only from `colors-dark` in the dark scheme (same list as design-md.ts DARK_EXPLICIT_ROLES). */
export const DARK_EXPLICIT_ROLES = ['primaryHover', 'secondary', 'onSecondary', 'danger', 'onDanger', 'surfaceVariant', 'tableZebra', 'tableHover', 'success', 'warning', 'error', 'info'];

/** Roles of one scheme of a front matter, with the dark rule (same as design-md.ts rolesOf). */
export function schemeRoles(fm, scheme) {
  const { light, dark, darkOverrides } = palettes(fm);
  const all = rolesOf(scheme === 'dark' && dark ? dark : light);
  if (scheme !== 'dark' || !dark) return all;
  const only = rolesOf(darkOverrides);
  for (const r of DARK_EXPLICIT_ROLES) all[r] = only[r];
  return all;
}

/** The pairs that decide whether text and controls can be read: [id, fg role, bg role, minimum]. */
export const MAIN_PAIRS = [
  ['text-on-background', 'text', 'background', 4.5],
  ['text-on-surface', 'text', 'surface', 4.5],
  ['secondary-text', 'textSecondary', 'background', 4.5],
  ['button-text', 'onPrimary', 'primary', 4.5],
  ['main-color', 'primary', 'background', 3],
  ['field-border', 'borderStrong', 'background', 3],
  ['danger-button', 'onDanger', 'danger', 4.5],
];

/** Contrast of the main pairs in every scheme the file supports. Pairs with an undeclared or non-hex side are skipped. */
export function mainPairs(fm) {
  const { schemes } = palettes(fm);
  const out = [];
  for (const scheme of schemes) {
    const r = schemeRoles(fm, scheme);
    r.background ??= r.surface;
    r.surface ??= r.background;
    for (const [id, fg, bg, min] of MAIN_PAIRS) {
      const a = r[fg], b = r[bg];
      if (!a || !b || !HEX.test(a) || !HEX.test(b)) continue;
      const ratio = Math.round(contrast(a, b) * 100) / 100;
      out.push({ id, scheme, fg: a, bg: b, ratio, min, ok: ratio >= min });
    }
  }
  return out;
}
