// Parser YAML mínimo para front matter de DESIGN.md e UX.md: mapas aninhados por indentação
// (qualquer profundidade), escalares (string, número, booleano), listas e mapas inline
// ([a, "b, c"], { k: v }), listas em bloco de escalares ("- item") e de mapas ("- id: D1" com as
// chaves seguintes alinhadas ao "id") e comentários. Texto multilinha (| e >) e lista dentro de
// lista em bloco não são suportados. Aspas protegem "#" e "," dentro de valores. Lança erro com
// número de linha quando não entende.

// Aspas só abrem no começo de um valor (apóstrofo no meio de texto, como em "it's", não conta).
const opensQuote = (prev) => prev === undefined || /[\s[{,:]/.test(prev);

// Divide pelo separador só no nível de topo (fora de aspas, [] e {}).
function splitTop(s, sep) {
  const out = [];
  let depth = 0, quote = null, cur = '';
  for (const ch of s) {
    if (quote) { if (ch === quote) quote = null; cur += ch; continue; }
    if ((ch === '"' || ch === "'") && opensQuote(cur.at(-1))) { quote = ch; cur += ch; continue; }
    if (ch === '[' || ch === '{' || ch === '(') depth++;
    if (ch === ']' || ch === '}' || ch === ')') depth--;
    if (depth === 0 && ch === sep) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

// Remove comentário "# ..." (início da linha ou precedido de espaço), fora de aspas.
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if ((ch === '"' || ch === "'") && opensQuote(line[i - 1])) { quote = ch; continue; }
    if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i).replace(/\s+$/, '');
  }
  return line;
}

function scalar(raw) {
  const v = raw.trim();
  if (v === '') return null;
  if (/^".*"$/.test(v) || /^'.*'$/.test(v)) return v.slice(1, -1);
  // Mapa inline { a: 1, b: x }. Sem ":" é tratado como string (referência {grupo.chave} sem aspas).
  if (/^\{.*:.*\}$/.test(v)) {
    const out = {};
    for (const pair of splitTop(v.slice(1, -1), ',')) {
      const i = pair.indexOf(':');
      if (i > 0) out[pair.slice(0, i).trim().replace(/^["']|["']$/g, '')] = scalar(pair.slice(i + 1));
    }
    return out;
  }
  if (/^\[.*\]$/.test(v)) {
    const inner = v.slice(1, -1).trim();
    return inner ? splitTop(inner, ',').map((x) => scalar(x)) : [];
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === 'true' || v === 'false') return v === 'true';
  return v;
}

export function parseYaml(text) {
  const root = {};
  // Cada entrada: { indent, obj, parent?, key?, item? }. `item` marca o mapa de um item de lista em bloco: as chaves
  // do item ficam na coluna do conteúdo depois do "- ", então uma chave nessa mesma coluna continua no item.
  const stack = [{ indent: -1, obj: root }];
  const setKey = (entry, rest, indent, lineNo, line) => {
    const m = rest.match(/^("[^"]+"|'[^']+'|[^:]+):(.*)$/);
    if (!m) throw new Error(`YAML linha ${lineNo}: não reconhecido: "${line.trim()}"`);
    const key = m[1].replace(/^["']|["']$/g, '').trim();
    const val = scalar(m[2]);
    if (val === null) {
      entry.obj[key] = {};
      stack.push({ indent, obj: entry.obj[key], parent: entry.obj, key });
    } else entry.obj[key] = val;
  };
  text.split('\n').forEach((line, i) => {
    const noComment = stripComment(line);
    if (!noComment.trim()) return;
    const indent = noComment.match(/^ */)[0].length;
    const trimmed = noComment.trim();
    const dash = trimmed.match(/^-(?:\s+(.*))?$/);
    if (dash) {
      // Item de lista em bloco: fecha o que estiver mais fundo (e o item anterior na mesma coluna).
      while (stack.length > 1 && (stack.at(-1).indent > indent || (stack.at(-1).indent === indent && stack.at(-1).item))) stack.pop();
      const owner = stack.at(-1);
      if (!owner.parent) throw new Error(`YAML linha ${i + 1}: item de lista sem chave dona: "${line.trim()}"`);
      if (!Array.isArray(owner.obj)) {
        if (Object.keys(owner.obj).length) throw new Error(`YAML linha ${i + 1}: lista e mapa misturados em "${owner.key}"`);
        owner.obj = owner.parent[owner.key] = [];
      }
      const rest = (dash[1] ?? '').trim();
      if (!rest) throw new Error(`YAML linha ${i + 1}: item de lista vazio ou lista dentro de lista (não suportado)`);
      const contentIndent = indent + noComment.slice(indent).indexOf(rest);
      const isPair = /^("[^"]+"|'[^']+'|[^:[{"']+):(\s|$)/.test(rest);
      if (!isPair) { owner.obj.push(scalar(rest)); return; }
      const item = {};
      owner.obj.push(item);
      const entry = { indent: contentIndent, obj: item, item: true };
      stack.push(entry);
      setKey(entry, rest, contentIndent, i + 1, line);
      return;
    }
    while (stack.length > 1 && (stack.at(-1).item ? indent < stack.at(-1).indent : indent <= stack.at(-1).indent)) stack.pop();
    const top = stack.at(-1);
    if (Array.isArray(top.obj)) throw new Error(`YAML linha ${i + 1}: chave dentro de lista sem "- ": "${line.trim()}"`);
    setKey(top, trimmed, indent, i + 1, line);
  });
  return root;
}

/** Separa front matter (--- ... ---) do corpo Markdown. */
export function splitFrontMatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontMatter: null, body: md, bodyStartLine: 1 };
  return { frontMatter: m[1], body: m[2], bodyStartLine: m[1].split('\n').length + 3 };
}
