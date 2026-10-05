import { createContext, type ReactNode } from 'react';
import { apiFetch } from '../api';
const Ctx = createContext<unknown>(null);
export function OrgProvider({ children, id }: { children: ReactNode; id: string }) {
  void apiFetch('/orgs/mine');
  void apiFetch(`/orgs/${id}/settings`);
  return <Ctx.Provider value={null}>{children}</Ctx.Provider>;
}
