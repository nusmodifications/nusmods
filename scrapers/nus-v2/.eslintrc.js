const WARN_IN_DEV = process.env === 'production' ? 'error' : 'warn';

module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',
  },

  root: true,

  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint',
  ],

  env: {
    node: true,
  },

  plugins: [
    '@typescript-eslint',
    'prettier',
    'import',
  ],

  overrides: [
    {
      files: ['**/*.test.ts', '**/__mocks__/**/*.ts', 'src/utils/test-utils.ts'],
      env: {
        jest: true,
      },
      rules: {
        // any is needed for mocking, amongst other things
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],

  rules: {
    'prettier/prettier': WARN_IN_DEV,

    // Enable i++ in for loops
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

    // Allows for more compact class declaration
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    // Let git handle the linebreaks instead.
    'linebreak-style': 'off',

    // Override AirBnb to allow for-of, since this is on the server so regenerator-runtime
    // overhead is trivial
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],

    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts', 'src/utils/test-utils.ts'] }],

    // Rule is buggy when used with TypeScript
    // TODO: Remove this when https://github.com/benmosher/eslint-plugin-import/issues/1282 is resolved
    'import/named': 'off',

    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-member-accessibility': 'off',

    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-function-return-type': 'off',

    '@typescript-eslint/no-unused-vars': [
      WARN_IN_DEV,
      {
        ignoreRestSiblings: true,
      },
    ],

    // We use type aliases for data types
    '@typescript-eslint/prefer-interface': 'off'
  },
};
