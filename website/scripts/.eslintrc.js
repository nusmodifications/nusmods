module.exports = {
  env: {
    node: true,
  },

  settings: {
    'import/resolver': {
      // https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-509384041
      node: {},
    },
  },

  rules: {
    // build scripts gotta print
    'no-console': 'off',
    // eslint thinks script dev dependencies are dependencies
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};
