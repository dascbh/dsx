import { ok, type FakeResponse } from './environment';
export const ROUTES: Record<string, FakeResponse> = { 'GET /orders': ok([{ id: 'po-1', number: 'PO-1' }]) };
