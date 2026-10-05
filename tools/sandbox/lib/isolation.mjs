// Isolation as a verifiable contract.
// - isolationCheck(dist): the SANDBOX build reaches no real host — no configured real host or identity-provider endpoint
//   in the assets, a CSP whose connect-src is the page itself (+ local WebSocket for HMR), and the interceptor present.
// - bundleCheck(dist): the OFFICIAL build carries nothing of the sandbox (marker data-dsx-sandbox / __DSX_SANDBOX__).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Hosts of identity providers and gateways a sandbox build must never contain. */
export const AUTH_ENDPOINTS = [
  'cognito-idp.', 'cognito-identity.', 'execute-api.', '.auth0.com', 'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com', 'login.microsoftonline.com', '.okta.com', '/protocol/openid-connect/',
];
export const SANDBOX_MARKER = /data-dsx-sandbox|__DSX_SANDBOX__|dsx-sandbox:/;

function textFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(m?js|cjs|css|html?|json|txt|webmanifest)$/.test(f.name) && !f.name.endsWith('.map')) out.push(p);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

const excerpt = (t, i) => t.slice(Math.max(0, i - 40), i + 60).replace(/\s+/g, ' ');

/** CSP of the built index.html: { directives, problems[] }. */
export function cspOf(html) {
  const tag = (html.match(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i) ?? [null])[0];
  const m = tag?.match(/content="([^"]*)"/i) ?? tag?.match(/content='([^']*)'/i);
  if (!m) return { directives: null, problems: ['no Content-Security-Policy meta tag in index.html'] };
  const directives = Object.fromEntries(m[1].split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
    const [name, ...values] = d.split(/\s+/);
    return [name.toLowerCase(), values];
  }));
  const problems = [];
  const connect = directives['connect-src'] ?? directives['default-src'];
  if (!connect) problems.push('CSP without connect-src or default-src');
  else {
    const allowed = /^('self'|ws:\/\/localhost:\*|ws:\/\/127\.0\.0\.1:\*)$/;
    const extra = connect.filter((v) => !allowed.test(v));
    if (extra.length) problems.push(`connect-src allows more than the page itself: ${extra.join(' ')}`);
  }
  return { directives, problems };
}

export function isolationCheck(dist, { realHosts = [] } = {}) {
  const findings = [];
  if (!existsSync(dist)) return { ok: false, findings: [{ rule: 'no-build', detail: `no build at ${dist}` }] };
  const files = textFiles(dist);
  let marker = false;
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    if (SANDBOX_MARKER.test(t)) marker = true;
    for (const h of [...realHosts.filter(Boolean), ...AUTH_ENDPOINTS]) {
      const i = t.indexOf(h);
      if (i >= 0) findings.push({ rule: realHosts.includes(h) ? 'real-host' : 'auth-endpoint', file: relative(dist, f), detail: h, excerpt: excerpt(t, i) });
    }
  }
  const index = join(dist, 'index.html');
  if (existsSync(index)) for (const p of cspOf(readFileSync(index, 'utf8')).problems) findings.push({ rule: 'csp', file: 'index.html', detail: p });
  else findings.push({ rule: 'csp', detail: 'no index.html in the build' });
  if (!marker) findings.push({ rule: 'no-interceptor', detail: 'the sandbox runtime is not in the build (main.sandbox.tsx not used?)' });
  return { ok: findings.length === 0, files: files.length, findings };
}

export function bundleCheck(dist) {
  const hits = [];
  for (const f of textFiles(dist)) {
    const t = readFileSync(f, 'utf8');
    const i = t.search(SANDBOX_MARKER);
    if (i >= 0) hits.push({ file: relative(dist, f), excerpt: excerpt(t, i) });
  }
  return { ok: hits.length === 0, hits };
}

/** CSP for the sandbox index.html: the page itself, local WebSocket for HMR, plus declared extras (e.g. web fonts). */
export function buildCsp(extra = {}) {
  const d = {
    'default-src': ["'self'"],
    'connect-src': ["'self'", 'ws://localhost:*', 'ws://127.0.0.1:*'],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'font-src': ["'self'", 'data:'],
    'img-src': ["'self'", 'data:', 'blob:'],
    'frame-src': ["'self'", 'blob:', 'data:'],
    'object-src': ["'none'"],
  };
  for (const [k, v] of Object.entries(extra)) if (k !== 'connect-src') d[k] = [...(d[k] ?? []), ...v];
  return Object.entries(d).map(([k, v]) => `${k} ${v.join(' ')}`).join('; ');
}
