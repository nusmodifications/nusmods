/* eslint-disable global-require, import/no-extraneous-dependencies */
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-custom-properties')({
      preserve: true, // Preserve the original CSS variable declaration
      warnings: false, // Ignore warnings about variables declared on non-:root selectors
    }),
    // Custom plugin used to remove extra ':root' rules
    require('./scripts/postcss-single-root-plugin'),
  ],
};
