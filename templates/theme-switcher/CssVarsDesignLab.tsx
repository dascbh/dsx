// DSX theme switcher for CSS variables (Tailwind with the css-vars preset, plain CSS, any kit that reads variables).
// Injects the active option's variables (toCssVariables) in a <style> after the app's own, so they win; official
// removes it. Development only, loaded like MuiDesignLab (see main.example.tsx).
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { googleFontUrls } from './design-md';
import { toCssVariables } from './css-vars';
import { useDesignOption } from './useDesignOption';
import { DesignLabPanel } from './DesignLabPanel';
import type { DesignLabLabels, DesignManifest } from './selection';
import manifestJson from './options.json';

const manifest = manifestJson as DesignManifest;

export default function CssVarsDesignLab({ children, labels, prefix }: { children: ReactNode; labels?: DesignLabLabels; prefix?: string }) {
  const state = useDesignOption(manifest);
  const { design } = state;
  useEffect(() => {
    if (!design) return;
    const style = document.createElement('style');
    style.dataset.dsxDesignLab = state.active;
    style.textContent = toCssVariables(design, { prefix }).css;
    document.head.appendChild(style);
    const links = googleFontUrls(design).map((href) => Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
    links.forEach((l) => document.head.appendChild(l));
    return () => { style.remove(); links.forEach((l) => l.remove()); };
  }, [design, state.active, prefix]);
  return (
    <>
      {children}
      <DesignLabPanel state={state} labels={labels} />
    </>
  );
}
