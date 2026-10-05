// Sandbox configuration: the "sandbox" block of <root>/.dsx/config.json, with defaults and absolute paths.
// templates/sandbox/lib/settings.ts reads the same block for the Vite build (keep the defaults in sync).
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { configFileFor, readConfigFile } from '../../ux-lint/lib/project-paths.mjs';

export const SANDBOX_DEFAULTS = Object.freeze({
  package: '.',
  dir: 'sandbox',
  items: ['src', 'public', 'DESIGN.md', 'UX.md', '.dsx/design-options'],
  filters: {},
  ignore: ['.DS_Store', 'node_modules', 'variants'],
  synthetic: {},
  storage_key: 'dsx-sandbox',
  default_scenario: 'normal',
  latency_ms: 250,
  slow_ms: 2500,
});

export const BASE_FILE = '.dsx-base.json';

/** root, config file, the raw block and absolute paths. `block` overrides what is on disk (used by init before writing). */
export function sandboxConfig(root, { config = null, env = process.env, block = null } = {}) {
  const base = resolve(root ?? process.cwd());
  const configFile = configFileFor(base, config, env);
  const cfg = readConfigFile(configFile) ?? {};
  const s = { ...SANDBOX_DEFAULTS, ...(block ?? cfg.sandbox ?? {}) };
  const dir = resolve(base, s.dir);
  const mirror = resolve(base, s.mirror ?? join(s.dir, 'mirror'));
  return {
    root: base, configFile, config: cfg, raw: s, configured: !!(block ?? cfg.sandbox),
    dir, mirror, baseFile: join(mirror, BASE_FILE), dist: join(dir, 'dist'),
    packageDir: resolve(base, s.package),
    items: s.items, filters: s.filters ?? {}, ignore: s.ignore ?? [], synthetic: s.synthetic ?? {},
    // A fictitious host may look real (it must pass the app's own format check); it is never a real host to refuse.
    realHosts: (s.real_hosts ?? []).filter((h) => !(s.fictitious_hosts ?? []).includes(h)),
    viteConfig: join(dir, 'vite.sandbox.config.ts'),
    design: { manifest: cfg.design?.manifest ?? null },
  };
}

export const hasMirror = (sc) => existsSync(sc.baseFile);
