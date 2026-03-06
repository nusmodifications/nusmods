import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: 'src',
    clearMocks: true,
    setupFiles: ['../scripts/vitest-setup.ts'],
    coverage: {
      include: ['**/*.ts'],
      exclude: ['utils/test-utils.ts', '**/*.d.ts'],
      reportsDirectory: '../coverage',
      reporter: ['text', 'lcov'],
    },
  },
});
