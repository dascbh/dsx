// DSX theme adapters — DESIGN.md parser (TypeScript, no dependencies). Copy into the project next to the adapter you
// use (mui.ts, css-vars.ts or tailwind.ts), e.g. src/dev/design-lab/design-md.ts.
//
// Reads the same format as the DSX linter (tools/lint-design-md.mjs, tools/lib/yaml-lite.mjs): YAML front matter
// with nested maps by indentation, scalars, inline lists and maps, block lists, comments, and {group.key}
// references. Multiline YAML text (| and >) is not supported, as in the linter. A parity test in the DSX
// (tools/test/design-lab.test.mjs) runs this file and the linter's parser over the same files.
//
// DSX convention for dark mode: an optional `colors-dark` group with the keys that change in the dark scheme
// (the rest is inherited from `colors`). A file without it has one scheme, light or dark by its background.
//
// Only erasable TypeScript (no enums, namespaces or parameter properties), so Node ≥ 22.18 can run it directly.

export type Scheme = 'light' | 'dark';
export type Scalar = string | number | boolean | null;
export type YamlValue = Scalar | YamlValue[] | { [key: string]: YamlValue };
export type YamlMap = { [key: string]: YamlValue };

export interface TypeLevel {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: string;
}

export interface DesignMd {
  /** `name` of the front matter (empty when absent). */
  name: string;
  description: string;
  /** Front matter as parsed, references untouched. */
  frontMatter: YamlMap;
  /** `colors`, references resolved. */
  colors: Record<string, string>;
  /** Full dark palette (`colors` overridden by `colors-dark`), or null when the file declares no dark scheme. */
  colorsDark: Record<string, string> | null;
  /** Only the keys `colors-dark` declares (empty without it). */
  darkOverrides: Record<string, string>;
  typography: Record<string, TypeLevel>;
  spacing: Record<string, string>;
  rounded: Record<string, string>;
  /** `components`, each property resolved: a color/size reference becomes its value, a typography reference its level. */
  components: Record<string, Record<string, string | TypeLevel>>;
  /** Schemes the file supports: both with `colors-dark`, otherwise the one its background implies. */
  schemes: Scheme[];
}

export interface StatusRole { main?: string; container?: string; onContainer?: string; border?: string }

/** Semantic roles with the synonyms used across DESIGN.md files (DSX names first, then common library names). */
export interface Roles {
  background?: string;
  surface?: string;
  surfaceVariant?: string;
  text?: string;
  textSecondary?: string;
  link?: string;
  border?: string;
  borderStrong?: string;
  focus?: string;
  primary?: string;
  primaryHover?: string;
  onPrimary?: string;
  secondary?: string;
  onSecondary?: string;
  danger?: string;
  onDanger?: string;
  tableHeader?: string;
  onTableHeader?: string;
  tableZebra?: string;
  tableHover?: string;
  success: StatusRole;
  warning: StatusRole;
  error: StatusRole;
  info: StatusRole;
}

// ------------------------------------------------------------------ YAML subset (same rules as tools/lib/yaml-lite.mjs)

