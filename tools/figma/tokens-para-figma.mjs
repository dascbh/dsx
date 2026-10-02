#!/usr/bin/env node
// Ponte DTCG → Figma: transforma os tokens do projeto (3 camadas) em variáveis do Figma.
//
//   node tools/figma/tokens-para-figma.mjs --tokens <pasta> [--json | --script]
//
// --json   (padrão) imprime o plano: coleções, modos, variáveis, aliases, scopes e o que não é suportado.
// --script imprime um script para colar em `use_figma` (carregue a skill `figma-use` antes). Idempotente:
//          reusa coleção, modo e variável pelo nome; só cria o que falta e atualiza valores.
//
// Esquema no Figma (mesma arquitetura do DSX):
//   Primitivos  — modo "Valor"; scopes vazios (não aparecem no seletor: força o uso dos semânticos)
//   Semântico   — modos "Claro" e "Escuro"; valores = alias para Primitivos (ou valor cru, se o token é cru)
//   Componente  — modo "Valor"; alias para Semântico (resolve conforme o modo aplicado no frame)
// Nomes: caminho DTCG com "/" no lugar de "." (color.text.primary → color/text/primary).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { flatten } from '../build-tokens.mjs';
import { parseArgs } from '../lib/cli.mjs';

export const COLECOES = {
  primitivos: { nome: 'Primitivos', modos: ['Valor'] },
  semantico: { nome: 'Semântico', modos: ['Claro', 'Escuro'] },
  componente: { nome: 'Componente', modos: ['Valor'] },
};

export const paraNomeFigma = (path) => path.replace(/\./g, '/');
export const paraCaminhoDtcg = (name) => name.replace(/\//g, '.');

/** Converte "#rrggbb[aa]" em {r,g,b,a} 0–1. */
export function hexParaRgba(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const n = (i) => parseInt(full.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? Math.round(n(6) * 1000) / 1000 : 1 };
}

/** Tipo DTCG → tipo de variável do Figma + valor convertido. null = não suportado como variável. */
export function converterValor(type, value) {
  if (type === 'color' && typeof value === 'string' && value.startsWith('#')) return { tipo: 'COLOR', valor: hexParaRgba(value) };
  if (type === 'dimension' && typeof value === 'string') {
    const m = value.match(/^(-?\d+(?:\.\d+)?)px$/);
    return m ? { tipo: 'FLOAT', valor: Number(m[1]) } : null; // ch, rem, % não têm equivalente direto
  }
  if (type === 'duration' && typeof value === 'string') {
    const m = value.match(/^(\d+(?:\.\d+)?)ms$/);
    return m ? { tipo: 'FLOAT', valor: Number(m[1]) } : null;
  }
  if ((type === 'number' || type === 'fontWeight') && typeof value === 'number') return { tipo: 'FLOAT', valor: value };
  if (type === 'fontFamily') return { tipo: 'STRING', valor: Array.isArray(value) ? value[0] : String(value) };
  return null; // shadow, cubicBezier, typography composta: viram estilos (efeito/texto), não variáveis
}

/** Scopes por intenção: é isso que faz o Figma sugerir a variável certa no lugar certo. */
export function scopesPara(path, camada) {
  if (camada === 'primitivos') return [];
  const p = path;
  if (/^color\.text\.|-text$|^color\.feedback\..*-text$/.test(p) || /\.text$/.test(p)) return ['TEXT_FILL'];
  if (/^color\.border\.|\.border$/.test(p)) return ['STROKE_COLOR'];
  if (/-icon$/.test(p)) return ['SHAPE_FILL', 'STROKE_COLOR'];
  if (/^color\.(bg|action|ai)\.|-bg$|\.bg(-hover)?$/.test(p)) return ['FRAME_FILL', 'SHAPE_FILL'];
  if (/^color\./.test(p)) return ['ALL_FILLS'];
  if (/^space\.|padding/.test(p)) return ['GAP'];
  if (/^radius\.|\.radius$/.test(p)) return ['CORNER_RADIUS'];
  if (/^size\.|\.height$/.test(p)) return ['WIDTH_HEIGHT'];
  if (/^font\.size\./.test(p)) return ['FONT_SIZE'];
  if (/^font\.weight\./.test(p)) return ['FONT_WEIGHT'];
  if (/^font\.family\./.test(p)) return ['FONT_FAMILY'];
  return [];
}

const ALIAS = /^\{([^}]+)\}$/;
const ler = (dir, f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : null);

