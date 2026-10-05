// DSX fake API — the framework-free core shared by capture-from-code (jsdom tests) and the sandbox (browser build).
// Copy next to environment.tsx (tests) or into <code>/sandbox/runtime/ (the sandbox `init` does it for you).
//
// No vitest, no Testing Library, no Node globals: `<area>.data.ts` files import their helpers from HERE, so the same
// data serves the capture tests and the sandbox without shims.
//
// Route keys: "METHOD /path" or "METHOD base:/path", with ":param" segments ("GET api:/orders/:id"). The query string is
// ignored when matching. A handler is a fixed answer, a queue of answers (each call takes the next; the last repeats) or
// a function of the request context.

export type FakeResponse = { status: number; body: unknown; delayMs?: number; headers?: Record<string, string> };
/** Adapt to the API envelope of the project (here: { data }). */
export const ok = (data: unknown): FakeResponse => ({ status: 200, body: { data } });
export const fail = (status = 500, code = 'INTERNAL', message = 'Something went wrong'): FakeResponse => ({ status, body: { error: { code, message } } });
/** Any status and body (a 201 with the created record, a 409 with the project's error envelope…). */
export const respond = (status: number, body: unknown = null, headers?: Record<string, string>): FakeResponse => ({ status, body, ...(headers ? { headers } : {}) });
/** 204: success without a body. */
export const noContent = (): FakeResponse => ({ status: 204, body: null });
let sequence = 0;
/** Unique fictional id for records created in memory by function handlers. */
export const newId = (prefix = 'sbx'): string => `${prefix}-${Date.now().toString(36)}-${(++sequence).toString(36)}`;
/** A response that never arrives: the screen stays in its loading state. */
export const PENDING: FakeResponse = { status: 0, body: null, delayMs: Infinity };

export type RequestContext = {
  method: string;
  base: string | null;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  headers: Headers;
  /** Sandbox scenario (normal | empty | slow | error | forbidden); "normal" in capture tests. */
  scenario: string;
};
export type HandlerResult = FakeResponse | unknown;
export type Handler = FakeResponse | FakeResponse[] | ((ctx: RequestContext) => HandlerResult | Promise<HandlerResult>);

export const isFakeResponse = (v: unknown): v is FakeResponse =>
  !!v && typeof v === 'object' && typeof (v as FakeResponse).status === 'number' && 'body' in (v as object);

type Compiled = { spec: string; method: string; base: string | null; re: RegExp; keys: string[]; handler: Handler };

/** "GET api:/orders/:id" → method, optional base, a path regex and its parameter names. */
export function compileRoute(spec: string, handler: Handler): Compiled {
  const space = spec.indexOf(' ');
  if (space < 0) throw new Error(`fake-api: route "${spec}" must be "METHOD /path" or "METHOD base:/path"`);
  const method = spec.slice(0, space).trim().toUpperCase();
  const rest = spec.slice(space + 1).trim();
  const m = /^([a-z][\w-]*):(\/.*)$/i.exec(rest);
  const base = m ? m[1] : null;
  const path = (m ? m[2] : rest).split('?')[0];
  const keys: string[] = [];
  const pattern = path
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) { keys.push(seg.slice(1)); return '([^/]+)'; }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { spec, method, base, re: new RegExp(`^${pattern}/?$`), keys, handler };
}

export type Match = { spec: string; params: Record<string, string>; answer: (ctx: RequestContext) => Promise<FakeResponse> };

/**
 * A route table. `add` registers one route; `table` registers a { "METHOD /path": answer } object (the ROUTES export of
 * `<area>.data.ts`), optionally restricted to an API base. The first registered match wins.
 */
export function createRouter() {
  const routes: Compiled[] = [];
  const queues = new Map<Compiled, FakeResponse[]>();

  const answerOf = (r: Compiled) => async (ctx: RequestContext): Promise<FakeResponse> => {
    const h = r.handler;
    if (Array.isArray(h)) {
      if (!queues.has(r)) queues.set(r, [...h]);
      const q = queues.get(r)!;
      return (q.length > 1 ? q.shift() : q[0]) ?? fail(500, 'FAKE_API_EMPTY_QUEUE', r.spec);
    }
    if (typeof h === 'function') {
      const out = await h(ctx);
      if (out === undefined || out === null) return { status: 204, body: null };
      return isFakeResponse(out) ? out : { status: 200, body: out };
    }
    return h;
  };

  return {
    add(spec: string, handler: Handler) { routes.push(compileRoute(spec, handler)); },
    table(entries: Record<string, Handler>, base?: string) {
      for (const [key, handler] of Object.entries(entries)) {
        const sp = key.indexOf(' ');
        const spec = base && sp > 0 && !/^\S+\s+[a-z][\w-]*:\//i.test(key) ? `${key.slice(0, sp)} ${base}:${key.slice(sp + 1)}` : key;
        routes.push(compileRoute(spec, handler));
      }
    },
    /** Finds the route for a request; `base` null matches only routes without a base restriction or any base when `anyBase`. */
    match(method: string, base: string | null, path: string): Match | null {
      const p = path.split('?')[0];
      for (const r of routes) {
        if (r.method !== method.toUpperCase()) continue;
        if (r.base && r.base !== base) continue;
        const m = r.re.exec(p);
        if (!m) continue;
        const params: Record<string, string> = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        return { spec: r.spec, params, answer: answerOf(r) };
      }
      return null;
    },
    /** Every registered route key (for coverage checks). */
    specs(): string[] { return routes.map((r) => r.spec); },
  };
}
export type Router = ReturnType<typeof createRouter>;

/** Turns a FakeResponse into a fetch Response, honoring delayMs (Infinity = never resolves). */
export async function toResponse(resp: FakeResponse): Promise<Response> {
  if (resp.delayMs === Infinity) return new Promise<Response>(() => {});
  if (resp.delayMs) await new Promise((r) => setTimeout(r, resp.delayMs));
  const noBody = resp.status === 204 || resp.status === 205 || resp.status === 304;
  return new Response(noBody ? null : JSON.stringify(resp.body), {
    status: resp.status,
    headers: { 'Content-Type': 'application/json', ...(resp.headers ?? {}) },
  });
}

/** "empty" scenario for static answers: lists become empty (top level or under `data`); other bodies stay as they are. */
export function emptied(resp: FakeResponse): FakeResponse {
  const b = resp.body as Record<string, unknown> | unknown[] | null;
  if (Array.isArray(b)) return { ...resp, body: [] };
  if (b && typeof b === 'object' && Array.isArray((b as Record<string, unknown>).data)) return { ...resp, body: { ...b, data: [] } };
  return resp;
}
