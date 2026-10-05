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

// The framework-free core (FakeResponse, ok, fail, PENDING, the route matcher) lives in fake-api.ts so that
// `<area>.data.ts` files and the sandbox can use it without Vitest. Re-exported here for existing imports.
export * from './fake-api';
import { createRouter, toResponse, type FakeResponse, type Handler } from './fake-api';

/** Routes the screen asked for that had no simulated answer (reset per test). */
export const missingRoutes: string[] = [];

/**
 * fetch replacement keyed by "METHOD /path" (query string ignored; ":param" segments allowed). An array answers in
 * order and repeats the last one. Unknown routes answer 404 and are recorded in `missingRoutes`; call
 * `assertAllRoutesSimulated()` before saving so a capture never shows an error banner by accident.
 */
export function fakeFetch(routes: Record<string, Handler>, fallback?: (key: string) => FakeResponse | undefined) {
  const router = createRouter();
  router.table(routes);
  return async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    const method = (init.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
    const key = `${method} ${path}`;
    const query = new URLSearchParams(url.includes('?') ? url.slice(url.indexOf('?') + 1) : '');
    const match = router.match(method, null, path);
    let found: FakeResponse | undefined;
    if (match) {
      found = await match.answer({ method, base: null, path, params: match.params, query, body: init.body ?? null, headers: new Headers(init.headers), scenario: 'normal' });
    } else found = fallback?.(key);
    if (!found) missingRoutes.push(key);
    return toResponse(found ?? { status: 404, body: { error: { code: 'CAPTURE_NO_ROUTE', message: key } } });
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
