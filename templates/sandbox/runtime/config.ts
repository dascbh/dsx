// DSX sandbox — runtime configuration, injected by vite.sandbox.config.ts (`define: { __DSX_SANDBOX__ }`) from the
// "sandbox" block of .dsx/config.json. Never imported by the official app.
import type { Persona, RuntimeConfig } from './scenarios';

declare const __DSX_SANDBOX__: RuntimeConfig;
export const CONFIG: RuntimeConfig = __DSX_SANDBOX__;

export const DEFAULT_LABELS: Record<string, string> = {
  badge: 'SANDBOX',
  scenario: 'Scenario',
  persona: 'Persona',
  latency: 'Latency',
  reload: 'Reload',
  log: 'Calls',
  'no-mock': 'without mock',
  blocked: 'blocked',
  normal: 'Normal',
  empty: 'Empty',
  slow: 'Slow',
  error: 'Error 500',
  forbidden: 'No access 403',
};
export const label = (key: string) => CONFIG.labels?.[key] ?? DEFAULT_LABELS[key] ?? key;

export const personaById = (id: string | null): Persona | null => CONFIG.personas.find((p) => p.id === id) ?? CONFIG.personas[0] ?? null;
