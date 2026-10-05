// DSX capture-from-code — serializer. Copy into the project's test folder (e.g. tests/capture/serialize.ts).
//
// Turns the current jsdom document into one self-contained static HTML file: every stylesheet the app injected
// (CSS-in-JS such as emotion/styled-components/stitches, CSS modules and Tailwind processed by Vitest, inline
// <style>), the <body> without scripts, images as data URIs, field values copied from DOM properties, and the
// known fixes for what jsdom cannot lay out. No server, no browser.
//
// Adapt only the CONFIG block below; everything else is generic.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

// ---------------------------------------------------------------- CONFIG (per project)
export const CAPTURE_CONFIG = {
  /** Folder served as "/" by the dev server (images referenced as src="/logo.png"). */
  publicDir: resolve(process.cwd(), 'public'),
  /** Output folder (docs/project-paths.md: default .dsx/captures/<module> at the project root). Override with DSX_CAPTURE_DIR. */
  outDir: process.env.DSX_CAPTURE_DIR ?? resolve(process.cwd(), '..', '.dsx', 'captures', process.env.DSX_CAPTURE_MODULE ?? 'app'),
  /** <html lang> of the capture: the language of the product's interface. */
  lang: 'en',
  /** Web fonts the app loads in index.html (copied as <link>), e.g. Google Fonts URLs. */
  fonts: [] as string[],
  /** Extra CSS files inlined as they are (compiled Tailwind output, a global stylesheet Vitest does not process). */
  extraCss: [] as string[],
  /** Element that scrolls in the app shell; it grows with the content so the capture is the whole page. */
  mainSelector: 'main',
  /** Overlay roots that are position:fixed in the app (portal containers of dialogs, drawers, menus). */
  overlaySelectors: '[role=dialog], [role=alertdialog], .MuiModal-root, [data-radix-portal], .ant-modal-root, .chakra-portal, .modal',
  /** Dimmed backgrounds of dialogs (they must cover the whole page, not the first fold). */
  backdropSelectors: '.MuiBackdrop-root, [data-radix-dialog-overlay], [data-slot=dialog-overlay], .ant-modal-mask, .chakra-modal__overlay, .modal-backdrop',
  /** Scrolling bodies inside dialogs (expanded with fullDialog). */
  dialogScrollSelectors: '.MuiDialogContent-root, .MuiDialog-paper, [data-slot=dialog-content], .ant-modal-body, .chakra-modal__body, .modal-body',
  /** Tab indicators drawn by measuring the DOM (width 0 in jsdom): hidden and replaced by an inset line on the selected tab. */
  tabIndicatorSelectors: '.MuiTabs-indicator, .ant-tabs-ink-bar',
};

// ---------------------------------------------------------------- generic part
const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon' };

/** File name convention read by the DSX tools: `<nn>-<screen>[.<state>].html`. */
export function captureName(nn: string | number, screen: string, state?: string) {
  const n = String(nn).padStart(2, '0');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(screen)) throw new Error(`screen id "${screen}": use lowercase letters, digits and hyphens`);
  if (state && !/^[a-z0-9][a-z0-9-]*$/.test(state)) throw new Error(`state "${state}": use lowercase letters, digits and hyphens (loading, empty, error, no-access…)`);
  return `${n}-${screen}${state ? `.${state}` : ''}.html`;
}

const dataUri = (file: string) => `data:${MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'};base64,${readFileSync(file).toString('base64')}`;
const publicFile = (src: string) => {
  if (!src.startsWith('/') || src.startsWith('//')) return null;
  const f = join(CAPTURE_CONFIG.publicDir, src.split(/[?#]/)[0]);
  return existsSync(f) ? f : null;
};

/** <img src="/x.png"> and CSS url(/x.png) from publicDir become data URIs: the HTML needs no server. */
function inlineImages(root: HTMLElement) {
  root.querySelectorAll('img[src], image[href], source[srcset]').forEach((n) => {
    const attr = n.hasAttribute('src') ? 'src' : n.hasAttribute('href') ? 'href' : 'srcset';
    const f = publicFile(n.getAttribute(attr) ?? '');
    if (f) n.setAttribute(attr, dataUri(f));
  });
}
const inlineCssUrls = (css: string) => css.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (m, q, p) => { const f = publicFile(p); return f ? `url("${dataUri(f)}")` : m; });

/** Text of a <style>: textContent, or the CSSOM rules when the library inserts with insertRule (emotion "speedy"). */
function cssOf(el: HTMLStyleElement): string {
  const text = el.textContent ?? '';
  if (text.trim()) return text;
  try { return Array.from(el.sheet?.cssRules ?? []).map((r) => r.cssText).join('\n'); } catch { return ''; }
}

/** What the user typed or chose lives in DOM properties, not in the HTML: copy it to attributes/content. */
function copyFieldValues(original: HTMLElement, copy: HTMLElement) {
  const from = original.querySelectorAll('input, textarea, select');
  const to = copy.querySelectorAll('input, textarea, select');
  from.forEach((el, i) => {
    const target = to[i] as HTMLElement | undefined;
    if (!target) return;
    if (el instanceof HTMLTextAreaElement) {
      target.textContent = el.value;
      // auto-sizing textareas measure themselves (height 0 in jsdom): drop the inline height, fall back to rows
      if (/height:\s*0/.test(target.getAttribute('style') ?? '') || el.getAttribute('aria-hidden') === 'true') target.style.removeProperty('height');
      if (!target.getAttribute('rows')) target.setAttribute('rows', String(Math.max(2, el.value.split('\n').length)));
    } else if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) target.setAttribute('checked', ''); else target.removeAttribute('checked'); }
      else if (el.type !== 'file' && el.type !== 'password') target.setAttribute('value', el.value);
    } else if (el instanceof HTMLSelectElement) {
      target.querySelectorAll('option').forEach((op, k) => { if (k === el.selectedIndex) op.setAttribute('selected', ''); else op.removeAttribute('selected'); });
    }
  });
}

