// DSX sandbox — request interception (browser). Installed before any app module runs (see install.ts).
//
// Layer 1 of isolation (layer 2 is the CSP in index.html):
// - fetch to a configured API prefix (/__dsx/<base>/…) → the mock router, shaped by the active scenario;
// - fetch/XHR/iframe to a fictitious host (*.sandbox.invalid, configured fake storage hosts) → empty 200;
// - any other cross-origin destination → blocked and logged (TypeError, like a network failure);
// - same-origin requests outside the API prefixes (Vite assets, HMR) pass through;
// - WebSocket only to the page's own host (Vite HMR keeps working); sendBeacon disabled.
import { emptied, toResponse, type FakeResponse, type Router } from './fake-api';
import { DEFAULT_SCENARIO_RESPONSES, hostMatches, isExempt, type Preferences, type RuntimeConfig } from './scenarios';

export type LogKind = 'mock' | 'no-mock' | 'blocked' | 'fictitious';
export type LogEntry = { at: string; method: string; url: string; status: number; kind: LogKind; route?: string };

const log: LogEntry[] = [];
const listeners = new Set<(e: LogEntry) => void>();
export const onLog = (fn: (e: LogEntry) => void) => { listeners.add(fn); return () => listeners.delete(fn); };
export const entries = () => log.slice();

