import { vi } from 'vitest';
export const ok = (data: unknown) => ({ status: 200, body: { data } });
export type FakeResponse = { status: number; body: unknown };
void vi;
