// DSX theme switcher — which design option is active (pure logic, no framework). Copy with the other switcher files.
//
// Order: ?ds=<name> in the URL > the last choice remembered in this browser > design.active of the manifest > official.
// A name that is not in the manifest is ignored at every step. Storage access is wrapped: private windows and
// blocked storage make it throw, and the switcher must still work (it just forgets the choice).

export const STORAGE_KEY = 'dsx-design-lab:active';
export const URL_PARAM = 'ds';
export const OFFICIAL = 'official';

export interface DesignOptionEntry { name: string; label: string; source: string; markdown: string }
/** Written by `node <DSX>/tools/design-md/lab.mjs manifest` (also refreshed by `add` and `use`). */
export interface DesignManifest {
  format: 1;
  kind: 'dsx-design-options';
  active: string | null;
  official: DesignOptionEntry | null;
  options: DesignOptionEntry[];
}

/** Text of the floating selector (the switcher is a developer tool; pass the product's language if you prefer). */
export interface DesignLabLabels { badge: string; choose: string; official: string; close: string; hint: string }
export const DEFAULT_LABELS: DesignLabLabels = {
  badge: 'Design', choose: 'Design option', official: 'Official', close: 'Close', hint: 'Development only. Also ?ds=<name> in the URL.',
};

export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }

const known = (m: DesignManifest, name: string | null | undefined): name is string =>
  !!name && (name === OFFICIAL || m.options.some((o) => o.name === name));

/** The option to show for this manifest, URL query and remembered choice. */
export function chooseOption(manifest: DesignManifest, { search = '', stored = null }: { search?: string; stored?: string | null } = {}): string {
  const fromUrl = new URLSearchParams(search).get(URL_PARAM);
  if (known(manifest, fromUrl)) return fromUrl;
  if (known(manifest, stored)) return stored;
  if (known(manifest, manifest.active)) return manifest.active;
  return OFFICIAL;
}

export function readStored(storage?: StorageLike | null): string | null {
  try { return (storage ?? globalThis.localStorage)?.getItem(STORAGE_KEY) ?? null; } catch { return null; }
}

export function writeStored(name: string, storage?: StorageLike | null): void {
  try {
    const s = storage ?? globalThis.localStorage;
    if (!s) return;
    if (name === OFFICIAL) s.removeItem(STORAGE_KEY); else s.setItem(STORAGE_KEY, name);
  } catch { /* storage blocked: the choice lasts until the page reloads */ }
}

/** Same URL with ?ds=<name> (removed for official), other query parameters and the hash kept. */
export function urlWith(href: string, name: string): string {
  const u = new URL(href);
  if (name === OFFICIAL) u.searchParams.delete(URL_PARAM); else u.searchParams.set(URL_PARAM, name);
  return u.toString();
}

/** Entry of a name (official included), or null. */
export function entryOf(manifest: DesignManifest, name: string): DesignOptionEntry | null {
  if (name === OFFICIAL) return manifest.official;
  return manifest.options.find((o) => o.name === name) ?? null;
}
