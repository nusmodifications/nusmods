const merge = require('webpack-merge');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const parts = require('./webpack.parts');

const commonConfig = merge([
  {
    // This tells Webpack where to look for modules.
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
        // Only include path for access to __mocks__
        ...(process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test' ? [parts.PATHS.root] : []),
      ],
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
    output: {
      path: parts.PATHS.build,
      filename: '[name].js',
    },
    plugins: [
      new StyleLintPlugin({
        context: parts.PATHS.styles,
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
