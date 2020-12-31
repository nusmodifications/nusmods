const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

// eslint-disable-next-line no-underscore-dangle
const __DEV__ = process.env.NODE_ENV === 'development';

const source = (file) => path.join('entry/export', file);

const timetableOnlyConfig = merge([
  {
    plugins: [
      new webpack.DefinePlugin({
        __DEV__,
        __TEST__: process.env.NODE_ENV === 'test',
        DISPLAY_COMMIT_HASH: JSON.stringify(parts.appVersion().commitHash),
        VERSION_STR: JSON.stringify(parts.appVersion().versionStr),
        DEBUG_SERVICE_WORKER: !!process.env.DEBUG_SERVICE_WORKER,
        DATA_API_BASE_URL: JSON.stringify(process.env.DATA_API_BASE_URL),
        VERCEL_ENV: JSON.stringify(process.env.VERCEL_ENV),
        VERCEL_GIT_COMMIT_REF: JSON.stringify(process.env.VERCEL_GIT_COMMIT_REF),
      }),
    ],
  },
  commonConfig,
  {
    // Override common's entry point
    entry: source('main.tsx'),
    // Don't attempt to continue if there are any errors.
    bail: true,
    mode: __DEV__ ? 'development' : 'production',
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',
    output: {
      publicPath: parts.TIMETABLE_ONLY_PUBLIC_PATH,
      path: parts.PATHS.buildTimetable,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(parts.PATHS.src, source('index.html')),
        inject: true,
      }),
      // TODO: Reenable InlineChunkHtmlPlugin in dev once
      // https://github.com/pmmmwh/react-refresh-webpack-plugin/pull/241 is
      // released. Otherwise website crashes on load.
      !__DEV__ && new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.(js|css)$/]),
      __DEV__ && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
  },
  parts.loadImages({
    include: parts.PATHS.images,
    options: {
      name: 'img/[name].[contenthash].[ext]',
    },
  }),
  parts.productionCSS(),
  parts.devServer(),
]);

module.exports = timetableOnlyConfig;
