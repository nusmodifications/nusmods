import nkzw from '@nkzw/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [nkzw],
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
