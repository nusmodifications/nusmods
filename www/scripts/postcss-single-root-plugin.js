/**
 * A custom PostCSS plugin that strips away extra :root declarations
 *
 * We need this because for postcss-custom-properties and CSS modules
 * to work together properly, the ':root' CSS variable declaration
 * block need to be duplicated at the top of every CSS module's styles.
 *
 * This leads to a huge number of ':root' styles being emitted, which
 * isn't a huge problem in production since gzip can compress duplicate
 * text blocks for free, but does make development harder, so we strip
 * the extra ':root' rules using a PostCSS plugin.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
module.exports = require('postcss').plugin('postcss-single-root-plugin', () => {
  const rootSelector = ':root';
  let count = 0;

  return (css) => {
    css.walkRules((rule) => {
      if (rule.selector === rootSelector) {
        if (count === 1) {
          rule.remove();
        } else {
          count = 1;
        }
      }
    });
  };
});
