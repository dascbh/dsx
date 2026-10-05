// Sandbox init — detection. Reads the project (never writes) and proposes the "sandbox" config block.
// Phase 1 supports Vite + React; everything detected is shown before anything is written, and every guess can be
// corrected in .dsx/config.json afterwards.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { detectCodeDirs } from '../../ux-lint/lib/project-paths.mjs';

const posix = (p) => p.split('\\').join('/');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const SOURCE_EXT = /\.(m?[jt]sx?)$/;

function walk(dir, out = [], skip = /^(node_modules|dist|build|\.git|coverage|sandbox)$/) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (skip.test(e)) continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out, skip);
    else if (SOURCE_EXT.test(e)) out.push(p);
  }
  return out;
}

/** JSON with comments and trailing commas (tsconfig). */
export function readJsonc(text) {
  const noComments = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'])\/\/.*$/gm, '$1');
  return JSON.parse(noComments.replace(/,\s*([}\]])/g, '$1'));
}

export function findViteConfig(pkg) {
  return ['vite.config.ts', 'vite.config.mts', 'vite.config.js', 'vite.config.mjs'].map((f) => join(pkg, f)).find(existsSync) ?? null;
}

/** Plugin imports and the plugin list of the project's Vite config, to repeat them in the sandbox build. */
export function vitePlugins(viteText) {
  if (!viteText) return { imports: ["import react from '@vitejs/plugin-react';"], calls: ['react()'], skipped: [] };
  const imports = [...viteText.matchAll(/^import\s+[^;]+?\s+from\s+['"]([^'"]+)['"];?\s*$/gm)]
    .filter((m) => /plugin|tailwind|svgr|vanilla-extract|linaria|emotion|macros/.test(m[1]) && m[1] !== 'vite')
    .map((m) => m[0].trim().replace(/;?$/, ';'));
  const imported = new Set();
  for (const line of imports) {
    const clause = line.replace(/^import\s+/, '').replace(/\s+from\s+['"][^'"]+['"];?$/, '');
    const def = clause.match(/^([A-Za-z_$][\w$]*)/);
    if (def) imported.add(def[1]);
    for (const n of (clause.match(/\{([^}]*)\}/)?.[1] ?? '').split(',')) { const id = n.trim().split(/\s+as\s+/).pop(); if (id) imported.add(id); }
  }
  const list = viteText.match(/plugins\s*:\s*\[([\s\S]*?)\]\s*,?\s*\n/);
  const all = list ? list[1].split(/,(?![^(]*\))/).map((s) => s.trim()).filter(Boolean) : ['react()'];
  // Only plugins imported from a package go to the sandbox; plugins defined in the config itself are usually production
  // guards (host formats, env checks) and conditional entries depend on the mode: both are left out and reported.
  const calls = [], skipped = [];
  for (const c of all) (/^[A-Za-z_$][\w$]*\s*\(/.test(c) && imported.has(c.match(/^[A-Za-z_$][\w$]*/)[0]) ? calls : skipped).push(c);
  return { imports, calls, skipped };
}

