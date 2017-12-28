module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: [
    'airbnb-base',
  ],
  env: {
    node: true,
  },
  plugins: [
    'import',
  ],
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
        'max-len': ['error', 120, {
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        }],
      },
    },
  ],
  rules: {
    // Consistent arrow parens
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
      },
    ],
    'max-len': ['error', 100, { ignoreComments: true }],
    // Let git handle the linebreaks instead
    'linebreak-style': 'off',
    'no-shadow': ['error', { allow: ['i'] }],
  },
};
