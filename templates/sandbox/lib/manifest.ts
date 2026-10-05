// DSX sandbox — live design-lab manifest built from the MIRROR's DESIGN.md and design options.
// Same shape as `tools/design-md/lib/options.mjs buildManifest` (kind dsx-design-options, format 1); a DSX test keeps
// both in parity. Node-only (vite.sandbox.config.ts).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export const NAME_RE = /^[a-z0-9][a-z0-9-]{0,47}$/;
export const PREVIOUS_RE = /^previous-\d{4}-\d{2}-\d{2}(-\d+)?$/;

export type ManifestEntry = { name: string; label: string; source: string; markdown: string };
export type Manifest = { format: 1; kind: 'dsx-design-options'; active: string | null; official: ManifestEntry | null; options: ManifestEntry[] };

/** The `name:` of a DESIGN.md front matter (plain, single- or double-quoted), or null. */
export function frontMatterName(md: string): string | null {
  const m = md.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const line = m[1].split('\n').find((l) => /^name:\s*\S/.test(l));
  if (!line) return null;
  let v = line.replace(/^name:\s*/, '').replace(/\s+#.*$/, '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v || null;
}

/** root = the mirror root (sources are relative to it, exactly like the official manifest relative to the project). */
export function buildManifest({ root, official, optionsDir, active }: { root: string; official: string; optionsDir: string; active: string | null }): Manifest {
  const entry = (name: string, file: string): ManifestEntry => {
    const markdown = readFileSync(file, 'utf8');
    return { name, label: frontMatterName(markdown) ?? name, source: relative(root, file).split('\\').join('/'), markdown };
  };
  const names = existsSync(optionsDir)
    ? readdirSync(optionsDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).filter((n) => NAME_RE.test(n) && !PREVIOUS_RE.test(n)).sort()
    : [];
  return {
    format: 1,
    kind: 'dsx-design-options',
    active: active ?? null,
    official: existsSync(official) ? entry('official', official) : null,
    options: names.map((n) => entry(n, join(optionsDir, `${n}.md`))),
  };
}
