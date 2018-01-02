module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: ['airbnb-base', 'plugin:flowtype/recommended'],
  env: {
    browser: true,
    node: true,
  },
  plugins: ['import', 'flowtype'],
  overrides: [
    {
      files: '**/*.test.{js,jsx}',
      env: {
        jest: true,
      },
    },
  ],
  rules: {
    'arrow-body-style': 'off',
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'max-len': ['error', 120],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
      },
    ],
    'linebreak-style': 'off',
  },
};
