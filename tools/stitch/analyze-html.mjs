#!/usr/bin/env node
// Analyzes the HTML of a Stitch-generated screen against DSX, before any UX critique.
//
//   node tools/stitch/analyze-html.mjs <screen.html> [--design-md DESIGN.md] [--json]
//
// Stitch returns HTML with Tailwind from a CDN and a `tailwind.config` embedded in <head>. This script:
//  1. reads the config (colors and radii) and measures, in the MARKUP, how many color uses are DSX roles and how
//     many are Material 3 roles that exist only in Stitch (each one carries the DSX token to map to);
//  2. flags Tailwind arbitrary values (`bg-[#…]`, `p-[13px]`) and inline styles;
//  3. measures the contrast of text/background pairs declared on the SAME element (gate: ≥ 4.5:1);
//  4. runs a static accessibility triage (does not replace the `accessibility` skill or axe):
//     image without alt, button/link without an accessible name, field without a label, clickable element
//     without keyboard access, single h1, lang, "#" links, sorting without aria-sort.
// Exits 1 when a gate fails (contrast, accessible name, unlabeled field, clickable without keyboard).
// --json output: { ok, failures, has_config, radius, colors: { total_uses, dsx_uses, dsx_percent, roles: [{ role, uses,
//   value, source (dsx|stitch|unknown), map_to }] }, contrast, arbitrary, inline: { total, examples }, a11y: [{ gate, rule,
//   occurrences, example }] }.
import { readFileSync } from 'node:fs';
import { contrast } from '../lib/color.mjs';
import { readDesignMd, MATERIAL_MAPPING } from './design-system.mjs';
import { parseCli } from '../lib/legacy-cli.mjs';

const PREFIXES = '(?:bg|text|border|ring|outline|fill|stroke|divide|from|to|via|placeholder|decoration|accent|caret)';

