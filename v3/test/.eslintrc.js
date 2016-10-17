module.exports = {
  extends: 'plugin:ava/recommended',
  plugins: [
    'ava',
  ],
  rules: {
    // AVA doesn't allow alternative file extensions
    'react/jsx-filename-extension' : 'off',
    // eslint thinks testing tools are dependencies
    'import/no-extraneous-dependencies': 'off',
  },
};