/** Monta o plano completo a partir da pasta de tokens. */
export function planejar(dir) {
  const prim = flatten(ler(dir, 'primitives.tokens.json') ?? {});
  const claro = flatten(ler(dir, 'semantic.light.tokens.json') ?? {});
  const escuro = flatten(ler(dir, 'semantic.dark.tokens.json') ?? {});
  const comp = flatten(ler(dir, 'component.tokens.json') ?? {});
  if (!Object.keys(prim).length || !Object.keys(claro).length) {
    throw new Error(`Pasta ${dir} sem primitives.tokens.json ou semantic.light.tokens.json.`);
  }
  const camadaDe = (path) => (path in comp ? 'componente' : path in claro ? 'semantico' : path in prim ? 'primitivos' : null);
  const variaveis = [];
  const naoSuportados = [];

  const entrada = (camada, path, porModo) => {
    const tipoBase = porModo[0].tok.type;
    const valores = {};
    let tipoFigma = null;
    for (const { modo, tok } of porModo) {
      const a = typeof tok.value === 'string' && tok.value.match(ALIAS);
      if (a) {
        const alvo = a[1];
        const camadaAlvo = camadaDe(alvo);
        if (!camadaAlvo) throw new Error(`${path}: alias para token inexistente {${alvo}}`);
        valores[modo] = { alias: paraNomeFigma(alvo), colecao: COLECOES[camadaAlvo].nome };
        continue;
      }
      const conv = converterValor(tok.type ?? tipoBase, tok.value);
      if (!conv) { naoSuportados.push({ token: path, tipo: tok.type, valor: tok.value }); return; }
      tipoFigma = conv.tipo;
      valores[modo] = { valor: conv.valor };
    }
    variaveis.push({
      colecao: COLECOES[camada].nome, nome: paraNomeFigma(path), tipoDtcg: tipoBase, tipo: tipoFigma,
      scopes: scopesPara(path, camada), descricao: porModo[0].tok.description ?? '', valores,
    });
  };

  for (const [p, tok] of Object.entries(prim)) entrada('primitivos', p, [{ modo: 'Valor', tok }]);
  for (const [p, tok] of Object.entries(claro)) entrada('semantico', p, [{ modo: 'Claro', tok }, { modo: 'Escuro', tok: escuro[p] ?? tok }]);
  for (const [p, tok] of Object.entries(comp)) entrada('componente', p, [{ modo: 'Valor', tok }]);

  // Tipo de variável que é só alias: herda do alvo.
  const porNome = Object.fromEntries(variaveis.map((v) => [v.nome, v]));
  const tipoDe = (v, seen = new Set()) => {
    if (v.tipo) return v.tipo;
    if (seen.has(v.nome)) return null;
    seen.add(v.nome);
    const alvo = Object.values(v.valores).find((x) => x.alias);
    return alvo && porNome[alvo.alias] ? tipoDe(porNome[alvo.alias], seen) : null;
  };
  for (const v of variaveis) v.tipo = tipoDe(v);
  // Alias para token não suportado (ex.: dimensão em ch) → também não suportado.
  const validas = variaveis.filter((v) => {
    if (v.tipo) return true;
    naoSuportados.push({ token: paraCaminhoDtcg(v.nome), tipo: v.tipoDtcg, valor: 'alias para token não suportado' });
    return false;
  });

  const ordem = ['Primitivos', 'Semântico', 'Componente'];
  validas.sort((a, b) => ordem.indexOf(a.colecao) - ordem.indexOf(b.colecao));
  return {
    colecoes: Object.values(COLECOES).filter((c) => validas.some((v) => v.colecao === c.nome)),
    variaveis: validas,
    naoSuportados,
    resumo: Object.fromEntries(ordem.map((c) => [c, validas.filter((v) => v.colecao === c).length])),
  };
}

/** Script idempotente para `use_figma`. */
export function gerarScript(plano) {
  return `// Gerado por tools/figma/tokens-para-figma.mjs — cole em use_figma (carregue a skill figma-use antes).
// Idempotente: reusa coleção/modo/variável pelo nome. Escreve no arquivo: respeita o guarda da vez.
const PLANO = ${JSON.stringify({ colecoes: plano.colecoes, variaveis: plano.variaveis })};

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const colecao = {}, modo = {}, variavel = {};
for (const c of PLANO.colecoes) {
  let col = cols.find(x => x.name === c.nome) || figma.variables.createVariableCollection(c.nome);
  // O primeiro modo de uma coleção nova se chama "Mode 1": renomeie em vez de criar outro.
  c.modos.forEach((m, i) => {
    let found = col.modes.find(x => x.name === m);
    if (!found && i === 0 && col.modes.length === 1 && !c.modos.includes(col.modes[0].name)) {
      col.renameMode(col.modes[0].modeId, m); found = col.modes[0];
    }
    const id = found ? found.modeId : col.addMode(m);
    modo[c.nome + '/' + m] = id;
  });
  colecao[c.nome] = col;
}
let criadas = 0, atualizadas = 0;
for (const v of PLANO.variaveis) {
  const col = colecao[v.colecao];
  let x = vars.find(y => y.name === v.nome && y.variableCollectionId === col.id);
  if (!x) { x = figma.variables.createVariable(v.nome, col, v.tipo); criadas++; } else atualizadas++;
  variavel[v.colecao + '/' + v.nome] = x;
  if (v.descricao) x.description = v.descricao;
  x.scopes = v.scopes;
}
const pendentes = [];
for (const v of PLANO.variaveis) {
  const x = variavel[v.colecao + '/' + v.nome];
  for (const [m, val] of Object.entries(v.valores)) {
    const modeId = modo[v.colecao + '/' + m];
    if (val.alias) {
      const alvo = variavel[val.colecao + '/' + val.alias];
      if (!alvo) { pendentes.push(v.nome + ' → ' + val.alias); continue; }
      x.setValueForMode(modeId, figma.variables.createVariableAlias(alvo));
    } else x.setValueForMode(modeId, val.valor);
  }
}
return { criadas, atualizadas, pendentes, colecoes: PLANO.colecoes.map(c => c.nome) };
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = parseArgs();
  const plano = planejar(a.tokens ?? 'tokens');
  if (a.script) console.log(gerarScript(plano));
  else console.log(JSON.stringify(plano, null, 2));
  if (plano.naoSuportados.length) {
    console.error(`\n${plano.naoSuportados.length} token(s) sem variável equivalente (viram estilos ou ficam só no código): ` +
      plano.naoSuportados.map((n) => n.token).join(', '));
  }
}
