// DSX capture-from-code — Vitest config for captures only. Put it next to the project's vite/vitest config.
// It reuses the app's Vite config (aliases, plugins, PostCSS/Tailwind) and turns on CSS processing so CSS modules
// and Tailwind end up as <style> tags in jsdom, where serialize.ts reads them.
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/capture/**/*.capture.test.tsx'],
    // process every stylesheet (default is none): CSS modules keep readable class names in the capture
    css: { include: [/.+/], modules: { classNameStrategy: 'non-scoped' } },
    // one file at a time: captures share the output folder and are cheap to rerun
    fileParallelism: false,
  },
}));
