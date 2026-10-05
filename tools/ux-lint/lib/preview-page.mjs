// Previews on the decision page: reads the preview.mjs manifest (`previews.json`), marks as outdated a preview whose
// capture changed after it was generated, and links each page case to its images (key = file in previews/).
// Alt text follows the page language (`lang`, lib/page-strings.mjs). No dependencies and no browser.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { pageStrings } from './page-strings.mjs';

const sha1 = (b) => createHash('sha1').update(b).digest('hex');
const LETTER = (i) => String.fromCharCode(65 + i);

/** Manifest with `stale` per case (capture changed or missing). No manifest → null. */
export function loadPreviews(outDir, { screensDir = null } = {}) {
  const f = join(outDir, 'previews.json');
  if (!existsSync(f)) return null;
  let m;
  try { m = JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
  const dir = screensDir ?? m.screens_dir;
  const cache = new Map();
  const cur = (s) => {
    if (!cache.has(s)) { const p = dir ? join(dir, `${s}.html`) : null; cache.set(s, p && existsSync(p) ? sha1(readFileSync(p)) : null); }
    return cache.get(s);
  };
  for (const e of Object.values(m.cases ?? {})) {
    if (e.capture_hashes && e.screen && e.capture_hashes[e.screen] !== undefined && dir) e.stale = cur(e.screen) !== e.capture_hashes[e.screen];
  }
  return { ...m, dir: outDir };
}

const describeTarget = (c, screen, S) => {
  const el = S.target.element[c.element];
  return c.family === 'flow' ? S.target.flow(screen) : c.family === 'states' || !el ? S.target.screen(screen) : S.target.el(el, String(c.text).slice(0, 60), screen);
};

/**
 * Links the cases to the previews: `c.preview = { before, after: [{ option, key, alt, label, note, failed }], failed?, stale? }`.
 * `key` is the file name in `manifest.dir`. Cases without a manifest entry get no `preview`. `lang`: page language.
 */
export function attachPreviews(cases, manifest, { lang = 'en' } = {}) {
  if (!manifest) return cases;
  const S = pageStrings(lang);
  for (const c of cases) {
    const e = manifest.cases?.[c.id];
    if (!e) continue;
    if (e.failed) { c.preview = { failed: e.failed }; continue; }
    if (e.stale) { c.preview = { failed: S.stale }; continue; }
    const target = describeTarget(c, e.screen, S);
    const before = e.before?.file ? { key: e.before.file, alt: S.altBefore(target, e.kind === 'element') } : null;
    const after = (e.after ?? []).map((a) => {
      const who = a.option === null || a.option === undefined ? S.altRuleWho(a.label ?? '') : S.altOptionWho(LETTER(a.option));
      return a.file
        ? { option: a.option ?? null, key: a.file, label: a.label ?? null, note: a.note ?? null, type: a.kind_label ?? null, alt: S.altAfter(who, a.description ?? '', e.kind === 'element') }
        : { option: a.option ?? null, label: a.label ?? null, failed: a.failed };
    });
    c.preview = { before, after, kind: e.kind };
  }
  return cases;
}

/** Image keys a case uses. */
export const previewKeys = (c) => [c.preview?.before?.key, ...(c.preview?.after ?? []).map((a) => a.key)].filter(Boolean);

/** Bytes the image takes embedded (base64 or inline SVG). */
export function embeddedSize(dir, key) {
  const p = join(dir, key);
  if (!existsSync(p)) return 0;
  const n = readFileSync(p).length;
  return key.endsWith('.svg') ? n : Math.ceil(n / 3) * 4 + 30;
}

/** Embedded content: data URI (image) or markup (SVG, with marker ids unique per use). */
export function embedded(dir, key) {
  const p = join(dir, key);
  if (!existsSync(p)) return null;
  const buf = readFileSync(p);
  if (key.endsWith('.svg')) return { svg: buf.toString('utf8') };
  const type = key.endsWith('.webp') ? 'image/webp' : key.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return { uri: `data:${type};base64,${buf.toString('base64')}` };
}
