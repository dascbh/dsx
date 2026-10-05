#!/usr/bin/env node
// Bridge between the DSX DESIGN.md and a Stitch design system.
//
//   node tools/stitch/design-system.mjs export <DESIGN.md> [-o .stitch/DESIGN.md]
//       → DESIGN.md adjusted for Stitch, to be sent with upload_design_md +
//         create_design_system_from_design_md.
//   node tools/stitch/design-system.mjs check <DESIGN.md> <list_design_systems-output.json> [--asset <id>] [--json]
//       → what Stitch kept, changed or added. Exits 1 when a DSX role disappeared,
//         the brand color changed, or radius/font diverge.
//
// What the tests against the real Stitch showed (2026-10-02):
//  - Importing through DESIGN.md keeps the named colors of the front matter. `update_design_system`, however,
//    only accepts the Material 3 model (seed color + overrides) and ERASES the named colors: never use
//    update_design_system to sync DSX.
//  - The Stitch radius level (4/8/12/full) comes from the first entry of `rounded`. Without a `DEFAULT`,
//    it takes the smallest DSX radius (sm) and screens end up with a 4px radius. The export declares
//    `DEFAULT` = the DSX control radius (button/field).
//  - Stitch adds ~40 Material 3 roles (primary-container, surface-variant…). They do not exist
//    in DSX: on the way back to code, map them to DSX tokens (see `mapping` in `check`).
// --json output of check: { ok, problems, warnings, preserved, changed: [{ role, dsx, stitch }], missing,
//   extras, mapping, unmapped, roundness }.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseYaml, splitFrontMatter } from '../lib/yaml-lite.mjs';
import { parseCli } from '../lib/legacy-cli.mjs';

// Fonts Stitch accepts (enum of the MCP schema, deprecated ones removed).
export const STITCH_FONTS = new Set(`BE_VIETNAM_PRO EPILOGUE INTER LEXEND MANROPE NEWSREADER NOTO_SERIF PLUS_JAKARTA_SANS
PUBLIC_SANS SPACE_GROTESK SPLINE_SANS WORK_SANS DOMINE LIBRE_CASLON_TEXT EB_GARAMOND LITERATA SOURCE_SERIF_4 MONTSERRAT
METROPHOBIC SOURCE_SANS_3 NUNITO_SANS ARIMO HANKEN_GROTESK RUBIK GEIST DM_SANS IBM_PLEX_SANS SORA ANYBODY ANTON
ARCHIVO_NARROW ATKINSON_HYPERLEGIBLE_NEXT BARLOW_CONDENSED BEBAS_NEUE BODONI_MODA BRICOLAGE_GROTESQUE CHIVO
CLIMATE_CRISIS COMFORTAA COURIER_PRIME FIRA_SANS GOOGLE_SANS GOOGLE_SANS_CODE GOOGLE_SANS_FLEX GOOGLE_SANS_MONO
GOOGLE_SANS_TEXT IBM_PLEX_SERIF JETBRAINS_MONO KARLA LIBRE_FRANKLIN MERRIWEATHER NOTO_SANS OPEN_SANS OSWALD OUTFIT
PLAYFAIR_DISPLAY POIRET_ONE QUESTRIAL QUICKSAND RALEWAY ROBOTO_FLEX SPACE_MONO SYNE VOLLKORN`.split(/\s+/));
const FONT_ALIASES = { ROBOTO: 'ROBOTO_FLEX', SOURCE_SERIF_FOUR: 'SOURCE_SERIF_4', SOURCE_SANS_THREE: 'SOURCE_SANS_3' };
const RADIUS_LEVELS = [[4, 'ROUND_FOUR'], [8, 'ROUND_EIGHT'], [12, 'ROUND_TWELVE']];

/** Stitch Material 3 roles → DSX semantic token, for the way back to code. */
export const MATERIAL_MAPPING = {
  primary: 'color.action.primary', 'primary-container': 'color.action.primary', 'on-primary': 'color.text.on-action',
  'on-primary-container': 'color.text.on-action', 'surface-tint': 'color.action.primary', 'inverse-primary': 'color.text.link',
  background: 'color.bg.canvas', 'surface-container-lowest': 'color.bg.canvas', 'surface-bright': 'color.bg.canvas',
  surface: 'color.bg.surface', 'surface-container-low': 'color.bg.surface', 'surface-container': 'color.bg.surface',
  'surface-container-high': 'color.bg.sunken', 'surface-container-highest': 'color.bg.sunken', 'surface-variant': 'color.bg.sunken', 'surface-dim': 'color.bg.sunken',
  'on-surface': 'color.text.primary', 'on-background': 'color.text.primary', 'on-surface-variant': 'color.text.secondary',
  outline: 'color.border.strong', 'outline-variant': 'color.border.default',
  error: 'color.action.danger', 'on-error': 'color.text.on-action', 'error-container': 'color.feedback.danger-bg', 'on-error-container': 'color.feedback.danger-text',
  'inverse-surface': 'color.bg.inverse', 'inverse-on-surface': 'color.text.inverse',
  secondary: 'color.text.secondary', 'secondary-container': 'color.action.secondary', 'on-secondary-container': 'color.text.primary',
  // The tertiary family (derived as orange from the purple) is what Stitch uses for warning states.
  tertiary: 'color.feedback.warning-icon', 'tertiary-container': 'color.feedback.warning-bg', 'on-tertiary-container': 'color.feedback.warning-text',
  'tertiary-fixed': 'color.feedback.warning-bg', 'tertiary-fixed-dim': 'color.feedback.warning-icon', 'on-tertiary-fixed': 'color.feedback.warning-text',
};

