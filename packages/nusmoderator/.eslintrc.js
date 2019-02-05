const warnInDevelopment = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: ['airbnb-base', 'plugin:flowtype/recommended', 'prettier'],
  env: {
    browser: true,
    node: true,
  },
  plugins: ['import', 'flowtype', 'prettier'],
  overrides: [
    {
      files: '**/*.test.{js,jsx}',
      env: {
        jest: true,
      },
    },
  ],
  rules: {
    'prettier/prettier': warnInDevelopment,
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
