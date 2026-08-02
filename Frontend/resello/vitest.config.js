import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

// Kept separate from vite.config.js so test-only settings don't affect the build.
//
// Deliberately no @vitejs/plugin-react here. Vitest 3.2 bundles its own Vite 7,
// while plugin-react 6 requires Vite 8 — under that mismatch the plugin loads
// without error but never transforms JSX, so every test file failed with
// "React is not defined". esbuild's automatic runtime does the same job for
// tests; the plugin's real value is Fast Refresh, which tests don't use.
//
// The '@' alias must be mirrored from vite.config.js: this file replaces that
// config rather than extending it, so an alias defined only there resolves in
// the build but not under test.
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
