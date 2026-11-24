import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['build/**', 'coverage/**', 'vitest.config.ts'],
      provider: 'v8',
      reporter: ['text', 'html', 'clover'],
    },
    exclude: ['build/**', 'coverage/**', 'node_modules/**'],
    globals: true,
  },
});
