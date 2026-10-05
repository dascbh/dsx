#!/usr/bin/env node
// Arranges a Stitch canvas in rows: one row per journey of the flow map (a label card, then the screens in the
// order the journey visits them; a screen used by several journeys appears in each row; a last row with the screens
// outside every journey), or explicit rows for comparisons (current × design-system options, current × variations).
//
//   node tools/stitch/arrange-canvas.mjs <projectId> --map <flows-<m>.json> --registry <stitch-screens.json>
//   node tools/stitch/arrange-canvas.mjs <projectId> --rows <rows.json> --registry <stitch-screens.json>
//   common: [--label "Journey"] [--color "#2B59C3"] [--root <project>] [--config <file>] [--dry-run]
//
// rows.json: [{ "id": "current", "title": "Current", "lines": ["…"], "screens": ["orders", "order-detail"] }, …];
// a screen is a registry id (from send.mjs) or { "screen": "<stitch screen id>" }. In comparison rows the same
// position is the same column, aligned to the widest screen of that column.
// Uses PATCH /v1/projects/<id>?updateMask=screenInstances with the whole instance list, so a rerun never piles up
// copies. Label cards are small HTML screens uploaded once and recorded in the registry as "label:<row id>"; they go
// through the same blocklist guard as captures. --dry-run prints the layout without network.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { normalizeFlowMap } from '../ux-lint/lib/legacy.mjs';
import { loadBlocklist, blockedEntries } from './lib/guard.mjs';
import { uploadHtml, getProject, setInstances, apiKey } from './lib/stitch-api.mjs';

export const WIDTH = 1440, HEIGHT = 900, GAP_X = 120, GAP_Y = 360;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** One row per journey (screens in visit order, only those in the registry) + a row for the rest. */
export function journeyRows(flow, registry, { label = 'Journey' } = {}) {
  const { map } = normalizeFlowMap(flow);
  const transitions = new Map((map.transitions ?? []).map((t) => [t.id, t]));
  const rows = [];
  const used = new Set();
  for (const j of map.journeys ?? []) {
    const seq = [];
    for (const step of j.steps ?? []) {
      const t = transitions.get(step);
      if (!t) continue;
      for (const s of [t.from, t.to]) if (registry[s] && !seq.includes(s)) seq.push(s);
    }
    seq.forEach((s) => used.add(s));
    rows.push({ id: j.id, title: j.name, eyebrow: [label, j.persona].filter(Boolean).join(' · '), lines: [j.goal ?? j.objective ?? '', `${(j.steps ?? []).length} steps · ${seq.length} screens · from the code`].filter(Boolean), screens: seq });
  }
  const outside = Object.keys(registry).filter((k) => !k.startsWith('label:') && !used.has(k))
    .sort((a, b) => String(registry[a].nn ?? '99').localeCompare(String(registry[b].nn ?? '99')));
  if (outside.length) rows.push({ id: null, screens: outside });
  return rows;
}

