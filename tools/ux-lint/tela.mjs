#!/usr/bin/env node
// ux-lint, nível tela: aplica as regras T1–T7 do contrato do UX.md (knowledge/fundamentos/ux-md.md)
// sobre capturas HTML de telas. Sem dependências.
//
// Uso: node tools/ux-lint/tela.mjs <pasta-ou-arquivos.html...> [--ux UX.md] [--json] [--falhar-em 3]
// Saída: achados por tela (regra, região, evidência arquivo:linha, severidade 0–4) e resumo.
// Código de saída 1 quando há achado com severidade >= --falhar-em (padrão 3).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';
import { parseHtml, querySelectorAll, matches, closest, isHidden, textOf, getById, walk, contains } from './lib/html.mjs';

export const SEVERIDADE = { T1: 3, T2: 2, T3: 2, T4: 3, T5: 3, T6: 2, T7: 1 };
export const ROTULOS_CANCELAR = ['cancelar', 'voltar', 'fechar', 'não', 'nao'];
export const ROTULOS_GENERICOS_DESTRUTIVA = ['confirmar', 'ok', 'sim', 'continuar'];
export const ROTULOS_SEM_VERBO = ['ok', 'sim', 'não', 'nao', 'enviar', 'confirmar'];

const norm = (s) => s.toLowerCase().replace(/[.!?:…]+$/, '').replace(/\s+/g, ' ').trim();
const ariaHidden = (n) => !!closest(n, '[aria-hidden=true]');

function nomeAcessivel(root, n) {
  const t = textOf(n);
  if (t) return t;
  if (n.attrs['aria-label']) return n.attrs['aria-label'].trim();
  if (n.attrs['aria-labelledby']) {
    return n.attrs['aria-labelledby'].split(/\s+/).map((id) => getById(root, id)).filter(Boolean).map(textOf).join(' ').trim();
  }
  return (n.attrs.title || '').trim();
}

function rotuloDoCampo(root, f) {
  if (f.attrs['aria-label']?.trim()) return f.attrs['aria-label'].trim();
  if (f.attrs['aria-labelledby']) {
    const t = f.attrs['aria-labelledby'].split(/\s+/).map((id) => getById(root, id)).filter(Boolean).map(textOf).join(' ').trim();
    if (t) return t;
  }
  if (f.attrs.id) {
    for (const l of querySelectorAll(root, 'label')) if (l.attrs.for === f.attrs.id && textOf(l)) return textOf(l);
  }
  const anc = closest(f.parent, 'label');
  if (anc && textOf(anc)) return textOf(anc);
  if (f.attrs.title?.trim()) return f.attrs.title.trim();
  return '';
}

/**
 * Analisa uma tela. `html` é o conteúdo; `arquivo` entra na evidência; `cfg` vem de loadConfig/configFrom.
 * Devolve { arquivo, dialogoAberto, regioes, achados: [{ regra, severidade, regiao, mensagem, evidencia }] }.
 */