export function readConfig(html) {
  const m = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*<\/script>/);
  const cfg = m ? m[1] : '';
  const colors = Object.fromEntries([...cfg.matchAll(/["']?([a-zA-Z0-9_-]+)["']?\s*:\s*["'](#[0-9a-fA-F]{3,8})["']/g)].map((x) => [x[1], x[2].toLowerCase()]));
  const radius = cfg.match(/borderRadius["']?\s*:\s*(\{[^}]*\})/)?.[1] ?? null;
  return { colors, radius, hasConfig: Boolean(m) };
}

const tagsMatching = (html, re) => [...html.matchAll(re)].map((m) => m[0]);
const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i'))?.[1];
const visibleText = (s) => s.replace(/<span[^>]*material-symbols[^>]*>[\s\S]*?<\/span>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

export function analyzeHtml(html, { dsxRoles = null } = {}) {
  const body = html.split(/<\/head>/i)[1] ?? html;
  const { colors, radius, hasConfig } = readConfig(html);
  const dsx = new Set(dsxRoles ?? []);
  const uses = {};
  const pairs = [];
  for (const m of body.matchAll(/<([a-z0-9-]+)\b([^>]*?)class="([^"]+)"([^>]*)>/gi)) {
    const classes = m[3].split(/\s+/);
    let fg = null, bg = null;
    for (const c of classes) {
      const r = c.match(new RegExp(`^(?:[a-z0-9-]+:)*${PREFIXES}-([a-zA-Z0-9_-]+?)(?:\\/\\d+)?$`));
      if (r && colors[r[1]]) {
        uses[r[1]] = (uses[r[1]] ?? 0) + 1;
        if (/^text-/.test(c)) fg = r[1];
        if (/^bg-/.test(c)) bg = r[1];
      }
    }
    if (fg && bg) pairs.push({ fg, bg, el: m[1] });
  }
  const totalUses = Object.values(uses).reduce((a, b) => a + b, 0);
  const roles = Object.entries(uses).map(([k, n]) => ({
    role: k, uses: n, value: colors[k],
    source: dsx.size ? (dsx.has(k) ? 'dsx' : 'stitch') : 'unknown',
    map_to: dsx.has(k) ? null : MATERIAL_MAPPING[k.replace(/_/g, '-')] ?? null,
  })).sort((a, b) => b.uses - a.uses);
  const dsxUses = roles.filter((p) => p.source === 'dsx').reduce((a, p) => a + p.uses, 0);

  const contrastPairs = [];
  const seen = new Set();
  for (const p of pairs) {
    const k = `${p.fg}|${p.bg}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const a = colors[p.fg], b = colors[p.bg];
    if (a?.length === 7 && b?.length === 7) contrastPairs.push({ ...p, ratio: +contrast(a, b).toFixed(2), ok: contrast(a, b) >= 4.5 });
  }

  const arbitrary = [...body.matchAll(/\b[a-z-]+-\[(?:#|\d)[^\]]*\]/g)].map((m) => m[0]);
  const inline = [...body.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]);

  // Static accessibility triage.
  const a11y = [];
  const add = (gate, rule, n, example) => n && a11y.push({ gate, rule, occurrences: n, example });
  const imgs = tagsMatching(body, /<img\b[^>]*>/gi);
  add(true, 'image without alt (1.1.1)', imgs.filter((t) => attribute(t, 'alt') == null).length, imgs.find((t) => attribute(t, 'alt') == null));
  const buttons = [...body.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)];
  const unnamedButtons = buttons.filter((b) => !attribute(`<b ${b[1]}>`, 'aria-label') && !attribute(`<b ${b[1]}>`, 'title') && !visibleText(b[2]));
  add(true, 'button without an accessible name (4.1.2)', unnamedButtons.length, unnamedButtons[0]?.[0].slice(0, 120));
  const links = [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  const unnamedLinks = links.filter((l) => !attribute(`<a ${l[1]}>`, 'aria-label') && !visibleText(l[2]));
  add(true, 'link without an accessible name (2.4.4)', unnamedLinks.length, unnamedLinks[0]?.[0].slice(0, 120));
  add(false, 'link with href="#" (destination to wire in code)', links.filter((l) => /href="#"/.test(l[1])).length);
  const fields = tagsMatching(body, /<(input|select|textarea)\b[^>]*>/gi).filter((t) => !/type="(hidden|submit|button)"/i.test(t));
  const labelled = new Set([...body.matchAll(/<label\b[^>]*for="([^"]+)"/gi)].map((m) => m[1]));
  const unlabelled = fields.filter((t) => !attribute(t, 'aria-label') && !attribute(t, 'aria-labelledby') && !labelled.has(attribute(t, 'id') ?? '\u0000') && !/<label\b[^>]*>(?:(?!<\/label>)[\s\S])*$/i.test(body.slice(0, body.indexOf(t))));
  add(true, 'field without an associated label (1.3.1/3.3.2)', unlabelled.length, unlabelled[0]);
  const clickables = tagsMatching(body, /<(tr|div|li|span|td)\b[^>]*(?:onclick=|cursor-pointer)[^>]*>/gi);
  const noKeyboard = clickables.filter((t) => !attribute(t, 'tabindex') && !attribute(t, 'role'));
  add(true, 'clickable element without keyboard access (2.1.1)', noKeyboard.length, noKeyboard[0]);
  const h1 = (body.match(/<h1\b/gi) ?? []).length;
  if (h1 !== 1) a11y.push({ gate: false, rule: `h1 must be unique (found: ${h1})`, occurrences: 1 });
  if (!/<html[^>]*\blang="/i.test(html)) a11y.push({ gate: true, rule: 'html without lang (3.1.1)', occurrences: 1 });
  const sortable = (body.match(/<th\b[^>]*>(?:(?!<\/th>)[\s\S])*(?:sort|arrow_(?:up|down)ward|unfold)/gi) ?? []).length;
  const ariaSort = (body.match(/aria-sort=/g) ?? []).length;
  if (sortable > ariaSort) a11y.push({ gate: false, rule: `sortable headers without aria-sort (${sortable - ariaSort})`, occurrences: sortable - ariaSort });

  const failures = [
    ...contrastPairs.filter((c) => !c.ok).map((c) => `contrast ${c.ratio}:1 for ${c.fg} on ${c.bg}`),
    ...a11y.filter((x) => x.gate).map((x) => `${x.rule}: ${x.occurrences}`),
  ];
  return {
    ok: failures.length === 0, failures, has_config: hasConfig, radius,
    colors: { total_uses: totalUses, dsx_uses: dsxUses, dsx_percent: totalUses ? Math.round((dsxUses / totalUses) * 100) : null, roles },
    contrast: contrastPairs, arbitrary, inline: { total: inline.length, examples: [...new Set(inline)].slice(0, 5) }, a11y,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseCli('stitch/analyze-html.mjs'); // aliases with a warning for old names
  const file = a._[0];
  if (!file) { console.error('Usage: node tools/stitch/analyze-html.mjs <screen.html> [--design-md DESIGN.md] [--json]'); process.exit(2); }
  const dsxRoles = a['design-md'] ? Object.keys(readDesignMd(readFileSync(a['design-md'], 'utf8')).fm.colors ?? {}) : null;
  const r = analyzeHtml(readFileSync(file, 'utf8'), { dsxRoles });
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else {
    const c = r.colors;
    console.log(`Colors in the markup: ${c.total_uses} uses${c.dsx_percent != null ? `, ${c.dsx_percent}% in DSX roles` : ' (pass --design-md to separate DSX from Stitch)'}`);
    for (const p of c.roles.filter((x) => x.source === 'stitch')) console.log(`  Stitch only: ${p.role} (${p.uses}×, ${p.value}) → ${p.map_to ?? 'NO MAPPING: decide the token'}`);
    if (r.radius) console.log(`Radii in the config: ${r.radius.replace(/\s+/g, ' ')}`);
    console.log(`Arbitrary values: ${r.arbitrary.length}${r.arbitrary.length ? ': ' + r.arbitrary.slice(0, 5).join(' ') : ''} · inline style: ${r.inline.total}`);
    const bad = r.contrast.filter((x) => !x.ok);
    console.log(`Contrast (pairs on the same element): ${r.contrast.length - bad.length}/${r.contrast.length} OK`);
    for (const x of bad) console.log(`  FAIL ${x.ratio}:1 ${x.fg} on ${x.bg}`);
    console.log('Accessibility (static triage):');
    if (!r.a11y.length) console.log('  nothing found');
    for (const x of r.a11y) console.log(`  ${x.gate ? 'GATE ' : 'warn '} ${x.rule}: ${x.occurrences}${x.example ? `\n         e.g. ${String(x.example).slice(0, 140)}` : ''}`);
    console.log(r.ok ? 'Result: PASSED the objective gates (go on to the UX critique)' : `Result: FAILED\n  - ${r.failures.join('\n  - ')}`);
  }
  process.exit(r.ok ? 0 : 1);
}
