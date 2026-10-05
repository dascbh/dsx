import { createContext, useContext, type ReactNode } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const pool = new CognitoUserPool({ UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID, ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID });
type AuthState = { user: { username: string } | null; signIn: (u: string, p: string) => Promise<void>; signOut: () => void };
const Ctx = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={{ user: null, signIn: async () => { void pool; }, signOut: () => {} }}>{children}</Ctx.Provider>;
}
export function useAuth() { return useContext(Ctx)!; }
