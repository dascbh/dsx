// Minimal YAML parser for DESIGN.md and UX.md front matter: maps nested by indentation
// (any depth), scalars (string, number, boolean), inline lists and maps
// ([a, "b, c"], { k: v }), block lists of scalars ("- item") and of maps ("- id: D1" with the
// following keys aligned with "id") and comments. Multiline text (| and >) and a list inside a
// block list are not supported. Quotes protect "#" and "," inside values. Throws an error with the
// line number when it cannot parse.

// Quotes only open at the start of a value (an apostrophe mid-text, as in "it's", does not count).
const opensQuote = (prev) => prev === undefined || /[\s[{,:]/.test(prev);

// Splits on the separator only at the top level (outside quotes, [] and {}).
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

// Strips a "# ..." comment (at line start or after a space), outside quotes.
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
  // Inline map { a: 1, b: x }. Without ":" it is a string (an unquoted {group.key} reference).
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
  // Each entry: { indent, obj, parent?, key?, item? }. `item` marks the map of a block list item: the item's keys sit
  // at the content column after "- ", so a key at that same column continues the item.
  const stack = [{ indent: -1, obj: root }];
  const setKey = (entry, rest, indent, lineNo, line) => {
    const m = rest.match(/^("[^"]+"|'[^']+'|[^:]+):(.*)$/);
    if (!m) throw new Error(`YAML line ${lineNo}: not recognized: "${line.trim()}"`);
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
      // Block list item: closes whatever is deeper (and the previous item at the same column).
      while (stack.length > 1 && (stack.at(-1).indent > indent || (stack.at(-1).indent === indent && stack.at(-1).item))) stack.pop();
      const owner = stack.at(-1);
      if (!owner.parent) throw new Error(`YAML line ${i + 1}: list item without an owning key: "${line.trim()}"`);
      if (!Array.isArray(owner.obj)) {
        if (Object.keys(owner.obj).length) throw new Error(`YAML line ${i + 1}: list and map mixed in "${owner.key}"`);
        owner.obj = owner.parent[owner.key] = [];
      }
      const rest = (dash[1] ?? '').trim();
      if (!rest) throw new Error(`YAML line ${i + 1}: empty list item or list inside a list (not supported)`);
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
    if (Array.isArray(top.obj)) throw new Error(`YAML line ${i + 1}: key inside a list without "- ": "${line.trim()}"`);
    setKey(top, trimmed, indent, i + 1, line);
  });
  return root;
}

/** Splits front matter (--- ... ---) from the Markdown body. */
export function splitFrontMatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontMatter: null, body: md, bodyStartLine: 1 };
  return { frontMatter: m[1], body: m[2], bodyStartLine: m[1].split('\n').length + 3 };
}
