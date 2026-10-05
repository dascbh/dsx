// DSX theme adapters — DESIGN.md → MUI theme options. Copy next to design-md.ts.
//
// Pure functions, no runtime dependency on MUI (types only). Over an existing (product) theme, as a nested provider
// in the live switcher and in captures:
//   <ThemeProvider theme={(outer) => createTheme(themeOptionsOver(outer, design))}>
// themeOptionsOver seeds the options with the product theme's resolved values and lets createTheme rebuild the
// palette, so derived colors (hover, contrast text) follow the new main colors. Do NOT pass the product theme as the
// first argument of createTheme with these options after it: MUI only processes palette and spacing from the first
// argument, so the derived colors would stay the product's and a numeric spacing would replace its function.
// From scratch (no product theme): createTheme(toMuiThemeOptions(design, { mode })).
//
// What maps: palette by role (light and dark), typography levels, control radius, spacing unit and — with
// `components: true` (default) — the color slots of common components that products often fix in their own theme
// (app bar, drawer, navigation item, table head/body/cell, outlined paper, card, outlined input, label, alert, chip
// tones, button). A role the DESIGN.md does not declare is left out, so the product theme keeps its value: the
// adapter never invents a color.
import type { Theme, ThemeOptions } from '@mui/material/styles';
import type { DesignMd, Scheme, TypeLevel } from './design-md';
import { contrast, controlRadius, px, rolesOf, schemeOf, spacingUnit, typeOf } from './design-md';

export interface MuiAdapterOptions {
  /** Scheme asked by the product (its light/dark toggle). A file with a single scheme always renders that one. */
  mode?: Scheme;
  /** Also restyle the color slots of common components (default true). */
  components?: boolean;
}

type Css = Record<string, unknown>;
const defined = (o: Css): Css => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(typeof v === 'number' && Number.isNaN(v))));
const nonEmpty = (o: Css) => Object.keys(o).length > 0;
const mix = (color: string | undefined, percent: number) => (color ? `color-mix(in srgb, ${color} ${percent}%, transparent)` : undefined);

function typeCss(level: TypeLevel | undefined, family?: string): Css | undefined {
  if (!level) return undefined;
  const size = px(level.fontSize);
  const out = defined({
    fontFamily: level.fontFamily ?? family,
    fontSize: Number.isNaN(size) ? undefined : `${size / 16}rem`,
    fontWeight: level.fontWeight !== undefined ? Number(level.fontWeight) || level.fontWeight : undefined,
    lineHeight: level.lineHeight !== undefined ? (typeof level.lineHeight === 'number' || /^[\d.]+$/.test(String(level.lineHeight)) ? Number(level.lineHeight) : level.lineHeight) : undefined,
    letterSpacing: level.letterSpacing,
  });
  return nonEmpty(out) ? out : undefined;
}

/** Text color with the better contrast over `bg`, chosen among declared colors only. */
function readableOn(bg: string | undefined, ...candidates: (string | undefined)[]): string | undefined {
  let best: string | undefined;
  let bestRatio = 0;
  for (const c of candidates) {
    const r = contrast(c, bg);
    if (c && r !== null && r > bestRatio) { best = c; bestRatio = r; }
  }
  return best;
}

/** MUI ThemeOptions from a parsed DESIGN.md. Merge it over the product theme with createTheme(outer, options). */
export function toMuiThemeOptions(design: DesignMd, options: MuiAdapterOptions = {}): ThemeOptions {
  const mode = schemeOf(design, options.mode);
  const r = rolesOf(design, mode);
  const body = typeOf(design, 'body');
  const family = body?.fontFamily ?? typeOf(design, 'h1')?.fontFamily;
  const headingFamily = typeOf(design, 'h1')?.fontFamily ?? typeOf(design, 'h2')?.fontFamily ?? family;
  const radius = controlRadius(design);
  const unit = spacingUnit(design);

  const status = (s: { main?: string; onContainer?: string }) => {
    const main = s.main ?? s.onContainer;
    return main ? { main } : undefined;
  };
  const palette = defined({
    mode,
    primary: r.primary ? defined({ main: r.primary, dark: r.primaryHover, contrastText: r.onPrimary }) : undefined,
    secondary: r.secondary ? defined({ main: r.secondary, contrastText: r.onSecondary }) : undefined,
    error: r.danger ? defined({ main: r.danger, contrastText: r.onDanger }) : status(r.error),
    warning: status(r.warning),
    success: status(r.success),
    info: status(r.info),
    background: r.background || r.surface ? defined({ default: r.background ?? r.surface, paper: r.surface ?? r.background }) : undefined,
    text: r.text ? defined({ primary: r.text, secondary: r.textSecondary }) : undefined,
    divider: r.border,
  });

  const heading = (role: string) => typeCss(typeOf(design, role), headingFamily);
  const typography = defined({
    fontFamily: family,
    h1: heading('h1'), h2: heading('h2'), h3: heading('h3'), h4: heading('h4'), h5: heading('h5'), h6: heading('h6'),
    body1: typeCss(body, family),
    body2: typeCss(typeOf(design, 'bodySmall'), family),
    subtitle2: typeCss(typeOf(design, 'label'), family),
    caption: typeCss(typeOf(design, 'caption'), family),
    button: typeCss(typeOf(design, 'button'), family),
  });

  const themeOptions: ThemeOptions = { palette: palette as ThemeOptions['palette'], typography: typography as ThemeOptions['typography'] };
  if (!Number.isNaN(radius)) themeOptions.shape = { borderRadius: radius };
  if (!Number.isNaN(unit)) themeOptions.spacing = unit;
  if (options.components !== false) themeOptions.components = componentOverrides(design, mode, radius) as ThemeOptions['components'];
  return themeOptions;
}

