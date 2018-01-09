/**
 * A custom PostCSS plugin that strips away extra :root declarations
 *
 * We need this for postcss-custom-properties plugin and CSS modules
 * to work together properly, the ':root' CSS variable declaration
 * block need to be duplicated at the top of every CSS module's styles.
 *
 * This leads to a huge number of ':root' styles being emitted, which
 * isn't a huge problem in production since gzip can compress duplicate
 * text blocks for free, but does make development harder, so we strip
 * the extra ':root' rules using a PostCSS plugin.
 */

const postcss = require('postcss'); // eslint-disable-line import/no-extraneous-dependencies

const rootSelectors = [':root', 'body.mode-dark'];

module.exports = postcss.plugin('postcss-single-root', () => (css) => {
  let isMainCSS = false;

  css.walkComments((comment) => {
    // Because PostCSS is run before css-loader, this plugin will receive a new
    // CSS object for every CSS module. This means that it needs to identify
    // which is the 'main.scss' file which it can then ignore so that it won't
    // drop the rules from the 'real' css-variables.scss file
    if (comment.text.includes('@postcss-single-root-entry')) {
      isMainCSS = true;
      return false;
    }

    return true;
  });

  if (isMainCSS) return;

  css.walkRules((rule) => {
    if (rootSelectors.includes(rule.selector)) {
      rule.remove();
    }
  });
});
