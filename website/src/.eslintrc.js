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
        // Also triggering incorrectly in some type declarations
        '@typescript-eslint/no-unused-vars': 'off',
      },
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
        camelcase: 'off',
      },
    },
  ],

  rules: {
    // Use @typescript-eslint to catch this
    'default-case': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],

    // Doesn't work with TypeScript
    'no-use-before-define': 'off',

    // Makes the code unnecessarily verbose
    '@typescript-eslint/explicit-function-return-type': 'off',
    // We use type inference heavily for things like reducers
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
      },
    ],
  },

  // Mimic the globals we set with Webpack's DefinePlugin
  globals: {
    NUSMODS_ENV: 'readonly',
    DATA_API_BASE_URL: 'readonly',
    VERSION_STR: 'readonly',
    DISPLAY_COMMIT_HASH: 'readonly',
    DEBUG_SERVICE_WORKER: 'readonly',
  },
};
