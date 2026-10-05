// DSX theme switcher for MUI — wraps the app in the active option's theme, merged over the product theme with the
// same adapter the static captures use (themeOptionsOver). Development only: load it with
//   const DesignLab = import.meta.env.DEV ? lazy(() => import('./dev/design-lab/MuiDesignLab')) : null;
// and put the app (CssBaseline included, so the page background follows) as its children. See main.example.tsx.
import { useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { googleFontUrls } from './design-md';
import { themeOptionsOver } from './mui';
import { useDesignOption } from './useDesignOption';
import { DesignLabPanel } from './DesignLabPanel';
import type { DesignLabLabels, DesignManifest } from './selection';
// Written by `node <DSX>/tools/design-md/lab.mjs manifest` (design.manifest in .dsx/config.json); `add` and `use` refresh it.
import manifestJson from './options.json';

const manifest = manifestJson as DesignManifest;

export default function MuiDesignLab({ children, labels }: { children: ReactNode; labels?: DesignLabLabels }) {
  const state = useDesignOption(manifest);
  const { design } = state;
  useEffect(() => {
    document.documentElement.dataset.dsxDesignOption = state.active;
    const links = design ? googleFontUrls(design).map((href) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.dataset.dsxDesignLab = '';
      document.head.appendChild(l);
      return l;
    }) : [];
    return () => links.forEach((l) => l.remove());
  }, [design, state.active]);
  const theme = useCallback((outer: Theme) => (design ? createTheme(themeOptionsOver(outer, design)) : outer), [design]);
  return (
    <>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
      <DesignLabPanel state={state} labels={labels} />
    </>
  );
}
