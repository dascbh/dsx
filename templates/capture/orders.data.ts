// DSX capture-from-code — fictional data for the example product "Purchasing" (purchase orders, suppliers,
// approvals). Shape = what the API returns (copy it from the app's API client or its test fixtures).
// NEVER real data: the HTML leaves the machine (Stitch, published pages). Invent plausible names; keep the
// project's blocklist (`capture.blocklist` in .dsx/config.json) up to date so the send step refuses real ones.
import { ok, type FakeResponse } from './environment';

export const SUPPLIERS = [
  { id: 'sup-1', name: 'Northwind Fasteners Ltd.', email: 'orders@northwind.example' },
  { id: 'sup-2', name: 'Bluebay Packaging Co.', email: 'sales@bluebay.example' },
];

export const ORDERS = [
  { id: 'po-412', number: 'PO-2026-0412', supplier: SUPPLIERS[0], status: 'sent', total: 18450.5, delivery: '2026-11-03' },
  { id: 'po-413', number: 'PO-2026-0413', supplier: SUPPLIERS[1], status: 'draft', total: 2310, delivery: '2026-11-10' },
  { id: 'po-414', number: 'PO-2026-0414', supplier: SUPPLIERS[0], status: 'confirmed', total: 760.25, delivery: '2026-10-28' },
];

/** "METHOD /path" → answer, for fakeFetch. */
export const ROUTES: Record<string, FakeResponse> = {
  'GET /api/orders': ok(ORDERS),
  'GET /api/suppliers': ok(SUPPLIERS),
  'GET /api/me': ok({ name: 'Riley Buyer', role: 'buyer' }),
};
