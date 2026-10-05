#!/usr/bin/env node
// Renders static HTML captures (file://, no server) to PNG with the PROJECT's Playwright, for visual QA before
// sending or publishing, and for the thumbnails of the journey page.
//
//   node tools/capture/render.mjs <file.html> [--out <file.png>] [--width 1440] [--thumbnail]
//   node tools/capture/render.mjs --thumbnails <captures-dir> [--width 1440]
//   node tools/capture/render.mjs --module <m> [--root <project>] [--config <file>] --thumbnails
//
// Run it from a project folder that has `playwright` or `@playwright/test` (the DSX does not ship a browser).
// --thumbnail: first fold only (width × 900) at half scale. --thumbnails <dir>: one `<screen-id>.thumb.png` per main
// capture `<nn>-<screen-id>.html` (state captures `<nn>-<screen-id>.<state>.html` are skipped).
// The render also reports what usually means a broken capture: images that did not load and an empty <body>.
// Exit: 0 ok · 1 a capture looks broken · 2 usage · 3 Playwright missing.
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { resolvePlaywright, PLAYWRIGHT_MISSING } from '../ux-lint/measure.mjs';
import { resolveProjectPaths } from '../ux-lint/lib/project-paths.mjs';

/** `<nn>-<screen-id>.html` → screen id; state captures and other files → null. */
export function screenIdOfCapture(file) {
  const m = basename(file).match(/^\d+-([\w-]+)\.html$/);
  return m ? m[1] : null;
}

/** Thumbnail jobs for a capture folder: [{ input, output }]. */
export function thumbnailJobs(dir) {
  return readdirSync(dir).sort().map((f) => ({ f, id: screenIdOfCapture(f) })).filter((x) => x.id)
    .map(({ f, id }) => ({ input: join(dir, f), output: join(dir, `${id}.thumb.png`) }));
}

export async function render(jobs, { playwright, width = 1440, thumbnail = false }) {
  const browser = await playwright.module.chromium.launch();
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: thumbnail ? 0.5 : 1 });
    for (const j of jobs) {
      await page.goto(pathToFileURL(resolve(j.input)).href, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(400);
      const health = await page.evaluate(() => ({
        brokenImages: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length,
        emptyBody: !document.body || document.body.innerText.trim().length === 0,
      }));
      await page.screenshot({ path: j.output, fullPage: !thumbnail });
      results.push({ ...j, ...health });
    }
  } finally {
    await browser.close();
  }
  return results;
}

async function main() {
  const a = parseArgs();
  const width = Number(a.width ?? 1440);
  let jobs, thumbnail = !!a.thumbnail;
  if (a.thumbnails || a.module) {
    let dir = typeof a.thumbnails === 'string' ? resolve(a.thumbnails) : null;
    if (!dir && typeof a.module === 'string') dir = resolveProjectPaths({ root: typeof a.root === 'string' ? a.root : process.cwd(), module: a.module, config: typeof a.config === 'string' ? a.config : null }).captures;
    if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) { console.error(`capture folder not found: ${dir}`); process.exit(2); }
    jobs = thumbnailJobs(dir);
    thumbnail = true;
  } else if (a._[0]) {
    jobs = [{ input: resolve(a._[0]), output: resolve(typeof a.out === 'string' ? a.out : a._[0].replace(/\.html?$/, '.png')) }];
  } else {
    console.error('Usage: node tools/capture/render.mjs <file.html> [--out <file.png>] [--width 1440] [--thumbnail] | --thumbnails <dir> | --module <m> --thumbnails');
    process.exit(2);
  }
  const playwright = resolvePlaywright();
  if (!playwright) { console.error(PLAYWRIGHT_MISSING); process.exit(3); }
  const results = await render(jobs, { playwright, width, thumbnail });
  let broken = 0;
  for (const r of results) {
    const issues = [r.brokenImages ? `${r.brokenImages} image(s) did not load` : '', r.emptyBody ? 'empty body' : ''].filter(Boolean);
    if (issues.length) broken++;
    console.log(`${r.output}${issues.length ? `  ← ${issues.join(', ')}` : ''}`);
  }
  process.exit(broken ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
