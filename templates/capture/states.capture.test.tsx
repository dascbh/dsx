// DSX capture-from-code — state captures (loading, empty, error) of the main screens, table-driven.
// File name: `<nn>-<screen>.<state>.html`, same nn and screen id as the main capture, so the DSX states checker
// (tools/ux-lint/states.mjs) pairs them. Loading = the deciding route never answers; empty = empty list;
// error = the API's error envelope.
//   DSX_CAPTURE=1 npx vitest run --config vitest.capture.config.ts tests/capture/states.capture.test.tsx
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { saveCapture, captureName } from './serialize';
import { CAPTURE, fakeStorage, mountPage, ok, fail, PENDING, type FakeResponse } from './environment';
import { ROUTES } from './orders.data';

vi.setConfig({ testTimeout: 30_000 });

// the deciding route of each case is swapped per test through this mutable table
const answers: Record<string, FakeResponse> = { ...ROUTES };
vi.mock('../../src/api/client', async (importOriginal) => {
  const { fakeFetch } = await import('./environment');
  return { ...(await importOriginal<object>()), apiFetch: (url: string, init?: RequestInit) => fakeFetch(answers)(url, init) };
});
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Riley Buyer', role: 'buyer' }, token: 'fake-token', loading: false, signOut: () => {} }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import OrdersPage from '../../src/pages/orders/OrdersPage';
import AppLayout from '../../src/layouts/AppLayout';

type State = 'loading' | 'empty' | 'error';
interface Case { nn: string; id: string; route: string; path: string; page: () => React.ReactNode; key: string; states: State[] }

const SCREENS: Case[] = [
  { nn: '02', id: 'orders', route: '/orders', path: '/orders', page: () => <OrdersPage />, key: 'GET /api/orders', states: ['loading', 'empty', 'error'] },
];

const ANSWER: Record<State, FakeResponse> = { loading: PENDING, empty: ok([]), error: fail(500) };
/** What proves the state is on screen before saving. ADAPT the texts to the product's language. */
const SHOWN: Record<State, () => Promise<unknown>> = {
  loading: () => screen.findByRole('progressbar'),
  empty: () => waitFor(() => { if (!/no orders|nothing here/i.test(document.querySelector('main')?.textContent ?? '')) throw new Error('empty state not shown'); }),
  error: () => screen.findByRole('alert'),
};

beforeEach(() => fakeStorage({ theme: 'light' }));
afterEach(() => { cleanup(); Object.assign(answers, ROUTES); });

describe('screen states', () => {
  for (const s of SCREENS) for (const state of s.states) {
    it.runIf(CAPTURE)(`captures ${s.nn} ${s.id}.${state}`, async () => {
      answers[s.key] = ANSWER[state];
      await mountPage({ route: s.route, path: s.path, page: s.page(), layout: <AppLayout /> });
      await SHOWN[state]();
      saveCapture(`${s.route} (${state})`, captureName(s.nn, s.id, state));
    });
  }
});
