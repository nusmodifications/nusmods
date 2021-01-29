const warnInDevelopment = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },

  root: true,
  extends: ['airbnb', 'prettier', 'prettier/react'],

  plugins: ['@typescript-eslint', 'prettier', 'import', 'jsx-a11y', 'react', 'react-hooks'],

  settings: {
    // 'import/resolver': {
    //   webpack: {
    //     config: 'webpack/webpack.config.common.js',
    //   },
    // },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },

  rules: {
    'prettier/prettier': warnInDevelopment,

    // Allow debugger and console statement in development
    'no-debugger': warnInDevelopment,
    'no-console': warnInDevelopment,

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

    'react/no-unescaped-entities': 'off',

    'react/no-array-index-key': 'off',

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
    'react/jsx-props-no-spreading': 'off',
    'react/state-in-constructor': 'off',

    // Defaults to outside, which is pretty ugly
    'react/static-property-placement': ['error', 'static public field'],

    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    'react/default-props-match-prop-types': ['error', { allowRequiredDefaults: true }],

    // TypeScript lints this for us
    'react/prop-types': 'off',

    // Too verbose, creates too many variables
    'react/destructuring-assignment': 'off',

    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies

    // Unnecessary with JSX transform
    'react/react-in-jsx-scope': 'off',

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
