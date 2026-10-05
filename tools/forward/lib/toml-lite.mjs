// Minimal TOML reader and writer, no dependencies (Node >= 20).
//
// Reads the TOML that Forward ships and writes: comments, bare/quoted/dotted keys, [tables], [[arrays of tables]],
// basic and literal strings (single- and multi-line), integers, floats, booleans, offset/local date-times (kept as
// strings), arrays (multi-line, nested, trailing comma) and inline tables. It rejects what it does not understand
// instead of guessing: a parse error names the line.
//
//   import { parseToml, tomlString, tomlValue } from './toml-lite.mjs';

export class TomlError extends Error {
  constructor(message, line) { super(`TOML line ${line}: ${message}`); this.line = line; }
}

const BARE = /[A-Za-z0-9_-]/;
const ESC = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', '\\': '\\', e: '\x1b' };
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Parses TOML text into plain objects. Arrays of tables become arrays of objects. */
export function parseToml(text) {
  const src = String(text ?? '').replace(/\r\n/g, '\n');
  let i = 0;
  let line = 1;
  const root = {};
  let current = root;
  const defined = new Set();           // explicitly defined [table] paths
  const fail = (m) => { throw new TomlError(m, line); };
  const peek = (o = 0) => src[i + o];
  const adv = (n = 1) => { for (let k = 0; k < n; k++) { if (src[i] === '\n') line++; i++; } };

  const skipWs = () => { while (peek() === ' ' || peek() === '\t') adv(); };
  const skipComment = () => { if (peek() === '#') while (i < src.length && peek() !== '\n') adv(); };
  const skipWsNl = () => {          // inside arrays: whitespace, newlines and comments
    for (;;) {
      skipWs();
      if (peek() === '#') { skipComment(); continue; }
      if (peek() === '\n') { adv(); continue; }
      break;
    }
  };
  const endOfLine = () => {
    skipWs(); skipComment();
    if (i < src.length && peek() !== '\n') fail(`unexpected "${peek()}" after value`);
  };

  function basicString(multi) {
    let out = '';
    if (multi) { adv(3); if (peek() === '\n') adv(); } else adv();
    for (;;) {
      if (i >= src.length) fail('unterminated string');
      const c = peek();
      if (multi && c === '"' && peek(1) === '"' && peek(2) === '"') {
        let n = 3; while (peek(n) === '"' && n < 5) n++;   // up to two quotes may precede the closing delimiter
        out += '"'.repeat(n - 3); adv(n); return out;
      }
      if (!multi && c === '"') { adv(); return out; }
      if (!multi && c === '\n') fail('newline in single-line string');
      if (c === '\\') {
        const n = peek(1);
        if (multi && (n === '\n' || n === ' ' || n === '\t')) {
          // line-ending backslash: trim whitespace and newlines up to the next non-blank
          let j = 1; while (peek(j) === ' ' || peek(j) === '\t') j++;
          if (peek(j) === '\n') { adv(j); while (/[\s]/.test(peek() ?? '')) adv(); continue; }
        }
        if (n in ESC) { out += ESC[n]; adv(2); continue; }
        if (n === 'u' || n === 'U') {
          const len = n === 'u' ? 4 : 8;
          const hex = src.slice(i + 2, i + 2 + len);
          if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length !== len) fail('bad unicode escape');
          out += String.fromCodePoint(parseInt(hex, 16)); adv(2 + len); continue;
        }
        fail(`bad escape "\\${n}"`);
      }
      out += c; adv();
    }
  }

  function literalString(multi) {
    let out = '';
    if (multi) { adv(3); if (peek() === '\n') adv(); } else adv();
    for (;;) {
      if (i >= src.length) fail('unterminated literal string');
      const c = peek();
      if (multi && c === "'" && peek(1) === "'" && peek(2) === "'") {
        let n = 3; while (peek(n) === "'" && n < 5) n++;
        out += "'".repeat(n - 3); adv(n); return out;
      }
      if (!multi && c === "'") { adv(); return out; }
      if (!multi && c === '\n') fail('newline in literal string');
      out += c; adv();
    }
  }

  function key() {
    skipWs();
    const parts = [];
    for (;;) {
      skipWs();
      const c = peek();
      if (c === '"') parts.push(basicString(false));
      else if (c === "'") parts.push(literalString(false));
      else {
        let k = '';
        while (i < src.length && BARE.test(peek())) { k += peek(); adv(); }
        if (!k) fail(`expected a key, found "${c ?? 'end of file'}"`);
        parts.push(k);
      }
      skipWs();
      if (peek() === '.') { adv(); continue; }
      return parts;
    }
  }

  function scalar() {
    let tok = '';
    while (i < src.length && !/[\s,\]}#]/.test(peek())) { tok += peek(); adv(); }
    // date-times may contain one space between date and time
    if (/^\d{4}-\d{2}-\d{2}$/.test(tok) && peek() === ' ' && /\d{2}:/.test(src.slice(i + 1, i + 4))) {
      adv(); tok += ' ';
      while (i < src.length && !/[\s,\]}#]/.test(peek())) { tok += peek(); adv(); }
    }
    if (tok === 'true') return true;
    if (tok === 'false') return false;
    if (/^[+-]?(inf|nan)$/.test(tok)) return tok.includes('nan') ? NaN : (tok.startsWith('-') ? -Infinity : Infinity);
    if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/i.test(tok) || /^\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(tok)) return tok;
    const num = tok.replace(/_/g, '');
    if (/^0x[0-9a-fA-F]+$/.test(num)) return parseInt(num.slice(2), 16);
    if (/^0o[0-7]+$/.test(num)) return parseInt(num.slice(2), 8);
    if (/^0b[01]+$/.test(num)) return parseInt(num.slice(2), 2);
    if (/^[+-]?(0|[1-9]\d*)$/.test(num)) return Number(num);
    if (/^[+-]?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(num)) return Number(num);
    fail(`cannot read value "${tok || peek()}"`);
  }

  function value() {
    const c = peek();
    if (c === '"') return src.startsWith('"""', i) ? basicString(true) : basicString(false);
    if (c === "'") return src.startsWith("'''", i) ? literalString(true) : literalString(false);
    if (c === '[') {
      adv();
      const arr = [];
      for (;;) {
        skipWsNl();
        if (peek() === ']') { adv(); return arr; }
        arr.push(value());
        skipWsNl();
        if (peek() === ',') { adv(); continue; }
        if (peek() === ']') { adv(); return arr; }
        fail('expected "," or "]" in array');
      }
    }
    if (c === '{') {
      adv();
      const obj = {};
      skipWs();
      if (peek() === '}') { adv(); return obj; }
      for (;;) {
        const k = key();
        if (peek() !== '=') fail('expected "=" in inline table');
        adv(); skipWs();
        assign(obj, k, value());
        skipWs();
        if (peek() === ',') { adv(); continue; }
        if (peek() === '}') { adv(); return obj; }
        fail('expected "," or "}" in inline table');
      }
    }
    if (c === undefined || c === '\n') fail('missing value');
    return scalar();
  }

  function assign(obj, parts, v) {
    let o = obj;
    for (const p of parts.slice(0, -1)) {
      if (o[p] === undefined) o[p] = {};
      else if (!isObj(o[p])) fail(`key "${p}" is not a table`);
      o = o[p];
    }
    const last = parts[parts.length - 1];
    if (Object.prototype.hasOwnProperty.call(o, last)) fail(`duplicate key "${parts.join('.')}"`);
    o[last] = v;
  }

  function tableAt(parts, isArray) {
    let o = root;
    parts.forEach((p, idx) => {
      const last = idx === parts.length - 1;
      if (last && isArray) {
        if (o[p] === undefined) o[p] = [];
        if (!Array.isArray(o[p])) fail(`"${parts.join('.')}" is not an array of tables`);
        const t = {}; o[p].push(t); o = t; return;
      }
      if (o[p] === undefined) o[p] = {};
      if (Array.isArray(o[p])) { o = o[p][o[p].length - 1]; return; }
      if (!isObj(o[p])) fail(`"${p}" is not a table`);
      o = o[p];
    });
    if (!isArray) {
      const path = parts.join('\u0000');
      if (defined.has(path)) fail(`table [${parts.join('.')}] defined twice`);
      defined.add(path);
    }
    return o;
  }

  while (i < src.length) {
    skipWs();
    const c = peek();
    if (c === '\n') { adv(); continue; }
    if (c === '#') { skipComment(); continue; }
    if (c === undefined) break;
    if (c === '[') {
      const isArray = peek(1) === '[';
      adv(isArray ? 2 : 1);
      const parts = key();
      if (isArray) { if (peek() !== ']' || peek(1) !== ']') fail('expected "]]"'); adv(2); }
      else { if (peek() !== ']') fail('expected "]"'); adv(); }
      current = tableAt(parts, isArray);
      endOfLine();
      continue;
    }
    const parts = key();
    if (peek() !== '=') fail(`expected "=" after key "${parts.join('.')}"`);
    adv(); skipWs();
    assign(current, parts, value());
    endOfLine();
  }
  return root;
}

