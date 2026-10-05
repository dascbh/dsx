// DSX sandbox — fake auth provider. Replaces the app's auth module (swapped by vite.sandbox.config.ts) with a session
// for the persona chosen in the panel: no identity provider, no network, any sign-in succeeds.
//
// ADAPT: export EXACTLY the names and shapes the real module exports (`sandbox.mjs init` lists them at the top of the
// generated copy), so every `useAuth()` consumer type-checks unchanged. Run the sandbox typecheck after editing.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { currentPersona } from '../runtime/install';
import { fakeJwt } from '../runtime/scenarios';

const SIGNED_OUT_KEY = 'dsx-sandbox:signed-out';

type User = { id: string; email: string; name: string; groups: string[] };
type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email?: string, password?: string) => Promise<{ ok: true }>;
  signOut: () => Promise<void>;
};

function sessionUser(): { user: User; token: string } | null {
  const p = currentPersona();
  if (!p) return null;
  const c = p.claims as Record<string, unknown>;
  return {
    user: { id: String(c.sub ?? p.id), email: String(c.email ?? `${p.id}@example.test`), name: String(c.name ?? p.label ?? p.id), groups: (c.groups as string[]) ?? [] },
    token: fakeJwt(c),
  };
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedOut, setSignedOut] = useState(() => { try { return sessionStorage.getItem(SIGNED_OUT_KEY) === '1'; } catch { return false; } });
  const value = useMemo<AuthState>(() => {
    const s = signedOut ? null : sessionUser();
    return {
      user: s?.user ?? null,
      token: s?.token ?? null,
      loading: false,
      isAuthenticated: !!s,
      async signIn() { try { sessionStorage.removeItem(SIGNED_OUT_KEY); } catch { /* ignore */ } setSignedOut(false); return { ok: true }; },
      async signOut() { try { sessionStorage.setItem(SIGNED_OUT_KEY, '1'); } catch { /* ignore */ } setSignedOut(true); },
    };
  }, [signedOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider (dsx sandbox)');
  return v;
}
