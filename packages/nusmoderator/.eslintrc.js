module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
  ],
  env: {
    browser: true,
    node: true,
  },
  globals: {
    expect: true,
    it: true,
  },
  plugins: [
    'flowtype',
    'import',
  ],
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js',
      },
    },
  },
  rules: {
    'arrow-body-style': 'off',
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'max-len': ['error', 120],
    'import/extensions': ['error', 'always',
      {
        js: 'never',
      }
    ],
    'linebreak-style': 'off',
  },
};
