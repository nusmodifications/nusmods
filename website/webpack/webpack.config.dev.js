const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

const developmentConfig = merge([
  {
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: true,
        DISPLAY_COMMIT_HASH: JSON.stringify(parts.appVersion().commitHash),
        VERSION_STR: JSON.stringify(parts.appVersion().versionStr),
        DEBUG_SERVICE_WORKER: !!process.env.DEBUG_SERVICE_WORKER,
        DATA_API_BASE_URL: JSON.stringify(process.env.DATA_API_BASE_URL),
      }),
    ],
  },
  commonConfig,
  {
    mode: 'development',
    // Use a fast source map for good-enough debugging usage
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: 'eval-cheap-module-source-map',
    entry: 'entry/main',
    // Fixes HMR in Webpack 5
    // TODO: Remove once one of these issues are fixed:
    // https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/235
    // https://github.com/webpack/webpack-dev-server/issues/2758
    target: 'web',
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(parts.PATHS.src, 'index.html'),
        cache: true,
        // Our production Webpack config manually injects CSS and JS files.
        // Do the same in development so that we can reuse the same index.html
        // file without having double/triple-injected scripts.
        inject: false,
      }),
      // Copy files from static folder over (in-memory)
      new CopyWebpackPlugin({
        patterns: [
          { from: 'static', context: parts.PATHS.root, globOptions: { ignore: ['short_url.php'] } },
        ],
      }),
      // Ignore node_modules so CPU usage with poll watching drops significantly.
      new webpack.WatchIgnorePlugin({
        paths: [parts.PATHS.node, parts.PATHS.build],
      }),
      new ReactRefreshWebpackPlugin(),
    ],
  },
  parts.lintJavaScript({
    include: parts.PATHS.src,
  }),
  parts.lintCSS(),
  parts.loadImages({
    include: parts.PATHS.images,
  }),
  parts.loadCSS({
    include: parts.PATHS.styles,
  }),
  parts.loadCSS({
    include: parts.PATHS.src,
    exclude: parts.PATHS.styles,
    options: {
      modules: {
        localIdentName: '[name]-[local]',
      },
    },
  }),
  parts.devServer(),
]);

module.exports = developmentConfig;
