module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
    'prettier',
    'prettier/babel',
    'prettier/flowtype',
  ],

  env: {
    node: true,
  },

  plugins: ['flowtype', 'prettier', 'import'],

  overrides: [
    {
      files: ['**/*.test.js', '**/__mocks__/**/*.js', 'src/utils/test-utils.js'],
      env: {
        jest: true,
      },
    },
  ],

  rules: {
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

    'import/no-extraneous-dependencies': [
      'error', { devDependencies: ['**/*.test.js', 'src/utils/test-utils.js'] },
    ],
  },
};
