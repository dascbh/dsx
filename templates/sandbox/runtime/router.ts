// DSX sandbox — the mock route table. Mocks register here (sandbox/mocks/*.ts):
//
//   route('GET api:/orders/:id', (ctx) => ({ data: findOrder(ctx.params.id) }));   // function: body or FakeResponse
//   table(ROUTES, 'api');                                                         // a capture `<area>.data.ts` table
//
// Handlers receive ctx.scenario: "empty" also empties static list answers automatically; return [] yourself in
// function handlers that build lists. The error/forbidden scenarios are applied before the handler runs.
import { createRouter } from './fake-api';

export const router = createRouter();
export const route = router.add;
export const table = router.table;
