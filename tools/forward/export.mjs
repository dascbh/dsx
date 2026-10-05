#!/usr/bin/env node
// DSX artifacts → Forward artifacts, at Forward's paths and in Forward's formats. No dependencies.
//
//   node tools/forward/export.mjs findings --from-registry <findings.json | dir> --id <demand-id> [--out <project>]
//        [--status open,decided,regression] [--min-severity 1] [--max-findings 5] [--kind adversarial]
//        [--criteria <criteria.json>] [--commit <sha>] [--stdout] [--force]
//      → <project>/reviews/<id>/findings.toml (templates/findings.template.toml; fde-review cap and blocking rule)
//   node tools/forward/export.mjs variations --manifest <variations.json> --id <demand-id> [--decision <decision.json>]
//        [--lens a=subtract,b=invert] [--hmw "first framing|second framing"] [--out <project>] [--stdout] [--force]
//        [--allow-incomplete]
//      → <project>/specs/<id>/design/alternatives.md (the divergence gate's artifact)
//   node tools/forward/export.mjs ux-md --ux <UX.md> [--module <m>] [--out <project>] [--stdout] [--force]
//      → <project>/design/product.md (only when absent; otherwise printed for a manual merge)
//
// `--max-findings` defaults to [review] max_findings of <project>/fde.config.toml when present, else 5. An existing
// review record is never overwritten without --force: a findings.toml is the reviewer's record (I3).
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { parseToml } from './lib/toml-lite.mjs';
import { registryToReview, renderReviewToml, DEFAULT_STATUSES, DEFAULT_MAX_FINDINGS } from './lib/findings-toml.mjs';
import { renderAlternatives, checkAlternatives } from './lib/alternatives.mjs';
import { readUxMd, renderProductMd } from './lib/product-md.mjs';

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Registry file from a path: the file itself, or <dir>/findings.json. */
export function registryFile(p) {
  const abs = resolve(p);
  return isDir(abs) ? join(abs, 'findings.json') : abs;
}

/** [review] max_findings from a Forward project's fde.config.toml, or null. */
export function projectMaxFindings(project) {
  const f = join(project, 'fde.config.toml');
  if (!existsSync(f)) return null;
  try { const n = parseToml(readFileSync(f, 'utf8')).review?.max_findings; return Number.isInteger(n) && n > 0 ? n : null; } catch { return null; }
}

/** Parses "a=subtract,b=invert". */
export const parsePairs = (s) => Object.fromEntries(String(s ?? '').split(',').map((p) => p.split('=').map((x) => x.trim())).filter(([k, v]) => k && v));

function writeOut(file, text, { force = false, stdout = false } = {}) {
  if (stdout) { process.stdout.write(text); return { written: false }; }
  if (existsSync(file) && !force) return { written: false, exists: true };
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
  return { written: true };
}

export function exportFindings(args) {
  const src = registryFile(args['from-registry']);
  if (!existsSync(src)) throw new Error(`registry not found: ${src}`);
  if (!args.id || !ID_RE.test(args.id)) throw new Error('--id <demand-id> is required (letters, digits, . _ -)');
  const out = resolve(typeof args.out === 'string' ? args.out : '.');
  const reg = readJson(src);
  const statuses = typeof args.status === 'string' ? args.status.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_STATUSES;
  const criteria = typeof args.criteria === 'string' ? readJson(resolve(args.criteria)) : {};
  const review = registryToReview(reg, {
    demandId: args.id, kind: typeof args.kind === 'string' ? args.kind : 'adversarial', statuses,
    minSeverity: args['min-severity'] !== undefined ? Number(args['min-severity']) : 1,
    maxFindings: args['max-findings'] !== undefined ? Number(args['max-findings']) : projectMaxFindings(out) ?? DEFAULT_MAX_FINDINGS,
    criteria: criteria.criteria ?? criteria, commit: typeof args.commit === 'string' ? args.commit : null,
    registryPath: relative(process.cwd(), src) || src,
  });
  const file = join(out, 'reviews', args.id, 'findings.toml');
  const text = renderReviewToml(review);
  return { file, text, review, ...writeOut(file, text, { force: !!args.force, stdout: !!args.stdout }) };
}

