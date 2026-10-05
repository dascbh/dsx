// DSX capture-from-code — shared environment for capture tests (React + Vitest + jsdom).
// Copy into the project's test folder (e.g. tests/capture/environment.tsx) and adapt `mountPage` to the app shell.
//
// What lives here: the CAPTURE guard, a fake storage, a fake fetch keyed by "METHOD /path", route watching that makes
// a capture FAIL when the screen calls an API route nobody simulated, and the shell mount. What does NOT live here:
// `vi.mock(...)` of contexts and API modules — Vitest only hoists vi.mock from the test file itself, so each capture
// test declares its own mocks (see example.capture.test.tsx).
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

/** Captures run only on demand: the normal suite (CI) skips them and writes nothing. STITCH_CAPTURE is the legacy name. */
export const CAPTURE = process.env.DSX_CAPTURE === '1' || process.env.STITCH_CAPTURE === '1';

/** Node ships an experimental localStorage without methods; apps that read theme/tenant need a real one. */
export function fakeStorage(seed: Record<string, string> = {}) {
  const memory = new Map<string, string>(Object.entries(seed));
  const storage: Storage = {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => void memory.set(k, String(v)),
    removeItem: (k) => void memory.delete(k),
    clear: () => memory.clear(),
    key: (i) => [...memory.keys()][i] ?? null,
    get length() { return memory.size; },
  };
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('sessionStorage', storage);
  return storage;
}

export type FakeResponse = { status: number; body: unknown; delayMs?: number };
/** Adapt to the API envelope of the project (here: { data }). */
export const ok = (data: unknown): FakeResponse => ({ status: 200, body: { data } });
export const fail = (status = 500, code = 'INTERNAL', message = 'Something went wrong'): FakeResponse => ({ status, body: { error: { code, message } } });
/** A response that never arrives: the screen stays in its loading state. */
export const PENDING: FakeResponse = { status: 0, body: null, delayMs: Infinity };

/** Routes the screen asked for that had no simulated answer (reset per test). */
export const missingRoutes: string[] = [];

/**
 * fetch replacement keyed by "METHOD /path" (query string ignored). Unknown routes answer 404 and are recorded in
 * `missingRoutes`; call `assertAllRoutesSimulated()` before saving so a capture never shows an error banner by accident.
 */
export function fakeFetch(routes: Record<string, FakeResponse | FakeResponse[]>, fallback?: (key: string) => FakeResponse | undefined) {
  const queues = new Map<string, FakeResponse[]>();
  return async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    const key = `${(init.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase()} ${path}`;
    const entry = routes[key];
    let found: FakeResponse | undefined;
    if (Array.isArray(entry)) {
      if (!queues.has(key)) queues.set(key, [...entry]);
      const q = queues.get(key)!;
      found = q.length > 1 ? q.shift() : q[0];
    } else found = entry ?? fallback?.(key);
    if (!found) missingRoutes.push(key);
    const resp = found ?? { status: 404, body: { error: { code: 'CAPTURE_NO_ROUTE', message: key } } };
    if (resp.delayMs === Infinity) return new Promise<Response>(() => {});
    if (resp.delayMs) await new Promise((r) => setTimeout(r, resp.delayMs));
    return new Response(JSON.stringify(resp.body), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
  };
}

/** Fails the capture when the screen called a route without a simulated answer. */
export function assertAllRoutesSimulated() {
  if (missingRoutes.length) throw new Error(`capture: no simulated route for ${[...new Set(missingRoutes)].join(', ')} (add them to the .data.ts file)`);
}

/** Waits for an open dialog and for its enter transition to finish (so the capture is not half-transparent). */
export async function waitForDialog(name?: string | RegExp) {
  const d = await screen.findByRole('dialog', name ? { name } : undefined);
  await waitFor(() => {
    const style = d.closest<HTMLElement>('[style*="opacity"]')?.style.opacity;
    if (style !== undefined && style !== '' && Number(style) < 1) throw new Error('dialog still entering');
  });
  return d;
}

/**
 * Mounts a page inside the real app shell on a memory router.
 * - `layout`: the app's layout route element (it renders <Outlet/>: header, navigation, side menu);
 * - `providers`: wraps everything outside the router (theme, query client, i18n…), as the app's root does.
 * ADAPT: the default uses react-router; for other routers (TanStack Router, Next.js) render the page with the same
 * providers and layout the app uses at that route.
 */
export async function mountPage({ route, path, page, layout, providers }: {
  route: string; path: string; page: ReactNode; layout?: ReactNode; providers?: (children: ReactNode) => ReactNode;
}) {
  missingRoutes.length = 0;
  const { MemoryRouter, Route, Routes } = await import('react-router-dom');
  const routes = layout
    ? <Route element={layout}><Route path={path} element={page} /></Route>
    : <Route path={path} element={page} />;
  const tree = <MemoryRouter initialEntries={[route]}><Routes>{routes}</Routes></MemoryRouter>;
  return render(<>{providers ? providers(tree) : tree}</>);
}