function componentOverrides(design: DesignMd, mode: Scheme, radius: number): Css {
  const r = rolesOf(design, mode);
  const c = design.components;
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const header = c['table-header'] ?? {};
  const headerBg = str(header.backgroundColor) ?? r.tableHeader ?? r.surfaceVariant ?? r.surface;
  const headerText = str(header.textColor) ?? r.onTableHeader ?? readableOn(headerBg, r.text, r.onPrimary, r.background);
  const surface = r.surface ?? r.background;
  const rowEven = r.tableZebra ?? r.background;
  const button = c['button-primary'] ?? {};
  const input = c.input ?? c['text-field'] ?? {};
  const cell = c['table-cell'] ?? {};
  const radiusPx = Number.isNaN(radius) ? undefined : radius;
  const out: Css = {};
  const add = (name: string, value: Css | undefined) => { if (value && nonEmpty(value)) out[name] = value; };
  const styles = (slots: Record<string, Css | undefined>) => {
    const kept = Object.fromEntries(Object.entries(slots).map(([k, v]) => [k, v ? defined(v) : undefined]).filter(([, v]) => v && nonEmpty(v as Css)));
    return nonEmpty(kept) ? { styleOverrides: kept } : undefined;
  };

  add('MuiAppBar', styles({ root: { backgroundColor: surface, color: r.text, borderBottomColor: r.primary } }));
  add('MuiDrawer', styles({ paper: { backgroundColor: surface, borderRightColor: r.border } }));
  add('MuiListItemButton', styles({
    root: defined({
      color: r.textSecondary ?? r.text,
      '&:hover': r.primary ? { backgroundColor: mix(r.primary, 6) } : undefined,
      '&.Mui-selected': r.primary ? defined({ backgroundColor: mix(r.primary, 10), color: r.text, borderLeftColor: r.primary }) : undefined,
    }),
  }));
  add('MuiTableHead', styles({
    root: defined({
      backgroundColor: headerBg,
      '& .MuiTableCell-head': defined({ color: headerText, ...(typeCss(typeof header.typography === 'object' ? header.typography : typeOf(design, 'label')) ?? {}) }),
    }),
  }));
  add('MuiTableBody', styles({
    root: {
      '& .MuiTableRow-root': defined({
        borderBottomColor: r.border,
        '&:nth-of-type(even)': rowEven ? { backgroundColor: rowEven } : undefined,
        '&:nth-of-type(odd)': surface ? { backgroundColor: surface } : undefined,
        '&:hover': r.tableHover ? { backgroundColor: r.tableHover } : undefined,
      }),
    },
  }));
  add('MuiTableCell', styles({
    root: defined({ borderBottomColor: r.border, padding: str(cell.padding), ...(typeCss(typeof cell.typography === 'object' ? cell.typography : typeOf(design, 'bodySmall')) ?? {}) }),
  }));
  add('MuiPaper', styles({ outlined: { borderColor: r.border, backgroundColor: surface } }));
  add('MuiCard', styles({ root: { borderColor: r.border, borderRadius: px(str(c.card?.rounded)) || undefined } }));
  add('MuiOutlinedInput', styles({
    root: defined({
      backgroundColor: str(input.backgroundColor) ?? surface,
      borderRadius: px(str(input.rounded)) || radiusPx,
      minHeight: px(str(input.height)) || undefined,
      '& .MuiOutlinedInput-notchedOutline': r.borderStrong || str(input.borderColor) ? { borderColor: str(input.borderColor) ?? r.borderStrong } : undefined,
      '&:hover .MuiOutlinedInput-notchedOutline': r.primary ? { borderColor: r.primary } : undefined,
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': r.focus ?? r.primary ? { borderColor: r.focus ?? r.primary } : undefined,
    }),
  }));
  add('MuiInputLabel', styles({ root: defined({ color: r.textSecondary ?? r.text, '&.Mui-focused': r.primary ? { color: r.primary } : undefined }) }));
  add('MuiButton', styles({
    root: defined({ borderRadius: px(str(button.rounded)) || radiusPx, padding: str(button.padding), minHeight: px(str(button.height)) || undefined }),
  }));
  add('MuiAlert', styles({ root: { borderRadius: radiusPx } }));

  // Chip tones: only when the file declares the container colors; otherwise the product keeps its own.
  const tones = (['success', 'error', 'warning', 'info'] as const).filter((t) => r[t].container && r[t].onContainer);
  if (tones.length) {
    out.MuiChip = {
      variants: tones.map((t) => ({
        props: { color: t },
        style: defined({ backgroundColor: r[t].container, color: r[t].onContainer, borderColor: r[t].border ?? r[t].onContainer, borderStyle: 'solid', borderWidth: 1 }),
      })),
    };
  }
  return out;
}