/** Direct child of the body that contains `el` (the portal container of an overlay, or the app shell). */
function topOf(el: HTMLElement, root: HTMLElement): HTMLElement {
  let top = el;
  while (top.parentElement && top.parentElement !== root) top = top.parentElement;
  return top;
}

/** Whole page: the scrolling main and its ancestors grow with the content (wide tables keep scrolling sideways). */
function releaseHeight(root: HTMLElement) {
  const main = root.querySelector<HTMLElement>(CAPTURE_CONFIG.mainSelector);
  for (let el = main; el && el !== root; el = el.parentElement) {
    el.style.setProperty('height', 'auto', 'important');
    el.style.setProperty('min-height', '100vh');
    el.style.setProperty('overflow', el === main ? 'auto' : 'visible', 'important');
    if (el === main) el.style.setProperty('min-width', '0');
  }
  // with a page taller than the window, a position:fixed overlay would cover only the first fold
  root.style.setProperty('position', 'relative');
  const shell = main ? topOf(main, root) : null;
  root.querySelectorAll<HTMLElement>(CAPTURE_CONFIG.overlaySelectors).forEach((dialog) => {
    const top = topOf(dialog, root);
    if (top === shell) return; // dialog rendered inline inside the app shell, not in a portal
    Object.assign(top.style, { position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' });
  });
  root.querySelectorAll<HTMLElement>(CAPTURE_CONFIG.backdropSelectors).forEach((b) => { b.style.position = 'absolute'; });
}

/** Dialog with internal scroll: static HTML does not keep the scroll position, so the dialog grows to its end. */
function expandDialog(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(CAPTURE_CONFIG.overlaySelectors).forEach((d) => {
    const top = topOf(d, root);
    Object.assign(top.style, { position: 'absolute', top: '0', left: '0', right: '0', bottom: 'auto', minHeight: '100%' });
    for (let el: HTMLElement | null = d; el && el !== top.parentElement; el = el.parentElement) {
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('height', 'auto');
    }
  });
  root.querySelectorAll<HTMLElement>(CAPTURE_CONFIG.dialogScrollSelectors).forEach((c) => {
    c.style.setProperty('max-height', 'none', 'important');
    c.style.setProperty('overflow', 'visible', 'important');
  });
  root.querySelectorAll<HTMLElement>(CAPTURE_CONFIG.backdropSelectors).forEach((b) => { b.style.position = 'absolute'; });
}

const NO_LAYOUT_CSS = () => `${CAPTURE_CONFIG.tabIndicatorSelectors}{display:none!important}
[role=tab][aria-selected="true"]{box-shadow:inset 0 -2px 0 currentColor}`;

export interface CaptureOptions {
  /** Viewport width the capture is laid out for (default 1440). */
  width?: number;
  /** Whole page instead of the first fold (default true). */
  fullPage?: boolean;
  /** Expand a dialog with internal scroll to its full height (default false). */
  fullDialog?: boolean;
  /** Subfolder of outDir, e.g. a design-system option or a variation: options/<name>, variations/<flow>/<variant>. */
  subdir?: string;
}

/**
 * Writes the capture. `title` goes to <title> (put the route: the tools read it), `file` is a name from
 * captureName() or a path relative to outDir. Returns { target, bytes, cssChars }.
 */
export function saveCapture(title: string, file: string, options: CaptureOptions = {}) {
  const width = options.width ?? 1440;
  const styles = [
    ...Array.from(document.querySelectorAll('style')).map(cssOf),
    ...CAPTURE_CONFIG.extraCss.map((f) => readFileSync(resolve(f), 'utf8')),
  ].filter(Boolean).map(inlineCssUrls).join('\n');
  const body = document.body.cloneNode(true) as HTMLElement;
  copyFieldValues(document.body, body);
  if (options.fullPage !== false) releaseHeight(body);
  if (options.fullDialog) expandDialog(body);
  body.querySelectorAll('script, noscript, template').forEach((n) => n.remove());
  inlineImages(body);
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const html = `<!doctype html>
<html lang="${CAPTURE_CONFIG.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${width}">
<title>${esc(title)}</title>
${CAPTURE_CONFIG.fonts.map((f) => `<link href="${f}" rel="stylesheet">`).join('\n')}
<style>body{margin:0;min-width:${width}px}</style>
<style data-source="app">
${styles}
</style>
<style data-source="no-layout">${NO_LAYOUT_CSS()}</style>
</head>
<body style="position:relative">
${body.innerHTML}
</body>
</html>
`;
  const target = resolve(CAPTURE_CONFIG.outDir, options.subdir ?? process.env.DSX_CAPTURE_SUBDIR ?? '', file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  return { target, bytes: html.length, cssChars: styles.length };
}
