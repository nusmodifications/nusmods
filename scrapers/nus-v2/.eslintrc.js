module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
    'prettier',
    'prettier/babel',
    'prettier/flowtype'
  ],

  env: {
    node: true,
  },

  plugins: ['flowtype', 'prettier', 'import'],

  overrides: [
    {
      files: ['**/*.test.js', '**/__mocks__/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],

  rules: {
    // Let git handle the linebreaks instead.
    'linebreak-style': 'off',
  },
};
