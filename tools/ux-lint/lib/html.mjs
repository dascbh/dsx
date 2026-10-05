// Minimal HTML parser for ux-lint: builds a node tree (elements and text) from serialized HTML
// (screen captures). It does not validate or repair malformed HTML beyond the basics:
// void elements, script/style content skipped, tolerant implicit closing.
// Includes a selector engine for the subset used by the UX.md contract.

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'template', 'noscript']);
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’' };

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}

function el(tag, attrs, parent, line, col) {
  return { type: 'element', tag, attrs, children: [], parent, line, col };
}

/** Reads the HTML and returns the root node (type: 'document'). Each element keeps its source line and column. */
export function parseHtml(html) {
  const root = { type: 'document', tag: '#document', attrs: {}, children: [], parent: null, line: 1 };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/\s*([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let last = 0;
  let line = 1;
  let lineStart = 0;
  const advance = (to) => {
    for (let i = last; i < to; i++) if (html.charCodeAt(i) === 10) { line++; lineStart = i + 1; }
    last = to;
  };
  const addText = (text) => {
    if (text) stack.at(-1).children.push({ type: 'text', text: decodeEntities(text), parent: stack.at(-1) });
  };
  let m;
  while ((m = re.exec(html))) {
    const textStart = last;
    addText(html.slice(textStart, m.index));
    advance(m.index);
    const tagLine = line;
    const tagCol = m.index - lineStart + 1;
    advance(re.lastIndex);
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const idx = stack.findLastIndex((n) => n.tag === tag);
      if (idx > 0) stack.length = idx;
      continue;
    }
    if (!m[2]) continue; // comment, doctype, CDATA
    const tag = m[2].toLowerCase();
    const rawAttrs = m[3] || '';
    const selfClosing = /\/\s*$/.test(rawAttrs);
    const node = el(tag, parseAttrs(rawAttrs.replace(/\/\s*$/, '')), stack.at(-1), tagLine, tagCol);
    stack.at(-1).children.push(node);
    if (RAW.has(tag)) {
      const close = new RegExp(`</\\s*${tag}\\s*>`, 'ig');
      close.lastIndex = re.lastIndex;
      const c = close.exec(html);
      const end = c ? close.lastIndex : html.length;
      advance(end);
      re.lastIndex = end;
      continue;
    }
    if (!VOID.has(tag) && !selfClosing) stack.push(node);
  }
  addText(html.slice(last));
  return root;
}

// ---------- selectors ----------

function splitTop(s, sep) {
  const out = [];
  let depth = 0, quote = null, cur = '';
  for (const ch of s) {
    if (quote) { if (ch === quote) quote = null; cur += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (depth === 0 && sep.test(ch)) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCompound(src) {
  const c = { tag: null, ids: [], classes: [], attrs: [], nots: [] };
  let s = src.trim();
  const tm = s.match(/^(\*|[a-zA-Z][\w-]*)/);
  if (tm) { if (tm[1] !== '*') c.tag = tm[1].toLowerCase(); s = s.slice(tm[1].length); }
  while (s) {
    let m;
    if ((m = s.match(/^\.([\w-]+)/))) c.classes.push(m[1]);
    else if ((m = s.match(/^#([\w-]+)/))) c.ids.push(m[1]);
    else if ((m = s.match(/^\[\s*([\w:-]+)\s*(?:([~^$*|]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+))\s*)?(i)?\s*\]/))) {
      c.attrs.push({ name: m[1].toLowerCase(), op: m[2] || null, value: m[3] ?? m[4] ?? m[5] ?? null, ci: !!m[6] });
    } else if ((m = s.match(/^:not\(/i))) {
      let depth = 1, i = m[0].length;
      for (; i < s.length && depth; i++) { if (s[i] === '(') depth++; else if (s[i] === ')') depth--; }
      c.nots.push(parseSelector(s.slice(m[0].length, i - 1)));
      s = s.slice(i);
      continue;
    } else throw new Error(`Unsupported selector: "${src}" (near "${s}")`);
    s = s.slice(m[0].length);
  }
  return c;
}

/** Turns "a b, c.d > e" into [{ parts: [{compound, comb}] }]. Supports descendant (space) and child (>). */
export function parseSelector(sel) {
  return splitTop(sel, /,/).map((s) => s.trim()).filter(Boolean).map((complex) => {
    const tokens = splitTop(complex.replace(/\s*>\s*/g, ' > '), /\s/).filter(Boolean);
    const parts = [];
    let comb = ' ';
    for (const t of tokens) {
      if (t === '>') { comb = '>'; continue; }
      parts.push({ compound: parseCompound(t), comb });
      comb = ' ';
    }
    return parts;
  });
}

function attrOk(node, a) {
  if (!(a.name in node.attrs)) return false;
  if (!a.op) return true;
  let v = node.attrs[a.name], want = a.value;
  if (a.ci) { v = v.toLowerCase(); want = want.toLowerCase(); }
  switch (a.op) {
    case '=': return v === want;
    case '~=': return v.split(/\s+/).includes(want);
    case '^=': return v.startsWith(want);
    case '$=': return v.endsWith(want);
    case '*=': return v.includes(want);
    case '|=': return v === want || v.startsWith(want + '-');
    default: return false;
  }
}

function classes(node) {
  return (node.attrs.class || '').split(/\s+/).filter(Boolean);
}

function compoundOk(node, c) {
  if (node.type !== 'element') return false;
  if (c.tag && node.tag !== c.tag) return false;
  if (c.ids.length && !c.ids.every((id) => node.attrs.id === id)) return false;
  if (c.classes.length) { const cl = classes(node); if (!c.classes.every((x) => cl.includes(x))) return false; }
  if (!c.attrs.every((a) => attrOk(node, a))) return false;
  if (c.nots.some((n) => matchesParsed(node, n))) return false;
  return true;
}

function complexOk(node, parts, i = parts.length - 1) {
  if (!compoundOk(node, parts[i].compound)) return false;
  if (i === 0) return true;
  const comb = parts[i].comb;
  let p = node.parent;
  if (comb === '>') return !!p && complexOk(p, parts, i - 1);
  for (; p && p.type === 'element'; p = p.parent) if (complexOk(p, parts, i - 1)) return true;
  return false;
}

function matchesParsed(node, parsed) {
  return parsed.some((parts) => complexOk(node, parts));
}

const cache = new Map();
function compiled(sel) {
  if (!cache.has(sel)) cache.set(sel, parseSelector(sel));
  return cache.get(sel);
}

export function matches(node, sel) {
  return node.type === 'element' && matchesParsed(node, compiled(sel));
}

/** True when `node` is `anc` or inside it. */
export function contains(anc, node) {
  for (let n = node; n; n = n.parent) if (n === anc) return true;
  return false;
}

export function* walk(node) {
  for (const ch of node.children || []) {
    yield ch;
    if (ch.children) yield* walk(ch);
  }
}

/** Descendant elements matching the selector, in document order. */
export function querySelectorAll(node, sel) {
  const parsed = compiled(sel);
  const out = [];
  for (const n of walk(node)) if (n.type === 'element' && matchesParsed(n, parsed)) out.push(n);
  return out;
}

export function querySelector(node, sel) {
  return querySelectorAll(node, sel)[0] || null;
}

/** Nearest ancestor (including the node itself, like Element.closest) matching the selector. */
export function closest(node, sel) {
  for (let n = node; n && n.type === 'element'; n = n.parent) if (matches(n, sel)) return n;
  return null;
}

/** Element hidden from whoever looks at the screen (hidden attribute, display:none, visibility:hidden). */
export function isHidden(node) {
  for (let n = node; n && n.type === 'element'; n = n.parent) {
    if ('hidden' in n.attrs) return true;
    if (n.tag === 'head' || n.tag === 'title') return true;
    const st = (n.attrs.style || '').replace(/\s+/g, '').toLowerCase();
    if (/display:none|visibility:hidden/.test(st)) return true;
  }
  return false;
}

/** Visible text of the node, with normalized whitespace (skips hidden nodes). */
export function textOf(node) {
  const parts = [];
  const rec = (n) => {
    if (n.type === 'text') { parts.push(n.text); return; }
    if (n.type === 'element') {
      if ('hidden' in n.attrs) return;
      const st = (n.attrs.style || '').replace(/\s+/g, '').toLowerCase();
      if (/display:none|visibility:hidden/.test(st)) return;
      if (n.tag === 'head' || n.tag === 'title') return;
      if (n.tag === 'br' || /^(p|div|li|tr|h[1-6]|section|article|header|footer|main|nav|aside|td|th|label|button)$/.test(n.tag)) parts.push(' ');
    }
    for (const ch of n.children || []) rec(ch);
  };
  if (node.type === 'element' && isHidden(node)) return '';
  rec(node);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

/** Looks up an id in the document. */
export function getById(root, id) {
  for (const n of walk(root)) if (n.type === 'element' && n.attrs.id === id) return n;
  return null;
}
