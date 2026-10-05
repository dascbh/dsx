// DSX sandbox — scenarios and viewer preferences (pure: no React, no DOM besides the storage it is given).
// Scenario ids are DSX state ids' siblings: each one forces the state the screen must show.

export const SCENARIOS = ['normal', 'empty', 'slow', 'error', 'forbidden'] as const;
export type Scenario = (typeof SCENARIOS)[number];

/** Scenario → the DSX state id it produces (capture names <nn>-<screen>[.<state>].html; success has no suffix). */
export const STATE_OF: Record<Scenario, string> = {
  normal: 'success',
  empty: 'empty',
  slow: 'loading',
  error: 'error',
  forbidden: 'no-access',
};

export type Persona = { id: string; label?: string; claims: Record<string, unknown> };

export type RuntimeConfig = {
  storage_key: string;
  default_scenario: Scenario;
  default_persona: string | null;
  latency_ms: number;
  slow_ms: number;
  /** API bases: the app's base URL env vars are rewritten to these same-origin prefixes. */
  bases: { name: string; prefix: string }[];
  /** Routes answered normally even in the error/forbidden scenarios (the app shell must still load). */
  exempt: string[];
  /** Hosts the app may "reach": answered with an empty 200 (uploads, downloads to fake storage). Glob: *.sandbox.invalid */
  fictitious_hosts: string[];
  personas: Persona[];
  /** Answers of the error and forbidden scenarios, when the app needs its own envelope or error code (defaults below). */
  scenario_responses: Partial<Record<'error' | 'forbidden', { status: number; body: unknown }>>;
  /** Panel text in the product's language. */
  labels: Record<string, string>;
};

export type Preferences = { scenario: Scenario; persona: string | null; latency_ms: number };

export const isScenario = (v: unknown): v is Scenario => typeof v === 'string' && (SCENARIOS as readonly string[]).includes(v);

/** Reads stored preferences; a broken or blocked storage counts as empty. */
export function readStored(storage: Pick<Storage, 'getItem'> | null | undefined, key: string): Partial<Preferences> {
  try {
    const raw = storage?.getItem(key);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

export function writeStored(storage: Pick<Storage, 'setItem'> | null | undefined, key: string, prefs: Preferences): boolean {
  try { storage?.setItem(key, JSON.stringify(prefs)); return true; } catch { return false; }
}

/** Order: URL (?scenario=, ?persona=) > stored > configuration default. Unknown values are ignored. */
export function choosePreferences(cfg: RuntimeConfig, search: string, stored: Partial<Preferences>): Preferences {
  const q = new URLSearchParams(search);
  const personaIds = cfg.personas.map((p) => p.id);
  const pick = <T,>(cands: unknown[], ok: (v: unknown) => v is T, fallback: T): T => (cands.find(ok) as T | undefined) ?? fallback;
  const scenario = pick<Scenario>([q.get('scenario'), stored.scenario], isScenario, isScenario(cfg.default_scenario) ? cfg.default_scenario : 'normal');
  const isPersona = (v: unknown): v is string => typeof v === 'string' && personaIds.includes(v);
  const persona = pick<string | null>([q.get('persona'), stored.persona], isPersona, cfg.default_persona ?? personaIds[0] ?? null);
  const latency = typeof stored.latency_ms === 'number' && stored.latency_ms >= 0 ? stored.latency_ms : cfg.latency_ms;
  return { scenario, persona, latency_ms: latency };
}

/** "*.sandbox.invalid" style glob → does the host match? */
export function hostMatches(host: string, patterns: string[]): boolean {
  return patterns.some((p) => (p.startsWith('*.') ? host === p.slice(2) || host.endsWith(p.slice(1)) : host === p));
}

export const DEFAULT_SCENARIO_RESPONSES = {
  error: { status: 500, body: { error: { code: 'SANDBOX_ERROR', message: 'Scenario: error' } } },
  forbidden: { status: 403, body: { error: { code: 'SANDBOX_FORBIDDEN', message: 'Scenario: forbidden' } } },
} as const;

const samePath = (pattern: string, path: string) => {
  const a = pattern.replace(/\/$/, '').split('/');
  const b = path.split('?')[0].replace(/\/$/, '').split('/');
  return a.length === b.length && a.every((s, i) => s.startsWith(':') || s === '*' || s === b[i]);
};

/** Is this request exempt from the error/forbidden scenarios? Patterns: "METHOD base:/path", "base:/path" or "/path"
 * (any method / any base); ":param" and "*" match one segment. */
export function isExempt(cfg: RuntimeConfig, method: string, base: string | null, path: string): boolean {
  return cfg.exempt.some((e) => {
    const parts = e.trim().split(/\s+/);
    const [m, target] = parts.length > 1 ? [parts[0].toUpperCase(), parts[1]] : [null, parts[0]];
    if (m && m !== method.toUpperCase()) return false;
    const i = target.indexOf(':/');
    const [b, p] = i > 0 ? [target.slice(0, i), target.slice(i + 1)] : [null, target];
    if (b && b !== base) return false;
    return samePath(p, path);
  });
}

/** Unsigned fake JWT carrying the persona's claims (alg "none": never accepted by a real back end). */
export function fakeJwt(claims: Record<string, unknown>): string {
  const b64 = (o: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ exp: 4102444800, ...claims })}.sandbox`;
}
