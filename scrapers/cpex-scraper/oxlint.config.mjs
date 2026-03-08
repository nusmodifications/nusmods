import nkzw from '@nkzw/oxlint-config';
import { defineConfig } from 'oxlint';

// Filter out react-hooks JS plugin since this is not a React project
const config = { ...nkzw };
config.jsPlugins = config.jsPlugins?.filter(
  (p) =>
    p !== '@nkzw/eslint-plugin' &&
    p !== 'eslint-plugin-unused-imports' &&
    !(typeof p === 'object' && p.name === 'react-hooks-js') &&
    p !== 'eslint-plugin-react-hooks',
);
config.rules = Object.fromEntries(
  Object.entries(config.rules ?? {}).filter(
    ([key]) =>
      !key.startsWith('@nkzw/') &&
      !key.startsWith('@typescript-eslint/') &&
      !key.startsWith('react-hooks-js/') &&
      !key.startsWith('react-hooks/') &&
      !key.startsWith('unused-imports/') &&
      key !== '@typescript-eslint/no-unused-vars',
  ),
);

export default defineConfig({
  extends: [config],
  rules: {
    'import-x/no-namespace': 'off',
    'no-console': 'off',
    'perfectionist/sort-object-types': 'off',
    'perfectionist/sort-objects': 'off',
    'unicorn/prefer-string-replace-all': 'off',
    'unicorn/prefer-top-level-await': 'off',
  },
});
