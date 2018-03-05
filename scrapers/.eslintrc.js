module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: ['airbnb-base', 'prettier'],
  env: {
    node: true,
  },
  plugins: ['import', 'prettier'],
  settings: {
    'import/resolver': 'node',
  },
  overrides: [
    {
      files: '**/*.test.{js,jsx}',
      env: {
        jest: true,
      },
      rules: {
        // Much more lenient linting for tests
        'max-len': [
          'error',
          120,
          {
            ignoreComments: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
          },
        ],
      },
    },
  ],
  rules: {
    'prettier/prettier': ['warn'],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        mjs: 'never',
      },
    ],
    // Enable i++ in for loops
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'max-len': ['error', 100, { ignoreComments: true }],
    // Let git handle the linebreaks instead
    'linebreak-style': 'off',
    'no-shadow': ['error', { allow: ['i'] }],
  },
};
