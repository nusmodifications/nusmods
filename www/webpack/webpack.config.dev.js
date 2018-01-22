const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

const developmentConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', 'development'),
  commonConfig,
  {
    // Use a fast source map for good-enough debugging usage
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: 'cheap-module-eval-source-map',
    entry: [
      'react-hot-loader/patch',
      // Modify entry for hot module reload to work
      // See: https://survivejs.com/webpack/appendices/hmr/#setting-wds-entry-points-manually
      'webpack-dev-server/client?http://0.0.0.0:8080',
      'webpack/hot/only-dev-server',
      'main',
    ],
    plugins: [
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      new WatchMissingNodeModulesPlugin(parts.PATHS.node),
      new HtmlWebpackPlugin({
        template: path.join(parts.PATHS.app, 'index.html'),
        cache: true,
      }),
      new AutoDllPlugin({
        inject: true, // will inject the DLL bundles to index.html
        filename: parts.DLL.FILE_FORMAT,
        entry: parts.DLL.ENTRIES,
      }),
      // Copy files from static folder over (in-memory)
      new CopyWebpackPlugin([
        { from: 'static', context: parts.PATHS.root, ignore: ['short_url.php'] },
      ]),
      // Ignore node_modules so CPU usage with poll watching drops significantly.
      new webpack.WatchIgnorePlugin([parts.PATHS.node, parts.PATHS.build]),
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      // Waiting on: https://github.com/jantimon/html-webpack-plugin/issues/533
      new webpack.HotModuleReplacementPlugin(),
      // { multiStep: true }
      // prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin(),
      // do not emit compiled assets that include errors
      new webpack.NoEmitOnErrorsPlugin(),
    ],
  },
  parts.loadImages({
    include: parts.PATHS.images,
  }),
  parts.loadCSS({
    include: parts.PATHS.styles,
  }),
  parts.loadCSS({
    include: parts.PATHS.scripts,
    options: {
      modules: true,
      localIdentName: '[name]-[local]_[hash:base64:4]',
    },
  }),
  parts.flow({ failOnError: false }),
]);

module.exports = developmentConfig;
