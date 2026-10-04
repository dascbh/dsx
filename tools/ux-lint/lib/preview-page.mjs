// Prévias na página de decisão: lê o manifesto do preview.mjs (`previews.json`), marca como desatualizada a prévia
// cuja captura mudou depois de gerada e liga cada caso da página às suas imagens (chave = arquivo em previews/).
// Sem dependências e sem navegador.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const sha1 = (b) => createHash('sha1').update(b).digest('hex');
const LETTER = (i) => String.fromCharCode(65 + i);

/** Manifesto com `stale` por caso (captura alterada ou ausente). Sem manifesto, null. */
export function loadPreviews(outDir, { screensDir = null } = {}) {
  const f = join(outDir, 'previews.json');
  if (!existsSync(f)) return null;
  let m;
  try { m = JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
  const dir = screensDir ?? m.screens_dir;
  const cache = new Map();
  const cur = (s) => {
    if (!cache.has(s)) { const p = dir ? join(dir, `${s}.html`) : null; cache.set(s, p && existsSync(p) ? sha1(readFileSync(p)) : null); }
    return cache.get(s);
  };
  for (const e of Object.values(m.cases ?? {})) {
    if (e.capture_hashes && e.screen && e.capture_hashes[e.screen] !== undefined && dir) e.stale = cur(e.screen) !== e.capture_hashes[e.screen];
  }
  return { ...m, dir: outDir };
}

const describeTarget = (c, screen) => {
  const el = { button: 'botão', title: 'título', label: 'rótulo', helper: 'texto de apoio', alert: 'alerta', tab: 'aba', menu: 'item de menu', cell: 'célula', placeholder: 'texto dentro do campo' }[c.element];
  const what = c.family === 'flow' ? `transições da tela "${screen}" no mapa de fluxo` : c.family === 'states' || !el ? `tela ${screen}` : `${el} "${String(c.text).slice(0, 60)}" na tela ${screen}`;
  return what;
};

/**
 * Liga os casos às prévias: `c.preview = { before, after: [{ option, key, alt, label, note, failed }], failed?, stale? }`.
 * `key` é o nome do arquivo em `manifest.dir`. Casos sem entrada no manifesto ficam sem `preview`.
 */
export function attachPreviews(cases, manifest) {
  if (!manifest) return cases;
  for (const c of cases) {
    const e = manifest.cases?.[c.id];
    if (!e) continue;
    if (e.failed) { c.preview = { failed: e.failed }; continue; }
    if (e.stale) { c.preview = { failed: 'prévia desatualizada: a captura mudou depois de gerada; rode preview.mjs de novo' }; continue; }
    const target = describeTarget(c, e.screen);
    const before = e.before?.file ? { key: e.before.file, alt: `Hoje: ${target}${e.kind === 'element' ? ', contornado em vermelho' : ''}` } : null;
    const after = (e.after ?? []).map((a) => {
      const who = a.option === null || a.option === undefined ? `Correção indicada pela regra (${a.label ?? ''})` : `Opção ${LETTER(a.option)}`;
      return a.file
        ? { option: a.option ?? null, key: a.file, label: a.label ?? null, note: a.note ?? null, type: a.kind_label ?? null, alt: `${who} aplicada: ${a.description ?? ''}${e.kind === 'element' ? '; elemento alterado contornado em verde' : ''}` }
        : { option: a.option ?? null, label: a.label ?? null, failed: a.failed };
    });
    c.preview = { before, after, kind: e.kind };
  }
  return cases;
}

/** Chaves de imagem que um caso usa. */
export const previewKeys = (c) => [c.preview?.before?.key, ...(c.preview?.after ?? []).map((a) => a.key)].filter(Boolean);

/** Bytes que a imagem ocupa embutida (base64 ou SVG inline). */
export function embeddedSize(dir, key) {
  const p = join(dir, key);
  if (!existsSync(p)) return 0;
  const n = readFileSync(p).length;
  return key.endsWith('.svg') ? n : Math.ceil(n / 3) * 4 + 30;
}

/** Conteúdo embutido: data URI (imagem) ou marcação (SVG, com ids de marcador únicos por uso). */
export function embedded(dir, key) {
  const p = join(dir, key);
  if (!existsSync(p)) return null;
  const buf = readFileSync(p);
  if (key.endsWith('.svg')) return { svg: buf.toString('utf8') };
  const type = key.endsWith('.webp') ? 'image/webp' : key.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return { uri: `data:${type};base64,${buf.toString('base64')}` };
}
