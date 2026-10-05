// DSX theme switcher — how to mount it in the app's entry point (React + Vite). Copy the lines marked DSX.
// In a production build `import.meta.env.DEV` is the literal false, so the bundler drops the lazy import and none of
// the switcher files (nor options.json) reach the bundle. Prove it after `vite build`:
//   node <DSX>/tools/design-md/lab.mjs bundle-check dist
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import App from './App';
import { AppThemeProvider } from './theme'; // the product's own theme provider, unchanged

// DSX: development-only design switcher (null in production)
const DesignLab = import.meta.env.DEV ? lazy(() => import('./dev/design-lab/MuiDesignLab')) : null;

const app = (
  <>
    <CssBaseline />
    <App />
  </>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      {/* DSX: inside the product theme (it merges over it), around everything that reads the theme */}
      {DesignLab ? <Suspense fallback={null}><DesignLab>{app}</DesignLab></Suspense> : app}
    </AppThemeProvider>
  </StrictMode>,
);
