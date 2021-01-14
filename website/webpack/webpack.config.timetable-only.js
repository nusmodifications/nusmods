const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

const NUSMODS_ENV = parts.env();

const source = (file) => path.join('entry/export', file);

const timetableOnlyConfig = merge([
  commonConfig,
  {
    // Override common's entry point
    entry: source('main.tsx'),
    // Don't attempt to continue if there are any errors.
    bail: true,
    mode: NUSMODS_ENV === 'development' ? 'development' : 'production',
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
      NUSMODS_ENV !== 'development' &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.(js|css)$/]),
      NUSMODS_ENV === 'development' && new ReactRefreshWebpackPlugin(),
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