const px = (v) => (typeof v === 'number' ? v : parseFloat(String(v)) * (/rem$/.test(String(v)) ? 16 : 1));

export function readDesignMd(text) {
  const { frontMatter } = splitFrontMatter(text);
  if (!frontMatter) throw new Error('DESIGN.md has no front matter: run tools/lint-design-md.mjs first.');
  const fm = parseYaml(frontMatter);
  const resolve = (v) => {
    for (let i = 0; i < 5 && typeof v === 'string' && /^\{.+\}$/.test(v); i++) v = v.slice(1, -1).split('.').reduce((o, k) => o?.[k], fm);
    return v;
  };
  return { fm, resolve };
}

export function stitchFont(family) {
  if (!family) return null;
  const k = String(family).split(',')[0].trim().replace(/["']/g, '').toUpperCase().replace(/[\s-]+/g, '_');
  const v = FONT_ALIASES[k] ?? k;
  return STITCH_FONTS.has(v) ? v : null;
}

export function stitchRadius(value) {
  const n = px(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 999) return 'ROUND_FULL';
  return RADIUS_LEVELS.reduce((m, r) => (Math.abs(r[0] - n) < Math.abs(m[0] - n) ? r : m))[1];
}

/** DSX control radius: the primary button's, else rounded.md. */
function controlRadius(fm, resolve) {
  return resolve(fm.components?.['button-primary']?.rounded) ?? resolve(fm.rounded?.md) ?? resolve(fm.rounded?.DEFAULT) ?? null;
}

/** DSX DESIGN.md → DESIGN.md for Stitch, with warnings for what has no equivalent there. */
export function exportDesignMd(text) {
  const { fm, resolve } = readDesignMd(text);
  const warnings = [];
  if (!fm.colors?.primary) throw new Error('DESIGN.md has no colors.primary.');
  let output = text;
  const ctrl = controlRadius(fm, resolve);
  if (ctrl && fm.rounded && !('DEFAULT' in fm.rounded)) {
    const m = output.match(/^rounded:[ \t]*\n/m);
    if (m) output = output.replace(m[0], `${m[0]}  DEFAULT: ${ctrl}\n`);
  }
  const level = stitchRadius(ctrl);
  if (ctrl && level && px(ctrl) !== { ROUND_FOUR: 4, ROUND_EIGHT: 8, ROUND_TWELVE: 12, ROUND_FULL: 9999 }[level]) {
    warnings.push(`Control radius ${ctrl} does not exist in Stitch; it becomes ${level}.`);
  }
  warnings.push('Stitch derives the radius scale from a single level; DSX card/modal radii apply only in code.');
  for (const [typeLevel, t] of Object.entries(fm.typography ?? {})) {
    const fam = resolve(t?.fontFamily);
    if (fam && !stitchFont(fam)) warnings.push(`Font "${fam}" (${typeLevel}) does not exist in Stitch; it will substitute it. Keep it in code only.`);
  }
  return { text: output, warnings, expected: { roundness: level ?? 'ROUND_EIGHT' } };
}

/** Extracts a design system from a list_design_systems response (object, MCP text or client output). */
export function readStitchList(input, asset) {
  let d = typeof input === 'string' ? JSON.parse(input) : input;
  if (d?.content?.[0]) d = typeof d.content[0] === 'string' ? JSON.parse(d.content[0]) : JSON.parse(d.content[0].text);
  if (d?.structuredContent) d = d.structuredContent;
  const list = d.designSystems ?? [d];
  const target = asset ? list.find((x) => String(x.name ?? '').endsWith(asset)) : list.at(-1);
  if (!target) throw new Error(`Design system ${asset} not found in the listing.`);
  return target.designSystem ?? target;
}

export function checkDesignSystem(text, stitch) {
  const { fm, resolve } = readDesignMd(text);
  const th = stitch.theme ?? {};
  const nc = Object.fromEntries(Object.entries(th.namedColors ?? {}).map(([k, v]) => [k.replace(/_/g, '-'), String(v).toLowerCase()]));
  const ours = Object.fromEntries(Object.entries(fm.colors ?? {}).map(([k, v]) => [k, String(resolve(v) ?? '').toLowerCase()]));
  const preserved = [], changed = [], missing = [];
  for (const [k, v] of Object.entries(ours)) {
    if (!nc[k]) missing.push(k); else if (nc[k] === v) preserved.push(k); else changed.push({ role: k, dsx: v, stitch: nc[k] });
  }
  const extras = Object.keys(nc).filter((k) => !(k in ours));
  const { expected } = exportDesignMd(text);
  const problems = [], warnings = [];
  if (!Object.keys(nc).length) problems.push('the design system has no palette yet (Stitch processes asynchronously: list again in ~10 s)');
  else if (missing.length) problems.push(`${missing.length} DSX role(s) disappeared (${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}): was update_design_system used? Re-import from the exported DESIGN.md`);
  if (nc.primary && ours.primary && nc.primary !== ours.primary) {
    if (nc['primary-container'] === ours.primary) warnings.push(`the brand ${ours.primary} landed in primary-container; primary = ${nc.primary}. On the way back, both → color.action.primary`);
    else problems.push(`brand color changed: primary ${ours.primary} → ${nc.primary}`);
  }
  for (const x of changed.filter((a) => a.role !== 'primary')) warnings.push(`role ${x.role} changed by Stitch: ${x.dsx} → ${x.stitch} (a role with the same name in Material 3); use the DSX value in code`);
  if (th.roundness && th.roundness !== expected.roundness) problems.push(`radius = ${th.roundness}, expected ${expected.roundness}: import the DESIGN.md generated by \`export\` (it declares DEFAULT)`);
  const fonts = { headlineFont: resolve(fm.typography?.h1?.fontFamily) ?? resolve(fm.typography?.display?.fontFamily), bodyFont: resolve(fm.typography?.body?.fontFamily) };
  for (const [field, fam] of Object.entries(fonts)) {
    const f = stitchFont(fam);
    if (f && th[field] && th[field] !== f) problems.push(`${field} = ${th[field]}, expected ${f}`);
  }
  const mapping = Object.fromEntries(extras.filter((k) => MATERIAL_MAPPING[k]).map((k) => [k, MATERIAL_MAPPING[k]]));
  const unmapped = extras.filter((k) => !MATERIAL_MAPPING[k]);
  return { ok: problems.length === 0, problems, warnings, preserved, changed, missing, extras, mapping, unmapped, roundness: th.roundness };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseCli('stitch/design-system.mjs'); // aliases with a warning for old names
  // `-o <file>` (shortcut for --out): parseArgs only knows `--`, so handle it here.
  const io = a._.indexOf('-o');
  if (io >= 0 && a._[io + 1]) { a.o = a._[io + 1]; a._.splice(io, 2); }
  const [cmd, file, list] = a._;
  if (cmd === 'export' && file) {
    const r = exportDesignMd(readFileSync(file, 'utf8'));
    const dest = a.o ?? a.out;
    if (dest) { mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, r.text); console.error(`Written: ${dest}`); }
    else process.stdout.write(r.text);
    for (const w of r.warnings) console.error(`WARNING  ${w}`);
  } else if (cmd === 'check' && file && list) {
    const r = checkDesignSystem(readFileSync(file, 'utf8'), readStitchList(readFileSync(list, 'utf8'), a.asset));
    if (a.json) console.log(JSON.stringify(r, null, 2));
    else {
      const total = r.preserved.length + r.changed.length + r.missing.length;
      console.log(`DSX colors kept: ${r.preserved.length}/${total} · radius: ${r.roundness ?? '—'}`);
      for (const x of r.changed) console.log(`  CHANGED  ${x.role}: DSX ${x.dsx} → Stitch ${x.stitch}`);
      if (r.missing.length) console.log(`  MISSING  ${r.missing.join(', ')}`);
      console.log(`Stitch-only roles: ${r.extras.length} (${Object.keys(r.mapping).length} mapped to DSX; unmapped: ${r.unmapped.length})`);
      for (const w of r.warnings) console.log(`  WARNING  ${w}`);
      console.log(r.ok ? 'Design system: CONFORMS' : `Design system: DIVERGES\n  - ${r.problems.join('\n  - ')}`);
    }
    process.exit(r.ok ? 0 : 1);
  } else {
    console.error('Usage:\n  node tools/stitch/design-system.mjs export <DESIGN.md> [-o .stitch/DESIGN.md]\n  node tools/stitch/design-system.mjs check <DESIGN.md> <list_design_systems.json> [--asset <id>] [--json]');
    process.exit(2);
  }
}