/** Module entry of index.html (<script type="module" src="/src/main.tsx">). */
export function entryOf(pkg) {
  const html = read(join(pkg, 'index.html'));
  const m = html?.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i) ?? html?.match(/<script[^>]+src=["']([^"']+)["'][^>]+type=["']module["']/i);
  return m ? join(pkg, m[1].replace(/^\//, '')) : ['src/main.tsx', 'src/main.jsx', 'src/index.tsx'].map((f) => join(pkg, f)).find(existsSync) ?? null;
}

/** tsconfig paths ("@/*": ["./src/*"]) → { "@": "<pkg>/src" } relative to the project root. */
export function aliasesOf(pkg, root) {
  const out = {};
  for (const f of ['tsconfig.app.json', 'tsconfig.json']) {
    const t = read(join(pkg, f));
    if (!t) continue;
    let json;
    try { json = readJsonc(t); } catch { continue; }
    const co = json.compilerOptions ?? {};
    const baseUrl = join(pkg, co.baseUrl ?? '.');
    for (const [k, v] of Object.entries(co.paths ?? {})) {
      if (!k.endsWith('/*') || !Array.isArray(v) || !v[0]?.endsWith('/*')) continue;
      out[k.slice(0, -2)] = posix(relative(root, join(baseUrl, v[0].slice(0, -2))));
    }
    if (Object.keys(out).length) break;
  }
  return out;
}

const AUTH_SDKS = /amazon-cognito-identity-js|aws-amplify|@aws-amplify|@auth0|keycloak|firebase\/auth|oidc-client|react-oidc|next-auth|@azure\/msal|@supabase\/|@clerk\//;

/** Names a module exports (functions, consts, classes, re-export lists, default). */
export function exportedNames(text) {
  const names = new Set();
  for (const m of text.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|class|type|interface)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of text.matchAll(/export\s*\{([^}]+)\}/g)) for (const part of m[1].split(',')) { const n = part.trim().split(/\s+as\s+/).pop(); if (n) names.add(n); }
  if (/export\s+default\b/.test(text)) names.add('default');
  return [...names];
}

/** The app's auth module: best-scored file mentioning auth, with a provider/hook, preferably importing an IdP SDK. */
export function authCandidates(files, root) {
  const out = [];
  for (const f of files) {
    if (/\.(test|spec|stories)\./.test(f)) continue;
    const t = readFileSync(f, 'utf8');
    let score = 0;
    if (/auth|session|login/i.test(basename(f))) score += 2;
    if (AUTH_SDKS.test(t)) score += 4;
    if (/createContext/.test(t)) score += 1;
    if (/export\s+(function|const)\s+useAuth\b/.test(t)) score += 3;
    if (/export\s+(function|const)\s+\w*Auth\w*Provider\b/.test(t)) score += 3;
    if (/signIn|signOut|logout|login\(/.test(t)) score += 1;
    if (score >= 5) out.push({ file: posix(relative(root, f)), score, sdk: (t.match(AUTH_SDKS) ?? [null])[0], exports: exportedNames(t) });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** import.meta.env.VITE_* used in code, classified: API base URL, host, identity-provider setting or other. */
export function envUsage(files) {
  const vars = new Set();
  for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g)) vars.add(m[1]);
  const out = { api_bases: {}, hosts: [], auth: [], other: [] };
  for (const v of [...vars].sort()) {
    if (/COGNITO|AUTH0|KEYCLOAK|OIDC|OKTA|FIREBASE|MSAL|CLERK|SUPABASE|CLIENT_ID|USER_POOL|CLIENT_SECRET|ISSUER|REALM/.test(v)) out.auth.push(v);
    else if (/_HOST$/.test(v)) out.hosts.push(v);
    else if (/(_URL|_BASE|_BASE_URL|_ENDPOINT|_API)$/.test(v)) {
      let name = v.replace(/^VITE_/, '').replace(/(^|_)(BASE_URL|URL|BASE|ENDPOINT)$/, '').replace(/^API_?/, '').toLowerCase().replace(/_/g, '-');
      if (!name || name === 'api') name = 'api';
      while (out.api_bases[name]) name = `${name}-x`;
      out.api_bases[name] = v;
    } else out.other.push(v);
  }
  return out;
}

/** Hosts of URL values in the package's .env files (what the sandbox build must never contain). */
export function realHosts(pkg) {
  const hosts = new Set();
  for (const f of readdirSync(pkg).filter((n) => /^\.env(\..+)?$/.test(n) && !n.endsWith('.example'))) {
    for (const m of readFileSync(join(pkg, f), 'utf8').matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
      if (!/localhost|127\.0\.0\.1|\.invalid$|\.test$|\.example$/.test(m[1])) hosts.add(m[1].toLowerCase());
    }
  }
  return [...hosts].sort();
}

/** Capture data (<area>.data.ts) that still imports from './environment' (Vitest): needs a redirect in the sandbox. */
export function captureData(pkg, root) {
  const out = { dirs: [], legacy_imports: [] };
  for (const f of walk(join(pkg, 'tests')).concat(walk(join(pkg, 'test')))) {
    if (!/\.data\.tsx?$/.test(f) && !/fake-api\.ts$/.test(f)) continue;
    const dir = posix(relative(root, dirname(f)));
    if (!out.dirs.includes(dir)) out.dirs.push(dir);
    if (/from\s+['"]\.\/environment['"]/.test(readFileSync(f, 'utf8')) && !out.legacy_imports.includes(dir)) out.legacy_imports.push(dir);
  }
  return out;
}

/** KEY=value pairs of the package's .env files (later files win; .example skipped). */
export function envValues(pkg) {
  const out = {};
  for (const f of readdirSync(pkg).filter((n) => /^\.env(\..+)?$/.test(n) && !n.endsWith('.example')).sort()) {
    for (const m of readFileSync(join(pkg, f), 'utf8').matchAll(/^\s*([A-Z0-9_]+)\s*=\s*['"]?([^'"\n#]*)['"]?/gm)) out[m[1]] = m[2].trim();
  }
  return out;
}

/** Anchored regex literals (/^…$/flags) in a text. */
export function anchoredRegexes(text) {
  const out = [];
  for (const m of text.matchAll(/\/(\^(?:[^/\\\n]|\\.)+\$)\/([gimsuy]*)/g)) { try { out.push(new RegExp(m[1], m[2])); } catch { /* not a regex */ } }
  return out;
}

/**
 * Host env vars the code validates with a regex: a "<name>.sandbox.invalid" value would be refused by the app itself.
 * Proposes a fictitious host that passes (the .env value with its long digit runs zeroed, then every digit) or none.
 */
export function hostValidations(hostVars, texts, env) {
  const out = {};
  for (const v of hostVars) {
    // Only regexes that spell a host (an escaped dot before a domain label): header or charset checks do not count.
    const regexes = texts.filter((t) => t.text.includes(v)).flatMap((t) => anchoredRegexes(t.text).filter((re) => /\\\.[a-z]{2,}/i.test(re.source)).map((re) => ({ re, file: t.file })));
    if (!regexes.length) continue;
    const real = env[v] ?? '';
    const candidates = real ? [real.replace(/\d{4,}/g, (d) => '0'.repeat(d.length)), real.replace(/\d/g, '0')] : [];
    const passes = (h) => regexes.some(({ re }) => { re.lastIndex = 0; return re.test(h); });
    const value = candidates.find((c) => c !== real && passes(c)) ?? null;
    out[v] = { files: [...new Set(regexes.map((r) => r.file))], patterns: [...new Set(regexes.map((r) => String(r.re)))], value };
  }
  return out;
}

/** Claim names the code reads from the token (namespaced ones like "cognito:groups", "custom:tenant_id", or roles/groups). */
export function claimUsage(files) {
  const claims = new Set();
  const groupValues = new Set();
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    const found = [...t.matchAll(/['"`]((?:cognito|custom|https?:\/\/[\w.-]+\/[\w/-]*)[:/][\w:-]+)['"`]/g)].map((m) => m[1]).filter((c) => !/^https?:\/\/[^/]+\/?$/.test(c));
    for (const c of found) claims.add(c);
    if (!found.length && !/\b(claims|payload|decoded|idToken|jwt)\b/i.test(t)) continue;
    for (const m of t.matchAll(/\b(?:claims|payload|decoded|token)\s*(?:\?\.)?\s*(?:\.\s*(groups|roles|permissions|scope)\b|\[\s*['"](groups|roles|permissions|scope)['"]\s*\])/g)) claims.add(m[1] ?? m[2]);
    // group/role names compared in the same file: includes('X'), === 'X'
    if (/groups|roles/.test(t)) for (const m of t.matchAll(/(?:includes\(\s*|===\s*|some\(\s*\w+\s*=>\s*\w+\s*===\s*)['"]([A-Za-z][\w -]{1,40})['"]/g)) groupValues.add(m[1]);
  }
  return { claims: [...claims].sort(), group_values: [...groupValues].sort() };
}

/** Error codes the code branches on for a denial (…FORBIDDEN…, …ACCESS_DENIED…): the forbidden scenario must send one. */
export function denialCodes(files) {
  const codes = new Set();
  const CODE = '[A-Z][A-Z0-9_]*(?:FORBIDDEN|ACCESS_DENIED|NOT_ALLOWED|NO_ACCESS)[A-Z0-9_]*';
  // quoted literals ('ORG_FORBIDDEN') and object keys of code maps ({ ORG_FORBIDDEN: … })
  const re = new RegExp(`['"](${CODE})['"]|(?:^|[{,\\s])(${CODE})\\s*:(?!:)`, 'gm');
  for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(re)) codes.add(m[1] ?? m[2]);
  return [...codes].sort();
}

/** API paths called by providers and layout/shell files: they must keep answering under error/forbidden. */
export function shellCalls(files, root, authFile) {
  const out = new Set();
  for (const f of files) {
    const rel = posix(relative(root, f));
    if (rel === authFile || /\.(test|spec|stories)\./.test(f)) continue;
    const t = readFileSync(f, 'utf8');
    const isShell = /(Provider|Context|Layout|Shell|Header|AppBar)\.[jt]sx?$/.test(f) || /export\s+(function|const)\s+\w*Provider\b/.test(t);
    if (!isShell) continue;
    for (const m of t.matchAll(/\b(?:\w*[Ff]etch\w*|get|post|request|api\w*|http\w*)\s*(?:<[^>]*>)?\(\s*[`'"](\/[\w\-/${}.:]*)[`'"]/g)) {
      const p = m[1].replace(/\$\{[^}]+\}/g, ':param').split('?')[0];
      if (p.length > 1) out.add(p);
    }
  }
  return [...out].sort();
}

/**
 * Design docs the DESIGN.md / UX.md point to (an index DESIGN.md often delegates to design/foundation.md…): the exact
 * Markdown files cited, outside the front package — code paths cited as examples are already mirrored through src.
 */
export function referencedDocs(root, pkg) {
  const out = new Set();
  const pkgRel = posix(relative(root, pkg));
  for (const doc of ['DESIGN.md', 'UX.md']) {
    const t = read(join(root, doc));
    if (!t) continue;
    for (const m of t.matchAll(/\]\(\s*(?:\.\/)?([\w.-][\w./-]*)\s*(?:#[^)]*)?\)|`(?:\.\/)?([\w-]+\/[\w./-]+)`/g)) {
      const p = (m[1] ?? m[2]).replace(/\/$/, '');
      if (!/\.md$/i.test(p) || /^https?:|^\.\.|^node_modules|^\.dsx/.test(p) || p === 'DESIGN.md' || p === 'UX.md') continue;
      if (pkgRel && pkgRel !== '.' && (p === pkgRel || p.startsWith(`${pkgRel}/`))) continue;
      const abs = join(root, p);
      if (existsSync(abs) && statSync(abs).isFile()) out.add(p);
    }
  }
  return [...out].sort();
}

/** A sandbox folder that DSX did not generate (another harness, a previous hand-made one). */
export function foreignHarness(dir) {
  if (!existsSync(dir) || !readdirSync(dir).length) return null;
  const vite = read(join(dir, 'vite.sandbox.config.ts'));
  if (vite && /DSX sandbox/.test(vite)) return null;
  return { entries: readdirSync(dir).sort() };
}

/** Everything init needs, plus what it could not decide (warnings). */
export function detect(root, { pkg: pkgArg = null } = {}) {
  const warnings = [];
  let pkg = pkgArg ? join(root, pkgArg) : null;
  if (!pkg) {
    const src = detectCodeDirs(root)[0];
    pkg = src ? dirname(src) : root;
  }
  const pkgJson = read(join(pkg, 'package.json'));
  const deps = pkgJson ? { ...JSON.parse(pkgJson).dependencies, ...JSON.parse(pkgJson).devDependencies } : {};
  const viteConfig = findViteConfig(pkg);
  if (!viteConfig) warnings.push('no vite.config found: phase 1 supports Vite projects only');
  if (!deps.react) warnings.push('react not in package.json: the panel and fake auth templates are React');
  const entry = entryOf(pkg);
  if (!entry) warnings.push('module entry not found in index.html');
  const srcDir = detectCodeDirs(root).find((d) => d.startsWith(pkg)) ?? join(pkg, 'src');
  const files = walk(srcDir);
  const auth = authCandidates(files, root);
  if (!auth.length) warnings.push('no auth module found: set sandbox.swaps by hand if the app needs a session');
  const env = envUsage(files);
  if (!Object.keys(env.api_bases).length) warnings.push('no API base env var (import.meta.env.VITE_*_URL) found: set sandbox.api_bases by hand');
  const capture = captureData(pkg, root);
  const rel = (p) => posix(relative(root, p)) || '.';
  const viteText = viteConfig ? read(viteConfig) : null;
  const plugins = vitePlugins(viteText);
  for (const s of plugins.skipped) warnings.push(`vite plugin left out of the sandbox build (defined in the config or conditional — a production guard?): ${s}`);
  const envVals = envValues(pkg);
  const texts = [...files, ...(viteConfig ? [viteConfig] : [])].map((f) => ({ file: rel(f), text: readFileSync(f, 'utf8') }));
  const host_validations = hostValidations(env.hosts, texts, envVals);
  for (const [v, h] of Object.entries(host_validations)) {
    if (!h.value) warnings.push(`BLOCKING ${v} is validated by ${h.patterns.join(' ')} in ${h.files.join(', ')}: set sandbox.env.${v} (and sandbox.fictitious_hosts) to a fictitious host that passes it`);
  }
  const hostValues = env.hosts.map((v) => envVals[v]).filter((h) => h && !/localhost|127\.0\.0\.1|\.invalid$/.test(h));
  const claims = claimUsage(files);
  const denial_codes = denialCodes(files);
  const shell_calls = shellCalls(files, root, auth[0]?.file ?? null);
  const fixtures = ['tests/fixtures', 'test/fixtures'].map((f) => join(pkg, f)).filter(existsSync).map(rel);
  let vitestConfig = ['vitest.config.ts', 'vitest.config.mts', 'vitest.config.js'].map((f) => join(pkg, f)).find(existsSync) ?? null;
  if (!vitestConfig && viteText && /\btest\s*:\s*\{/.test(viteText)) vitestConfig = viteConfig;
  return {
    root, package: rel(pkg), src: rel(srcDir), vite_config: viteConfig ? rel(viteConfig) : null,
    stack: { react: !!deps.react, mui: !!deps['@mui/material'], tailwind: !!(deps.tailwindcss || deps['@tailwindcss/vite']), vitest: !!deps.vitest },
    entry: entry ? rel(entry) : null,
    public_dir: existsSync(join(pkg, 'public')) ? rel(join(pkg, 'public')) : null,
    index_html: existsSync(join(pkg, 'index.html')) ? rel(join(pkg, 'index.html')) : null,
    aliases: aliasesOf(pkg, root),
    plugins,
    auth, env, real_hosts: [...new Set([...realHosts(pkg), ...hostValues])].sort(), capture, host_validations,
    claims, denial_codes, shell_calls, fixtures, referenced_docs: referencedDocs(root, pkg),
    foreign_harness: foreignHarness(join(pkg, 'sandbox')),
    package_json: pkgJson ? rel(join(pkg, 'package.json')) : null,
    design_md: existsSync(join(root, 'DESIGN.md')), ux_md: existsSync(join(root, 'UX.md')),
    eslint_config: ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.ts'].map((f) => join(pkg, f)).find(existsSync) ?? null,
    vitest_config: vitestConfig,
    warnings,
  };
}
