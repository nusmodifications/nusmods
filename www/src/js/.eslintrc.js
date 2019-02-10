module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier/@typescript-eslint',
  ],

  rules: {
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
  }
};
