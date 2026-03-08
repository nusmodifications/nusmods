import nkzw from '@nkzw/oxlint-config';
import { defineConfig } from 'oxlint';

// Filter out react-related config since this is not a React project
const config = { ...nkzw };
config.jsPlugins = config.jsPlugins?.filter(
  (p) =>
    !(typeof p === 'object' && p.name === 'react-hooks-js') && p !== 'eslint-plugin-react-hooks',
);
// Remove react-hooks-js/* and react-hooks/* rules
config.rules = Object.fromEntries(
  Object.entries(config.rules ?? {}).filter(
    ([key]) => !key.startsWith('react-hooks-js/') && !key.startsWith('react-hooks/'),
  ),
);

export default defineConfig({
  extends: [config],
  ignorePatterns: ['**/antlr4/*'],
  overrides: [
    {
      files: ['**/*.test.ts', '**/__mocks__/**/*.ts', 'src/utils/test-utils.ts'],
      rules: {
        'unicorn/consistent-function-scoping': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import-x/no-namespace': 'off',
    'unused-imports/no-unused-imports': 'off',
  },
});
