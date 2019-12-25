const warnInDevelopment = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier/@typescript-eslint',
    'prettier',
  ],
  env: {
    browser: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  rules: {
    'prettier/prettier': warnInDevelopment,
    'import/extensions': [
      warnInDevelopment,
      'always',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-member-accessibility': 'off',
    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-function-return-type': 'off',
    'linebreak-style': 'off',
  },
};
