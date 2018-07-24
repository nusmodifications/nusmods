const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');
const nusmods = require('../src/js/apis/nusmods');
const config = require('../src/js/config/app-config.json');

/**
 * Extracts css into their own file.
 *
 * @see https://webpack.js.org/guides/code-splitting-css/
 * @see https://survivejs.com/webpack/styling/separating-css/
 */
const extractTextPlugin = new ExtractTextPlugin('[name].[chunkhash].css', {
  allChunks: true,
});

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
        template: path.join(parts.PATHS.app, 'index.html'),
        minify: {
          removeComments: true,
          removeRedundantAttributes: true,
        },
        // For use as a variable under htmlWebpackPlugin.options in the template
        moduleListUrl: nusmods.moduleListUrl(),
        venuesUrl: nusmods.venuesUrl(config.semester),
        brandName: config.brandName,
        description: config.defaultDescription,
      }),
      new ScriptExtHtmlWebpackPlugin({
        inline: /manifest/,
        preload: /\.js$/,
      }),
      extractTextPlugin,
      // Copy files from static folder over to dist
      new CopyWebpackPlugin([{ from: 'static', context: parts.PATHS.root }], {
        copyUnmodified: true,
      }),
    ],
  },
  parts.workbox(),
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
  // Fail for CI
  parts.flow({ failOnError: true }),
]);

module.exports = productionConfig;
