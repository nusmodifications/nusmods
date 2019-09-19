const path = require('path');
const merge = require('webpack-merge');
const TerserJsPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const PacktrackerPlugin = require('@packtracker/webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');
const nusmods = require('../src/apis/nusmods');
const config = require('../src/config/app-config.json');

const IS_CI = !!process.env.CI;

const productionConfig = ({ browserWarningPath }) =>
  merge([
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
      plugins: [
        // SEE: https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
        new HtmlWebpackPlugin({
          template: path.join(parts.PATHS.src, 'index.html'),
          minify: {
            removeComments: true,
            removeRedundantAttributes: true,
          },
          // Embed the runtime entry point chunk in the HTML itself
          // See runtimeChunk below
          inlineSource: 'runtime',

          // Embed the browser warning code from the browser-warning Webpack bundle
          browserWarningPath,

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
        !IS_CI &&
          new CompressionPlugin({
            test: /\.(js|css|html|json|svg|xml|txt)$/,
          }),
        // Copy files from static folder over to dist
        new CopyWebpackPlugin([{ from: 'static', context: parts.PATHS.root }], {
          copyUnmodified: true,
        }),
        process.env.CI &&
          new PacktrackerPlugin({
            upload: true,
          }),
      ].filter(Boolean),
      optimization: {
        minimizer: [
          new TerserJsPlugin({
            terserOptions: {
              compress: {
                // Terser enables arrow functions after Babel transpilation,
                // which breaks targets that have no support for arrow fns.
                // When we drop support for Safari 9.1, we can re-enable this.
                arrows: false,
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
    // If the file size is below the specified limit
    // the file is converted into a data URL and inlined to avoid requests.
    parts.loadImages({
      include: parts.PATHS.images,
      options: {
        limit: 15000,
        name: 'img/[name].[hash].[ext]',
      },
    }),
    parts.productionCSS(),
    // Lint and Typescript type check are not enabled for production because CI has
    // explicit lint stages
  ]);

module.exports = productionConfig;