export function analisarTela(html, cfg = configFrom({}), arquivo = 'tela.html') {
  const root = parseHtml(html);
  const sel = cfg.verificacao.seletores;
  const regiaoSel = [...sel.regioes, sel.dialogo].join(', ');
  const achados = [];
  const ev = (n) => `${arquivo}:${n.line}:${n.col}`;
  const evs = (ns) => [...new Set(ns.map(ev))].join(', ');
  const add = (regra, regiao, mensagem, evidencia) =>
    achados.push({ regra, severidade: SEVERIDADE[regra], regiao, mensagem, evidencia });

  // Regiões: rótulo estável por elemento (tag, id/role e, no diálogo, o título).
  const contagem = {};
  const rotulos = new Map();
  const rotuloRegiao = (r) => {
    if (!r) return '(fora de região)';
    if (rotulos.has(r)) return rotulos.get(r);
    let base = r.tag + (r.attrs.id && !/^_r_|^:r/.test(r.attrs.id) ? `#${r.attrs.id}` : '');
    if (matches(r, sel.dialogo)) {
      const titulo = r.attrs['aria-labelledby'] ? textOf(getById(root, r.attrs['aria-labelledby'].split(/\s+/)[0]) || r) : r.attrs['aria-label'] || '';
      base = `diálogo${titulo ? ` "${titulo.slice(0, 60)}"` : ''}`;
    } else if (r.attrs.role) base += `[role=${r.attrs.role}]`;
    contagem[base] = (contagem[base] || 0) + 1;
    const label = contagem[base] > 1 ? `${base} (${contagem[base]}º)` : base;
    rotulos.set(r, label);
    return label;
  };
  const regiaoDe = (n) => closest(n, regiaoSel);

  const dialogos = querySelectorAll(root, sel.dialogo).filter((d) => !isHidden(d) && !closest(d.parent, sel.dialogo));
  const dialogoAberto = dialogos.length > 0;
  // Com diálogo aberto, a página atrás fica fora das regras de região (é o que a pessoa vê em foco).
  const emFoco = (n) => !dialogoAberto || dialogos.some((d) => contains(d, n));

  const botoes = querySelectorAll(root, sel.botao).filter((b) => !isHidden(b));
  const ordem = new Map();
  let i = 0;
  for (const n of walk(root)) ordem.set(n, i++);
  const primaria = (b) => matches(b, sel.primaria);
  const destrutiva = (b) => matches(b, sel.destrutiva);

  // T1 — primárias por região (com diálogo aberto, só o diálogo conta).
  const max = cfg.acoes['primarias-por-regiao'];
  const porRegiao = new Map();
  for (const b of botoes.filter((b) => primaria(b) && emFoco(b))) {
    const r = regiaoDe(b);
    if (!porRegiao.has(r)) porRegiao.set(r, []);
    porRegiao.get(r).push(b);
  }
  for (const [r, bs] of porRegiao) {
    if (bs.length > max) {
      add('T1', rotuloRegiao(r), `${bs.length} ações primárias (máx. ${max}): ${bs.map((b) => `"${nomeAcessivel(root, b)}"`).join(', ')}`, evs(bs));
    }
  }

  // T2 — ordem no rodapé do diálogo.
  const ordemDialogo = cfg.acoes['ordem-dialogo'];
  for (const d of dialogos) {
    const doDialogo = botoes.filter((b) => contains(d, b));
    const cancelar = doDialogo.filter((b) => ROTULOS_CANCELAR.includes(norm(nomeAcessivel(root, b))));
    const principais = doDialogo.filter((b) => (primaria(b) || destrutiva(b)) && !cancelar.includes(b));
    for (const p of principais) {
      // Sobe do botão principal até o primeiro ancestral, abaixo do próprio diálogo, que também tem um
      // botão de cancelar: é o rodapé. Botões em áreas diferentes (conteúdo × rodapé) não são comparados.
      // Com `verificacao.seletores.rodape-dialogo`, o rodapé é declarado; sem ele, é inferido.
      let grupo = p.parent, par = null;
      const rodape = sel['rodape-dialogo'] ? closest(p, sel['rodape-dialogo']) : null;
      if (rodape && contains(d, rodape)) {
        par = cancelar.find((c) => contains(rodape, c)) ?? null;
        grupo = d;
      }
      while (!par && grupo && grupo !== d) {
        par = cancelar.find((c) => contains(grupo, c));
        if (par) break;
        grupo = grupo.parent;
      }
      if (!par) continue;
      const cancelarAntes = ordem.get(par) < ordem.get(p);
      const errado = ordemDialogo === 'acao-cancelar' ? cancelarAntes : !cancelarAntes;
      if (errado) {
        const esperado = ordemDialogo === 'acao-cancelar' ? 'ação antes de cancelar' : 'cancelar antes da ação';
        add('T2', rotuloRegiao(d), `ordem "${nomeAcessivel(root, par)}" × "${nomeAcessivel(root, p)}" invertida (esperado: ${esperado})`, `${ev(par)}, ${ev(p)}`);
      }
    }
  }

  // T3 — exatamente um h1.
  // Com diálogo aberto, a tela de base é avaliada na própria captura: não repete o T3.
  const h1 = querySelectorAll(root, 'h1').filter((h) => !isHidden(h));
  if (dialogos.length === 0 && h1.length !== 1) {
    add('T3', '(tela)', h1.length === 0 ? 'nenhum título principal (h1)' : `${h1.length} títulos principais (h1): ${h1.map((h) => `"${textOf(h).slice(0, 50)}"`).join(', ')}`, h1.length ? evs(h1) : arquivo);
  }

  // T4 — campo com rótulo visível ou nome acessível.
  const campos = querySelectorAll(root, sel.campo).filter((f) => emFoco(f) && !isHidden(f) && !ariaHidden(f) && !/^(submit|button|reset|image)$/.test(f.attrs.type || ''));
  for (const f of campos) {
    if (rotuloDoCampo(root, f)) continue;
    const ph = f.attrs.placeholder;
    add('T4', rotuloRegiao(regiaoDe(f)), ph ? `campo só com placeholder ("${ph}"), sem rótulo` : `campo <${f.tag}${f.attrs.name ? ` name="${f.attrs.name}"` : ''}> sem rótulo nem nome acessível`, ev(f));
  }

  // T5 — destrutiva com rótulo genérico.
  const marcados = new Set();
  if (cfg.acoes['destrutiva-rotulo-especifico'] !== false) {
    for (const b of botoes.filter((b) => destrutiva(b) && emFoco(b))) {
      const nome = nomeAcessivel(root, b);
      if (ROTULOS_GENERICOS_DESTRUTIVA.includes(norm(nome))) {
        marcados.add(b);
        add('T5', rotuloRegiao(regiaoDe(b)), `ação destrutiva com rótulo genérico "${nome}" (diga o que acontece: "Excluir minuta")`, ev(b));
      }
    }
  }

  // T6 — termos proibidos no texto visível (palavra inteira, sem caixa).
  const termos = (cfg.conteudo.proibidos || []).map(String).filter(Boolean);
  if (termos.length) {
    const re = termos.map((t) => [t, new RegExp(`(?<![\\p{L}\\p{N}_])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_])`, 'iu')]);
    const vistos = new Map();
    for (const n of walk(root)) {
      if (n.type !== 'text' || !n.text.trim() || !emFoco(n) || isHidden(n.parent)) continue;
      for (const [t, r] of re) {
        if (!r.test(n.text)) continue;
        const k = `${t}|${rotuloRegiao(regiaoDe(n.parent))}`;
        if (!vistos.has(k)) vistos.set(k, { t, regiao: rotuloRegiao(regiaoDe(n.parent)), nos: [] });
        vistos.get(k).nos.push(n);
      }
    }
    for (const { t, regiao, nos } of vistos.values()) {
      const trecho = nos[0].text.replace(/\s+/g, ' ').trim().slice(0, 80);
      add('T6', regiao, `termo proibido "${t}" no texto visível (${nos.length}×), ex.: "${trecho}"`, evs(nos.slice(0, 3).map((n) => n.parent)));
    }
  }

  // T7 — rótulo de botão sem verbo + objeto (aviso).
  const semVerbo = new Map();
  for (const b of botoes) {
    if (marcados.has(b) || !emFoco(b)) continue;
    const nome = nomeAcessivel(root, b);
    if (!ROTULOS_SEM_VERBO.includes(norm(nome))) continue;
    const regiao = rotuloRegiao(regiaoDe(b));
    const k = `${norm(nome)}|${regiao}`;
    if (!semVerbo.has(k)) semVerbo.set(k, { nome, regiao, bs: [] });
    semVerbo.get(k).bs.push(b);
  }
  for (const { nome, regiao, bs } of semVerbo.values()) {
    add('T7', regiao, `botão "${nome}" sem verbo + objeto${bs.length > 1 ? ` (${bs.length}×)` : ''} (ex.: "Enviar minuta")`, evs(bs));
  }

  return { arquivo, dialogoAberto, achados };
}

