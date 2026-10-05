#!/usr/bin/env node
// Journey page: one horizontal lane per journey of the flow map, with the real captures (thumbnails) of each screen.
// Screen → action (label + file:line evidence) → screen; actions that stay on the same screen are listed inside its
// card; persona switches are marked; a link sent outside the product is a dashed arrow; a screen without a thumbnail
// shows "capture pending". The page is self-contained (thumbnails embedded) and can be published as is.
//
//   node tools/stitch/journeys.mjs <flows.json> --out <journeys.html> [--captures <dir>] [--module <m> --root <project>]
//                                  [--labels <labels.json>] [--no-validate]
//
// Thumbnails: <captures>/<screen-id>.thumb.png (node tools/capture/render.mjs --thumbnails <captures>).
// Default --captures: the project's capture folder for --module (docs/project-paths.md). The flow map is checked with
// tools/capture/validate-flow.mjs (evidence against the code under --root) and the page says so only when it passes.
// --labels: JSON overriding the page's interface strings (e.g. in the product's language): see templates/capture/journeys.html.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { normalizeFlowMap } from '../ux-lint/lib/legacy.mjs';
import { resolveProjectPaths } from '../ux-lint/lib/project-paths.mjs';
import { validateFlow } from '../capture/validate-flow.mjs';

const DSX = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TEMPLATE = join(DSX, 'templates', 'capture', 'journeys.html');

/** Builds the page HTML. `thumbnails`: screen id → data URI. */
export function renderJourneys(flow, { thumbnails = {}, labels = null, validated = false, module = '' } = {}) {
  const { map } = normalizeFlowMap(flow);
  const data = JSON.stringify({ flow: map, thumbnails, labels, validated }).replace(/</g, '\\u003c');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return readFileSync(TEMPLATE, 'utf8').replace('/*__DATA__*/null', () => data).replace(/__MODULE__/g, esc(module || map.module || ''));
}

/** Thumbnails present in a capture folder for the map's screens. */
export function loadThumbnails(flow, dir) {
  const { map } = normalizeFlowMap(flow);
  const out = {};
  for (const s of map.screens ?? []) {
    const png = join(dir, `${s.id}.thumb.png`);
    if (existsSync(png)) out[s.id] = `data:image/png;base64,${readFileSync(png).toString('base64')}`;
  }
  return out;
}

function main() {
  const a = parseArgs();
  const file = a._[0];
  if (!file || typeof a.out !== 'string') { console.error('Usage: node tools/stitch/journeys.mjs <flows.json> --out <journeys.html> [--captures <dir>] [--module <m> --root <project>] [--labels <labels.json>] [--no-validate]'); process.exit(2); }
  const flow = JSON.parse(readFileSync(resolve(file), 'utf8'));
  const root = resolve(typeof a.root === 'string' ? a.root : process.cwd());
  const module = typeof a.module === 'string' ? a.module : flow.module ?? null;
  const captures = typeof a.captures === 'string' ? resolve(a.captures) : resolveProjectPaths({ root, module }).captures;
  let validated = false;
  if (!a['no-validate']) {
    const v = validateFlow(flow, { root });
    validated = v.ok;
    if (!v.ok) console.error(`WARNING flow map not approved (${v.failures.length} failure(s)); the page will not claim checked evidence. Run tools/capture/validate-flow.mjs for details.`);
  }
  const thumbnails = loadThumbnails(flow, captures);
  const labels = typeof a.labels === 'string' ? JSON.parse(readFileSync(resolve(a.labels), 'utf8')) : null;
  const out = resolve(a.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, renderJourneys(flow, { thumbnails, labels, validated, module }));
  const { map } = normalizeFlowMap(flow);
  console.log(`${out} · ${(map.journeys ?? []).length} journey(s) · ${Object.keys(thumbnails).length}/${(map.screens ?? []).length} screen(s) with capture`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