const isPlain = (v: unknown): v is Css => !!v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

/** Deep merge of plain objects; arrays, functions and other values from `b` replace those of `a`. */
export function mergeOptions(a: unknown, b: unknown): unknown {
  if (b === undefined) return a;
  if (!isPlain(a) || !isPlain(b)) return b;
  const out: Css = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = mergeOptions(a[k], v);
  return out;
}

const PALETTE_COLORS = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const;
const TYPE_VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline'] as const;

/**
 * Complete ThemeOptions for createTheme(): the product theme's resolved values (palette main colors and declared
 * contrast/hover, typography variants, shape, spacing, component overrides) with the design option on top. A palette
 * color the option declares replaces the product's whole entry (its derived shades are rebuilt by createTheme); a new
 * font family drops the product's per-variant families unless the option names one for that variant. When the option
 * renders another scheme than the product (a dark-only file in a light product), the product's background, text and
 * divider are not carried over.
 */
export function themeOptionsOver(outer: Theme, design: DesignMd, options: Omit<MuiAdapterOptions, 'mode'> = {}): ThemeOptions {
  const ours = toMuiThemeOptions(design, { ...options, mode: outer.palette.mode }) as Css;
  const op = outer.palette as unknown as Record<string, Css>;
  const oursPalette = (ours.palette ?? {}) as Css;
  const sameMode = oursPalette.mode === outer.palette.mode;
  const palette: Css = { mode: oursPalette.mode };
  for (const k of PALETTE_COLORS) {
    if (oursPalette[k]) { palette[k] = oursPalette[k]; continue; }
    const c = op[k];
    if (c?.main) palette[k] = defined({ main: c.main, contrastText: sameMode ? c.contrastText : undefined });
  }
  if (sameMode) {
    palette.background = mergeOptions({ default: outer.palette.background.default, paper: outer.palette.background.paper }, oursPalette.background);
    palette.text = mergeOptions({ primary: outer.palette.text.primary, secondary: outer.palette.text.secondary }, oursPalette.text);
    palette.divider = oursPalette.divider ?? outer.palette.divider;
  } else {
    for (const k of ['background', 'text', 'divider']) if (oursPalette[k] !== undefined) palette[k] = oursPalette[k];
  }

  const ot = outer.typography as unknown as Css;
  const oursType = (ours.typography ?? {}) as Css;
  const newFamily = typeof oursType.fontFamily === 'string';
  const typography: Css = { fontFamily: oursType.fontFamily ?? ot.fontFamily };
  for (const v of TYPE_VARIANTS) {
    const seeded = isPlain(ot[v]) ? { ...(ot[v] as Css) } : {};
    if (newFamily) delete seeded.fontFamily;
    typography[v] = mergeOptions(seeded, oursType[v]);
  }

  const unit = Number.parseFloat(String(outer.spacing(1)));
  return {
    palette: palette as ThemeOptions['palette'],
    typography: typography as ThemeOptions['typography'],
    shape: (ours.shape as ThemeOptions['shape']) ?? { ...outer.shape },
    spacing: (ours.spacing as number | undefined) ?? (Number.isNaN(unit) ? undefined : unit),
    components: mergeOptions(outer.components ?? {}, ours.components ?? {}) as ThemeOptions['components'],
  };
}
