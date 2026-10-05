#!/usr/bin/env node
/**
 * Compares two Figma snapshots (see tools/figma/snapshot.js) and prints the
 * change report in markdown, already classified.
 *
 *   node tools/figma/diff-baseline.cjs design/figma-baseline/app.json /tmp/current.json
 *
 * Core rule: the SAME change (node name + property + from→to) in two or more
 * frames is a primitive/token; in a single frame it is a composition.
 *
 * .cjs on purpose: the DSX package.json is "type": "module" and this script uses require.
 * Also accepts snapshots from the earlier pt-BR flow (keys `variaveis`, `estilos`,
 * `nos`, `oculto`), compatible with baselines already committed.
 */
const fs = require('fs');

const [basePath, currentPath] = process.argv.slice(2);
if (!basePath || !currentPath) {
  console.error('usage: node tools/figma/diff-baseline.cjs <baseline.json> <current.json>');
  process.exit(1);
}

/** Normalizes the snapshot to the snapshot.js format (accepts the legacy pt-BR keys). */
function normalize(snap) {
  const fixPaint = v => (typeof v === 'string' ? v.replace(/\boculto\b/g, 'hidden') : v);
  const frames = {};
  for (const [key, fr] of Object.entries(snap.frames || {})) {
    const src = fr.nodes || fr.nos;
    const out = { hash: fr.hash, n: fr.n };
    if (src) {
      out.nodes = {};
      for (const [id, node] of Object.entries(src)) {
        const o = { ...node };
        if ('oculto' in o) { o.hidden = o.oculto; delete o.oculto; }
        if ('f' in o) o.f = fixPaint(o.f);
        if ('st' in o) o.st = fixPaint(o.st);
        out.nodes[id] = o;
      }
    }
    frames[key] = out;
  }
  return {
    variables: snap.variables !== undefined ? snap.variables : snap.variaveis,
    styles: snap.styles !== undefined ? snap.styles : snap.estilos,
    frames,
  };
}

const A = normalize(JSON.parse(fs.readFileSync(basePath, 'utf8')));
const B = normalize(JSON.parse(fs.readFileSync(currentPath, 'utf8')));

const LABEL = {
  l: 'auto-layout', s: 'sizing', w: 'width', h: 'height', r: 'radius',
  f: 'fill', st: 'stroke', sw: 'stroke weight', op: 'opacity',
  abs: 'absolute position', txt: 'text', fs: 'font size', fw: 'weight',
  ff: 'family', lh: 'line height', ls: 'tracking', tc: 'case', ta: 'alignment',
  ml: 'max lines', tt: 'truncation', ts: 'text style', d: 'vector',
  hidden: 'visibility', c: 'child order',
};
const IGNORE = new Set(['p', 'n', 't']);   // path, name and type are context, not diff

/**
 * The mirror names nodes `Type · instance` (`SectionCard · Demand`, `Button · primary`).
 * For grouping, the TYPE is what matters: without this, every card has a unique name and
 * primitive grouping never fires.
 */
const family = name => (name && name.indexOf(' · ') > -1 ? name.split(' · ')[0] : name);

const SEP = '\u0001';                                  // content-proof key separator
const FIELDS_L = ['mode', 'padTop', 'padRight', 'padBottom', 'padLeft', 'gap',
  'main align', 'cross align', 'wrap', 'cross gap'];
const FIELDS_SW = ['stroke top', 'stroke right', 'stroke bottom', 'stroke left'];

/** Readable description: for compound properties, shows only the field that changed. */
function describe(prop, from, to) {
  const fields = prop === 'l' ? FIELDS_L : prop === 'sw' ? FIELDS_SW : null;
  if (fields) {
    const a = String(from).split('|'), b = String(to).split('|');
    const diff = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) diff.push(`${fields[i] || i} ${a[i]} → ${b[i]}`);
    }
    if (diff.length) return diff.join(', ');
  }
  if (prop === 's') {
    const a = String(from).split('/'), b = String(to).split('/');
    const diff = [];
    if (a[0] !== b[0]) diff.push(`horizontal ${a[0]} → ${b[0]}`);
    if (a[1] !== b[1]) diff.push(`vertical ${a[1]} → ${b[1]}`);
    if (diff.length) return diff.join(', ');
  }
  return `${from} → ${to}`;
}