/** Label card HTML (neutral, self-contained). */
export function labelCard(row, color = '#2B59C3') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(row.title)}</title>
<style>html,body{margin:0;min-height:100vh;background:${esc(color)};color:#fff;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
.card{padding:72px 80px;display:grid;gap:24px;max-width:1100px}.eyebrow{font-size:22px;letter-spacing:.1em;text-transform:uppercase;opacity:.85;font-weight:600}
h1{margin:0;font-size:60px;line-height:1.1}p{margin:0;font-size:28px;line-height:1.45;opacity:.95}</style></head>
<body><div class="card">${row.eyebrow ? `<div class="eyebrow">${esc(row.eyebrow)}</div>` : ''}<h1>${esc(row.title)}</h1>${(row.lines ?? []).map((l) => `<p>${esc(l)}</p>`).join('')}</div></body></html>`;
}

const screenOf = (registry, s) => (typeof s === 'object' && s ? s.screen : registry[s]?.screen ?? null);

/**
 * Instances for the canvas. `sizes`: stitch screen id → { width, height } (from the project). `align`: same index =
 * same column (comparisons). Repeated screens get a distinct instance id per row.
 */
export function layoutInstances(rows, registry, { project, sizes = {}, align = false } = {}) {
  const prefix = `projects/${project}/screens/`;
  const size = (id) => ({ width: sizes[id]?.width ?? WIDTH, height: sizes[id]?.height ?? HEIGHT });
  const cells = rows.map((r) => [...(r.id ? [registry[`label:${r.id}`]?.screen ?? null] : []), ...r.screens.map((s) => screenOf(registry, s))]);
  const colWidth = [];
  if (align) cells.forEach((c) => c.forEach((id, i) => { colWidth[i] = Math.max(colWidth[i] ?? 0, id ? size(id).width : WIDTH); }));
  const out = [];
  const placed = new Set();
  let y = 0;
  cells.forEach((c, ri) => {
    let x = 0, h = 0;
    c.forEach((id, ci) => {
      const { width, height } = id ? size(id) : { width: WIDTH, height: HEIGHT };
      if (id) {
        out.push({ id: placed.has(id) ? `r${ri}-c${ci}-${id}` : id, sourceScreen: prefix + id, x, y, width, height });
        placed.add(id);
      }
      x += (align ? colWidth[ci] : width) + GAP_X;
      h = Math.max(h, height);
    });
    y += h + GAP_Y;
  });
  return out;
}

async function main() {
  const a = parseArgs();
  const project = a._[0];
  if (!project || typeof a.registry !== 'string' || (!a.map && !a.rows)) {
    console.error('Usage: node tools/stitch/arrange-canvas.mjs <projectId> (--map <flows.json> | --rows <rows.json>) --registry <stitch-screens.json> [--label "Journey"] [--color "#2B59C3"] [--dry-run]');
    process.exit(2);
  }
  const registryPath = resolve(a.registry);
  const registry = existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : {};
  const rows = a.map ? journeyRows(JSON.parse(readFileSync(resolve(a.map), 'utf8')), registry, { label: typeof a.label === 'string' ? a.label : 'Journey' })
    : JSON.parse(readFileSync(resolve(a.rows), 'utf8'));
  const color = typeof a.color === 'string' ? a.color : '#2B59C3';
  const { entries } = loadBlocklist({ root: typeof a.root === 'string' ? a.root : process.cwd(), config: typeof a.config === 'string' ? a.config : null });
  const missingLabels = rows.filter((r) => r.id && !registry[`label:${r.id}`]);
  for (const r of missingLabels) {
    const hit = blockedEntries(labelCard(r, color), entries);
    if (hit.length) { console.error(`REFUSED label "${r.title}": matches blocklist ${hit.map((x) => JSON.stringify(x)).join(', ')}`); process.exit(3); }
  }
  if (a['dry-run']) {
    for (const r of rows) console.log(`${r.id ? `[${r.title}] ` : '[outside journeys] '}${r.screens.map((s) => (typeof s === 'object' ? s.screen : s)).join(' → ')}`);
    console.log(`${rows.length} row(s); ${missingLabels.length} label card(s) to upload`);
    return;
  }
  let key;
  try { key = apiKey(); } catch (e) { console.error(e.message); process.exit(2); }
  for (const r of missingLabels) {
    const screen = await uploadHtml(project, labelCard(r, color), `${a.map ? (typeof a.label === 'string' ? a.label : 'Journey') : 'Row'} · ${r.title}`, { key });
    registry[`label:${r.id}`] = { screen, title: r.title };
    writeFileSync(registryPath, `${JSON.stringify(registry, null, 1)}\n`);
  }
  const data = await getProject(project, { key });
  const current = (data.screenInstances ?? []).filter((s) => s.sourceScreen);
  const sizes = Object.fromEntries(current.map((s) => [s.sourceScreen.split('/').pop(), { width: s.width, height: s.height }]));
  const instances = layoutInstances(rows, registry, { project, sizes, align: !!a.rows });
  // keep every other instance of the project (design-system imports, notes) below the arranged rows
  const usedIds = new Set(instances.map((i) => i.sourceScreen));
  const bottom = Math.max(0, ...instances.map((i) => i.y + i.height)) + GAP_Y;
  let x = 0;
  for (const s of current) if (!usedIds.has(s.sourceScreen)) { instances.push({ ...s, x, y: bottom }); x += (s.width ?? WIDTH) + GAP_X; }
  await setInstances(project, instances, { key });
  console.log(`${rows.length} row(s) · ${instances.length} instance(s)`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
