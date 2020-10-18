const WARN_IN_DEV = process.env === 'production' ? 'error' : 'warn';

module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',
  },

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
  },

  root: true,

  extends: [
    'airbnb-base',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
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

    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        ts: 'never',
      },
    ],

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

    'no-continue': 'off',

    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts', 'src/utils/test-utils.ts'] }],

    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-member-accessibility': 'off',

    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    '@typescript-eslint/no-unused-vars': [
      WARN_IN_DEV,
      {
        ignoreRestSiblings: true,
      },
    ],

    // We use type aliases for data types
    '@typescript-eslint/prefer-interface': 'off',

    '@typescript-eslint/no-explicit-any': WARN_IN_DEV,
  },
};