// ── tokens and styles ────────────────────────────────────────────────────────
function diffMap(before, after) {
  const out = [];
  if (typeof before === 'string' || typeof after === 'string') return out;   // hash-only baseline
  before = before || {}; after = after || {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of [...keys].sort()) {
    const a = before[k], b = after[k];
    if (a === undefined) { out.push(`+ \`${k}\` = ${JSON.stringify(b)}`); continue; }
    if (b === undefined) { out.push(`− \`${k}\` (removed)`); continue; }
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    if (sa !== sb) out.push(`\`${k}\` ${sa} → ${sb}`);
  }
  return out;
}

// ── node pairing: id first, then path ──────────────────────────────────────
function pairNodes(nodesA, nodesB) {
  const pairs = [], onlyA = [], onlyB = [];
  const usedB = new Set();
  for (const [id, a] of Object.entries(nodesA)) {
    if (nodesB[id]) { pairs.push([a, nodesB[id]]); usedB.add(id); } else onlyA.push(a);
  }
  const byPathB = {};
  for (const [id, b] of Object.entries(nodesB)) if (!usedB.has(id)) (byPathB[b.p] ||= []).push([id, b]);
  const remainingA = [];
  for (const a of onlyA) {
    const candidates = byPathB[a.p];
    if (candidates && candidates.length) { const [id, b] = candidates.shift(); pairs.push([a, b]); usedB.add(id); }
    else remainingA.push(a);
  }
  for (const [id, b] of Object.entries(nodesB)) if (!usedB.has(id)) onlyB.push(b);
  return { pairs, removed: remainingA, added: onlyB };
}

function diffNode(a, b) {
  const changed = [];
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (IGNORE.has(k)) continue;
    if (k === 'c') {                                  // child order: compare by position
      const sa = (a.c || []).length, sb = (b.c || []).length;
      if (sa !== sb) changed.push({ prop: 'c', from: `${sa} children`, to: `${sb} children` });
      continue;
    }
    const va = a[k], vb = b[k];
    if (JSON.stringify(va) !== JSON.stringify(vb)) {
      changed.push({ prop: k, from: va === undefined ? '—' : String(va), to: vb === undefined ? '—' : String(vb) });
    }
  }
  return changed;
}

// ── per-frame scan ───────────────────────────────────────────────────────────
const framesA = A.frames, framesB = B.frames;
const allKeys = new Set([...Object.keys(framesA), ...Object.keys(framesB)]);
const byFrame = {};                 // frame → [{node, prop, from, to}]
const addedFrames = [], removedFrames = [], noDetail = [];
const grouped = new Map();          // "family|prop|from→to" → Set(frames)

for (const key of [...allKeys].sort()) {
  const frameA = framesA[key], frameB = framesB[key];
  if (!frameA) { addedFrames.push(key); continue; }
  if (!frameB) { removedFrames.push(key); continue; }
  if (frameA.hash === frameB.hash) continue;
  if (!frameA.nodes || !frameB.nodes) { noDetail.push(key); continue; }

  const { pairs, removed, added } = pairNodes(frameA.nodes, frameB.nodes);
  const list = byFrame[key] = [];
  for (const [a, b] of pairs) {
    for (const m of diffNode(a, b)) {
      list.push({ node: b.n, path: b.p, ...m });
      const k = [family(b.n), m.prop, m.from, m.to].join(SEP);
      (grouped.get(k) || grouped.set(k, new Set()).get(k)).add(key);
    }
  }
  for (const r of removed) list.push({ kind: '−', node: r.n, path: r.p, txt: r.txt });
  for (const ad of added) list.push({ kind: '+', node: ad.n, path: ad.p, txt: ad.txt });
}

// ── possible naming-convention violations ────────────────────────────────────
// The same change, in the same ≥ 2 frames, can still escape the "primitive"
// grouping above when the nodes involved do not share the family prefix
// `Type · instance`: family() cannot tell they are the same thing, and the
// change passes silently as several loose composition tweaks instead of one
// primitive. This catches exactly that hole.
const byPropOnly = new Map();          // "prop|from|to" → Map(family → Set(frame))
for (const [frame, items] of Object.entries(byFrame)) {
  for (const i of items) {
    if (i.kind) continue;              // an added/removed node is not a naming question
    const propKey = [i.prop, i.from, i.to].join(SEP);
    const fam = family(i.node);
    const byFam = byPropOnly.get(propKey) || byPropOnly.set(propKey, new Map()).get(propKey);
    (byFam.get(fam) || byFam.set(fam, new Set()).get(fam)).add(frame);
  }
}
const namingIssues = [];
for (const [propKey, byFam] of byPropOnly) {
  if (byFam.size < 2) continue;                                     // a single name: not fragmentation
  if (![...byFam.values()].some(s => s.size >= 2)) {                // no single name reached the threshold
    const totalFrames = new Set([...byFam.values()].flatMap(s => [...s]));
    if (totalFrames.size >= 2) {
      const [prop, from, to] = propKey.split(SEP);
      namingIssues.push({ prop, from, to, names: [...byFam.keys()], frames: totalFrames });
    }
  }
}