// ---------- writer ----------

/** A TOML string literal: a basic string, or a multi-line basic string when the text has newlines. */
export function tomlString(s, { multiline = 'auto' } = {}) {
  const text = String(s ?? '');
  const multi = multiline === true || (multiline === 'auto' && text.includes('\n'));
  const esc = (t, keepNl) => t.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
    .replace(keepNl ? /(?!)/g : /\n/g, '\\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
  if (!multi) return `"${esc(text, false)}"`;
  return `"""\n${esc(text, true)}"""`;
}

/** Any JSON-like value as a TOML value (strings, numbers, booleans, arrays, inline tables). */
export function tomlValue(v, { multiline = 'auto' } = {}) {
  if (typeof v === 'string') return tomlString(v, { multiline });
  if (typeof v === 'number') { if (!Number.isFinite(v)) throw new Error(`TOML cannot hold ${v} here`); return String(v); }
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `[${v.map((x) => tomlValue(x, { multiline: false })).join(', ')}]`;
  if (isObj(v)) return `{ ${Object.entries(v).map(([k, x]) => `${tomlKey(k)} = ${tomlValue(x, { multiline: false })}`).join(', ')} }`;
  throw new Error(`TOML cannot hold ${typeof v}`);
}

export const tomlKey = (k) => (/^[A-Za-z0-9_-]+$/.test(k) ? k : tomlString(k, { multiline: false }));

/** A multi-line array of strings, one item per line (the layout Forward's own records use). */
export function tomlStringList(items) {
  if (!items.length) return '[]';
  return `[\n${items.map((x) => `  ${tomlString(x, { multiline: false })},`).join('\n')}\n]`;
}
