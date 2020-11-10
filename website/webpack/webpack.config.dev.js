const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
    entry: [
      'react-hot-loader/patch',
      // Modify entry for hot module reload to work
      // See: https://survivejs.com/webpack/appendices/hmr/#setting-wds-entry-points-manually
      'webpack-dev-server/client',
      'webpack/hot/only-dev-server',
      'entry/main',
    ],
    resolve: {
      alias: {
        // Replace React DOM with the hot reload patched version in development
        'react-dom': '@hot-loader/react-dom',
      },
    },
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
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      // Waiting on: https://github.com/jantimon/html-webpack-plugin/issues/533
      // { multiStep: true }
      new webpack.HotModuleReplacementPlugin(),
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
