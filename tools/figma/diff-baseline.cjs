#!/usr/bin/env node
/**
 * Compara dois retratos do Figma (ver tools/figma/snapshot.js) e emite o
 * relatório de mudanças em markdown, já classificado.
 *
 *   node tools/figma/diff-baseline.cjs design/figma-baseline/app.json /tmp/atual.json
 *
 * Regra central: a MESMA mudança (nome do nó + propriedade + de→para) em dois
 * ou mais frames é primitivo/token; em um frame só é composição.
 *
 * .cjs de propósito: o package.json do DSX é "type": "module" e este script usa require.
 * Aceita também retratos do fluxo anterior em pt-BR (chaves `variaveis`, `estilos`,
 * `nos`, `oculto`) — compatível com baselines já comitados.
 */
const fs = require('fs');

const [basePath, currentPath] = process.argv.slice(2);
if (!basePath || !currentPath) {
  console.error('uso: node tools/figma/diff-baseline.cjs <baseline.json> <atual.json>');
  process.exit(1);
}

/** Normaliza o retrato para o formato de snapshot.js (aceita as chaves legadas em pt-BR). */
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
  l: 'auto-layout', s: 'sizing', w: 'largura', h: 'altura', r: 'raio',
  f: 'preenchimento', st: 'borda', sw: 'espessura da borda', op: 'opacidade',
  abs: 'posição absoluta', txt: 'texto', fs: 'tamanho da fonte', fw: 'peso',
  ff: 'família', lh: 'entrelinha', ls: 'tracking', tc: 'caixa', ta: 'alinhamento',
  ml: 'máx. linhas', tt: 'truncamento', ts: 'estilo de texto', d: 'vetor',
  hidden: 'visibilidade', c: 'ordem dos filhos',
};
const IGNORE = new Set(['p', 'n', 't']);   // caminho, nome e tipo entram como contexto, não como diff

/**
 * O espelho nomeia `Tipo · instância` (`SectionCard · Demanda`, `Botão · primária`).
 * Para agrupar, o que importa é o TIPO — sem isto, cada card tem nome único e o
 * agrupamento por primitivo nunca dispara.
 */
const family = name => (name && name.indexOf(' · ') > -1 ? name.split(' · ')[0] : name);

const SEP = '\u0001';                                  // separador de chave à prova de conteúdo
const FIELDS_L = ['modo', 'padTop', 'padDir', 'padBaixo', 'padEsq', 'gap',
  'alinh. principal', 'alinh. cruzado', 'wrap', 'gap cruzado'];
const FIELDS_SW = ['borda topo', 'borda dir', 'borda baixo', 'borda esq'];

/** Descrição legível: em propriedades compostas, mostra só o campo que mudou. */
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

// ── tokens e estilos ─────────────────────────────────────────────────────────
function diffMap(before, after) {
  const out = [];
  if (typeof before === 'string' || typeof after === 'string') return out;   // baseline só de hash
  before = before || {}; after = after || {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of [...keys].sort()) {
    const a = before[k], b = after[k];
    if (a === undefined) { out.push(`+ \`${k}\` = ${JSON.stringify(b)}`); continue; }
    if (b === undefined) { out.push(`− \`${k}\` (removido)`); continue; }
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    if (sa !== sb) out.push(`\`${k}\` ${sa} → ${sb}`);
  }
  return out;
}

// ── pareamento de nós: id primeiro, caminho depois ───────────────────────────
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
    if (k === 'c') {                                  // ordem dos filhos: compara por posição
      const sa = (a.c || []).length, sb = (b.c || []).length;
      if (sa !== sb) changed.push({ prop: 'c', from: `${sa} filhos`, to: `${sb} filhos` });
      continue;
    }
    const va = a[k], vb = b[k];
    if (JSON.stringify(va) !== JSON.stringify(vb)) {
      changed.push({ prop: k, from: va === undefined ? '—' : String(va), to: vb === undefined ? '—' : String(vb) });
    }
  }
  return changed;
}

// ── varredura por frame ──────────────────────────────────────────────────────
const framesA = A.frames, framesB = B.frames;
const allKeys = new Set([...Object.keys(framesA), ...Object.keys(framesB)]);
const byFrame = {};                 // frame → [{node, prop, from, to}]
const addedFrames = [], removedFrames = [], noDetail = [];
const grouped = new Map();          // "família|prop|de→para" → Set(frames)

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

