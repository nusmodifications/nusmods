const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

const extractTextPlugin = new ExtractTextPlugin('[name].[chunkhash].css', {
  allChunks: true,
});

const source = (file) => path.join('js/timetable-export', file);

const productionConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', process.env.NODE_ENV || 'production'),
  commonConfig,
  {
    // Override common's entry point
    entry: source('main.js'),
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',
    output: {
      // The build folder.
      path: parts.PATHS.buildTimetable,
      filename: '[name].[chunkhash].js',
      // This is used for require.ensure. The setup
      // will work without but this is useful to set.
      chunkFilename: '[chunkhash].js',
    },
    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          include: parts.PATHS.styles,
          use: extractTextPlugin.extract({
            use: parts.getCSSConfig(),
            fallback: 'style-loader',
          }),
        },
        {
          test: /\.(css|scss)$/,
          include: parts.PATHS.scripts,
          use: extractTextPlugin.extract({
            use: parts.getCSSConfig({
              options: {
                modules: true,
                localIdentName: '[hash:base64:8]',
              },
            }),
            fallback: 'style-loader',
          }),
        },
      ],
    },
    plugins: [
      // SEE: https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
      new webpack.optimize.ModuleConcatenationPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(parts.PATHS.app, source('index.html')),
        inlineSource: '\\.(js|css)$',
      }),
      new HtmlWebpackInlineSourcePlugin(),
      extractTextPlugin,
    ],
  },
  // parts.minifyJavascript(),
  parts.loadImages({
    include: parts.PATHS.images,
    options: {
      name: 'img/[name].[hash].[ext]',
    },
  }),
  parts.clean(parts.PATHS.buildTimetable),
]);

module.exports = productionConfig;
