const merge = require('webpack-merge');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const parts = require('./webpack.parts');

// Used by Webpack to resolve the path to assets on the client side
// See: https://webpack.js.org/guides/public-path/
const publicPath = process.env.PUBLIC_PATH || '/';

const commonConfig = merge([
  {
    // This tells Webpack where to look for modules. Remember to update the
    // corresponding entry in .flowconfig if you're updating these
    resolve: {
      // Specify a few root paths when importing our own modules,
      // so that we can use absolute paths in our imports.
      // E.g. Importing our own module at `/js/path/to/module` will simply be:
      // `import module from 'path/to/module;`
      modules: [
        parts.PATHS.scripts,
        parts.PATHS.app,
        parts.PATHS.styles,
        parts.PATHS.node,
      ],
      // Maps specific modules, similar to modules above, except in this case
      // we map the folders directly - for instance we only want __mocks__ and not
      // any of the other folders under root to be imported from root, so we use
      // this instead of modules
      alias: {
        __mocks__: parts.PATHS.fixtures,
      },
      // Importing modules from these files will not require the extension.
      extensions: ['.js', '.jsx', '.json'],
    },
    // Entry accepts a path or an object of entries.
    // We'll be using the latter form given it's
    // convenient with more complex configurations.
    entry: {
      // This will build an app.js file from the `main` module.
      app: ['babel-polyfill', 'main'],
    },
    context: parts.PATHS.app,
    output: {
      publicPath,
      path: parts.PATHS.build,
      filename: '[name].js',
    },
    plugins: [
      new StyleLintPlugin({
        context: parts.PATHS.app,
      }),
      new LodashModuleReplacementPlugin({
        caching: true,
        collections: true,
        flattening: true,
        paths: true,
      }),
    ],
  },
  parts.lintJavaScript({
    include: parts.PATHS.app,
  }),
  parts.transpileJavascript({
    include: parts.PATHS.scripts,
  }),
  parts.mockNode(),
]);

module.exports = commonConfig;
