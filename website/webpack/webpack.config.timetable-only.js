const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

const nodeEnvStr = process.env.NODE_ENV || 'production';
const isProd = nodeEnvStr === 'production';

const source = (file) => path.join('entry/export', file);

const productionConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', nodeEnvStr),
  commonConfig,
  {
    // Override common's entry point
    entry: source('main.tsx'),
    // Don't attempt to continue if there are any errors.
    bail: true,
    mode: 'production',
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',
    output: {
      // The build folder.
      path: parts.PATHS.buildTimetable,
      filename: isProd ? '[chunkhash].js' : '[hash].js',
      // This is used for require.ensure. The setup
      // will work without but this is useful to set.
      chunkFilename: '[chunkhash].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(parts.PATHS.src, source('index.html')),
        inject: true,
      }),
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.(js|css)$/]),
    ],
  },
  parts.loadImages({
    include: parts.PATHS.images,
    options: {
      name: 'img/[name].[hash].[ext]',
    },
  }),
  parts.productionCSS(),
  parts.devServer(),
]);

module.exports = productionConfig;