// ── report ───────────────────────────────────────────────────────────────────
const L = [];
L.push(`# Figma diff`, '');
L.push(`baseline: \`${basePath}\` · current: \`${currentPath}\``, '');

const diffVariables = diffMap(A.variables, B.variables);
const diffStyles = diffMap(A.styles, B.styles);
if (diffVariables.length || diffStyles.length) {
  L.push('## Tokens and styles: class `token`, affects the whole app', '');
  diffVariables.forEach(l => L.push('- ' + l + '  ⚠'));
  diffStyles.forEach(l => L.push('- ' + l + '  ⚠'));
  L.push('', 'Requires a regression sweep in both themes before applying.', '');
} else if (typeof A.variables !== 'string') {
  L.push('## Tokens and styles', '', 'No change.', '');
}

const groups = [...grouped.entries()]
  .filter(([, frames]) => frames.size >= 2)
  .sort((a, b) => b[1].size - a[1].size);
if (groups.length) {
  L.push('## Grouped (≥ 2 frames): class `primitive`', '');
  for (const [k, frames] of groups) {
    const [node, prop, from, to] = k.split(SEP);
    L.push(`- \`${node}\` · ${LABEL[prop] || prop} · ${describe(prop, from, to)} · **${frames.size} frames**`);
    L.push(`  <sub>${[...frames].slice(0, 6).join(' · ')}${frames.size > 6 ? ' …' : ''}</sub>`);
  }
  L.push('', 'Apply it to the shared component, once, not on each screen.', '');
}

if (namingIssues.length) {
  L.push('## Possible naming problem', '');
  L.push('Same change, but spread over names that share no family prefix. None reached the ≥ 2 frames threshold alone, so it shows up as loose tweaks instead of a primitive:', '');
  for (const { prop, from, to, names, frames } of namingIssues) {
    L.push(`- ${LABEL[prop] || prop} · ${describe(prop, from, to)} · **${frames.size} frames in total**, spread over: ${names.map(n => '`' + n + '`').join(', ')}`);
  }
  L.push('', 'If they really are the same primitive, rename them to share the `Type · instance` prefix (e.g. `Chip · status`); the next diff then groups them on its own instead of losing the pattern.', '');
}

const groupedKeys = new Set(groups.map(([k]) => k));
const withComposition = Object.entries(byFrame)
  .map(([f, items]) => [f, items.filter(i => i.kind || !groupedKeys.has([family(i.node), i.prop, i.from, i.to].join(SEP)))])
  .filter(([, items]) => items.length);
if (withComposition.length) {
  L.push('## Per frame: class `composition`', '');
  for (const [frame, items] of withComposition) {
    L.push(`### ${frame}`);
    for (const i of items) {
      if (i.kind) L.push(`- ${i.kind} \`${i.node}\`${i.txt ? ` "${String(i.txt).slice(0, 60)}"` : ''} in \`${i.path}\``);
      else L.push(`- \`${i.node}\` · ${LABEL[i.prop] || i.prop}: ${describe(i.prop, i.from, i.to)}`);
    }
    L.push('');
  }
}

if (addedFrames.length) L.push('## New frames in Figma', '', ...addedFrames.map(f => `- + ${f}`), '');
if (removedFrames.length) L.push('## Frames gone from Figma', '', ...removedFrames.map(f => `- − ${f}`), '');
if (noDetail.length) {
  L.push('## Changed, but the baseline has no detail', '');
  noDetail.forEach(f => L.push(`- ${f}`));
  L.push('', 'Run the snapshot with `MODE = "full"` and these frames in `TARGETS`.', '');
}
if (!groups.length && !withComposition.length && !diffVariables.length && !diffStyles.length
    && !addedFrames.length && !removedFrames.length && !noDetail.length) {
  L.push('No changes.', '');
}

process.stdout.write(L.join('\n') + '\n');
