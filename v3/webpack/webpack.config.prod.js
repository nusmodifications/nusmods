const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

const productionConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', 'production'),
  commonConfig,
  {
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',
    output: {
      // The build folder.
      path: parts.PATHS.build,
      filename: '[name].[chunkhash].js',
      // This is used for require.ensure. The setup
      // will work without but this is useful to set.
      chunkFilename: '[chunkhash].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'NUSMods',
        template: path.join(parts.PATHS.app, 'index.html'),
      }),
      // SEE: https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
      new webpack.optimize.ModuleConcatenationPlugin(),
    ],
  },
  parts.clean(parts.PATHS.build),
  parts.extractBundle({
    name: 'vendor',
    entries: parts.VENDOR,
  }),
  parts.minifyJavascript(),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  // If the file size is below the specified limit
  // the file is converted into a data URL and inlined to avoid requests.
  parts.loadImages({
    include: parts.PATHS.images,
    options: {
      limit: 15000,
      name: 'img/[name].[hash].[ext]',
    },
  }),
  parts.extractCSS({
    include: parts.PATHS.app,
  }),
  // Fail for CI
  parts.flow({ failOnError: true }),
]);

module.exports = productionConfig;
