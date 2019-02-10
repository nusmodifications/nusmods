const warnInDevelopment = process.env.NODE_ENV === 'production' ? 'error' : 'warn';

module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',
  },

  root: true,
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  env: {
    browser: true,
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'import',
    'jsx-a11y',
    'react',
  ],

  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack/webpack.config.js.common.js',
      },
    },
  },

  overrides: [
    {
      files: ['**/*.test.{js,ts,js,tsx}', '**/__mocks__/**/*.{js,ts,js,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        // any is needed for mocking, amongst other things
        '@typescript-eslint/no-explicit-any': 'off',
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


    // Rule is buggy when used with TypeScript
    // TODO: Remove this when https://github.com/benmosher/eslint-plugin-import/issues/1282 is resolved
    'import/named': 'off',

    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-member-accessibility': 'off',

    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-function-return-type': 'off',


    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
      },
    ],


    // We use type aliases for data types
    '@typescript-eslint/prefer-interface': 'off',

    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