function record(e: Omit<LogEntry, 'at'>) {
  const entry = { at: new Date().toISOString(), ...e };
  log.unshift(entry);
  if (log.length > 300) log.length = 300;
  if (e.kind === 'no-mock') console.warn(`[dsx-sandbox] no mock for ${e.method} ${e.url}`);
  if (e.kind === 'blocked') console.error(`[dsx-sandbox] blocked ${e.method} ${e.url}`);
  listeners.forEach((fn) => fn(entry));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Which configured base does this same-origin path belong to? */
function baseOf(cfg: RuntimeConfig, pathname: string): { name: string; rest: string } | null {
  for (const b of cfg.bases) {
    if (pathname === b.prefix || pathname.startsWith(`${b.prefix}/`)) return { name: b.name, rest: pathname.slice(b.prefix.length) || '/' };
  }
  return null;
}

function parseBody(body: unknown): unknown {
  if (typeof body !== 'string') return body ?? null;
  try { return JSON.parse(body); } catch { return body; }
}

/** The scenario's answer for one API request (exported for tests). */
export async function answer(router: Router, cfg: RuntimeConfig, prefs: Preferences, method: string, base: string, path: string,
  query: URLSearchParams, body: unknown, headers: Headers): Promise<{ resp: FakeResponse; kind: LogKind; route?: string }> {
  const exempt = isExempt(cfg, method, base, path);
  if (!exempt && (prefs.scenario === 'error' || prefs.scenario === 'forbidden')) {
    const r = cfg.scenario_responses?.[prefs.scenario] ?? DEFAULT_SCENARIO_RESPONSES[prefs.scenario];
    return { resp: { status: r.status, body: r.body }, kind: 'mock' };
  }
  const match = router.match(method, base, path);
  if (!match) return { resp: { status: 404, body: { error: { code: 'SANDBOX_NO_MOCK', message: `${method} ${base}:${path}` } } }, kind: 'no-mock' };
  try {
    let resp = await match.answer({ method, base, path, params: match.params, query, body: parseBody(body), headers, scenario: prefs.scenario });
    if (prefs.scenario === 'empty' && !exempt) resp = emptied(resp);
    return { resp, kind: 'mock', route: match.spec };
  } catch (e) {
    return { resp: { status: 500, body: { error: { code: 'SANDBOX_MOCK_FAILED', message: String((e as Error)?.message ?? e) } } }, kind: 'mock', route: match.spec };
  }
}

export function install(router: Router, cfg: RuntimeConfig, prefs: Preferences) {
  const realFetch = window.fetch.bind(window);
  const delay = () => sleep(prefs.scenario === 'slow' ? cfg.slow_ms : prefs.latency_ms);

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href);
    const method = (init.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (url.origin !== location.origin) {
      if (hostMatches(url.hostname, cfg.fictitious_hosts)) {
        await delay();
        record({ method, url: url.href, status: 200, kind: 'fictitious' });
        return new Response('', { status: 200 });
      }
      record({ method, url: url.href, status: 0, kind: 'blocked' });
      throw new TypeError(`dsx-sandbox: blocked request to ${url.origin}`);
    }
    const base = baseOf(cfg, url.pathname);
    if (!base) return realFetch(input as RequestInfo, init);
    const body = init.body ?? (input instanceof Request ? await input.clone().text() : null);
    const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
    await delay();
    const { resp, kind, route } = await answer(router, cfg, prefs, method, base.name, base.rest, url.searchParams, body, headers);
    record({ method, url: `${base.name}:${base.rest}${url.search}`, status: resp.status, kind, route });
    return toResponse(resp);
  };

  // XHR (used for presigned uploads with progress): fictitious hosts succeed with progress events; the rest is blocked.
  class SandboxXHR extends EventTarget {
    readyState = 0; status = 0; responseText = ''; response: unknown = ''; responseType = '';
    upload = new EventTarget() as EventTarget & { onprogress?: ((e: ProgressEvent) => void) | null };
    onload: ((e: Event) => void) | null = null; onerror: ((e: Event) => void) | null = null;
    onabort: ((e: Event) => void) | null = null; onreadystatechange: ((e: Event) => void) | null = null;
    ontimeout: ((e: Event) => void) | null = null;
    private method = 'GET'; private url = ''; private aborted = false;
    open(method: string, url: string) { this.method = method.toUpperCase(); this.url = new URL(url, location.href).href; this.readyState = 1; }
    setRequestHeader() { /* not needed */ }
    getAllResponseHeaders() { return ''; }
    getResponseHeader() { return null; }
    abort() { this.aborted = true; this.fire('abort'); }
    private fire(type: string, init?: ProgressEventInit) {
      const e = init ? new ProgressEvent(type, init) : new Event(type);
      (this as unknown as Record<string, ((ev: Event) => void) | null>)[`on${type}`]?.(e);
      this.dispatchEvent(e);
    }
    async send(body?: Blob | string | null) {
      const u = new URL(this.url);
      if (u.origin === location.origin || hostMatches(u.hostname, cfg.fictitious_hosts)) {
        const total = body instanceof Blob ? body.size : String(body ?? '').length || 1;
        for (let i = 1; i <= 5 && !this.aborted; i++) {
          await sleep(Math.max(120, prefs.latency_ms));
          const p = new ProgressEvent('progress', { lengthComputable: true, loaded: (total * i) / 5, total });
          this.upload.onprogress?.(p);
          this.upload.dispatchEvent(p);
        }
        if (this.aborted) return;
        this.readyState = 4; this.status = 200;
        record({ method: this.method, url: this.url, status: 200, kind: 'fictitious' });
        this.fire('readystatechange'); this.fire('load'); this.fire('loadend');
        return;
      }
      record({ method: this.method, url: this.url, status: 0, kind: 'blocked' });
      setTimeout(() => { this.readyState = 4; this.fire('error'); this.fire('loadend'); }, 0);
    }
  }
  (window as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = SandboxXHR;

  // iframe downloads to a fictitious host: save a small file instead of navigating.
  const desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
  if (desc?.set) {
    Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
      ...desc,
      set(this: HTMLIFrameElement, value: string) {
        try {
          const u = new URL(value, location.href);
          if (u.origin !== location.origin && hostMatches(u.hostname, cfg.fictitious_hosts)) {
            record({ method: 'GET', url: u.href, status: 200, kind: 'fictitious' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([`dsx sandbox download: ${u.pathname}\n`], { type: 'text/plain' }));
            a.download = `${u.pathname.split('/').pop() || 'file'}.sandbox.txt`;
            a.click();
            return;
          }
        } catch { /* fall through */ }
        desc.set!.call(this, value);
      },
    });
  }

  const RealWS = window.WebSocket;
  window.WebSocket = class extends RealWS {
    constructor(url: string | URL, protocols?: string | string[]) {
      const u = new URL(String(url), location.href);
      if (u.hostname !== location.hostname) {
        record({ method: 'WS', url: u.href, status: 0, kind: 'blocked' });
        throw new DOMException(`dsx-sandbox: blocked WebSocket to ${u.host}`, 'SecurityError');
      }
      super(url, protocols);
    }
  } as typeof WebSocket;

  if (navigator.sendBeacon) navigator.sendBeacon = () => false;

  (window as unknown as Record<string, unknown>).__dsx_sandbox = { entries, prefs, routes: router.specs() };
}
