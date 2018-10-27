/* eslint-disable global-require, import/no-extraneous-dependencies */
const config = {
  plugins: [
    require('autoprefixer'),
    require('postcss-custom-properties')({
      preserve: true, // Preserve the original CSS variable declaration
      warnings: false, // Ignore warnings about variables declared on non-:root selectors
    }),
    // Custom plugin used to remove extra ':root' rules
    require('./scripts/postcss-single-root'),
  ],
};

// Use CSSNano in production to minify CSS
if (process.env.NODE_ENV === 'production') {
  config.plugins.push(require('cssnano'));
}

module.exports = config;