function listarHtml(entradas) {
  const out = [];
  for (const e of entradas) {
    if (statSync(e).isDirectory()) {
      for (const f of readdirSync(e).sort()) if (f.endsWith('.html')) out.push(join(e, f));
    } else out.push(e);
  }
  return out;
}

export function resumir(resultados) {
  const porRegra = {};
  const porSeveridade = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of resultados) for (const a of r.achados) {
    porRegra[a.regra] = (porRegra[a.regra] || 0) + 1;
    porSeveridade[a.severidade]++;
  }
  return {
    telas: resultados.length,
    telasComAchado: resultados.filter((r) => r.achados.length).length,
    achados: resultados.reduce((s, r) => s + r.achados.length, 0),
    porRegra,
    porSeveridade,
  };
}

function main() {
  const args = parseArgs();
  if (!args._.length) {
    console.error('Uso: node tools/ux-lint/tela.mjs <pasta-ou-arquivos.html...> [--ux UX.md] [--json] [--falhar-em 3]');
    process.exit(2);
  }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const resultados = listarHtml(args._).map((f) => analisarTela(readFileSync(f, 'utf8'), cfg, f));
  const resumo = resumir(resultados);
  const limite = Number(args['falhar-em'] ?? 3);
  if (args.json) console.log(JSON.stringify({ resumo, telas: resultados }, null, 2));
  else {
    for (const r of resultados) {
      const nome = basename(r.arquivo);
      if (!r.achados.length) { console.log(`✓ ${nome}`); continue; }
      console.log(`✗ ${nome}${r.dialogoAberto ? ' (diálogo aberto)' : ''}`);
      for (const a of r.achados.sort((x, y) => y.severidade - x.severidade || x.regra.localeCompare(y.regra))) {
        console.log(`   ${a.regra} sev ${a.severidade} | ${a.regiao} | ${a.mensagem}\n      ${a.evidencia}`);
      }
    }
    const regras = Object.entries(resumo.porRegra).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum';
    console.log(`\nResumo: ${resumo.telas} telas, ${resumo.telasComAchado} com achado, ${resumo.achados} achados (${regras}); severidade ${Object.entries(resumo.porSeveridade).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }
  const falha = resultados.some((r) => r.achados.some((a) => a.severidade >= limite));
  process.exit(falha ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
