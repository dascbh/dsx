/**
 * Normalizes an SVG `d` attribute to the subset Figma accepts in
 * `vectorPaths`: absolute M / L / C / Q / Z only.
 *
 * Why it exists:
 *   1. Figma's parser rejects H, V, S, T (and A), failing with
 *      "Failed to convert path. Invalid command at V6.5…".
 *   2. In SVG, the fill closes a subpath implicitly; in Figma it does not.
 *      Without closing each subpath with Z, every icon with a hole (ring,
 *      document with inner lines) renders as a solid blob.
 *
 * Arcs (A/a) are not converted: the function throws. In practice almost every
 * library icon has an equivalent variant without arcs (e.g. in MUI,
 * `Edit` uses an arc and `EditOutlined` does not).
 *
 * CommonJS (.cjs) on purpose: the DSX package.json is "type": "module", and
 * this file must be loadable with `require` by standalone scripts.
 *
 * Usage:
 *   const { norm } = require('<DSX>/tools/figma/normalize-svg-path.cjs')
 *   const d = [...src.matchAll(/d: "([^"]*)"/g)].map(m => m[1]).map(norm).join(' ')
 *
 * From the command line (one `d` per argument, one normalized line per output):
 *   node <DSX>/tools/figma/normalize-svg-path.cjs "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"
 */

function tokenize(d) {
  const out = [];
  const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/gi;
  let m;
  while ((m = re.exec(d))) out.push(m[1] ? m[1] : parseFloat(m[2]));
  return out;
}

function norm(d) {
  const t = tokenize(d);
  let i = 0, cmd = null;
  let x = 0, y = 0, sx = 0, sy = 0;
  let px = null, py = null, qx = null, qy = null;
  const r = [];
  const n = () => t[i++];
  const f = (v) => Math.round(v * 1000) / 1000;

  while (i < t.length) {
    if (typeof t[i] === 'string') cmd = t[i++];
    else if (cmd === 'M') cmd = 'L';
    else if (cmd === 'm') cmd = 'l';

    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();

    if (C === 'Z') { r.push('Z'); x = sx; y = sy; px = py = qx = qy = null; continue; }

    if (C === 'M') {
      const a = n(), b = n();
      x = rel ? x + a : a; y = rel ? y + b : b; sx = x; sy = y;
      r.push(`M ${f(x)} ${f(y)}`); px = py = qx = qy = null;
    } else if (C === 'L') {
      const a = n(), b = n();
      x = rel ? x + a : a; y = rel ? y + b : b;
      r.push(`L ${f(x)} ${f(y)}`); px = py = qx = qy = null;
    } else if (C === 'H') {
      const a = n(); x = rel ? x + a : a;
      r.push(`L ${f(x)} ${f(y)}`); px = py = qx = qy = null;
    } else if (C === 'V') {
      const a = n(); y = rel ? y + a : a;
      r.push(`L ${f(x)} ${f(y)}`); px = py = qx = qy = null;
    } else if (C === 'C') {
      let x1 = n(), y1 = n(), x2 = n(), y2 = n(), x3 = n(), y3 = n();
      if (rel) { x1 += x; y1 += y; x2 += x; y2 += y; x3 += x; y3 += y; }
      r.push(`C ${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x3)} ${f(y3)}`);
      px = x2; py = y2; x = x3; y = y3; qx = qy = null;
    } else if (C === 'S') {
      let x2 = n(), y2 = n(), x3 = n(), y3 = n();
      if (rel) { x2 += x; y2 += y; x3 += x; y3 += y; }
      const x1 = px == null ? x : 2 * x - px;
      const y1 = py == null ? y : 2 * y - py;
      r.push(`C ${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(x3)} ${f(y3)}`);
      px = x2; py = y2; x = x3; y = y3; qx = qy = null;
    } else if (C === 'Q') {
      let x1 = n(), y1 = n(), x2 = n(), y2 = n();
      if (rel) { x1 += x; y1 += y; x2 += x; y2 += y; }
      r.push(`Q ${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)}`);
      qx = x1; qy = y1; x = x2; y = y2; px = py = null;
    } else if (C === 'T') {
      let x2 = n(), y2 = n();
      if (rel) { x2 += x; y2 += y; }
      const x1 = qx == null ? x : 2 * x - qx;
      const y1 = qy == null ? y : 2 * y - qy;
      r.push(`Q ${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)}`);
      qx = x1; qy = y1; x = x2; y = y2; px = py = null;
    } else if (C === 'A') {
      throw new Error('arc not supported: use the icon variant without arcs (e.g. EditOutlined)');
    } else {
      throw new Error('unknown command: ' + cmd);
    }
  }

  // Closes every subpath: SVG fill closes implicitly, Figma does not.
  const out = [];
  for (const seg of r) {
    if (seg.startsWith('M') && out.length && out[out.length - 1] !== 'Z') out.push('Z');
    out.push(seg);
  }
  if (out.length && out[out.length - 1] !== 'Z') out.push('Z');
  return out.join(' ');
}

module.exports = { norm };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('usage: node normalize-svg-path.cjs "<SVG d>" ["<another d>" …]');
    process.exit(1);
  }
  for (const d of args) console.log(norm(d));
}
