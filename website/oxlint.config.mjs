import nkzw from '@nkzw/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [nkzw],
  globals: {
    NUSMODS_ENV: 'readonly',
    DATA_API_BASE_URL: 'readonly',
    VERSION_STR: 'readonly',
    DISPLAY_COMMIT_HASH: 'readonly',
    DEBUG_SERVICE_WORKER: 'readonly',
    OPTIMISER_API_URL: 'readonly',
    vi: 'readonly',
  },
  overrides: [
    {
      files: [
        '**/*.test.{js,ts,jsx,tsx}',
        '**/__mocks__/**/*.{js,ts,jsx,tsx}',
        '**/test-utils/**/*.{js,ts,jsx,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'unicorn/consistent-function-scoping': 'off',
      },
    },
    {
      files: ['{api,src/bootstrapping}/**/*.ts', '**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  rules: {
    // Not using Relay
    '@nkzw/ensure-relay-types': 'off',
    // Not in existing ESLint config, would cause many changes
    '@nkzw/no-instanceof': 'off',
    // Existing config allowed require in .js files
    '@typescript-eslint/no-require-imports': 'off',
    // Not in existing config, would cause mass code changes (forces Array<T> over T[])
    '@typescript-eslint/array-type': 'off',
    // Not in existing config, would require braces on all single-line if/else
    curly: 'off',
    // Redundant with TypeScript; false positives on Node.js globals in .js files
    'no-undef': 'off',
    // Not in existing config
    '@typescript-eslint/no-empty-object-type': 'off',
    // Not enforced in existing config
    'import-x/no-namespace': 'off',
    // Scripts and webpack configs need console
    'no-console': 'off',
    // Match existing ESLint config (warn, not error)
    'react-hooks/exhaustive-deps': 'warn',
    // New React Compiler rules not in existing config, would require code changes
    'react-hooks-js/immutability': 'off',
    'react-hooks-js/refs': 'off',
    'react-hooks-js/set-state-in-effect': 'off',
    'react-hooks-js/static-components': 'off',
    // False positives with TypeScript (function overloads, etc.)
    'no-redeclare': 'off',
    // Not in existing config
    'react/display-name': 'off',
    // Was off in existing ESLint config
    'react/no-unescaped-entities': 'off',
    // False positives with Downshift's getItemProps() which spreads key
    'react/jsx-key': 'off',
    // Not in existing config, would cause mass code changes
    'unused-imports/no-unused-imports': 'off',
    // Not in existing config, would cause mass reformatting
    'perfectionist/sort-enums': 'off',
    'perfectionist/sort-heritage-clauses': 'off',
    'perfectionist/sort-interfaces': 'off',
    'perfectionist/sort-jsx-props': 'off',
    'perfectionist/sort-object-types': 'off',
    'perfectionist/sort-objects': 'off',
    // Not in existing config, would cause many code changes
    'unicorn/catch-error-name': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/no-typeof-undefined': 'off',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-array-flat-map': 'off',
    'unicorn/prefer-array-some': 'off',
    'unicorn/prefer-at': 'off',
    'unicorn/prefer-dom-node-append': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/prefer-number-properties': 'off',
    'unicorn/prefer-optional-catch-binding': 'off',
    'unicorn/prefer-string-raw': 'off',
    'unicorn/prefer-string-replace-all': 'off',
    'unicorn/prefer-string-slice': 'off',
    'unicorn/prefer-structured-clone': 'off',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/no-useless-spread': 'off',
    'unicorn/text-encoding-identifier-case': 'off',
  },
});
