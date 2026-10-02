#!/usr/bin/env node
// Ponte Figma → DTCG: compara as variáveis de um snapshot do Figma com os tokens do projeto
// e devolve a mudança como diff de tokens — a classe `token` da volta do ciclo.
//
//   node tools/figma/figma-para-tokens.mjs --snapshot <snapshot.json> --tokens <pasta> [--write] [--json]
//
// <snapshot.json>: saída de tools/figma/snapshot.js em MODE 'full' (campo `variables`:
//   { "color/text/primary": { "Semântico/Claro": "→color/neutral/950", ... }, "space/4": { "Primitivos/Valor": 16 } }).
// Sem --write: só relata. Com --write: aplica as mudanças em tokens EXISTENTES e roda o gate de contraste
// (tokens/contrast-pairs.json) — sai com código 1 se algum par ficar abaixo do mínimo.
// Variáveis novas no Figma NUNCA são criadas automaticamente: token novo é decisão (skill `tokens`).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { flatten, build, checkContrast, useTokensDir } from '../build-tokens.mjs';
import { hexParaRgba, paraCaminhoDtcg, paraNomeFigma } from './tokens-para-figma.mjs';
import { parseArgs } from '../lib/cli.mjs';

const ARQUIVO = {
  'Primitivos/Valor': 'primitives.tokens.json',
  'Semântico/Claro': 'semantic.light.tokens.json',
  'Semântico/Escuro': 'semantic.dark.tokens.json',
  'Componente/Valor': 'component.tokens.json',
};

/** Valor do snapshot → valor DTCG, usando o tipo do token existente quando houver. */
export function paraDtcg(valorFigma, tipo) {
  if (typeof valorFigma === 'string' && valorFigma.startsWith('→')) return `{${paraCaminhoDtcg(valorFigma.slice(1))}}`;
  if (typeof valorFigma === 'string' && valorFigma.startsWith('#')) {
    const [hex, op] = valorFigma.split('/');
    if (op == null || Number(op) === 1) return hex.toLowerCase();
    return hex.toLowerCase() + Math.round(Number(op) * 255).toString(16).padStart(2, '0');
  }
  if (typeof valorFigma === 'number') {
    if (tipo === 'dimension') return `${valorFigma}px`;
    if (tipo === 'duration') return `${valorFigma}ms`;
    return valorFigma;
  }
  return valorFigma;
}

const mesmaCor = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || !a.startsWith('#') || !b.startsWith('#')) return false;
  const x = hexParaRgba(a), y = hexParaRgba(b);
  return ['r', 'g', 'b', 'a'].every((k) => Math.abs(x[k] - y[k]) < 0.006);
};
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b) || mesmaCor(a, b) ||
  (Array.isArray(a) && a[0] === b); // fontFamily: o Figma só guarda a primeira família

export function comparar(snapshot, dir) {
  const ler = (f) => (existsSync(join(dir, f)) ? flatten(JSON.parse(readFileSync(join(dir, f), 'utf8'))) : {});
  const dtcg = Object.fromEntries(Object.entries(ARQUIVO).map(([k, f]) => [k, ler(f)]));
  const claro = dtcg['Semântico/Claro'];
  const vars = snapshot.variables;
  if (!vars || typeof vars !== 'object') throw new Error('Snapshot sem `variables` detalhadas — rode o snapshot com MODE = \'full\'.');

  const mudancas = [], novos = [], sugestoes = [];
  const vistos = new Set();
  for (const [nome, porModo] of Object.entries(vars)) {
    const path = paraCaminhoDtcg(nome);
    for (const [chave, valorFigma] of Object.entries(porModo)) {
      const arquivo = ARQUIVO[chave];
      if (!arquivo) { novos.push({ nome, colecao: chave, valor: valorFigma, motivo: 'coleção/modo fora do esquema DSX' }); continue; }
      vistos.add(`${chave}|${path}`);
      // Tema escuro herda do claro quando a chave não está no arquivo escuro.
      const atual = dtcg[chave][path] ?? (chave === 'Semântico/Escuro' ? claro[path] : undefined);
      if (!atual) { novos.push({ nome, colecao: chave, valor: valorFigma }); continue; }
      const depois = paraDtcg(valorFigma, atual.type);
      if (!igual(atual.value, depois)) {
        mudancas.push({ token: path, arquivo, modo: chave, antes: atual.value, depois, herdado: !dtcg[chave][path] });
      }
      // Semântico com cor crua: se um primitivo tem o mesmo valor, sugira o alias.
      if (chave.startsWith('Semântico') && typeof depois === 'string' && depois.startsWith('#')) {
        const prim = Object.entries(dtcg['Primitivos/Valor']).find(([, t]) => mesmaCor(t.value, depois));
        if (prim) sugestoes.push({ token: path, modo: chave, sugestao: `use {${prim[0]}} em vez de ${depois}` });
        else sugestoes.push({ token: path, modo: chave, sugestao: `valor cru ${depois} sem primitivo correspondente — crie um passo na rampa (skill tokens)` });
      }
    }
  }
  const ausentesNoFigma = [];
  for (const [chave, toks] of Object.entries(dtcg)) {
    for (const path of Object.keys(toks)) if (!vistos.has(`${chave}|${path}`)) ausentesNoFigma.push(`${chave} ${paraNomeFigma(path)}`);
  }
  return { mudancas, novos, sugestoes, ausentesNoFigma };
}

