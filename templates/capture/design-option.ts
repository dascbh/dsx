// DSX capture-from-code — the design option being captured (skill design-lab). Copy next to serialize.ts.
//
// Reads DSX_DESIGN_MD (legacy: STITCH_THEME), parses it with the same parser the live switcher uses and registers the
// option's web fonts in the capture. Null when no option is set: the product theme applies unchanged.
// ADAPT the import below to where you copied templates/theme-adapters/design-md.ts (the app's dev folder, so the
// capture and the live switcher share one copy).
import { readFileSync } from 'node:fs';
import { googleFontUrls, parseDesignMd } from '../../src/dev/design-lab/design-md';
import type { DesignMd } from '../../src/dev/design-lab/design-md';
import { DESIGN_MD_PATH, DESIGN_OPTION, registerFonts } from './serialize';

export { DESIGN_MD_PATH, DESIGN_OPTION };

/** Parsed DESIGN.md of the option, or null. A broken file fails the capture instead of saving the product theme. */
export const DESIGN: DesignMd | null = DESIGN_MD_PATH ? parseDesignMd(readFileSync(DESIGN_MD_PATH, 'utf8')) : null;

if (DESIGN) registerFonts(googleFontUrls(DESIGN));
