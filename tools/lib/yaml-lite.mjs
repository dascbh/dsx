// Parser YAML mínimo para front matter de DESIGN.md: apenas mapas aninhados por indentação,
// escalares (string, número, booleano) e comentários. Listas e multilinha não são suportadas
// (o formato de DESIGN.md não precisa delas). Lança erro com número de linha quando não entende.

function scalar(raw) {
  const v = raw.trim();
  if (v === '') return null;
  if (/^".*"$/.test(v) || /^'.*'$/.test(v)) return v.slice(1, -1);
  // Mapa inline { a: 1, b: x }. Sem ":" é tratado como string (referência {grupo.chave} sem aspas).
  if (/^\{.*:.*\}$/.test(v)) {
    const out = {};
    for (const pair of v.slice(1, -1).split(',')) {
      const i = pair.indexOf(':');
      if (i > 0) out[pair.slice(0, i).trim().replace(/^["']|["']$/g, '')] = scalar(pair.slice(i + 1));
    }
    return out;
  }
  if (/^\[.*\]$/.test(v)) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map((x) => scalar(x)) : [];
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v === 'true' || v === 'false') return v === 'true';
  return v;
}

export function parseYaml(text) {
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  text.split('\n').forEach((line, i) => {
    const noComment = line.replace(/\s+#.*$/, '').replace(/^\s*#.*$/, '');
    if (!noComment.trim()) return;
    const indent = noComment.match(/^ */)[0].length;
    const m = noComment.trim().match(/^("[^"]+"|'[^']+'|[^:]+):(.*)$/);
    if (!m) throw new Error(`YAML linha ${i + 1}: não reconhecido: "${line.trim()}"`);
    const key = m[1].replace(/^["']|["']$/g, '').trim();
    while (stack.length > 1 && indent <= stack.at(-1).indent) stack.pop();
    const parent = stack.at(-1).obj;
    const val = scalar(m[2]);
    if (val === null) {
      parent[key] = {};
      stack.push({ indent, obj: parent[key] });
    } else parent[key] = val;
  });
  return root;
}

/** Separa front matter (--- ... ---) do corpo Markdown. */
export function splitFrontMatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontMatter: null, body: md, bodyStartLine: 1 };
  return { frontMatter: m[1], body: m[2], bodyStartLine: m[1].split('\n').length + 3 };
}
