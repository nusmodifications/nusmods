import nkzw from '@nkzw/oxlint-config';
import { defineConfig } from 'oxlint';

// Filter out react-hooks JS plugin since this is not a React project
const config = { ...nkzw };
config.jsPlugins = config.jsPlugins?.filter(
  (p) =>
    !(typeof p === 'object' && p.name === 'react-hooks-js') &&
    p !== 'eslint-plugin-react-hooks',
);
config.rules = Object.fromEntries(
  Object.entries(config.rules ?? {}).filter(
    ([key]) => !key.startsWith('react-hooks-js/') && !key.startsWith('react-hooks/'),
  ),
);

export default defineConfig({
  extends: [config],
  rules: {
    'import-x/no-namespace': 'off',
    'no-console': 'off',
    'unicorn/prefer-top-level-await': 'off',
  },
});
