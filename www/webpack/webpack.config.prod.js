const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const TerserJsPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

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
const cssExtractPlugin = new MiniCssExtractPlugin({
  filename: '[name].[contenthash:8].css',
  chunkFilename: '[name].[contenthash:8].css',
});

const productionConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', 'production'),
  commonConfig,
  {
    // Don't attempt to continue if there are any errors.
    bail: true,
    mode: 'production',
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',
    output: {
      // The build folder.
      path: parts.PATHS.build,
      filename: '[name].[contenthash:8].js',
      // This is used for require.ensure. The setup
      // will work without but this is useful to set.
      chunkFilename: '[name].[contenthash:8].js',
    },
    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          include: parts.PATHS.styles,
          use: [MiniCssExtractPlugin.loader, ...parts.getCSSConfig()],
        },
        {
          test: /\.(css|scss)$/,
          include: parts.PATHS.scripts,
          use: [
            MiniCssExtractPlugin.loader,
            ...parts.getCSSConfig({
              options: {
                modules: true,
                localIdentName: '[hash:base64:8]',
              },
            }),
          ],
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
        // Embed the runtime entry point chunk in the HTML itself
        // See runtimeChunk below
        inlineSource: 'runtime',
        // For use as a variable under htmlWebpackPlugin.options in the template
        moduleListUrl: nusmods.moduleListUrl(),
        venuesUrl: nusmods.venuesUrl(config.semester),
        brandName: config.brandName,
        description: config.defaultDescription,
      }),
      // Allows us to use the inlineSource option above
      new HtmlWebpackInlineSourcePlugin(),
      new ScriptExtHtmlWebpackPlugin({
        inline: /manifest/,
        preload: /\.js$/,
      }),
      cssExtractPlugin,
      // Copy files from static folder over to dist
      new CopyWebpackPlugin([{ from: 'static', context: parts.PATHS.root }], {
        copyUnmodified: true,
      }),
    ],
    optimization: {
      minimizer: [
        new TerserJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          terserOptions: {
            compress: {
              // Two passes yield the most optimal results
              passes: 2,
            },
          },
        }),
      ],
      splitChunks: {
        // include all types of chunks
        chunks: 'all',
      },
      // Split off the runtime chunk and allows us to inline this directly into the HTML
      // for better performance
      runtimeChunk: 'single',
    },
  },
  parts.workbox(),
  parts.clean(parts.PATHS.build),
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
