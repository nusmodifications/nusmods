import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['**/*.integration.test.{js,jsx,ts,tsx}'],
      exclude: [],
      coverage: {
        enabled: false,
      },
    },
  }),
);
