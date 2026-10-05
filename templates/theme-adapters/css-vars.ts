// DSX theme adapters — DESIGN.md → CSS custom properties. Copy next to design-md.ts.
//
// Every token becomes a variable: --<prefix>color-<key>, --<prefix>role-<role> (semantic roles with synonyms
// resolved, see design-md.ts ROLE_KEYS), --<prefix>font-<level>-<property>, --<prefix>space-<key>,
// --<prefix>radius-<key>. The light scheme goes on :root; a file with `colors-dark` also gets
// [data-theme="dark"] and the system preference (unless [data-theme="light"] is forced). A dark-only file puts its
// palette on :root with color-scheme: dark.
//
//   const { css } = toCssVariables(parseDesignMd(markdown));
//   document.getElementById('design-tokens')!.textContent = css;   // or write it to a .css file at build time
import type { DesignMd, Scheme } from './design-md';
import { paletteOf, rolesOf } from './design-md';

export interface CssVarsOptions {
  /** Variable prefix after "--" (default "ds-"). */
  prefix?: string;
  /** Selector of the light/base block (default ":root"). */
  root?: string;
  /** Selector that forces dark (default '[data-theme="dark"]'); the light force is the same attribute with "light". */
  darkSelector?: string;
}

export interface CssVariables {
  /** Variables of the base scheme (light, or dark for a dark-only file). */
  base: Record<string, string>;
  /** Variables that change in the dark scheme, or null without `colors-dark`. */
  dark: Record<string, string> | null;
  /** Ready-to-inject stylesheet. */
  css: string;
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();

function colorVars(design: DesignMd, scheme: Scheme, p: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(paletteOf(design, scheme))) out[`--${p}color-${kebab(k)}`] = v;
  const roles = rolesOf(design, scheme);
  for (const [role, v] of Object.entries(roles)) {
    if (typeof v === 'string') out[`--${p}role-${kebab(role)}`] = v;
    else if (v && typeof v === 'object') for (const [part, c] of Object.entries(v)) if (typeof c === 'string') out[`--${p}role-${kebab(role)}-${kebab(part)}`] = c;
  }
  return out;
}

/** CSS variables (and a stylesheet) from a parsed DESIGN.md. */
export function toCssVariables(design: DesignMd, options: CssVarsOptions = {}): CssVariables {
  const p = options.prefix ?? 'ds-';
  const root = options.root ?? ':root';
  const darkSel = options.darkSelector ?? '[data-theme="dark"]';
  const lightSel = darkSel.replace(/dark/g, 'light');
  const baseScheme = design.schemes[0];
  const base: Record<string, string> = { ...colorVars(design, baseScheme, p) };
  for (const [level, t] of Object.entries(design.typography)) {
    for (const [prop, v] of Object.entries(t)) if (v !== undefined) base[`--${p}font-${kebab(level)}-${kebab(prop)}`] = String(v);
  }
  for (const [k, v] of Object.entries(design.spacing)) base[`--${p}space-${kebab(k)}`] = v;
  for (const [k, v] of Object.entries(design.rounded)) base[`--${p}radius-${kebab(k)}`] = v;

  let dark: Record<string, string> | null = null;
  if (design.schemes.includes('dark') && baseScheme === 'light') {
    const all = colorVars(design, 'dark', p);
    dark = Object.fromEntries(Object.entries(all).filter(([k, v]) => base[k] !== v));
  }
  const block = (sel: string, vars: Record<string, string>, scheme?: Scheme) =>
    `${sel}{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')}${scheme ? `;color-scheme:${scheme}` : ''}}`;
  const parts = [block(root, base, baseScheme)];
  if (dark) {
    parts.push(block(`${root}${darkSel}`, dark, 'dark'));
    parts.push(`@media (prefers-color-scheme: dark){${block(`${root}:not(${lightSel})`, dark, 'dark')}}`);
  }
  return { base, dark, css: parts.filter(Boolean).join('\n') };
}
