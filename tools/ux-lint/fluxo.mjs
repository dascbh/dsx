#!/usr/bin/env node
// ux-lint, nível fluxo: aplica as regras F1–F5 do contrato do UX.md (knowledge/fundamentos/ux-md.md)
// sobre o mapa de fluxo de um módulo (.dsx/mapas/fluxos-<modulo>.json). Sem dependências.
//
// Formato de entrada: { telas: [{id, nome, tipo, rota, pai, persona}],
//   transicoes: [{id, de, para, gatilho: {tipo, rotulo}, evidencia}], jornadas: [{id, nome, passos, trocas_persona}] }
// Passos de jornada podem ser ids de transição ou de tela.
//
// Uso: node tools/ux-lint/fluxo.mjs .dsx/mapas/fluxos-<modulo>.json [--ux UX.md] [--json] [--falhar-em 3]
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { loadConfig, configFrom } from './lib/config.mjs';

export const SEVERIDADE = { F1: 3, F2: 1, F3: 2, F4: 2, F5: 3 };
const TIPOS_DIALOGO = new Set(['dialogo', 'diálogo', 'dialog', 'modal']);

/** Devolve { achados: [{ regra, severidade, tela, mensagem, evidencia: [] }], resumo }. */
export function analisarFluxo(mapa, cfg = configFrom({})) {
  const telas = mapa.telas || [];
  const transicoes = mapa.transicoes || [];
  const jornadas = mapa.jornadas || [];
  const porId = new Map(telas.map((t) => [t.id, t]));
  const ehDialogo = (id) => TIPOS_DIALOGO.has(String(porId.get(id)?.tipo || '').toLowerCase());
  const saidas = new Map(telas.map((t) => [t.id, []]));
  const entradas = new Map(telas.map((t) => [t.id, []]));
  for (const tr of transicoes) {
    saidas.get(tr.de)?.push(tr);
    entradas.get(tr.para)?.push(tr);
  }
  const achados = [];
  const add = (regra, tela, mensagem, evidencia = [], severidade = SEVERIDADE[regra]) =>
    achados.push({ regra, severidade, tela, mensagem, evidencia: evidencia.filter(Boolean) });
  const evid = (trs) => trs.map((t) => `${t.id} (${t.evidencia || 'sem evidência'})`);
  const nome = (id) => porId.get(id)?.nome || id;

  // Referências quebradas: transição para/de tela que não existe (não é regra do contrato; vai como aviso F0).
  for (const tr of transicoes) {
    for (const lado of ['de', 'para']) {
      if (!porId.has(tr[lado])) add('F0', tr[lado], `transição ${tr.id} aponta para tela inexistente "${tr[lado]}"`, evid([tr]), 1);
    }
  }

  // F1 — tela (não diálogo) sem nenhuma saída. Transição para a própria tela (ação que fica nela) não é saída.
  const becos = telas.filter((t) => !ehDialogo(t.id) && !saidas.get(t.id).some((tr) => tr.para !== t.id));
  const limiteBecos = Number(cfg.fluxos['becos-sem-saida'] ?? 0);
  for (const t of becos) {
    add('F1', t.id, `"${t.nome}" (${t.tipo}) não tem nenhuma transição de saída; chega-se por ${entradas.get(t.id).length} transição(ões)`,
      evid(entradas.get(t.id)), becos.length > limiteBecos ? SEVERIDADE.F1 : 1);
  }

  // F2 — tela fora de todas as jornadas (aviso).
  if (jornadas.length) {
    const nasJornadas = new Set();
    const trPorId = new Map(transicoes.map((t) => [t.id, t]));
    for (const j of jornadas) for (const p of j.passos || []) {
      const tr = trPorId.get(p);
      if (tr) { nasJornadas.add(tr.de); nasJornadas.add(tr.para); } else if (porId.has(p)) nasJornadas.add(p);
    }
    for (const t of telas) {
      if (!nasJornadas.has(t.id)) add('F2', t.id, `"${t.nome}" não aparece em nenhuma jornada`, t.componente ? [t.componente] : []);
    }
  }

  // F3 — jornada longa.
  const maxPassos = Number(cfg.fluxos['max-passos-jornada']);
  for (const j of jornadas) {
    const n = (j.passos || []).length;
    if (n > maxPassos) {
      const trocas = (j.trocas_persona || []).length;
      add('F3', j.id, `jornada "${j.nome}" tem ${n} passos (máx. ${maxPassos})${trocas ? `, com ${trocas} troca(s) de persona` : ''}`, []);
    }
  }

  // F4 — diálogos empilhados: profundidade da cadeia diálogo → diálogo acima do limite. O mapa não diz se o
  // primeiro diálogo fecha antes do segundo abrir; a regra acusa e a evidência permite conferir no código.
  const maxDialogos = Number(cfg.fluxos['max-dialogos-empilhados']);
  // Abertura diálogo → diálogo: não conta ação dentro do mesmo diálogo nem volta para a tela-mãe (B → A
  // quando A é o `pai` de B).
  const empilha = (tr) => ehDialogo(tr.de) && ehDialogo(tr.para) && tr.de !== tr.para && porId.get(tr.de)?.pai !== tr.para;
  const aberturas = transicoes.filter(empilha);
  // Profundidade = maior cadeia de aberturas que termina no diálogo (o primeiro diálogo conta 1).
  const prof = (id, visitando = new Set([id])) => {
    let maior = 0;
    for (const tr of aberturas) {
      if (tr.para !== id || visitando.has(tr.de)) continue;
      visitando.add(tr.de);
      maior = Math.max(maior, prof(tr.de, visitando));
      visitando.delete(tr.de);
    }
    return 1 + maior;
  };
  for (const tr of transicoes) {
    if (!empilha(tr)) continue; // ação dentro do mesmo diálogo, volta ou diálogo aberto a partir de página
    const p = prof(tr.para);
    if (p > maxDialogos) {
      add('F4', tr.para, `diálogo "${nome(tr.para)}" abre a partir do diálogo "${nome(tr.de)}" (${p} diálogos empilhados; máx. ${maxDialogos})${tr.gatilho?.rotulo ? ` — gatilho "${tr.gatilho.rotulo}"` : ''}`, evid([tr]));
    }
  }

  // F5 — tela não raiz (com pai) sem transição de volta para a mãe ou para uma tela de onde se chega a ela.
  if (cfg.navegacao.retorno === 'obrigatorio') {
    for (const t of telas.filter((t) => t.pai)) {
      // Origem = de onde se chega; filhas que voltam para esta tela (diálogo que fecha) não são origem.
      const origens = new Set(entradas.get(t.id).map((tr) => tr.de).filter((de) => de !== t.id && porId.get(de)?.pai !== t.id));
      const volta = saidas.get(t.id).some((tr) => tr.para === t.pai || origens.has(tr.para));
      if (!volta) {
        add('F5', t.id, `"${t.nome}" (filha de "${nome(t.pai)}") não tem transição de volta para a mãe nem para ${origens.size ? [...origens].map((o) => `"${nome(o)}"`).join(', ') : 'nenhuma origem'}`,
          evid([...entradas.get(t.id), ...saidas.get(t.id)]));
      }
    }
  }

  const porRegra = {};
  for (const a of achados) porRegra[a.regra] = (porRegra[a.regra] || 0) + 1;
  return {
    achados,
    resumo: { telas: telas.length, transicoes: transicoes.length, jornadas: jornadas.length, achados: achados.length, porRegra },
  };
}

