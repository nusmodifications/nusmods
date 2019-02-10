const warnInDevelopment = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  parser: 'babel-eslint',
  root: true,
  extends: ['airbnb', 'prettier', 'prettier/react'],
  env: {
    browser: true,
  },
  plugins: ['prettier', 'import', 'jsx-a11y', 'react'],
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack/webpack.config.common.js',
      },
    },
  },
  overrides: [
    {
      files: ['**/*.test.{js,ts,js,tsx}', '**/__mocks__/**/*.{js,ts,js,tsx}'],
      env: {
        jest: true,
      },
    },
  ],
  rules: {
    'prettier/prettier': warnInDevelopment,

    // Allow debugger and console statement in development
    'no-debugger': warnInDevelopment,
    'no-console': warnInDevelopment,

    'no-alert': 'off',
    'prefer-destructuring': 'off',

    'import/extensions': [
      warnInDevelopment,
      'always',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    // Enable i++ in for loops
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-bitwise': 'off',

    'react/no-array-index-key': 'off',
    // SEE: https://github.com/yannickcr/eslint-plugin-react/issues
    'react/no-unused-prop-types': 'off',
    // Enables typing to be placed above lifecycle
    'react/sort-comp': [
      warnInDevelopment,
      {
        order: [
          'type-annotations',
          'static-methods',
          'lifecycle',
          '/^on.+$/',
          'everything-else',
          'render',
        ],
      },
    ],
    'react/require-default-props': 'off',
    'react/default-props-match-prop-types': ['error', { allowRequiredDefaults: true }],
    // TODO: Replace divs with buttons, but remove all button styling.
    'jsx-a11y/no-static-element-interactions': 'off',
    // The default option requires BOTH id and nesting, which is excessive,
    // especially with checkboxes and radiobuttons. This changes it to EITHER
    'jsx-a11y/label-has-for': [
      'error',
      {
        required: {
          some: ['nesting', 'id'],
        },
      },
    ],
    // Link fails this rule as it has no "href" prop.
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],
    // For use with immer
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['draft', 'draftState'] },
    ],
    // Let git handle the linebreaks instead.
    'linebreak-style': 'off',
  },
};
