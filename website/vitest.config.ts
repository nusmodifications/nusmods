import path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const FILE_MOCK = path.resolve(__dirname, 'src/__mocks__/fileMock.ts');
const SVG_MOCK = path.resolve(__dirname, 'src/__mocks__/svgMock.tsx');
const CSS_MOCK_ID = '\0css-identity-mock';

// Plugin to redirect static asset and CSS/SCSS imports to mock files
function assetMockPlugin(): Plugin {
  return {
    name: 'asset-mock',
    enforce: 'pre',
    resolveId(source) {
      if (
        /\.(?:jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/.test(
          source,
        )
      ) {
        return FILE_MOCK;
      }
      const cleanSource = source.split('?')[0];
      if (cleanSource.endsWith('.svg')) {
        if (source.includes('?url')) return FILE_MOCK;
        return SVG_MOCK;
      }
      if (/\.(?:css|scss)$/.test(source)) {
        return CSS_MOCK_ID;
      }
      return null;
    },
    load(id) {
      // identity-obj-proxy equivalent: returns property name as value
      if (id === CSS_MOCK_ID) {
        return 'export default new Proxy({}, { get: (_, prop) => prop });';
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [assetMockPlugin(), tsconfigPaths()],
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    // Mimic the globals we set with Webpack's DefinePlugin
    NUSMODS_ENV: JSON.stringify('test'),
    DATA_API_BASE_URL: JSON.stringify(''),
    OPTIMISER_API_URL: JSON.stringify(''),
    VERSION_STR: JSON.stringify(''),
    DISPLAY_COMMIT_HASH: JSON.stringify(''),
    DEBUG_SERVICE_WORKER: false,
  },
  test: {
    globals: true,
    root: 'src',
    environment: 'jsdom',
    clearMocks: true,
    setupFiles: ['../scripts/vitest-setup.ts'],
    include: ['**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['**/*.integration.test.{js,jsx,ts,tsx}'],
    // Allow us to directly use enzyme wrappers for snapshotting
    snapshotSerializers: ['enzyme-to-json/serializer'],
    coverage: {
      include: ['**/!(*.d).{js,jsx,ts,tsx}'],
      exclude: ['test-utils/**', 'e2e/**'],
      reportsDirectory: '../coverage',
      reporter: ['text', ...(process.env.CI ? ['json'] : [])],
    },
  },
});
