module.exports = {
  extends: [
    // Only enable the TypeScript rules under src/js
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier/@typescript-eslint',
  ],

  overrides: [
    {
      files: ['**/*.test.{js,ts,js,tsx}', '**/__mocks__/**/*.{js,ts,js,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

        // any is needed for mocking, amongst other things
        '@typescript-eslint/no-explicit-any': 'off',

        // Generally safe to allow non-null assertions in unit tests
        '@typescript-eslint/no-non-null-assertion': 'off',

        // Can be cleaner to directly assert types in tests
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
      },
    },

    {
      files: ['**/*.{js,jsx}'],
      rules: {
        // Don't force import for .js files
        '@typescript-eslint/no-var-requires': 'off',
      },
    },

    {
      files: ['api/**/*.ts', 'bootstrapping/**/*.ts'],
      rules: {
        // Easier to write interfaces with external libraries and APIs with any
        '@typescript-eslint/no-explicit-any': 'off',
      }
    }
  ],

  rules: {
    // Assume TypeScript will catch this for us
    'default-case': 'off',

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

    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
};
