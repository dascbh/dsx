// DSX theme adapters — DESIGN.md → Tailwind preset. Copy next to design-md.ts (and css-vars.ts when cssVars is on).
//
// Tailwind v3: `presets: [toTailwindPreset(parseDesignMd(readFileSync('DESIGN.md', 'utf8')))]` in tailwind.config.
// Tailwind v4: generate the CSS with toTailwindTheme() into a file imported after `@import "tailwindcss"`.
//
// With `cssVars: true` (default) the colors point at the CSS variables of css-vars.ts (`var(--ds-color-<key>)`), so the
// light/dark switch and the live design switcher work without rebuilding; with false they are the literal values.
import type { DesignMd } from './design-md';
import { px } from './design-md';

export interface TailwindAdapterOptions {
  /** Colors as var(--<prefix>color-<key>) instead of literal values (default true). */
  cssVars?: boolean;
  /** Prefix of the CSS variables (default "ds-", same as css-vars.ts). */
  prefix?: string;
}

export interface TailwindPreset {
  darkMode: [string, string];
  theme: { extend: Record<string, Record<string, unknown>> };
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();
const stack = (family: string) => family.split(',').map((f) => f.trim()).filter(Boolean);

/** Tailwind v3 preset (theme.extend) from a parsed DESIGN.md. */
export function toTailwindPreset(design: DesignMd, options: TailwindAdapterOptions = {}): TailwindPreset {
  const p = options.prefix ?? 'ds-';
  const useVars = options.cssVars !== false;
  const colors: Record<string, string> = {};
  for (const [k, v] of Object.entries(design.colors)) colors[k] = useVars ? `var(--${p}color-${kebab(k)})` : v;
  const fontFamily: Record<string, string[]> = {};
  const fontSize: Record<string, [string, Record<string, string>]> = {};
  for (const [level, t] of Object.entries(design.typography)) {
    if (t.fontFamily) fontFamily[level] = stack(t.fontFamily);
    const size = px(t.fontSize);
    if (!Number.isNaN(size)) {
      const extra: Record<string, string> = {};
      if (t.lineHeight !== undefined) extra.lineHeight = String(t.lineHeight);
      if (t.fontWeight !== undefined) extra.fontWeight = String(t.fontWeight);
      if (t.letterSpacing) extra.letterSpacing = t.letterSpacing;
      fontSize[level] = [`${size / 16}rem`, extra];
    }
  }
  const body = design.typography.body ?? design.typography['body-md'];
  if (body?.fontFamily) fontFamily.sans = stack(body.fontFamily);
  const extend: Record<string, Record<string, unknown>> = { colors, fontFamily, fontSize };
  if (Object.keys(design.spacing).length) extend.spacing = { ...design.spacing };
  if (Object.keys(design.rounded).length) extend.borderRadius = { ...design.rounded };
  return { darkMode: ['selector', '[data-theme="dark"]'], theme: { extend } };
}

/** Tailwind v4 `@theme` block (CSS) from a parsed DESIGN.md. */
export function toTailwindTheme(design: DesignMd, options: TailwindAdapterOptions = {}): string {
  const preset = toTailwindPreset(design, options);
  const lines: string[] = [];
  const e = preset.theme.extend;
  for (const [k, v] of Object.entries(e.colors as Record<string, string>)) lines.push(`--color-${kebab(k)}: ${v};`);
  for (const [k, v] of Object.entries(e.fontFamily as Record<string, string[]>)) lines.push(`--font-${kebab(k)}: ${v.join(', ')};`);
  for (const [k, v] of Object.entries(e.fontSize as Record<string, [string, Record<string, string>]>)) {
    lines.push(`--text-${kebab(k)}: ${v[0]};`);
    if (v[1].lineHeight) lines.push(`--text-${kebab(k)}--line-height: ${v[1].lineHeight};`);
    if (v[1].fontWeight) lines.push(`--text-${kebab(k)}--font-weight: ${v[1].fontWeight};`);
  }
  for (const [k, v] of Object.entries((e.spacing ?? {}) as Record<string, string>)) lines.push(`--spacing-${kebab(k)}: ${v};`);
  for (const [k, v] of Object.entries((e.borderRadius ?? {}) as Record<string, string>)) lines.push(`--radius-${kebab(k)}: ${v};`);
  return `@theme {\n  ${lines.join('\n  ')}\n}\n`;
}
