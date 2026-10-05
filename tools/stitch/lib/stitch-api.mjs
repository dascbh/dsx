// Google Stitch REST client for the capture tools (send, arrange-canvas). No dependencies (global fetch, Node ≥ 20).
//
// API key, in this order: $STITCH_API_KEY, then the `stitch` MCP server header in ~/.claude.json
// (mcpServers.stitch.headers["X-Goog-Api-Key"]). The key is never printed, logged or written: errors mention
// where it was looked for, not its value.
//
// Real-data guard: before any upload the HTML is checked against the project's blocklist
// (lib/guard.mjs); a match refuses the upload. The DSX ships no names of its own.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const API = 'https://stitch.googleapis.com/v1';

/** Resolves the API key without exposing it. Throws a message that never contains the key. */
export function apiKey(env = process.env, home = homedir()) {
  if (env.STITCH_API_KEY) return env.STITCH_API_KEY;
  try {
    const cfg = JSON.parse(readFileSync(join(home, '.claude.json'), 'utf8'));
    const k = cfg?.mcpServers?.stitch?.headers?.['X-Goog-Api-Key'];
    if (k) return k;
  } catch { /* fall through */ }
  throw new Error('Stitch API key not found: set STITCH_API_KEY or configure the "stitch" MCP server (header X-Goog-Api-Key) in ~/.claude.json');
}

/** Removes anything that looks like the key from a message before it is shown. */
export const redact = (msg, key) => (key ? String(msg).split(key).join('[redacted]') : String(msg));

/** JSON request to the Stitch API. `fetchImpl` lets tests run without network. */
export async function request(method, url, body, { key = apiKey(), fetchImpl = globalThis.fetch } = {}) {
  const res = await fetchImpl(url, {
    method,
    headers: { 'X-Goog-Api-Key': key, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(redact(`Stitch ${method} ${url.replace(/\?.*$/, '')} → HTTP ${res.status}: ${text.slice(0, 300)}`, key));
  return text ? JSON.parse(text) : {};
}

/** CreateScreenRequest for an HTML document (the shape the official uploader sends). */
export function screenRequest(html, title, generatedBy = 'dsx::capture-from-code') {
  return {
    screen: {
      htmlCode: { fileContentBase64: Buffer.from(html, 'utf8').toString('base64'), mimeType: 'text/html' },
      screenType: 'DOCUMENT', isCreatedByClient: true, generatedBy, ...(title ? { title } : {}),
    },
  };
}

/** First `projects/<p>/screens/<id>` found anywhere in a response → screen id. */
export function screenIdFrom(json) {
  const m = JSON.stringify(json ?? {}).match(/projects\/[^/"]+\/screens\/([0-9A-Za-z_-]+)/);
  return m ? m[1] : null;
}

/** Uploads one HTML screen; returns its screen id. */
export async function uploadHtml(project, html, title, opts = {}) {
  const r = await request('POST', `${API}/projects/${project}/screens:batchCreate`,
    { parent: `projects/${project}`, requests: [screenRequest(html, title)], createScreenInstances: true }, opts);
  const id = screenIdFrom(r);
  if (!id) throw new Error('Stitch answered without a screen id');
  return id;
}

export const getProject = (project, opts) => request('GET', `${API}/projects/${project}`, undefined, opts);
export const setInstances = (project, screenInstances, opts) =>
  request('PATCH', `${API}/projects/${project}?updateMask=screenInstances`, { screenInstances }, opts);
