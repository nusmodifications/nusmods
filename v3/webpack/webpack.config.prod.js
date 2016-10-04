const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.config.common');
const utils = require('./utils');

const config = merge(
  common,
  {
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(common.PATHS.app, 'index.ejs'),
        cache: true,
      })
    ],
    output: {
      // The build folder.
      path: common.PATHS.build,
      filename: '[name].[chunkhash].js',
      // This is used for require.ensure. The setup
      // will work without but this is useful to set.
      chunkFilename: '[chunkhash].js',
    },
  },
  // Delete the build folder.
  // TODO: Use create-react-app's way of building that shows file size differences.
  utils.clean(common.PATHS.build),
  utils.setFreeVariable('process.env.NODE_ENV', 'production'),
  utils.extractBundle({
    name: 'vendor',
    entries: common.VENDOR,
  }),
  utils.minify(),
  utils.extractCSS(common.PATHS.styles)
);

module.exports = config;
