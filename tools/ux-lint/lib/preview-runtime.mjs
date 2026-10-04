// Código que roda DENTRO da captura (Playwright, file://) para as prévias de opção: localiza o elemento do achado,
// aplica as operações de `preview` (lib/preview-spec.mjs) e desenha contornos, anotações e selos por cima. Os
// doadores do módulo (blocos de estado, alertas, botões, painel, chip…) chegam em `window.__dsxkit`, montados por
// lib/preview-kit.mjs a partir das próprias capturas. Contrato: knowledge/fundamentos/achados-de-ux.md.
// Sem dependências. A função é serializada (`runtime.toString()`), então não pode usar nada de fora dela.

/* c8 ignore start */
export function runtime() {
  const kit = window.__dsxkit || {};
  const clean = (s) => String(s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    }
    return true;
  };
  const KIND = { button: 'button, [role=button], a, [role=tab], [role=menuitem], [role=option]', heading: 'h1, h2, h3, h4, h5, h6, [role=heading]' };
  const R = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  const union = (rs) => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };
  const dialogOf = (el) => el.closest('[role=dialog], .MuiDialog-paper');
  const openDialog = () => [...document.querySelectorAll('[role=dialog]')].find(visible) || null;
  const st = { targets: [], via: 'text', orig: [], added: [], marks: [], overlays: [], attrText: null };
  const fontPx = (el) => parseFloat(getComputedStyle(el).fontSize) || 0;
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
  const mark0 = (el) => el && el.hasAttribute && el.hasAttribute('data-dsx-mark');

  function textNodes(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && n.parentElement.closest('svg, style, script') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const out = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim()) out.push(n);
    return out;
  }
  function setText(el, text) {
    if (el.matches('input, textarea')) { el.placeholder = text; return; }
    const label = el.querySelector('.MuiChip-label');
    if (label) { label.textContent = text; return; }
    const ns = textNodes(el);
    if (!ns.length) { el.textContent = text; return; }
    ns[0].nodeValue = text;
    for (const n of ns.slice(1)) n.nodeValue = '';
  }

  // ---------- título principal e regiões da tela ----------
  function mainTitle() {
    const h1 = [...document.querySelectorAll('h1, [role=heading][aria-level="1"]')].find(visible);
    if (h1) return h1;
    const root = openDialog() || document.querySelector('main') || document.body;
    const top = root.getBoundingClientRect().top;
    const cands = [...root.querySelectorAll('h2, h3, h4, h5, h6, [role=heading], p, span, div, label')]
      .filter((e) => ownText(e) && visible(e) && !e.closest('nav, button, a, [role=tablist], [role=tab], [data-dsx-mark], .MuiChip-root') && e.getBoundingClientRect().top - top < 400);
    // título editável (campo de texto grande no topo) também conta
    cands.push(...[...root.querySelectorAll('input[type=text], input:not([type]), textarea')].filter((e) => e.value && visible(e) && fontPx(e) >= 18 && e.getBoundingClientRect().top - top < 400));
    let best = null, bs = 0;
    for (const e of cands) { const s = fontPx(e) + (/^H[2-6]$/.test(e.tagName) ? 0.5 : 0); if (s > bs + 0.01) { best = e; bs = s; } }
    return best;
  }
  /** Conteúdo da tela abaixo do cabeçalho (título e abas); em diálogo, o DialogContent. */
  function contentArea() {
    const dlg = openDialog();
    if (dlg) {
      const c = dlg.querySelector('.MuiDialogContent-root') || dlg;
      return { dialog: dlg, parent: c, before: null, content: [...c.children].filter(visible) };
    }
    const main = document.querySelector('main') || document.body;
    const title = mainTitle();
    const minH = Math.min(300, innerHeight * 0.4);
    let P = null, head = null;
    for (let node = title; node && node !== main && node.parentElement; node = node.parentElement) {
      const p = node.parentElement;
      if ([...p.children].filter(visible).length >= 2 && R(p).h >= Math.max(minH, R(node).h + 40)) { P = p; head = node; break; }
      if (p === main) break;
    }
    if (!P) { P = main; while (P.children.length === 1 && visible(P.children[0])) P = P.children[0]; }
    const kids = [...P.children].filter(visible);
    let i = head ? kids.indexOf(head) + 1 : 0;
    while (i < kids.length && (kids[i].matches('[role=tablist]') || kids[i].querySelector('[role=tablist]')) && R(kids[i]).h < 90) i++;
    const content = kids.slice(i);
    return { parent: P, before: content[0] || null, content };
  }
  /** A tabela ou lista do conteúdo (o que muda de dados); sem ela, o maior bloco do conteúdo. */
  function dataRegion(area) {
    const SEL = 'table, [role=grid], [role=table], .MuiTableContainer-root, ul, ol, .MuiList-root, [role=list]';
    let best = null, ba = 0;
    for (const k of area.content) for (const e of [k, ...k.querySelectorAll(SEL)]) {
      if (!e.matches(SEL) || !visible(e) || e.closest('nav, [role=tablist], .MuiMenu-root')) continue;
      const r = R(e); if (r.w * r.h > ba) { best = e; ba = r.w * r.h; }
    }
    if (best) return best.closest('.MuiTableContainer-root') || best;
    let big = null, bb = 0;
    for (const k of area.content) { const r = R(k); if (r.w * r.h > bb) { big = k; bb = r.w * r.h; } }
    return big;
  }

  // ---------- doadores (da própria captura primeiro, senão do kit do módulo) ----------
  function inject(css) {
    if (!css) return;
    const s = document.createElement('style');
    s.setAttribute('data-dsx-kit', '');
    s.textContent = css;
    document.head.appendChild(s);
  }
  function fromKit(d) {
    if (!d || !d.html) return null;
    inject(d.css);
    const t = document.createElement('template');
    t.innerHTML = d.html.trim();
    return t.content.firstElementChild;
  }
  const ROLE_SEL = {
    chip: '.MuiChip-root', helper: '.MuiFormHelperText-root', caption: '.MuiTypography-caption',
    panel: '.MuiPaper-outlined:not(.MuiAlert-root), .MuiCard-root', heading: 'main h2, main h3',
    'alert-info': '.MuiAlert-colorInfo', 'alert-warning': '.MuiAlert-colorWarning', 'alert-success': '.MuiAlert-colorSuccess', 'alert-error': '.MuiAlert-colorError',
  };
  const SHALLOW = new Set(['panel', 'heading', 'caption']);
  const NEUTRAL = new Set(['helper', 'caption']);
  const sat1 = (e) => { const m = getComputedStyle(e).color.match(/\d+/g) || [0, 0, 0]; const [r, g, b] = m.map(Number); return Math.max(r, g, b) - Math.min(r, g, b); };
  const sat = (e) => Math.max(sat1(e), ...[...e.querySelectorAll('*')].map(sat1));
  function roleEl(role) {
    let local = null;
    if (role === 'search-field') {
      const inp = [...document.querySelectorAll('input[placeholder]')].find((e) => /^(buscar|pesquisar|procurar|filtrar|search)/i.test(e.placeholder) && visible(e));
      local = inp ? inp.closest('.MuiTextField-root, .MuiFormControl-root, .MuiInputBase-root') : null;
    } else if (ROLE_SEL[role]) {
      const list = [...document.querySelectorAll(ROLE_SEL[role])].filter((e) => visible(e) && !mark0(e) && !e.classList.contains('Mui-error') && (role !== 'panel' || (R(e).w >= 240 && !e.closest('[role=dialog]'))));
      // texto de apoio e legenda: o de cor mais neutra (não copiar um apoio de sucesso ou de erro)
      local = NEUTRAL.has(role) ? list.filter((e) => sat(e) < 40).sort((a, b) => sat(a) - sat(b))[0] : list[0];
    }
    if (local) return SHALLOW.has(role) ? local.cloneNode(false) : local.cloneNode(true);
    const k = kit.roles && kit.roles[role];
    return fromKit(k);
  }

  // ---------- tokens de texto ----------
  const parts = (t) => { const s = clean(t).split(/\s+[—–·|]\s+/); return s.length > 1 ? [s[0], s.slice(1).join(' — ')] : [s[0]]; };
  function contextLabel(el) {
    const SEL = 'label, legend, h2, h3, h4, h5, h6, [role=heading], .MuiTypography-overline, .MuiTypography-subtitle1, .MuiTypography-subtitle2, .MuiFormLabel-root, th';
    const strong = (e) => { const cs = getComputedStyle(e); const t = clean(e.innerText); return cs.textTransform === 'uppercase' || Number(cs.fontWeight) >= 600 || (/[A-ZÀ-Ý]{3}/.test(t) && t === t.toUpperCase()); };
    const ok = (e) => visible(e) && !e.contains(el) && !e.closest('button, a, [role=button], .MuiChip-root') && (e.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) && clean(e.innerText).length >= 2 && clean(e.innerText).length <= 40;
    for (let a = el.parentElement, depth = 0; a && depth < 6 && a !== document.body; a = a.parentElement, depth++) {
      // o rótulo mais próximo antes do botão, no menor contêiner que tenha um (título, legenda ou texto destacado)
      const prev = [...a.querySelectorAll('*')].filter((e) => (e.matches(SEL) || (ownText(e) && strong(e))) && ok(e));
      if (prev.length) {
        let t = clean(prev.at(-1).innerText).replace(/[*:]\s*$/, '').trim();
        if (t === t.toUpperCase()) t = t.toLowerCase();
        else t = t.charAt(0).toLowerCase() + t.slice(1);
        return t;
      }
    }
    return null;
  }
  function resolve(text, el, i) {
    const orig = st.orig[i] ?? clean(el.innerText || el.getAttribute('aria-label') || '');
    let miss = null;
    const out = String(text).replace(/\{(self|context|no-parens|part:(\d))\}/g, (m, k, n) => {
      if (k === 'self') return orig;
      if (k === 'no-parens') return clean(orig.replace(/\s*\([^)]*\)/g, ''));
      if (k === 'context') { const c = contextLabel(el); if (!c) miss = 'sem rótulo por perto para servir de objeto'; return c || ''; }
      const p = parts(orig)[Number(n)];
      if (p === undefined) miss = `o texto "${orig}" não tem o bloco ${Number(n) + 1}`;
      return p ?? '';
    });
    return miss ? { error: miss } : { text: clean(out) };
  }

  // ---------- localização ----------
  function find(loc) {
    const out = [];
    st.via = 'text';
    if (loc.kind === 'main-title') { const t = mainTitle(); return t ? [t] : []; }
    for (const s of loc.selectors || []) { try { const el = document.querySelector(s); if (el && visible(el) && !out.includes(el)) out.push(el); } catch { /* seletor inválido */ } }
    if (out.length) return out.slice(0, loc.max || 1);
    const dlg = openDialog();
    const order = (l) => (dlg ? [...l.filter((e) => dlg.contains(e)), ...l.filter((e) => !dlg.contains(e))] : l);
    if (loc.kind === 'placeholder') {
      const pats = (loc.patterns || []).map((p) => new RegExp(p, 'i'));
      return order([...document.querySelectorAll('input[placeholder], textarea[placeholder]')].filter((e) => visible(e) && pats.some((p) => p.test(clean(e.placeholder))))).slice(0, loc.max || 1);
    }
    const all = [...document.body.querySelectorAll('*')].filter((e) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(e.tagName) && !e.closest('svg') && !mark0(e));
    const pass = (test) => {
      let hits = all.filter((e) => { const t = clean(e.innerText); return t && test(t) && visible(e); });
      hits = hits.filter((e) => !hits.some((o) => o !== e && e.contains(o)));
      if (KIND[loc.kind]) hits = hits.map((e) => e.closest(KIND[loc.kind]) || e);
      if (loc.require_class) hits = hits.filter((e) => e.classList.contains(loc.require_class));
      return order([...new Set(hits)]);
    };
    const pats = (loc.patterns || []).map((p) => new RegExp(p, 'i'));
    // T1 e L3 citam vários elementos: um por padrão, na ordem do achado.
    if ((loc.max || 1) > 1 && pats.length > 1) {
      const res = [];
      for (const p of pats) { const h = pass((t) => p.test(t)).find((e) => !res.includes(e)); if (h) res.push(h); }
      if (res.length) return res.slice(0, loc.max);
    }
    let hits = pats.length ? pass((t) => pats.some((p) => p.test(t))) : [];
    if (!hits.length && (loc.prefixes || []).length) hits = pass((t) => loc.prefixes.some((p) => t.startsWith(p)));
    if (!hits.length && (loc.contains || []).length) hits = pass((t) => loc.contains.some((p) => t.includes(p)));
    if (!hits.length && (loc.loose || []).length) { const lp = loc.loose.map((p) => new RegExp(p, 'i')); hits = pass((t) => lp.some((p) => p.test(t))); }
    // Nome acessível, dica (title) ou placeholder: o texto está num atributo, não em pixels.
    if (!hits.length && pats.length) {
      const shown = (e) => (visible(e) ? e : e.parentElement && visible(e.parentElement) && e.getBoundingClientRect().width > 0 ? e.parentElement : null);
      let attrText = null;
      const attrHits = all.filter((e) => ['aria-label', 'title', 'placeholder'].some((a) => { const v = e.getAttribute(a); const ok = v && pats.some((p) => p.test(clean(v))); if (ok && !attrText) attrText = clean(v); return ok; })).map(shown).filter(Boolean);
      hits = order([...new Set(attrHits.filter((e) => !attrHits.some((o) => o !== e && e.contains(o))))]);
      if (hits.length) { st.via = 'attr'; st.attrText = attrText; }
    }
    return hits.slice(0, loc.max || 1);
  }
  const CONTAINER = 'section, form, fieldset, article, aside, header, footer, nav, table, ul, ol, [role=toolbar], [role=group], [role=region], [role=tabpanel], [role=list], .MuiCard-root, .MuiPaper-root, .MuiDialogActions-root, .MuiDialogContent-root, .MuiStack-root, .MuiAccordion-root';
  function contextRect(targets) {
    const T = union(targets.map(R));
    const vw = innerWidth, vh = innerHeight;
    const dlg = dialogOf(targets[0]);
    let C;
    if (dlg) C = R(dlg);
    else {
      C = null;
      for (let p = targets[0].parentElement; p && p !== document.body; p = p.parentElement) {
        if (!targets.every((t) => p.contains(t))) continue;
        const r = R(p);
        if (p.matches(CONTAINER) && r.w >= 320 && r.h >= T.h + 24) { C = r; break; }
      }
      if (!C) { const m = document.querySelector('main') || document.body; C = R(m); }
    }
    const maxW = dlg ? Math.min(Math.max(C.w, T.w + 32), vw) : Math.min(Math.max(720, T.w + 32), vw);
    const maxH = dlg ? vh : Math.min(Math.max(420, T.h + 48), vh);
    const fit = (cs, cl, ts, tl, max) => { if (cl <= max) return [cs, cl]; const s = Math.min(Math.max(ts + tl / 2 - max / 2, cs), cs + cl - max); return [s, max]; };
    let [x, w] = fit(C.x, C.w, T.x, T.w, maxW);
    let [y, h] = fit(C.y, C.h, T.y, T.h, maxH);
    const grow = (s, l, min, lim) => (l >= min ? [s, l] : [Math.max(0, Math.min(s - (min - l) / 2, lim - min)), min]);
    [x, w] = grow(x, w, Math.min(480, vw), vw);
    [y, h] = grow(y, h, 160, vh);
    const x2 = Math.max(x + w, T.x + T.w + 6), y2 = Math.max(y + h, T.y + T.h + 6);
    x = Math.min(x, T.x - 6); y = Math.min(y, T.y - 6);
    x = Math.max(0, x - 8); y = Math.max(0, y - 8);
    return { x, y, w: Math.min(vw, x2 + 8) - x, h: Math.min(vh, y2 + 8) - y };
  }

  // ---------- sobreposições (fora do produto: contorno, balão, selo, dobra) ----------
  function overlay(css, text) {
    const d = document.createElement('div');
    d.setAttribute('data-dsx-mark', '');
    d.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;box-sizing:border-box;${css}`;
    if (text !== undefined) d.textContent = text;
    document.body.appendChild(d);
    return d;
  }
  function tooltipBubble(text) {
    const local = [...document.querySelectorAll('.MuiTooltip-tooltip')].find(visible);
    let el = local ? local.cloneNode(false) : null;
    if (!el && kit.roles && kit.roles.tooltip) {
      inject(kit.roles.tooltip.css);
      el = document.createElement('div');
      el.className = kit.roles.tooltip.className;
    }
    if (el) el.textContent = text;
    return el;
  }
  /** Balão ligado ao elemento: "Leitor de tela: «…»", a dica (com as classes de tooltip do kit, se houver) ou nota. */
  function balloon(el, kind, text) {
    const r = R(el);
    const label = kind === 'screen-reader' ? `Leitor de tela: «${text}»` : text;
    const tall = r.h > innerHeight * 0.4 || (r.y + r.h + 90 >= innerHeight && r.y < 90);
    const side = tall && r.x + r.w + 400 < innerWidth;
    const below = !tall && r.y + r.h + 90 < innerHeight;
    const left = side ? r.x + r.w + 16 : tall ? r.x + 12 : Math.max(8, Math.min(r.x, innerWidth - 400));
    const top = tall ? Math.max(8, r.y) + 24 : below ? r.y + r.h + 14 : Math.max(4, r.y - 14);
    let b;
    const tip = kind === 'tooltip' ? tooltipBubble(text) : null;
    if (tip) {
      b = overlay(`left:${left}px;top:${top}px;max-width:380px;${below ? '' : 'transform:translateY(-100%);'}`);
      tip.style.setProperty('margin', '0', 'important');
      tip.style.setProperty('opacity', '1', 'important');
      tip.style.setProperty('position', 'static', 'important');
      b.appendChild(tip);
    } else {
      b = overlay(`left:${left}px;top:${top}px;max-width:380px;${below ? '' : 'transform:translateY(-100%);'}background:#1E2130;color:#fff;font:500 13px/1.4 Inter,system-ui,sans-serif;padding:7px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.25)`, label);
    }
    const br = R(b);
    if (tall) {
      if (side) { const line = overlay(`left:${r.x + r.w}px;top:${br.y + br.h / 2 - 1}px;width:16px;height:2px;background:#1E2130`); st.overlays.push(br, R(line)); } else st.overlays.push(br);
      return br;
    }
    const cx = Math.max(br.x + 12, Math.min(r.x + Math.min(r.w, 60) / 2, br.x + br.w - 12));
    const y1 = below ? r.y + r.h : br.y + br.h, y2 = below ? br.y : r.y;
    const line = overlay(`left:${cx - 1}px;top:${Math.min(y1, y2)}px;width:2px;height:${Math.abs(y2 - y1)}px;background:#1E2130`);
    st.overlays.push(br, R(line));
    return br;
  }
  function foldLine(fold, note) {
    const y = fold - scrollY;
    if (y < 0 || y > innerHeight) return;
    overlay(`left:0;top:${y - 1}px;width:100%;height:0;border-top:2px dashed #E5484D`);
    overlay(`right:12px;top:${y - 24}px;background:#E5484D;color:#fff;font:600 12px/1 Inter,system-ui,sans-serif;padding:5px 8px;border-radius:6px`, `dobra (${fold} px)`);
    if (note) overlay(`left:${(document.querySelector('main') || document.body).getBoundingClientRect().left + 16}px;top:${y - 30}px;background:#1E2130;color:#fff;font:500 13px/1.3 Inter,system-ui,sans-serif;padding:6px 10px;border-radius:8px`, note);
  }

  // ---------- estados e regiões montados na tela ----------
  function setBlockTexts(block, { title, text, action }) {
    const btns = [...block.querySelectorAll('button, a.MuiButton-root, [role=button]')];
    const nodes = textNodes(block).filter((n) => !btns.some((b) => b.contains(n)));
    const vals = title ? [title, text] : [text];
    nodes.forEach((n, i) => {
      if (i < vals.length && vals[i]) n.nodeValue = vals[i];
      else { n.nodeValue = ''; const p = n.parentElement; if (p && p !== block && !clean(p.textContent) && !p.querySelector('svg, img')) p.style.display = 'none'; }
    });
    if (nodes.length && nodes.length < vals.filter(Boolean).length) {
      const last = nodes.at(-1).parentElement;
      const extra = last.cloneNode(false);
      extra.textContent = vals.filter(Boolean).at(-1);
      last.after(extra);
    }
    if (action) { if (btns[0]) setText(btns[0], action); btns.slice(1).forEach((b) => b.remove()); } else btns.forEach((b) => b.remove());
  }
  function pickBlock(kind, wantButton) {
    const list = (kit.blocks && kit.blocks[kind]) || [];
    if (!list.length) return null;
    const pref = list.filter((b) => !!b.button === !!wantButton);
    return (pref.length ? pref : list)[0];
  }
  const rgb = (c) => { const m = String(c).match(/\d+(\.\d+)?/g); if (/^#/.test(c)) { const h = c.slice(1).length === 3 ? [...c.slice(1)].map((x) => x + x).join('') : c.slice(1); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); } return m ? m.slice(0, 3).map(Number) : [211, 47, 47]; };
  function alertEl(color, text) {
    const cap = color.charAt(0).toUpperCase() + color.slice(1);
    const local = [...document.querySelectorAll(`.MuiAlert-color${cap}`)].find(visible);
    let el = local ? local.cloneNode(true) : fromKit(kit.alerts && kit.alerts[color]);
    let recolor = null;
    if (!el && color === 'error') {
      const alt = [...document.querySelectorAll('.MuiAlert-root')].find(visible);
      el = alt ? alt.cloneNode(true) : fromKit((kit.alerts || {}).warning || (kit.alerts || {}).info);
      recolor = kit.error_color || '#d32f2f';
    }
    if (!el) el = fromKit((kit.alerts || {}).info || Object.values(kit.alerts || {})[0]);
    if (!el) return null;
    const msg = el.querySelector('.MuiAlert-message') || el;
    msg.textContent = text;
    el.querySelectorAll('.MuiAlert-action').forEach((a) => a.remove());
    el.style.removeProperty('display');
    if (recolor) {
      // alerta de erro montado com a cor de erro do tema (lida do CSS da captura), no padrão do kit: texto escuro, fundo claro
      const [r, g, b] = rgb(recolor);
      el.style.setProperty('color', `rgb(${Math.round(r * 0.4)}, ${Math.round(g * 0.4)}, ${Math.round(b * 0.4)})`, 'important');
      el.style.setProperty('background-color', `rgb(${Math.round(r + (255 - r) * 0.9)}, ${Math.round(g + (255 - g) * 0.9)}, ${Math.round(b + (255 - b) * 0.9)})`, 'important');
      el.style.setProperty('border-color', recolor, 'important');
      const ic = el.querySelector('.MuiAlert-icon');
      if (ic) ic.style.setProperty('color', recolor, 'important');
    }
    return el;
  }
  function fieldError(text) {
    const root = openDialog() || document.querySelector('main') || document.body;
    const inputs = [...root.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not(.MuiSelect-nativeInput), textarea:not([aria-hidden=true])')]
      .filter((e) => visible(e) || (e.parentElement && visible(e.parentElement)));
    const starred = (e) => { const fc = e.closest('.MuiFormControl-root'); return fc && /\*/.test((fc.querySelector('label') || {}).textContent || ''); };
    const req = inputs.find((e) => e.required || e.getAttribute('aria-required') === 'true') || inputs.find(starred) || inputs[0];
    if (!req) return { error: 'esta captura não tem campo de formulário para mostrar o erro (os campos ficam num diálogo ou passo que a tela abre)' };
    const fc = req.closest('.MuiTextField-root, .MuiFormControl-root') || req.parentElement;
    const color = kit.error_color || '#d32f2f';
    req.setAttribute('aria-invalid', 'true');
    for (const e of [fc, ...fc.querySelectorAll('.MuiInputBase-root, .MuiOutlinedInput-root, .MuiInput-root, .MuiFilledInput-root, .MuiInputLabel-root, .MuiFormLabel-root, .MuiFormHelperText-root')]) e.classList.add('Mui-error');
    const outline = fc.querySelector('.MuiOutlinedInput-notchedOutline');
    if (outline) outline.style.setProperty('border-color', color, 'important');
    const label = fc.querySelector('label');
    if (label) label.style.setProperty('color', color, 'important');
    let helper = fc.querySelector('.MuiFormHelperText-root');
    if (!helper) {
      helper = roleEl('helper') || document.createElement('p');
      helper.classList.add('MuiFormHelperText-root', 'Mui-error');
      fc.appendChild(helper);
    }
    helper.textContent = text;
    helper.style.setProperty('color', color, 'important');
    helper.style.removeProperty('display');
    const box = label ? union([R(fc), R(label)]) : R(fc);
    return { el: fc, mark: { x: box.x, y: box.y - 2, w: box.w, h: box.h + 2 } };
  }
  function synthesizeState(op) {
    const dlg = openDialog();
    const r = (dlg ? op.recipe.dialog : op.recipe.page) || op.recipe.page;
    if (r.mode === 'field-error') return fieldError(r.text);
    const area = contentArea();
    if (r.mode === 'banner') {
      const el = alertEl(r.color || 'info', r.text);
      if (!el) return { error: 'nenhum alerta nas capturas do módulo para montar o aviso' };
      if (dlg) area.parent.appendChild(el); else area.parent.insertBefore(el, area.before);
      el.style.setProperty('margin-top', dlg ? '16px' : '0');
      el.style.setProperty('margin-bottom', '16px');
      return { el, added: [el] };
    }
    const d = pickBlock(r.block, r.button ?? !!r.action);
    if (!d) return { error: `nenhuma captura do módulo tem bloco de estado "${r.block}" para copiar` };
    let block = fromKit(d);
    if (r.block !== 'loading') setBlockTexts(block, { title: r.title, text: r.text, action: r.action });
    if (d.ctx) {
      // o contexto do bloco na captura doadora (centralização, espaçamento da célula ou do contêiner que o envolvia)
      const w = document.createElement('div');
      for (const [k, v] of Object.entries(d.ctx)) w.style.setProperty(k, v);
      w.appendChild(block);
      block = w;
    }
    if (r.mode === 'replace-data' && !dlg) {
      const data = dataRegion(area);
      if (!data) return { error: 'não achei a tabela ou lista da tela para trocar pelo estado' };
      data.before(block);
      data.style.setProperty('display', 'none', 'important');
    } else {
      for (const k of area.content) k.style.setProperty('display', 'none', 'important');
      if (dlg || !area.before) area.parent.appendChild(block); else area.before.before(block);
    }
    block.style.setProperty('width', '100%');
    block.style.setProperty('box-sizing', 'border-box');
    return { el: block, added: [block] };
  }
  function shell(title, caption) {
    const box = roleEl('panel') || document.createElement('div');
    box.style.setProperty('padding', '16px');
    box.style.setProperty('margin', '0 0 16px');
    box.style.setProperty('display', 'block');
    box.style.setProperty('min-height', '0');
    if (title) { const h = roleEl('heading') || document.createElement('h3'); h.textContent = title; h.style.setProperty('margin', '0 0 6px'); box.appendChild(h); }
    if (caption) { const c = roleEl('caption') || document.createElement('span'); c.textContent = caption; for (const [k, v] of [['display', 'block'], ['white-space', 'normal'], ['overflow', 'visible'], ['text-overflow', 'clip'], ['max-width', 'none']]) c.style.setProperty(k, v); box.appendChild(c); }
    return box;
  }
  function synthesizeRegion(op) {
    const area = contentArea();
    let el;
    if (op.region === 'search-bar') {
      el = roleEl('search-field');
      if (el) {
        const inp = el.querySelector('input') || el;
        inp.placeholder = `${op.title || 'Buscar'}…`; inp.value = '';
        el.style.setProperty('margin', '0 0 16px'); el.style.setProperty('max-width', '420px');
      }
    }
    if (!el) el = shell(op.title || op.region, 'Região prevista no arquétipo; o conteúdo depende da decisão.');
    if (area.dialog || !area.before) area.parent.appendChild(el); else area.parent.insertBefore(el, area.before);
    return { el, added: [el] };
  }

  // ---------- operações ----------
  function targetsOf(op) {
    if (op.selector) { const e = document.querySelector(op.selector); return e ? [e] : []; }
    const t = st.targets;
    if (op.targets === 'all') return t;
    if (op.targets === 'all-but-last') return t.slice(0, -1);
    if (op.targets === 'all-but-first') return t.slice(1);
    if (Number.isInteger(op.targets)) return t[op.targets] ? [t[op.targets]] : [];
    return t.slice(0, 1);
  }
  const levelOf = (el) => { const m = el.tagName.match(/^H([1-6])$/); return m ? Number(m[1]) : Number(el.getAttribute('aria-level')) || null; };
  function themeValue(v, el, prop) {
    const m = String(v).match(/^theme:(h([1-6])|self)$/);
    if (!m) return v;
    const level = m[1] === 'self' ? levelOf(el) : Number(m[2]);
    const t = level && kit.typography && kit.typography[`h${level}`];
    if (!t) return null;
    return prop === 'font-size' ? `${t.size}px` : prop === 'line-height' ? t.line : prop === 'font-weight' ? String(t.weight) : null;
  }
  function applyOp(op) {
    if (op.op === 'synthesize-state') return synthesizeState(op);
    if (op.op === 'synthesize-region') return synthesizeRegion(op);
    const list = targetsOf(op);
    const el = list[0];
    if (!el) return { error: op.targets === 'all-but-last' ? 'só um elemento localizado; não há o que rebaixar' : 'alvo da operação não encontrado' };
    if (op.op === 'text') {
      const changed = [];
      for (const [i, t] of list.entries()) {
        const rv = resolve(op.text, t, st.targets.indexOf(t));
        if (rv.error) return { error: rv.error };
        let text = rv.text;
        if (Array.isArray(op.choices) && op.choices.length) {
          const words = (s) => new Set(clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 2));
          const cur = [...words(t.innerText || t.placeholder || '')];
          let best = 0;
          for (const c of op.choices) { const n = [...words(c)].filter((w) => cur.some((x) => x === w || (x.length >= 5 && w.length >= 5 && x.slice(0, 5) === w.slice(0, 5)))).length; if (n > best) { best = n; text = c; } }
        }
        if (st.via === 'attr' && !t.matches('input, textarea')) { balloon(t, 'screen-reader', text); return { el: t, text, converted: { op: 'annotate', kind: 'screen-reader', text } }; }
        setText(t, text);
        changed.push(text);
        if (i === 0) return { el: t, text };
      }
      return { el, text: changed[0] };
    }
    if (op.op === 'remove') { const r = R(el); el.style.setProperty('display', 'none', 'important'); return { removed: r }; }
    if (op.op === 'variant') {
      for (const t of list) {
        if (!t.classList.contains('MuiButton-root')) return { error: 'o elemento não é um botão do MUI; variant não se aplica' };
        const size = [...t.classList].find((c) => /^MuiButton-size/.test(c));
        const donors = [...document.querySelectorAll(`.MuiButton-root.MuiButton-${op.variant}`)].filter((d) => !list.includes(d) && visible(d) && !d.disabled && !d.classList.contains('Mui-disabled'));
        const donor = donors.find((d) => size && d.classList.contains(size)) || donors[0];
        const wasDisabled = t.classList.contains('Mui-disabled');
        if (donor) t.className = donor.className;
        else if (kit.buttons && kit.buttons[op.variant]) { inject(kit.buttons[op.variant].css); t.className = kit.buttons[op.variant].className; }
        else return { error: `nenhum botão "${op.variant}" nas capturas do módulo para copiar o estilo` };
        if (!wasDisabled) t.classList.remove('Mui-disabled');
      }
      return { el, added: list.slice(1) };
    }
    if (op.op === 'move') {
      if (op.to === 'region-top') {
        const fold = op.fold || 900;
        let g = el;
        const p = el.parentElement;
        if (p && p !== document.body && [...p.children].filter(visible).every((k) => k.matches('button, a, [role=button]')) && R(p).h < 100) g = p;
        const gh = R(g).h;
        const limit = fold - gh - 24;
        for (let reg = g.parentElement; reg && reg !== document.body; reg = reg.parentElement) {
          if (R(reg).y + scrollY >= limit) continue;
          const kids = [...reg.children].filter(visible);
          const branch = kids.find((k) => k.contains(g));
          const idx = kids.indexOf(branch);
          const cross = kids.slice(0, Math.max(0, idx)).find((k) => R(k).y + scrollY + R(k).h > limit);
          const target = cross || branch;
          if (target && target !== g) { reg.insertBefore(g, target); break; }
        }
        return { el };
      }
      const g = el.parentElement;
      if (op.to === 'end') g.appendChild(el);
      if (op.to === 'start') g.prepend(el);
      if (op.justify) { if (!/flex/.test(getComputedStyle(g).display)) g.style.display = 'flex'; g.style.justifyContent = op.justify; g.style.alignItems = g.style.alignItems || 'center'; }
      return { el };
    }
    if (op.op === 'style') {
      let n = 0;
      for (const t of list) for (const [k, v] of Object.entries(op.css)) { const val = themeValue(v, t, k); if (val !== null) { t.style.setProperty(k, val); n++; } }
      if (!n) return { error: 'a escala de títulos do tema não foi lida nas capturas do módulo' };
      return { el, added: list.slice(1) };
    }
    if (op.op === 'align') {
      const items = [...new Set(list.map((t) => t.closest('.MuiTextField-root, .MuiFormControl-root') || t))].map((t) => ({ t, r: R(t) }));
      const rows = [];
      for (const it of [...items].sort((a, b) => a.r.y - b.r.y)) { const row = rows.find((rw) => Math.abs(rw[0].r.y - it.r.y) < 8); if (row) row.push(it); else rows.push([it]); }
      const shift = (t, dx) => { const ml = parseFloat(getComputedStyle(t).marginLeft) || 0; t.style.setProperty('margin-left', `${ml + dx}px`); };
      const mode = op.mode === 'auto' ? (rows.every((rw) => rw.length === 1) ? 'left' : 'columns') : op.mode;
      if (mode === 'left') { const x0 = items[0].r.x; for (const it of items.slice(1)) if (Math.abs(it.r.x - x0) > 0.5) shift(it.t, x0 - it.r.x); }
      else {
        const edges = rows[0].map((it) => it.r.x).sort((a, b) => a - b);
        for (const row of rows.slice(1)) {
          let prevRight = -Infinity;
          for (const it of row.sort((a, b) => a.r.x - b.r.x)) {
            const right = it.r.x + it.r.w;
            const nl = edges.filter((e) => e >= prevRight + 8).sort((a, b) => Math.abs(a - it.r.x) - Math.abs(b - it.r.x))[0];
            if (nl !== undefined && Math.abs(nl - it.r.x) > 0.5 && right - nl > 80) {
              shift(it.t, nl - it.r.x);
              const w = right - nl;
              for (const [k, v] of [['flex', `0 0 ${w}px`], ['width', `${w}px`], ['max-width', `${w}px`], ['min-width', '0']]) it.t.style.setProperty(k, v);
              prevRight = nl + w;
            } else prevRight = right;
          }
        }
      }
      return { el: items[0].t, added: items.slice(1).map((it) => it.t), mark: null, marks: items.map((it) => R(it.t)) };
    }
    if (op.op === 'replace-text-many') {
      const scope = op.scope === 'screen' ? document.body : el;
      let n = 0;
      for (const node of textNodes(scope)) {
        let v = node.nodeValue;
        for (const p of op.pairs) {
          const re = new RegExp(p.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          if (re.test(v)) { v = v.replace(re, p.to); n++; }
        }
        if (v !== node.nodeValue) node.nodeValue = v.replace(/\(\s*,\s*/g, '(').replace(/,\s*\)/g, ')').replace(/\(\s*\)/g, '').replace(/\s+([,.;:])/g, '$1').replace(/:\s*:/g, ':').replace(/ {2,}/g, ' ');
      }
      if (!n) return { error: 'nenhum dos textos a trocar está no elemento' };
      return { el };
    }
    if (op.op === 'insert') {
      let node;
      if (op.source) node = op.from ? fromKit(kit.extras && kit.extras[`${op.from}|${op.source}`]) : (document.querySelector(op.source) || { cloneNode: () => null }).cloneNode(true);
      else node = roleEl(op.like);
      if (!node) return { error: `nenhum elemento "${op.like || op.source}" nas capturas do módulo para copiar` };
      if (op.text !== undefined) {
        const rv = resolve(op.text, el, st.targets.indexOf(el));
        if (rv.error) return { error: rv.error };
        if (op.like === 'search-field') { const inp = node.querySelector('input') || node; inp.placeholder = rv.text; inp.value = ''; } else if (op.like === 'helper' || op.like === 'caption') node.textContent = rv.text; else setText(node, rv.text);
      }
      if (op.placeholder !== undefined) { const inp = node.querySelector('input, textarea'); if (inp) { inp.placeholder = op.placeholder; inp.value = ''; } }
      node.style.removeProperty('display');
      if (op.like === 'chip') node.style.setProperty('margin-left', op.position === 'after' ? '8px' : '0');
      if (op.like === 'caption' || op.like === 'helper') for (const [k, v] of [['white-space', 'normal'], ['overflow', 'visible'], ['text-overflow', 'clip'], ['max-width', '320px'], ['display', 'block']]) node.style.setProperty(k, v);
      if (op.position === 'before') el.before(node); else if (op.position === 'prepend') el.prepend(node); else if (op.position === 'append') el.append(node); else el.after(node);
      return { el, added: [node], text: op.text !== undefined ? clean(node.innerText || node.querySelector('input')?.placeholder || '') : null };
    }
    if (op.op === 'wrap') {
      const box = shell(op.title, null);
      el.replaceWith(box);
      box.appendChild(el);
      return { el, added: [box] };
    }
    if (op.op === 'annotate') {
      const rv = resolve(op.text, el, st.targets.indexOf(el));
      if (rv.error) return { error: rv.error };
      balloon(el, op.kind, rv.text);
      return { el, text: rv.text, noMark: true };
    }
    if (op.op === 'badge') return { el, noMark: true, badge: op.text };
    return { error: `operação ${op.op} não se aplica ao DOM` };
  }
  function mark(rects, color, dashed) {
    for (const r of rects) {
      const line = r.h === 0;
      overlay(`left:${r.x - 4}px;top:${r.y - (line ? 2 : 4)}px;width:${r.w + 8}px;height:${line ? 0 : r.h + 8}px;border:${line ? '0' : `3px ${dashed ? 'dashed' : 'solid'} ${color}`};${line ? `border-top:3px dashed ${color};` : ''}border-radius:6px;box-shadow:0 0 0 1px rgba(255,255,255,.9)`);
    }
  }
  const still = document.createElement('style');
  still.textContent = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';
  document.head.appendChild(still);
  window.__dsxp = {
    locate(loc) {
      st.targets = find(loc);
      st.orig = st.targets.map((t) => clean(t.innerText || t.value || t.getAttribute('aria-label') || ''));
      if (!st.targets.length) return { found: 0 };
      if (loc.viewport) scrollTo(0, 0); else st.targets[0].scrollIntoView({ block: 'center', inline: 'nearest' });
      return { found: st.targets.length, crop: contextRect(st.targets), rects: st.targets.map(R), via: st.via };
    },
    /** Tela inteira: sem elemento; devolve o retângulo do diálogo aberto (o recorte) ou null. */
    screen() { st.targets = []; st.orig = []; const d = openDialog(); const p = d && (d.querySelector('.MuiDialog-paper') || d); if (p && (R(p).y < 0 || R(p).y + R(p).h > innerHeight)) p.scrollIntoView({ block: 'start' }); return { dialog: p ? R(p) : null }; },
    /** Antes: balão com o nome acessível ou a dica de hoje; linha da dobra; devolve os retângulos das sobreposições. */
    before(opts) {
      st.overlays = [];
      const el = st.targets[0];
      if (el && (opts.annotate || st.via === 'attr')) {
        const kind = opts.annotate || 'screen-reader';
        balloon(el, kind, st.attrText || opts.text || st.orig[0] || '');
      }
      if (opts.fold) {
        const r = el ? el.getBoundingClientRect() : null;
        foldLine(opts.fold, r && r.bottom + scrollY > opts.fold ? `↓ «${clean(el.innerText).slice(0, 40)}» está abaixo da dobra, a ${Math.round(r.bottom + scrollY)} px do topo` : null);
      }
      return { overlays: st.overlays };
    },
    apply(ops, opts = {}) {
      st.overlays = [];
      st.added = [];
      st.marks = [];
      const touched = [];
      let removed = null, marked = true, badged = false;
      const texts = [], applied = [];
      const before = st.targets.map(R);
      for (const op of ops) {
        const r = applyOp(op);
        if (r.error) return { error: r.error };
        if (r.removed) removed = r.removed;
        texts.push(r.text ?? null);
        applied.push(r.converted || op);
        if (r.el && !r.noMark) touched.push(r.el);
        if (r.added) st.added.push(...r.added);
        if (r.mark) st.marks.push(r.mark);
        if (r.marks) st.marks.push(...r.marks);
        if (r.el && !st.targets.length) st.targets = [r.el];
        if (r.noMark && ops.length === 1) marked = false;
        if (r.badge) badged = r.badge;
      }
      if (opts.fold) foldLine(opts.fold, null);
      // contorno verde só no que a operação mudou ou montou (não nos outros elementos localizados)
      const live = [...(touched.length || st.added.length ? touched : st.targets), ...st.added].filter((t) => t.isConnected && visible(t));
      const rects = marked ? (st.marks.length ? st.marks : [...new Set(live)].map(R)) : [];
      const crop = live.length ? contextRect(live) : null;
      const same = (a, b) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5;
      const geometric = ops.every((o) => ['move', 'style', 'align'].includes(o.op));
      const now = st.targets.map(R);
      const unchanged = geometric && !st.added.length && now.length === before.length && now.every((r, i) => same(r, before[i]));
      return { rects, removed, crop, texts, unchanged, overlays: st.overlays, applied, badged };
    },
    /** Selo no canto superior direito do recorte (por dentro), para não cobrir o elemento nem o vizinho. */
    badgeAt(box, text) {
      overlay(`left:${box.x + box.width - 12}px;top:${box.y + 10}px;transform:translateX(-100%);background:#F1F3F5;color:#1E2130;border:1.5px solid #5B6578;font:600 12.5px/1 Inter,system-ui,sans-serif;padding:7px 12px;border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.18)`, `✓ ${text}`);
    },
    mark(rects, after) { mark(rects, after ? '#12A150' : '#E5484D', false); },
    markRemoved(r) { mark([{ x: r.x, y: r.y, w: r.w, h: 0 }], '#12A150', true); },
  };
}
/* c8 ignore stop */