// ── possíveis violações da convenção de nomes ───────────────────────────────
// A mesma mudança, nos mesmos ≥ 2 frames, ainda pode escapar do agrupamento
// "primitivo" acima se os nós envolvidos não compartilham o prefixo de família
// `Tipo · instância` — aí family() não tem como saber que são a mesma coisa, e a
// mudança passa calada como vários ajustes de composição avulsos em vez de um
// primitivo. Isto pega exatamente esse buraco.
const byPropOnly = new Map();          // "prop|de|para" → Map(família → Set(frame))
for (const [frame, items] of Object.entries(byFrame)) {
  for (const i of items) {
    if (i.kind) continue;              // nó adicionado/removido não é questão de nome
    const propKey = [i.prop, i.from, i.to].join(SEP);
    const fam = family(i.node);
    const byFam = byPropOnly.get(propKey) || byPropOnly.set(propKey, new Map()).get(propKey);
    (byFam.get(fam) || byFam.set(fam, new Set()).get(fam)).add(frame);
  }
}
const namingIssues = [];
for (const [propKey, byFam] of byPropOnly) {
  if (byFam.size < 2) continue;                                     // um nome só: não é fragmentação
  if (![...byFam.values()].some(s => s.size >= 2)) {                // nenhum nome sozinho já atingiu o limiar
    const totalFrames = new Set([...byFam.values()].flatMap(s => [...s]));
    if (totalFrames.size >= 2) {
      const [prop, from, to] = propKey.split(SEP);
      namingIssues.push({ prop, from, to, names: [...byFam.keys()], frames: totalFrames });
    }
  }
}

// ── relatório ────────────────────────────────────────────────────────────────
const L = [];
L.push(`# Diff do Figma`, '');
L.push(`baseline: \`${basePath}\` · atual: \`${currentPath}\``, '');

const diffVariables = diffMap(A.variables, B.variables);
const diffStyles = diffMap(A.styles, B.styles);
if (diffVariables.length || diffStyles.length) {
  L.push('## Tokens e estilos — classe `token`, afeta o app inteiro', '');
  diffVariables.forEach(l => L.push('- ' + l + '  ⚠'));
  diffStyles.forEach(l => L.push('- ' + l + '  ⚠'));
  L.push('', 'Exige varredura de regressão nos dois temas antes de aplicar.', '');
} else if (typeof A.variables !== 'string') {
  L.push('## Tokens e estilos', '', 'Sem mudança.', '');
}

const groups = [...grouped.entries()]
  .filter(([, frames]) => frames.size >= 2)
  .sort((a, b) => b[1].size - a[1].size);
if (groups.length) {
  L.push('## Agrupadas (≥ 2 frames) — classe `primitivo`', '');
  for (const [k, frames] of groups) {
    const [node, prop, from, to] = k.split(SEP);
    L.push(`- \`${node}\` · ${LABEL[prop] || prop} · ${describe(prop, from, to)} · **${frames.size} frames**`);
    L.push(`  <sub>${[...frames].slice(0, 6).join(' · ')}${frames.size > 6 ? ' …' : ''}</sub>`);
  }
  L.push('', 'Aplique no componente compartilhado, uma vez — não em cada tela.', '');
}

if (namingIssues.length) {
  L.push('## Possível problema de nomenclatura', '');
  L.push('Mesma mudança, mas espalhada por nomes que não compartilham prefixo de família — nenhum atingiu sozinho o limiar de ≥ 2 frames, então ela aparece como ajustes avulsos em vez de um primitivo:', '');
  for (const { prop, from, to, names, frames } of namingIssues) {
    L.push(`- ${LABEL[prop] || prop} · ${describe(prop, from, to)} · **${frames.size} frames no total**, espalhada por: ${names.map(n => '`' + n + '`').join(', ')}`);
  }
  L.push('', 'Se são de fato o mesmo primitivo, renomeie para compartilharem o prefixo `Tipo · instância` (ex.: `Chip · status`) — o próximo diff agrupa sozinho em vez de perder o padrão.', '');
}

const groupedKeys = new Set(groups.map(([k]) => k));
const withComposition = Object.entries(byFrame)
  .map(([f, items]) => [f, items.filter(i => i.kind || !groupedKeys.has([family(i.node), i.prop, i.from, i.to].join(SEP)))])
  .filter(([, items]) => items.length);
if (withComposition.length) {
  L.push('## Por frame — classe `composição`', '');
  for (const [frame, items] of withComposition) {
    L.push(`### ${frame}`);
    for (const i of items) {
      if (i.kind) L.push(`- ${i.kind} \`${i.node}\`${i.txt ? ` "${String(i.txt).slice(0, 60)}"` : ''} em \`${i.path}\``);
      else L.push(`- \`${i.node}\` · ${LABEL[i.prop] || i.prop}: ${describe(i.prop, i.from, i.to)}`);
    }
    L.push('');
  }
}

if (addedFrames.length) L.push('## Frames novos no Figma', '', ...addedFrames.map(f => `- + ${f}`), '');
if (removedFrames.length) L.push('## Frames que sumiram do Figma', '', ...removedFrames.map(f => `- − ${f}`), '');
if (noDetail.length) {
  L.push('## Mudaram, mas o baseline não tem detalhe', '');
  noDetail.forEach(f => L.push(`- ${f}`));
  L.push('', 'Rode o snapshot com `MODE = "full"` e estes frames em `TARGETS`.', '');
}
if (!groups.length && !withComposition.length && !diffVariables.length && !diffStyles.length
    && !addedFrames.length && !removedFrames.length && !noDetail.length) {
  L.push('Nenhuma mudança.', '');
}

process.stdout.write(L.join('\n') + '\n');
