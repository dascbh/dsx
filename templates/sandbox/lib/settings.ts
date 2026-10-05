// DSX sandbox — reads the "sandbox" block of <project>/.dsx/config.json (found by walking up from the sandbox folder)
// and resolves every path. Node-only, used by vite.sandbox.config.ts. Same defaults as tools/sandbox/lib/config.mjs.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { RuntimeConfig } from '../runtime/scenarios';

export type SandboxSettings = {
  root: string; sandboxDir: string; mirrorDir: string; packageDir: string;
  entry: string; publicDir: string | null;
  aliases: Record<string, string>;
  swaps: Record<string, string>;
  redirects: { specifier: string; importer_prefix: string; to: string }[];
  define: Record<string, string>;
  runtime: RuntimeConfig;
  ports: { dev: number; preview: number };
  design: { official: string; optionsDir: string; manifest: string | null; active: string | null };
};

/** Real path (symlinks resolved): Vite resolves module ids to real paths, so every compared path must be one too. */
export function real(p: string): string {
  try { return realpathSync.native(p); } catch {
    const up = dirname(p);
    return up === p ? p : join(real(up), p.slice(up.length + 1));
  }
}

export function findProjectRoot(from: string): string {
  let dir = resolve(from);
  for (;;) {
    if (existsSync(join(dir, '.dsx', 'config.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) throw new Error(`dsx sandbox: no .dsx/config.json above ${from} — run \`sandbox.mjs init --write\` first`);
    dir = up;
  }
}

export function loadSettings(sandboxDir: string, env: Record<string, string | undefined> = process.env): SandboxSettings {
  const root = real(env.DSX_SANDBOX_ROOT ? resolve(env.DSX_SANDBOX_ROOT) : findProjectRoot(sandboxDir));
  const cfg = JSON.parse(readFileSync(join(root, '.dsx', 'config.json'), 'utf8'));
  const s = cfg.sandbox ?? {};
  const d = cfg.design ?? {};
  const abs = (p: string) => resolve(root, p);
  const mirrorDir = abs(s.mirror ?? join(s.dir ?? 'sandbox', 'mirror'));
  const inMirror = (p: string) => join(mirrorDir, p);
  const bases = Object.keys(s.api_bases ?? {}).map((name) => ({ name, prefix: `/__dsx/${name}` }));
  const define: Record<string, string> = {};
  for (const [name, envVar] of Object.entries<string>(s.api_bases ?? {})) define[`import.meta.env.${envVar}`] = JSON.stringify(`/__dsx/${name}`);
  for (const [k, v] of Object.entries<string>(s.env ?? {})) define[`import.meta.env.${k}`] = JSON.stringify(v);
  const runtime: RuntimeConfig = {
    storage_key: s.storage_key ?? 'dsx-sandbox',
    default_scenario: s.default_scenario ?? 'normal',
    default_persona: s.default_persona ?? null,
    latency_ms: s.latency_ms ?? 250,
    slow_ms: s.slow_ms ?? 2500,
    bases,
    exempt: s.exempt ?? [],
    fictitious_hosts: ['*.sandbox.invalid', ...(s.fictitious_hosts ?? [])],
    personas: s.personas ?? [],
    scenario_responses: s.scenario_responses ?? {},
    labels: s.labels ?? {},
  };
  define.__DSX_SANDBOX__ = JSON.stringify(runtime);
  return {
    root, sandboxDir: real(resolve(sandboxDir)), mirrorDir, packageDir: abs(s.package ?? '.'),
    entry: inMirror(s.entry ?? 'src/main.tsx'),
    publicDir: s.public_dir ? inMirror(s.public_dir) : null,
    aliases: Object.fromEntries(Object.entries<string>(s.aliases ?? {}).map(([k, v]) => [k, inMirror(v)])),
    swaps: Object.fromEntries(Object.entries<string>(s.swaps ?? {}).map(([k, v]) => [inMirror(k), abs(v)])),
    redirects: (s.redirects ?? []).map((r: { specifier: string; importer_prefix: string; to: string }) => ({ ...r, importer_prefix: inMirror(r.importer_prefix), to: abs(r.to) })),
    define,
    runtime,
    ports: { dev: s.ports?.dev ?? 3100, preview: s.ports?.preview ?? 3101 },
    design: {
      official: inMirror(d.official ?? 'DESIGN.md'),
      optionsDir: inMirror(d.options_dir ?? '.dsx/design-options'),
      manifest: d.manifest ? inMirror(d.manifest) : null,
      active: d.active ?? null,
    },
  };
}
