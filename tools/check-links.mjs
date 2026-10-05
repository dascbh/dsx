#!/usr/bin/env node
// Checks internal references in every DSX .md:
//  - relative Markdown links [text](path.md#anchor) → the file exists (relative to the file)
//  - paths cited in code spans `knowledge/…`, `patterns/…`, `templates/…`, `tools/…`, `skills/…`,
//    `agents/…`, `evals/…`, `examples/…`, `tokens/…`, `docs/…`, `archetypes/…`, `references/…`, `hooks/…` → they exist
//    (relative to the DSX root; except in docs/renames-*.md, which lists old paths on purpose)
// Usage: node tools/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOTS = ['knowledge', 'patterns', 'archetypes', 'references', 'templates', 'tools', 'skills', 'agents', 'evals', 'examples', 'tokens', 'docs', 'hooks'];
const SKIP = new Set(['node_modules', '.git', 'build']);

function* mdFiles(dir) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* mdFiles(p);
    else if (p.endsWith('.md')) yield p;
  }
}

export function checkLinks() {
  const broken = [];
  for (const file of mdFiles(ROOT)) {
    const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
    const rel = relative(ROOT, file);
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = m[1].split('#')[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      if (!existsSync(join(dirname(file), target))) broken.push(`${rel}: link → ${m[1]}`);
    }
    // Rename tables (docs/renames-*.md) cite paths that no longer exist on purpose.
    if (/^docs\/renames-[^/]+\.md$/.test(rel)) continue;
    for (const m of text.matchAll(/`((?:\.\.\/)*(?:[a-z-]+\/)*?(?:knowledge|patterns|archetypes|references|templates|tools|skills|agents|evals|examples|tokens|docs|hooks)\/[^`\s*<>{}]+?)`/g)) {
      let p = m[1].replace(/^(\.\.\/)+/, '');
      if (/[*<>]/.test(p) || p.includes('build/')) continue; // globs, placeholders and generated artifacts
      if (!ROOTS.some((r) => p.startsWith(r + '/'))) continue;
      p = p.replace(/[.,;:)]+$/, '');
      if (!existsSync(join(ROOT, p))) broken.push(`${rel}: caminho → ${m[1]}`);
    }
  }
  return broken;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const broken = checkLinks();
  for (const b of broken) console.log(`BROKEN  ${b}`);
  console.log(`${broken.length} broken reference(s).`);
  process.exit(broken.length ? 1 : 0);
}
