// DSX capture-from-code — example capture (product "Purchasing", screen "Orders" and its "Cancel order" dialog).
// Renders the REAL page component in jsdom with a fake API and fictional data, then writes a static HTML file.
//   DSX_CAPTURE=1 npx vitest run --config vitest.capture.config.ts tests/capture/orders.capture.test.tsx
// Copy this file per area (orders, suppliers, approvals…): one `<area>.capture.test.tsx` + `<area>.data.ts`.
import { afterEach, beforeEach, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { saveCapture, captureName } from './serialize';
import { CAPTURE, fakeStorage, mountPage, assertAllRoutesSimulated, waitForDialog } from './environment';

vi.setConfig({ testTimeout: 30_000 });

// vi.mock must stay in this file (Vitest hoists it only from the test file). ADAPT the module paths and the values
// to the app: auth/session, current organization, feature flags, API client.
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Riley Buyer', role: 'buyer' }, token: 'fake-token', loading: false, signOut: () => {} }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('../../src/api/client', async (importOriginal) => {
  const { fakeFetch } = await import('./environment');
  const { ROUTES } = await import('./orders.data');
  return { ...(await importOriginal<object>()), apiFetch: fakeFetch(ROUTES) };
});

import OrdersPage from '../../src/pages/orders/OrdersPage';
import AppLayout from '../../src/layouts/AppLayout';

beforeEach(() => fakeStorage({ theme: 'light' }));
afterEach(() => cleanup());

it.runIf(CAPTURE)('captures 02 orders', async () => {
  await mountPage({ route: '/orders', path: '/orders', page: <OrdersPage />, layout: <AppLayout /> });
  // wait for the FINAL state (data on screen), never for a timer
  await screen.findByText('PO-2026-0412');
  assertAllRoutesSimulated();
  saveCapture('/orders', captureName('02', 'orders'));
});

it.runIf(CAPTURE)('captures 05 cancel-order dialog', async () => {
  await mountPage({ route: '/orders', path: '/orders', page: <OrdersPage />, layout: <AppLayout /> });
  await screen.findByText('PO-2026-0412');
  // open it the way a person does: the trigger label comes from the flow map (.dsx/maps/flows-<m>.json)
  fireEvent.click(screen.getAllByRole('button', { name: 'Cancel order' })[0]);
  await waitForDialog('Cancel order');
  assertAllRoutesSimulated();
  saveCapture('/orders (Cancel order)', captureName('05', 'cancel-order'), { fullDialog: true });
});