export function exportVariations(args) {
  const manifestFile = resolve(args.manifest ?? '');
  if (!args.manifest || !existsSync(manifestFile)) throw new Error(`--manifest <variations.json> not found: ${args.manifest ?? ''}`);
  if (!args.id || !ID_RE.test(args.id)) throw new Error('--id <demand-id> is required');
  const m = readJson(manifestFile);
  const decisionFile = typeof args.decision === 'string' ? resolve(args.decision) : join(dirname(manifestFile), 'decision.json');
  const decision = existsSync(decisionFile) ? readJson(decisionFile) : null;
  const hmw = typeof args.hmw === 'string' ? args.hmw.split('|').map((s) => s.trim()).filter(Boolean) : null;
  const r = renderAlternatives(m, decision, { lenses: parsePairs(args.lens), hmw });
  const out = resolve(typeof args.out === 'string' ? args.out : '.');
  const file = join(out, 'specs', args.id, 'design', 'alternatives.md');
  // the gate's own check (parity with design.py), at the strictest size, on top of the view's problems
  for (const b of checkAlternatives(r.text, 2)) if (!r.problems.includes(b)) r.problems.push(`gate check: ${b}`);
  if (r.problems.length && !args['allow-incomplete']) return { file, text: r.text, problems: r.problems, written: false, blocked: true };
  return { file, text: r.text, problems: r.problems, ...writeOut(file, r.text, { force: !!args.force, stdout: !!args.stdout }) };
}

export function exportUxMd(args) {
  const ux = resolve(args.ux ?? 'UX.md');
  if (!existsSync(ux)) throw new Error(`UX.md not found: ${ux}`);
  const data = readUxMd(ux, { module: typeof args.module === 'string' ? args.module : null });
  const out = resolve(typeof args.out === 'string' ? args.out : '.');
  const inside = relative(out, ux);
  const text = renderProductMd(data, { source: inside && !inside.startsWith('..') ? inside : relative(process.cwd(), ux) || 'UX.md' });
  const file = join(out, 'design', 'product.md');
  return { file, text, warnings: data.warnings, ...writeOut(file, text, { force: !!args.force, stdout: !!args.stdout }) };
}

function main() {
  const [cmd] = process.argv.slice(2);
  const args = parseArgs(process.argv.slice(3));
  const usage = () => { console.error(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(1, 15).map((l) => l.slice(3)).join('\n')); process.exit(2); };
  if (!['findings', 'variations', 'ux-md'].includes(cmd)) usage();
  let r;
  try {
    r = cmd === 'findings' ? exportFindings(args) : cmd === 'variations' ? exportVariations(args) : exportUxMd(args);
  } catch (e) { console.error(`✗ ${e.message}`); process.exit(2); }
  for (const w of r.warnings ?? []) console.error(`! ${w}`);
  if (cmd === 'findings') {
    const s = r.review;
    console.error(`${s.findings.length} [[finding]] (cap), ${s.notes.length} note line(s), ${s.skipped.length} not exported${s.skipped.length ? `: ${s.skipped.slice(0, 3).map((x) => `${x.id} (${x.why})`).join('; ')}` : ''}`);
  }
  for (const p of r.problems ?? []) console.error(`✗ ${p}`);
  if (r.blocked) { console.error('nothing written: fix the manifest or pass the missing data (--lens, --hmw, --decision), or --allow-incomplete'); process.exit(1); }
  if (r.exists) { console.error(`${r.file} exists and was not overwritten (--force to replace${cmd === 'ux-md' ? '; merge the text below by hand' : ''})`); if (cmd === 'ux-md') process.stdout.write(r.text); process.exit(cmd === 'ux-md' ? 0 : 1); }
  if (r.written) console.error(`✓ ${r.file}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