const opensQuote = (prev: string | undefined) => prev === undefined || /[\s[{,:]/.test(prev);

function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = '';
  for (const ch of s) {
    if (quote) { if (ch === quote) quote = null; cur += ch; continue; }
    if ((ch === '"' || ch === "'") && opensQuote(cur.at(-1))) { quote = ch; cur += ch; continue; }
    if (ch === '[' || ch === '{' || ch === '(') depth++;
    if (ch === ']' || ch === '}' || ch === ')') depth--;
    if (depth === 0 && ch === sep) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function stripComment(line: string): string {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if ((ch === '"' || ch === "'") && opensQuote(line[i - 1])) { quote = ch; continue; }
    if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i).replace(/\s+$/, '');
  }
  return line;
}

function scalar(raw: string): YamlValue {
  const v = raw.trim();
  if (v === '') return null;
  if (/^".*"$/.test(v) || /^'.*'$/.test(v)) return v.slice(1, -1);
  if (/^\{.*:.*\}$/.test(v)) {
    const out: YamlMap = {};
    for (const pair of splitTop(v.slice(1, -1), ',')) {
      const i = pair.indexOf(':');
      if (i > 0) out[pair.slice(0, i).trim().replace(/^["']|["']$/g, '')] = scalar(pair.slice(i + 1));
    }
    return out;
  }
  if (/^\[.*\]$/.test(v)) {
    const inner = v.slice(1, -1).trim();
    return inner ? splitTop(inner, ',').map((x) => scalar(x)) : [];
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === 'true' || v === 'false') return v === 'true';
  return v;
}

interface Frame { indent: number; obj: YamlMap | YamlValue[]; parent?: YamlMap; key?: string; item?: boolean }

/** Parses the YAML subset of DESIGN.md/UX.md front matter. Throws with the line number when it cannot. */
export function parseYaml(text: string): YamlMap {
  const root: YamlMap = {};
  const stack: Frame[] = [{ indent: -1, obj: root }];
  const top = () => stack[stack.length - 1];
  const setKey = (entry: Frame, rest: string, indent: number, lineNo: number, line: string) => {
    const m = rest.match(/^("[^"]+"|'[^']+'|[^:]+):(.*)$/);
    if (!m) throw new Error(`YAML line ${lineNo}: not recognized: "${line.trim()}"`);
    const key = m[1].replace(/^["']|["']$/g, '').trim();
    const val = scalar(m[2]);
    const obj = entry.obj as YamlMap;
    if (val === null) {
      const child: YamlMap = {};
      obj[key] = child;
      stack.push({ indent, obj: child, parent: obj, key });
    } else obj[key] = val;
  };
  text.split('\n').forEach((line, i) => {
    const noComment = stripComment(line);
    if (!noComment.trim()) return;
    const indent = (noComment.match(/^ */) ?? [''])[0].length;
    const trimmed = noComment.trim();
    const dash = trimmed.match(/^-(?:\s+(.*))?$/);
    if (dash) {
      while (stack.length > 1 && (top().indent > indent || (top().indent === indent && top().item))) stack.pop();
      const owner = top();
      if (!owner.parent || owner.key === undefined) throw new Error(`YAML line ${i + 1}: list item without an owning key: "${line.trim()}"`);
      if (!Array.isArray(owner.obj)) {
        if (Object.keys(owner.obj).length) throw new Error(`YAML line ${i + 1}: list and map mixed in "${owner.key}"`);
        const list: YamlValue[] = [];
        owner.obj = list;
        owner.parent[owner.key] = list;
      }
      const rest = (dash[1] ?? '').trim();
      if (!rest) throw new Error(`YAML line ${i + 1}: empty list item or list inside a list (not supported)`);
      const contentIndent = indent + noComment.slice(indent).indexOf(rest);
      const isPair = /^("[^"]+"|'[^']+'|[^:[{"']+):(\s|$)/.test(rest);
      const list = owner.obj as YamlValue[];
      if (!isPair) { list.push(scalar(rest)); return; }
      const item: YamlMap = {};
      list.push(item);
      const entry: Frame = { indent: contentIndent, obj: item, item: true };
      stack.push(entry);
      setKey(entry, rest, contentIndent, i + 1, line);
      return;
    }
    while (stack.length > 1 && (top().item ? indent < top().indent : indent <= top().indent)) stack.pop();
    const t = top();
    if (Array.isArray(t.obj)) throw new Error(`YAML line ${i + 1}: key inside a list without "- ": "${line.trim()}"`);
    setKey(t, trimmed, indent, i + 1, line);
  });
  return root;
}

/** Splits front matter (--- ... ---) from the Markdown body. */
export function splitFrontMatter(md: string): { frontMatter: string | null; body: string } {
  const m = md.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return m ? { frontMatter: m[1], body: m[2] } : { frontMatter: null, body: md };
}

// ------------------------------------------------------------------ colors and sizes

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Relative luminance (WCAG 2.x) of a #rgb/#rrggbb color; null for anything else. */
export function luminance(color: string | undefined): number | null {
  if (!color || !HEX.test(color)) return null;
  const h = color.slice(1);
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two hex colors, or null when either is not hex. */
export function contrast(a: string | undefined, b: string | undefined): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Size in px: a px string → its number, "0.75rem"/"0.75em" → 12, a number → itself; NaN when unreadable. */
export function px(value: unknown): number {
  if (typeof value === 'number') return value;
  const s = String(value ?? '').trim();
  const n = parseFloat(s);
  if (Number.isNaN(n)) return NaN;
  return /r?em$/.test(s) ? n * 16 : n;
}

/** First family of a font stack, unquoted: "'IBM Plex Sans', system-ui" → "IBM Plex Sans". */
export function primaryFamily(stack: string | undefined): string | null {
  const first = String(stack ?? '').split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || null;
}

const GENERIC_FAMILIES = /^(system-ui|ui-sans-serif|ui-serif|ui-monospace|sans-serif|serif|monospace|cursive|-apple-system|BlinkMacSystemFont|Segoe UI|Helvetica Neue|Helvetica|Arial|Georgia|Times New Roman|Menlo|Consolas)$/i;

/** Web font families a design needs (generic and system families left out), in order of first use. */
export function webFontFamilies(design: DesignMd): string[] {
  const out: string[] = [];
  for (const level of Object.values(design.typography)) {
    for (const f of String(level.fontFamily ?? '').split(',')) {
      const name = f.trim().replace(/^['"]|['"]$/g, '');
      if (name && !GENERIC_FAMILIES.test(name) && !out.includes(name)) out.push(name);
    }
  }
  return out;
}

/** Google Fonts stylesheet URLs for the design's families (400–700). */
export function googleFontUrls(design: DesignMd): string[] {
  return webFontFamilies(design).map((f) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`);
}

// ------------------------------------------------------------------ parse + normalize

const isMap = (v: unknown): v is YamlMap => !!v && typeof v === 'object' && !Array.isArray(v);

function lookup(fm: YamlMap, path: string): YamlValue | undefined {
  let cur: YamlValue | undefined = fm;
  for (const k of path.split('.')) cur = isMap(cur) ? cur[k] : undefined;
  return cur;
}

/** Follows {group.key} references (up to 5 hops). A reference to a map returns the map. */
function resolveRef(fm: YamlMap, v: YamlValue | undefined): YamlValue | undefined {
  for (let i = 0; i < 5 && typeof v === 'string' && /^\{[^}]+\}$/.test(v); i++) v = lookup(fm, v.slice(1, -1));
  return v;
}

function stringMap(fm: YamlMap, group: YamlValue | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isMap(group)) return out;
  for (const [k, v] of Object.entries(group)) {
    const r = resolveRef(fm, v);
    if (r !== null && r !== undefined && !isMap(r) && !Array.isArray(r)) out[k] = String(r);
  }
  return out;
}

function typeLevelOf(fm: YamlMap, v: YamlValue | undefined): TypeLevel {
  const out: TypeLevel = {};
  if (!isMap(v)) return out;
  for (const [k, raw] of Object.entries(v)) {
    const r = resolveRef(fm, raw);
    if (r === null || r === undefined || isMap(r) || Array.isArray(r)) continue;
    if (k === 'fontWeight' || k === 'lineHeight') (out as Record<string, string | number>)[k] = typeof r === 'number' ? r : String(r);
    else (out as Record<string, string>)[k] = String(r);
  }
  return out;
}

/** Parses a DESIGN.md into normalized tokens. Throws when the front matter is missing or unreadable. */
export function parseDesignMd(markdown: string): DesignMd {
  const { frontMatter } = splitFrontMatter(markdown);
  if (frontMatter === null) throw new Error('DESIGN.md without front matter: the tokens cannot be read.');
  const fm = parseYaml(frontMatter);
  const colors = stringMap(fm, fm.colors);
  const darkOverrides = stringMap(fm, fm['colors-dark']);
  const colorsDark = Object.keys(darkOverrides).length ? { ...colors, ...darkOverrides } : null;
  const typography: Record<string, TypeLevel> = {};
  if (isMap(fm.typography)) for (const [k, v] of Object.entries(fm.typography)) typography[k] = typeLevelOf(fm, v);
  const components: Record<string, Record<string, string | TypeLevel>> = {};
  if (isMap(fm.components)) {
    for (const [name, def] of Object.entries(fm.components)) {
      if (!isMap(def)) continue;
      const props: Record<string, string | TypeLevel> = {};
      for (const [prop, raw] of Object.entries(def)) {
        const r = resolveRef(fm, raw);
        if (isMap(r)) props[prop] = typeLevelOf(fm, r);
        else if (r !== null && r !== undefined && !Array.isArray(r)) {
          // padding such as "{spacing.2} {spacing.4}" holds several references
          props[prop] = String(r).replace(/\{([^}]+)\}/g, (m, path: string) => {
            const x = resolveRef(fm, lookup(fm, path));
            return x !== undefined && x !== null && !isMap(x) && !Array.isArray(x) ? String(x) : m;
          });
        }
      }
      components[name] = props;
    }
  }
  const natural: Scheme = isDarkColor(pick(colors, BACKGROUND_KEYS)) ? 'dark' : 'light';
  const schemes: Scheme[] = colorsDark ? (natural === 'dark' ? ['dark'] : ['light', 'dark']) : [natural];
  return {
    name: typeof fm.name === 'string' ? fm.name : '',
    description: typeof fm.description === 'string' ? fm.description : '',
    frontMatter: fm,
    colors,
    colorsDark: natural === 'dark' ? null : colorsDark,
    darkOverrides: natural === 'dark' ? {} : darkOverrides,
    typography,
    spacing: stringMap(fm, fm.spacing),
    rounded: stringMap(fm, fm.rounded),
    components,
    schemes,
  };
}

/** True for a dark background (luminance below 0.2). Unknown colors count as light. */
export function isDarkColor(color: string | undefined): boolean {
  const l = luminance(color);
  return l !== null && l < 0.2;
}

/** The scheme to render: the requested one when the file supports it, otherwise the file's only scheme. */
export function schemeOf(design: DesignMd, requested?: Scheme): Scheme {
  if (requested && design.schemes.includes(requested)) return requested;
  return design.schemes[0];
}

/** Palette of one scheme (`colors`, or `colors` + `colors-dark`). */
export function paletteOf(design: DesignMd, scheme: Scheme): Record<string, string> {
  return scheme === 'dark' && design.colorsDark ? design.colorsDark : design.colors;
}

// ------------------------------------------------------------------ roles (synonyms)

const BACKGROUND_KEYS = ['canvas', 'background', 'bg', 'surface-container-lowest'];
/** Role → keys tried in order. DSX names first; then names common in the DESIGN.md library and Material 3. */
export const ROLE_KEYS: Record<Exclude<keyof Roles, 'success' | 'warning' | 'error' | 'info'>, string[]> = {
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

function pick(palette: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) if (palette[k]) return palette[k];
  return undefined;
}

function status(palette: Record<string, string>, name: 'success' | 'warning' | 'error' | 'info'): StatusRole {
  const alt = name === 'error' ? ['error', 'danger'] : [name];
  const first = (suffixes: string[]) => pick(palette, alt.flatMap((n) => suffixes.map((s) => s.replace('*', n))));
  return {
    main: first(['*', '*-main']),
    container: first(['*-container', '*-bg', '*-background', '*-surface']),
    onContainer: first(['on-*-container', 'on-*-bg', '*-text', '*-foreground']),
    border: first(['*-border']),
  };
}

/** Semantic roles of a palette (no scheme rule). A role the palette does not declare stays undefined. */
export function rolesOfPalette(p: Record<string, string>): Roles {
  const out = { success: status(p, 'success'), warning: status(p, 'warning'), error: status(p, 'error'), info: status(p, 'info') } as Roles;
  for (const [role, keys] of Object.entries(ROLE_KEYS)) (out as unknown as Record<string, string | undefined>)[role] = pick(p, keys);
  return out;
}

/**
 * Roles that only make sense when the dark scheme declares them: a light hover, status tint or danger red inherited
 * into dark mode is usually unreadable there, so in dark they come from `colors-dark` or stay undefined (the product
 * theme keeps its own dark value).
 */
export const DARK_EXPLICIT_ROLES = ['primaryHover', 'secondary', 'onSecondary', 'danger', 'onDanger', 'surfaceVariant', 'tableZebra', 'tableHover', 'success', 'warning', 'error', 'info'];

/** Semantic roles of one scheme, with the dark rule above. Adapters never invent a color. */
export function rolesOf(design: DesignMd, scheme: Scheme = schemeOf(design)): Roles {
  const all = rolesOfPalette(paletteOf(design, scheme));
  if (scheme !== 'dark' || !design.colorsDark) return all;
  const only = rolesOfPalette(design.darkOverrides) as unknown as Record<string, unknown>;
  const out = all as unknown as Record<string, unknown>;
  for (const r of DARK_EXPLICIT_ROLES) out[r] = only[r];
  return all;
}

/** Typography role → level names tried in order (DSX names, then the library's). */
export const TYPE_KEYS: Record<string, string[]> = {
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

/** Type level for a role (h1…h6, body, bodySmall, label, caption, button, code), by synonym. */
export function typeOf(design: DesignMd, role: string): TypeLevel | undefined {
  for (const k of TYPE_KEYS[role] ?? [role]) if (design.typography[k]) return design.typography[k];
  return undefined;
}

/** Base spacing unit in px: spacing "1" when it is the base, else the smallest step ≥ 4; NaN when undeclared. */
export function spacingUnit(design: DesignMd): number {
  const s = design.spacing;
  const one = px(s['1']);
  const two = px(s['2']);
  // DSX scale ("1" = 4, "2" = 8…) and MUI-like scale ("1" = 8, "0.5" = 4) both keep "1" meaningful; MUI's
  // unit is the step of 8, so a scale whose "1" is 4 and "2" is 8 yields 8.
  if (!Number.isNaN(one) && !Number.isNaN(two) && Math.abs(two - one * 2) < 0.01 && one < 6) return two;
  if (!Number.isNaN(one)) return one;
  const md = px(s.md ?? s.base ?? s.DEFAULT);
  if (!Number.isNaN(md)) return md / 2 >= 4 ? md / 2 : md;
  return NaN;
}

/** Control radius in px: button-primary's, else rounded.md, DEFAULT, sm; NaN when undeclared. */
export function controlRadius(design: DesignMd): number {
  const fromButton = design.components['button-primary']?.rounded;
  const candidates = [typeof fromButton === 'string' ? fromButton : undefined, design.rounded.md, design.rounded.DEFAULT, design.rounded.sm, design.rounded.base];
  for (const c of candidates) { const n = px(c); if (!Number.isNaN(n)) return n >= 999 ? 999 : n; }
  return NaN;
}
