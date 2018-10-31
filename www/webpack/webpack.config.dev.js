const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

const developmentConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', 'development'),
  parts.setFreeVariable('process.env.DEBUG_WORKBOX', process.env.DEBUG_WORKBOX),
  commonConfig,
  {
    mode: 'development',
    // Use a fast source map for good-enough debugging usage
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: 'cheap-module-eval-source-map',
    entry: [
      'react-hot-loader/patch',
      // Modify entry for hot module reload to work
      // See: https://survivejs.com/webpack/appendices/hmr/#setting-wds-entry-points-manually
      'webpack-dev-server/client',
      'webpack/hot/only-dev-server',
      'main',
    ],
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(parts.PATHS.app, 'index.html'),
        cache: true,
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
      // { multiStep: true }
      new webpack.HotModuleReplacementPlugin(),
      // do not emit compiled assets that include errors
      new webpack.NoEmitOnErrorsPlugin(),
      // Caches compiled modules to disk to improve rebuild times
      new HardSourceWebpackPlugin({
        info: {
          level: 'info',
        },
      }),
    ],
  },
  process.env.DEBUG_WORKBOX ? parts.workbox() : {},
  parts.lintJavaScript({
    include: parts.PATHS.app,
  }),
  parts.lintCSS(),
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
