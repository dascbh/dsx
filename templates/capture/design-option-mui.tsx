// DSX capture-from-code — MUI provider that applies the design option over the product theme, with the same adapter
// the live switcher uses (themeOptionsOver). Put it inside the app's own theme provider in mountPage:
//   providers: (children) => <AppThemeProvider><DesignOptionTheme><CssBaseline />{children}</DesignOptionTheme></AppThemeProvider>
// Without DSX_DESIGN_MD it renders its children unchanged.
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { themeOptionsOver } from '../../src/dev/design-lab/mui'; // ADAPT: where templates/theme-adapters/mui.ts lives
import { DESIGN } from './design-option';

const theme = (outer: Theme) => (DESIGN ? createTheme(themeOptionsOver(outer, DESIGN)) : outer);

export function DesignOptionTheme({ children }: { children: ReactNode }) {
  if (!DESIGN) return <>{children}</>;
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
