#!/usr/bin/env node
// Sends HTML captures (from the code, skill capture-from-code) to a Google Stitch project as screens.
//
//   node tools/stitch/send.mjs <projectId> <file.html> [--title "<nn> · <name> · <route>"]
//   node tools/stitch/send.mjs <projectId> --order <capture-order.json> [--module <m>] [--dir <captures>]
//                              [--registry <stitch-screens.json>] [--skip id,id]
//   common: [--root <project>] [--config <file>] [--dry-run] [--json]
//
// capture-order.json: [{ "nn": "02", "id": "orders", "name": "Orders", "route": "/orders" }, …] in journey order
// (the upload order is the canvas order). Each <dir>/<nn>-<id>.html is sent with the title "<nn> · <name> · <route>"
// and recorded in the registry (id → { nn, screen, title }); already-recorded ids are skipped, so a rerun resumes.
// Defaults: --dir = the project's capture folder for --module (docs/project-paths.md); --registry =
// <dir>/stitch-screens.json (for the legacy `.stitch/<m>/code`, the file next to `code/`).
//
// Guard: every file is checked against the project's blocklist (`capture.blocklist` in .dsx/config.json); a match
// refuses the upload (exit 3) and names the matching entry. The API key is never printed (lib/stitch-api.mjs).
// --dry-run checks files and blocklist and prints the plan without network.
// Exit: 0 sent · 1 some upload failed · 2 usage · 3 blocked by the guard.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { resolveProjectPaths } from '../ux-lint/lib/project-paths.mjs';
import { loadBlocklist, blockedEntries } from './lib/guard.mjs';
import { uploadHtml, apiKey } from './lib/stitch-api.mjs';

const USAGE = `Usage:
  node tools/stitch/send.mjs <projectId> <file.html> [--title "…"] [--root <project>] [--config <file>] [--dry-run]
  node tools/stitch/send.mjs <projectId> --order <capture-order.json> [--module <m>] [--dir <captures>] [--registry <file>] [--skip id,id] [--dry-run]`;

/** Title of a screen in the canvas: "<nn> · <name> · <route>" without empty parts. */
export const titleOf = (s) => [s.nn, s.name, s.route].filter(Boolean).join(' · ');

/** Registry file next to the captures (legacy `code/` folders keep theirs one level up). */
export const registryFor = (dir) => (basename(dir) === 'code' ? join(dirname(dir), 'stitch-screens.json') : join(dir, 'stitch-screens.json'));

/**
 * Upload plan for an order file: [{ id, file, title, status: 'send'|'skip'|'missing'|'blocked', blocked? }].
 * Pure apart from reading the capture files.
 */
export function plan(order, { dir, registry = {}, skip = new Set(), blocklist = [] }) {
  return order.map((s) => {
    const file = join(dir, `${s.nn}-${s.id}.html`);
    const base = { id: s.id, nn: s.nn, file, title: titleOf(s) };
    if (skip.has(s.id) || registry[s.id]) return { ...base, status: 'skip' };
    if (!existsSync(file)) return { ...base, status: 'missing' };
    const blocked = blockedEntries(readFileSync(file, 'utf8'), blocklist);
    return blocked.length ? { ...base, status: 'blocked', blocked } : { ...base, status: 'send' };
  });
}

async function main() {
  const a = parseArgs();
  const project = a._[0];
  if (!project || (!a.order && !a._[1])) { console.error(USAGE); process.exit(2); }
  const root = resolve(typeof a.root === 'string' ? a.root : process.cwd());
  const { entries, errors } = loadBlocklist({ root, config: typeof a.config === 'string' ? a.config : null });
  for (const e of errors) console.error(`WARNING ${e}`);
  if (!entries.length) console.error('WARNING no blocklist configured (capture.blocklist in .dsx/config.json): nothing stops real names from being uploaded');

  let items;
  let registryPath = null;
  let registry = {};
  if (a.order) {
    const pp = resolveProjectPaths({ root, module: typeof a.module === 'string' ? a.module : null, config: typeof a.config === 'string' ? a.config : null });
    for (const w of pp.warnings) console.error(`WARNING ${w}`);
    const dir = typeof a.dir === 'string' ? resolve(a.dir) : pp.captures;
    registryPath = typeof a.registry === 'string' ? resolve(a.registry) : registryFor(dir);
    registry = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
    const skip = new Set(typeof a.skip === 'string' ? a.skip.split(',') : []);
    items = plan(JSON.parse(readFileSync(resolve(a.order), 'utf8')), { dir, registry, skip, blocklist: entries });
  } else {
    const file = resolve(a._[1]);
    if (!existsSync(file)) { console.error(`file not found: ${file}`); process.exit(2); }
    const blocked = blockedEntries(readFileSync(file, 'utf8'), entries);
    items = [{ id: basename(file, '.html'), file, title: typeof a.title === 'string' ? a.title : basename(file, '.html'), status: blocked.length ? 'blocked' : 'send', blocked }];
  }

  const blocked = items.filter((i) => i.status === 'blocked');
  for (const b of blocked) console.error(`REFUSED ${basename(b.file)}: matches blocklist entr${b.blocked.length > 1 ? 'ies' : 'y'} ${b.blocked.map((x) => JSON.stringify(x)).join(', ')}; replace the capture data with fictional data`);
  if (blocked.length) process.exit(3);
  if (a['dry-run']) {
    if (a.json) console.log(JSON.stringify(items, null, 2));
    else for (const i of items) console.log(`${i.status.padEnd(7)} ${basename(i.file)}  "${i.title}"`);
    return;
  }

  let key;
  try { key = apiKey(); } catch (e) { console.error(e.message); process.exit(2); }
  let failures = 0;
  for (const i of items) {
    if (i.status === 'missing') { console.log(`${i.nn ?? ''} ${i.id}: no capture, skipped`); continue; }
    if (i.status !== 'send') continue;
    try {
      const screen = await uploadHtml(project, readFileSync(i.file, 'utf8'), i.title, { key });
      console.log(`${i.nn ?? ''} ${i.id}: screen ${screen}`);
      if (registryPath) {
        registry[i.id] = { nn: i.nn, screen, title: i.title };
        writeFileSync(registryPath, `${JSON.stringify(registry, null, 1)}\n`);
      }
    } catch (e) {
      failures++;
      console.error(`${i.nn ?? ''} ${i.id}: FAILED ${String(e.message).slice(0, 300)}`);
    }
  }
  if (registryPath) console.log(`registry ${registryPath} · ${Object.keys(registry).length} screen(s) · ${failures} failure(s)`);
  process.exit(failures ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
