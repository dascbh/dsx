#!/usr/bin/env node
// Analisa o HTML de uma tela gerada pelo Stitch contra o DSX — antes de qualquer crítica de UX.
//
//   node tools/stitch/analisar-html.mjs <tela.html> [--design-md DESIGN.md] [--json]
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
import { readFileSync } from 'node:fs';
import { contrast } from '../lib/color.mjs';
import { lerDesignMd, MAPEAMENTO_MATERIAL } from './design-system.mjs';
import { parseArgs } from '../lib/cli.mjs';

const PREFIXOS = '(?:bg|text|border|ring|outline|fill|stroke|divide|from|to|via|placeholder|decoration|accent|caret)';

export function lerConfig(html) {
  const m = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*<\/script>/);
  const cfg = m ? m[1] : '';
  const cores = Object.fromEntries([...cfg.matchAll(/["']?([a-zA-Z0-9_-]+)["']?\s*:\s*["'](#[0-9a-fA-F]{3,8})["']/g)].map((x) => [x[1], x[2].toLowerCase()]));
  const raio = cfg.match(/borderRadius["']?\s*:\s*(\{[^}]*\})/)?.[1] ?? null;
  return { cores, raio, temConfig: Boolean(m) };
}

const tagsCom = (html, re) => [...html.matchAll(re)].map((m) => m[0]);
const atributo = (tag, nome) => tag.match(new RegExp(`\\s${nome}\\s*=\\s*"([^"]*)"`, 'i'))?.[1];
const textoVisivel = (s) => s.replace(/<span[^>]*material-symbols[^>]*>[\s\S]*?<\/span>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

export function analisar(html, { papeisDsx = null } = {}) {
  const corpo = html.split(/<\/head>/i)[1] ?? html;
  const { cores, raio, temConfig } = lerConfig(html);
  const dsx = new Set(papeisDsx ?? []);
  const usos = {};
  const pares = [];
  for (const m of corpo.matchAll(/<([a-z0-9-]+)\b([^>]*?)class="([^"]+)"([^>]*)>/gi)) {
    const classes = m[3].split(/\s+/);
    let fg = null, bg = null;
    for (const c of classes) {
      const r = c.match(new RegExp(`^(?:[a-z0-9-]+:)*${PREFIXOS}-([a-zA-Z0-9_-]+?)(?:\\/\\d+)?$`));
      if (r && cores[r[1]]) {
        usos[r[1]] = (usos[r[1]] ?? 0) + 1;
        if (/^text-/.test(c)) fg = r[1];
        if (/^bg-/.test(c)) bg = r[1];
      }
    }
    if (fg && bg) pares.push({ fg, bg, el: m[1] });
  }
  const totalUsos = Object.values(usos).reduce((a, b) => a + b, 0);
  const papel = Object.entries(usos).map(([k, n]) => ({
    papel: k, usos: n, valor: cores[k],
    origem: dsx.size ? (dsx.has(k) ? 'dsx' : 'stitch') : 'desconhecida',
    mapearPara: dsx.has(k) ? null : MAPEAMENTO_MATERIAL[k.replace(/_/g, '-')] ?? null,
  })).sort((a, b) => b.usos - a.usos);
  const usosDsx = papel.filter((p) => p.origem === 'dsx').reduce((a, p) => a + p.usos, 0);

  const contraste = [];
  const vistos = new Set();
  for (const p of pares) {
    const k = `${p.fg}|${p.bg}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    const a = cores[p.fg], b = cores[p.bg];
    if (a?.length === 7 && b?.length === 7) contraste.push({ ...p, ratio: +contrast(a, b).toFixed(2), ok: contrast(a, b) >= 4.5 });
  }

  const arbitrarios = [...corpo.matchAll(/\b[a-z-]+-\[(?:#|\d)[^\]]*\]/g)].map((m) => m[0]);
  const inline = [...corpo.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]);

  // Triagem de acessibilidade estática.
  const a11y = [];
  const add = (gate, regra, n, exemplo) => n && a11y.push({ gate, regra, ocorrencias: n, exemplo });
  const imgs = tagsCom(corpo, /<img\b[^>]*>/gi);
  add(true, 'imagem sem alt (1.1.1)', imgs.filter((t) => atributo(t, 'alt') == null).length, imgs.find((t) => atributo(t, 'alt') == null));
  const botoes = [...corpo.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)];
  const semNomeBtn = botoes.filter((b) => !atributo(`<b ${b[1]}>`, 'aria-label') && !atributo(`<b ${b[1]}>`, 'title') && !textoVisivel(b[2]));
  add(true, 'botão sem nome acessível (4.1.2)', semNomeBtn.length, semNomeBtn[0]?.[0].slice(0, 120));
  const links = [...corpo.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  const semNomeLink = links.filter((l) => !atributo(`<a ${l[1]}>`, 'aria-label') && !textoVisivel(l[2]));
  add(true, 'link sem nome acessível (2.4.4)', semNomeLink.length, semNomeLink[0]?.[0].slice(0, 120));
  add(false, 'link com href="#" (destino a ligar no código)', links.filter((l) => /href="#"/.test(l[1])).length);
  const campos = tagsCom(corpo, /<(input|select|textarea)\b[^>]*>/gi).filter((t) => !/type="(hidden|submit|button)"/i.test(t));
  const rotulados = new Set([...corpo.matchAll(/<label\b[^>]*for="([^"]+)"/gi)].map((m) => m[1]));
  const semRotulo = campos.filter((t) => !atributo(t, 'aria-label') && !atributo(t, 'aria-labelledby') && !rotulados.has(atributo(t, 'id') ?? '\u0000') && !/<label\b[^>]*>(?:(?!<\/label>)[\s\S])*$/i.test(corpo.slice(0, corpo.indexOf(t))));
  add(true, 'campo sem rótulo associado (1.3.1/3.3.2)', semRotulo.length, semRotulo[0]);
  const clicaveis = tagsCom(corpo, /<(tr|div|li|span|td)\b[^>]*(?:onclick=|cursor-pointer)[^>]*>/gi);
  const semTeclado = clicaveis.filter((t) => !atributo(t, 'tabindex') && !atributo(t, 'role'));
  add(true, 'elemento clicável sem acesso por teclado (2.1.1)', semTeclado.length, semTeclado[0]);
  const h1 = (corpo.match(/<h1\b/gi) ?? []).length;
  if (h1 !== 1) a11y.push({ gate: false, regra: `h1 deve ser único (encontrados: ${h1})`, ocorrencias: 1 });
  if (!/<html[^>]*\blang="/i.test(html)) a11y.push({ gate: true, regra: 'html sem lang (3.1.1)', ocorrencias: 1 });
  const ordenaveis = (corpo.match(/<th\b[^>]*>(?:(?!<\/th>)[\s\S])*(?:sort|arrow_(?:up|down)ward|unfold)/gi) ?? []).length;
  const ariaSort = (corpo.match(/aria-sort=/g) ?? []).length;
  if (ordenaveis > ariaSort) a11y.push({ gate: false, regra: `cabeçalhos ordenáveis sem aria-sort (${ordenaveis - ariaSort})`, ocorrencias: ordenaveis - ariaSort });

  const falhas = [
    ...contraste.filter((c) => !c.ok).map((c) => `contraste ${c.ratio}:1 em ${c.fg} sobre ${c.bg}`),
    ...a11y.filter((x) => x.gate).map((x) => `${x.regra}: ${x.ocorrencias}`),
  ];
  return {
    ok: falhas.length === 0, falhas, temConfig, raio,
    cores: { totalUsos, usosDsx, percentualDsx: totalUsos ? Math.round((usosDsx / totalUsos) * 100) : null, papeis: papel },
    contraste, arbitrarios, inline: { total: inline.length, exemplos: [...new Set(inline)].slice(0, 5) }, a11y,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const arq = a._[0];
  if (!arq) { console.error('Uso: node tools/stitch/analisar-html.mjs <tela.html> [--design-md DESIGN.md] [--json]'); process.exit(2); }
  const papeisDsx = a['design-md'] ? Object.keys(lerDesignMd(readFileSync(a['design-md'], 'utf8')).fm.colors ?? {}) : null;
  const r = analisar(readFileSync(arq, 'utf8'), { papeisDsx });
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else {
    const c = r.cores;
    console.log(`Cores na marcação: ${c.totalUsos} usos${c.percentualDsx != null ? ` — ${c.percentualDsx}% em papéis do DSX` : ' (passe --design-md para separar DSX × Stitch)'}`);
    for (const p of c.papeis.filter((x) => x.origem === 'stitch')) console.log(`  só Stitch: ${p.papel} (${p.usos}×, ${p.valor}) → ${p.mapearPara ?? 'SEM MAPEAMENTO: decidir token'}`);
    if (r.raio) console.log(`Raios na config: ${r.raio.replace(/\s+/g, ' ')}`);
    console.log(`Valores arbitrários: ${r.arbitrarios.length}${r.arbitrarios.length ? ' — ' + r.arbitrarios.slice(0, 5).join(' ') : ''} · style inline: ${r.inline.total}`);
    const ruins = r.contraste.filter((x) => !x.ok);
    console.log(`Contraste (pares no mesmo elemento): ${r.contraste.length - ruins.length}/${r.contraste.length} OK`);
    for (const x of ruins) console.log(`  FALHA ${x.ratio}:1 ${x.fg} sobre ${x.bg}`);
    console.log('Acessibilidade (triagem estática):');
    if (!r.a11y.length) console.log('  nada encontrado');
    for (const x of r.a11y) console.log(`  ${x.gate ? 'GATE ' : 'aviso'} ${x.regra}: ${x.ocorrencias}${x.exemplo ? `\n         ex.: ${String(x.exemplo).slice(0, 140)}` : ''}`);
    console.log(r.ok ? 'Resultado: APROVADO nos gates objetivos (siga para a crítica de UX)' : `Resultado: REPROVADO\n  - ${r.falhas.join('\n  - ')}`);
  }
  process.exit(r.ok ? 0 : 1);
}
