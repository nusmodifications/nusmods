const warnInDevelopment = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',

    // @typescript-eslint/parser doesn't play well with eslint --watch, this is
    // a stopgap measure to allow adding new files in the IDE to still work.
    // See https://github.com/typescript-eslint/typescript-eslint/issues/890
    createDefaultProgram: process.env.NODE_ENV !== 'production' && !process.env.CI,
  },

  root: true,
  extends: ['airbnb', 'prettier', 'prettier/react'],

  plugins: ['@typescript-eslint', 'prettier', 'import', 'jsx-a11y', 'react'],

  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack/webpack.config.common.js',
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },

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

    // Allow properties that are logically grouped together to be written
    // without line breaks
    'lines-between-class-members': 'off',

    // Enable i++ in for loops
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-bitwise': 'off',

    'react/no-unescaped-entities': 'off',

    'react/no-array-index-key': 'off',

    // SEE: https://github.com/yannickcr/eslint-plugin-react/issues
    'react/no-unused-prop-types': 'off',

    // Enables typing to be placed above lifecycle
    'react/sort-comp': [
      warnInDevelopment,
      {
        order: [
          'type-annotations',
          'instance-variables',
          'static-methods',
          'lifecycle',
          '/^on.+$/',
          'everything-else',
          'render',
        ],
      },
    ],

    // These lints are not useful
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/state-in-constructor': 'off',

    // Defaults to outside, which is pretty ugly
    "react/static-property-placement": ['error', 'static public field'],

    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    'react/default-props-match-prop-types': ['error', { allowRequiredDefaults: true }],

    // TypeScript lints this for us
    'react/prop-types': 'off',

    // Too verbose, creates too many variables
    'react/destructuring-assignment': 'off',

    // TODO: Fix this
    'react/no-access-state-in-setstate': 'warn',

    // TODO: Replace divs with buttons, but remove all button styling.
    'jsx-a11y/no-static-element-interactions': 'off',

    // Seem to be triggering on th, so setting to warn for now
    // TODO: Wait for https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/637
    'jsx-a11y/control-has-associated-label': 'warn',

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

    // Rule appear to be buggy when used with @typescript-eslint/parser
    'jsx-a11y/label-has-associated-control': 'off',

    // For use with immer
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['draft', 'draftState'] },
    ],

    // Let git handle the linebreaks instead.
    'linebreak-style': 'off',
  },
};