/** Grava as mudanças nos arquivos DTCG (só tokens existentes; herdado no escuro vira chave explícita). */
export function aplicar(mudancas, dir) {
  const arquivos = {};
  const abrir = (f) => (arquivos[f] ??= JSON.parse(readFileSync(join(dir, f), 'utf8')));
  const claroArvore = abrir('semantic.light.tokens.json');
  for (const m of mudancas) {
    const arvore = abrir(m.arquivo);
    const partes = m.token.split('.');
    let no = arvore, noClaro = claroArvore;
    for (const p of partes.slice(0, -1)) { no = no[p] ??= {}; noClaro = noClaro?.[p]; }
    const folha = partes.at(-1);
    if (!no[folha]) no[folha] = { $type: noClaro?.[folha]?.$type ?? 'color' };
    no[folha].$value = m.depois;
  }
  for (const [f, arvore] of Object.entries(arquivos)) writeFileSync(join(dir, f), JSON.stringify(arvore, null, 2) + '\n');
  return Object.keys(arquivos);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  if (!a.snapshot) { console.error('Uso: node tools/figma/figma-para-tokens.mjs --snapshot <arquivo> --tokens <pasta> [--write] [--json]'); process.exit(2); }
  const dir = a.tokens ?? 'tokens';
  const r = comparar(JSON.parse(readFileSync(a.snapshot, 'utf8')), dir);
  if (a.json) console.log(JSON.stringify(r, null, 2));
  else {
    console.log(`## Mudanças de token (${r.mudancas.length})`);
    for (const m of r.mudancas) console.log(`- ${m.token} [${m.modo}] ${JSON.stringify(m.antes)} → ${JSON.stringify(m.depois)}${m.herdado ? ' (antes herdado do Claro)' : ''}`);
    console.log(`\n## Variáveis novas no Figma — decisão, não aplicação automática (${r.novos.length})`);
    for (const n of r.novos) console.log(`- ${n.nome} [${n.colecao}] = ${JSON.stringify(n.valor)}${n.motivo ? ` — ${n.motivo}` : ''}`);
    console.log(`\n## Sugestões (${r.sugestoes.length})`);
    for (const s of r.sugestoes) console.log(`- ${s.token} [${s.modo}]: ${s.sugestao}`);
    console.log(`\n## Tokens sem variável no Figma (${r.ausentesNoFigma.length})${r.ausentesNoFigma.length ? ' — normal para sombra/easing; investigue o resto' : ''}`);
    for (const x of r.ausentesNoFigma.slice(0, 20)) console.log(`- ${x}`);
  }
  if (a.write && r.mudancas.length) {
    const gravados = aplicar(r.mudancas, dir);
    console.log(`\nGravado: ${gravados.join(', ')}`);
    useTokensDir(dir);
    const falhas = checkContrast(build().resolved).filter((x) => !x.ok);
    if (falhas.length) {
      for (const f of falhas) console.log(`FALHA [${f.theme}] ${f.ratio}:1 (mín ${f.min}) ${f.fg} / ${f.bg} — ${f.uso}`);
      console.log('\nGate de contraste REPROVADO: devolva a proposta ao design (não aplique). Reverta com git checkout nos arquivos de tokens.');
      process.exit(1);
    }
    console.log('Gate de contraste: OK em todos os pares e temas.');
  }
}
