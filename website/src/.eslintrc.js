module.exports = {
  env: {
    browser: true,
  },

  extends: [
    // Only enable the TypeScript rules under src
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier/@typescript-eslint',
  ],

  overrides: [
    {
      files: [
        '**/*.test.{js,ts,jsx,tsx}',
        '**/__mocks__/**/*.{js,ts,jsx,tsx}',
        'test-utils/**/*.{js,ts,jsx,tsx}',
      ],
      env: {
        jest: true,
      },
      rules: {
        // These seem to be tripping randomly in tests unfortunately
        'max-classes-per-file': 'off',

        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

        // any is needed for mocking, amongst other things
        '@typescript-eslint/no-explicit-any': 'off',

        // Generally safe to allow non-null assertions in unit tests since
        // they will trigger runtime crashes that can be caught by the test
        '@typescript-eslint/no-non-null-assertion': 'off',

        // Can be cleaner to directly assert types in tests
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
      },
    },

    {
      files: ['**/*.{js,jsx}'],
      rules: {
        // Don't force import over require in .js files
        '@typescript-eslint/no-var-requires': 'off',
      },
    },

    {
      files: ['{api,bootstrapping}/**/*.ts', '**/*.d.ts'],
      rules: {
        // Easier to write interfaces with external libraries and APIs with any
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },

    {
      files: ['**/*.d.ts'],
      rules: {
        // ESLint triggers this on declared constructors, which is useless
        'no-useless-constructor': 'off',
        // Also triggering incorrectly in some type declarations
        '@typescript-eslint/no-unused-vars': 'off',
      }
    },

    {
      files: ['{apis,test-utils,types,utils}/**/*.{js,ts,jsx,tsx}'],
      rules: {
        // Util files don't necessarily need a default export
        'import/prefer-default-export': 'off',
      },
    },

    {
      files: ['{apis,types}/**/*.{ts,tsx}'],
      rules: {
        // External types may not be camelcase
        '@typescript-eslint/camelcase': 'off',
      },
    },
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

    // We use type aliases for data types, ie. things that are not new-able
    '@typescript-eslint/prefer-interface': 'off',

    // TODO: Fix these
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
};