function main() {
  const args = parseArgs();
  if (!args._.length) {
    console.error('Uso: node tools/ux-lint/fluxo.mjs .dsx/mapas/fluxos-<modulo>.json [--ux UX.md] [--json] [--falhar-em 3]');
    process.exit(2);
  }
  const cfg = loadConfig(typeof args.ux === 'string' ? args.ux : null);
  const limite = Number(args['falhar-em'] ?? 3);
  const saida = args._.map((f) => ({ arquivo: f, ...analisarFluxo(JSON.parse(readFileSync(f, 'utf8')), cfg) }));
  if (args.json) console.log(JSON.stringify(saida.length === 1 ? saida[0] : saida, null, 2));
  else {
    for (const s of saida) {
      console.log(`${s.arquivo}`);
      for (const a of [...s.achados].sort((x, y) => x.regra.localeCompare(y.regra) || y.severidade - x.severidade)) {
        console.log(`   ${a.regra} sev ${a.severidade} | ${a.tela} | ${a.mensagem}`);
        for (const e of a.evidencia.slice(0, 4)) console.log(`      ${e}`);
        if (a.evidencia.length > 4) console.log(`      … +${a.evidencia.length - 4}`);
      }
      const r = s.resumo;
      console.log(`\nResumo: ${r.telas} telas, ${r.transicoes} transições, ${r.jornadas} jornadas; ${r.achados} achados (${Object.entries(r.porRegra).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhum'})`);
    }
  }
  process.exit(saida.some((s) => s.achados.some((a) => a.severidade >= limite)) ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
