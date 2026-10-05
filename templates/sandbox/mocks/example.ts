// DSX sandbox — example module mocks for the fictional "Purchasing" product. Replace with the project's modules.
// Data is ALWAYS fictional. Reuse capture data first: `table(ROUTES, 'api')` registers a `<area>.data.ts` table as is.
import { fail, ok } from '../runtime/fake-api';
import { route } from '../runtime/router';
import { currentPersona } from '../runtime/install';

type Order = { id: string; number: string; status: 'draft' | 'sent' | 'confirmed'; total: number };

// In-memory state: lives until the page reloads.
const orders: Order[] = [
  { id: 'po-412', number: 'PO-2026-0412', status: 'sent', total: 18450.5 },
  { id: 'po-413', number: 'PO-2026-0413', status: 'draft', total: 2310 },
];

route('GET api:/orders', (ctx) => ok(ctx.scenario === 'empty' ? [] : orders));
route('GET api:/orders/:id', (ctx) => {
  const o = orders.find((x) => x.id === ctx.params.id);
  return o ? ok(o) : fail(404, 'NOT_FOUND', 'Order not found');
});
route('POST api:/orders', (ctx) => {
  const body = (ctx.body ?? {}) as Partial<Order>;
  const o: Order = { id: `po-${Date.now()}`, number: `PO-2026-${String(orders.length + 500).padStart(4, '0')}`, status: 'draft', total: body.total ?? 0 };
  orders.unshift(o);
  return { status: 201, body: { data: o } };
});
route('GET api:/me', () => ok({ email: String(currentPersona()?.claims.email ?? 'buyer@example.test'), role: currentPersona()?.id ?? 'buyer' }));
