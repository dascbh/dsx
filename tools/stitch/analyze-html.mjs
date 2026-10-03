#!/usr/bin/env node
// Analisa o HTML de uma tela gerada pelo Stitch contra o DSX — antes de qualquer crítica de UX.
//
//   node tools/stitch/analyze-html.mjs <tela.html> [--design-md DESIGN.md] [--json]
//
// O Stitch devolve HTML com Tailwind via CDN e um `tailwind.config` embutido no <head>. Este script:
//  1. lê a config (cores e raios) e mede, na MARCAÇÃO, quantos usos de cor são papéis do DSX e quantos
//     são papéis Material 3 que só existem no Stitch (cada um traz o token DSX para onde mapear);
//  2. acusa valores arbitrários do Tailwind (`bg-[#…]`, `p-[13px]`) e estilos inline;
//  3. mede contraste dos pares texto/fundo declarados no MESMO elemento (gate: ≥ 4.5:1);
//  4. faz uma triagem de acessibilidade estática (não substitui a skill `acessibilidade` nem axe):
//     imagem sem alt, botão/link sem nome acessível, campo sem rótulo, elemento clicável sem teclado,
//     h1 único, lang, links "#", ordenação sem aria-sort.
// Sai com 1 se algum gate falhar (contraste, nome acessível, campo sem rótulo, clicável sem teclado).
// Saída --json: { ok, failures, has_config, radius, colors: { total_uses, dsx_uses, dsx_percent, roles: [{ role, uses,
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

  // Triagem de acessibilidade estática.
  const a11y = [];
  const add = (gate, rule, n, example) => n && a11y.push({ gate, rule, occurrences: n, example });
  const imgs = tagsMatching(body, /<img\b[^>]*>/gi);
  add(true, 'imagem sem alt (1.1.1)', imgs.filter((t) => attribute(t, 'alt') == null).length, imgs.find((t) => attribute(t, 'alt') == null));
  const buttons = [...body.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)];
  const unnamedButtons = buttons.filter((b) => !attribute(`<b ${b[1]}>`, 'aria-label') && !attribute(`<b ${b[1]}>`, 'title') && !visibleText(b[2]));
  add(true, 'botão sem nome acessível (4.1.2)', unnamedButtons.length, unnamedButtons[0]?.[0].slice(0, 120));
  const links = [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  const unnamedLinks = links.filter((l) => !attribute(`<a ${l[1]}>`, 'aria-label') && !visibleText(l[2]));
  add(true, 'link sem nome acessível (2.4.4)', unnamedLinks.length, unnamedLinks[0]?.[0].slice(0, 120));
  add(false, 'link com href="#" (destino a ligar no código)', links.filter((l) => /href="#"/.test(l[1])).length);
  const fields = tagsMatching(body, /<(input|select|textarea)\b[^>]*>/gi).filter((t) => !/type="(hidden|submit|button)"/i.test(t));
  const labelled = new Set([...body.matchAll(/<label\b[^>]*for="([^"]+)"/gi)].map((m) => m[1]));
  const unlabelled = fields.filter((t) => !attribute(t, 'aria-label') && !attribute(t, 'aria-labelledby') && !labelled.has(attribute(t, 'id') ?? '\u0000') && !/<label\b[^>]*>(?:(?!<\/label>)[\s\S])*$/i.test(body.slice(0, body.indexOf(t))));
  add(true, 'campo sem rótulo associado (1.3.1/3.3.2)', unlabelled.length, unlabelled[0]);
  const clickables = tagsMatching(body, /<(tr|div|li|span|td)\b[^>]*(?:onclick=|cursor-pointer)[^>]*>/gi);
  const noKeyboard = clickables.filter((t) => !attribute(t, 'tabindex') && !attribute(t, 'role'));
  add(true, 'elemento clicável sem acesso por teclado (2.1.1)', noKeyboard.length, noKeyboard[0]);
  const h1 = (body.match(/<h1\b/gi) ?? []).length;
  if (h1 !== 1) a11y.push({ gate: false, rule: `h1 deve ser único (encontrados: ${h1})`, occurrences: 1 });
  if (!/<html[^>]*\blang="/i.test(html)) a11y.push({ gate: true, rule: 'html sem lang (3.1.1)', occurrences: 1 });
  const sortable = (body.match(/<th\b[^>]*>(?:(?!<\/th>)[\s\S])*(?:sort|arrow_(?:up|down)ward|unfold)/gi) ?? []).length;
  const ariaSort = (body.match(/aria-sort=/g) ?? []).length;
  if (sortable > ariaSort) a11y.push({ gate: false, rule: `cabeçalhos ordenáveis sem aria-sort (${sortable - ariaSort})`, occurrences: sortable - ariaSort });

  const failures = [
    ...contrastPairs.filter((c) => !c.ok).map((c) => `contraste ${c.ratio}:1 em ${c.fg} sobre ${c.bg}`),
    ...a11y.filter((x) => x.gate).map((x) => `${x.rule}: ${x.occurrences}`),
  ];
  return {
    ok: failures.length === 0, failures, has_config: hasConfig, radius,
    colors: { total_uses: totalUses, dsx_uses: dsxUses, dsx_percent: totalUses ? Math.round((dsxUses / totalUses) * 100) : null, roles },
    contrast: contrastPairs, arbitrary, inline: { total: inline.length, examples: [...new Set(inline)].slice(0, 5) }, a11y,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseCli('stitch/analyze-html.mjs'); // apelidos com aviso para nomes antigos
  const file = a._[0];
  if (!file) { console.error('Uso: node tools/stitch/analyze-html.mjs <tela.html> [--design-md DESIGN.md] [--json]'); process.exit(2); }
  const dsxRoles = a['design-md'] ? Object.keys(readDesignMd(readFileSync(a['design-md'], 'utf8')).fm.colors ?? {}) : null;
  const r = analyzeHtml(readFileSync(file, 'utf8'), { dsxRoles });
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else {
    const c = r.colors;
    console.log(`Cores na marcação: ${c.total_uses} usos${c.dsx_percent != null ? ` — ${c.dsx_percent}% em papéis do DSX` : ' (passe --design-md para separar DSX × Stitch)'}`);
    for (const p of c.roles.filter((x) => x.source === 'stitch')) console.log(`  só Stitch: ${p.role} (${p.uses}×, ${p.value}) → ${p.map_to ?? 'SEM MAPEAMENTO: decidir token'}`);
    if (r.radius) console.log(`Raios na config: ${r.radius.replace(/\s+/g, ' ')}`);
    console.log(`Valores arbitrários: ${r.arbitrary.length}${r.arbitrary.length ? ' — ' + r.arbitrary.slice(0, 5).join(' ') : ''} · style inline: ${r.inline.total}`);
    const bad = r.contrast.filter((x) => !x.ok);
    console.log(`Contraste (pares no mesmo elemento): ${r.contrast.length - bad.length}/${r.contrast.length} OK`);
    for (const x of bad) console.log(`  FALHA ${x.ratio}:1 ${x.fg} sobre ${x.bg}`);
    console.log('Acessibilidade (triagem estática):');
    if (!r.a11y.length) console.log('  nada encontrado');
    for (const x of r.a11y) console.log(`  ${x.gate ? 'GATE ' : 'aviso'} ${x.rule}: ${x.occurrences}${x.example ? `\n         ex.: ${String(x.example).slice(0, 140)}` : ''}`);
    console.log(r.ok ? 'Resultado: APROVADO nos gates objetivos (siga para a crítica de UX)' : `Resultado: REPROVADO\n  - ${r.failures.join('\n  - ')}`);
  }
  process.exit(r.ok ? 0 : 1);
}
