const path = require('path');
const { partition } = require('lodash');

const { merge } = require('webpack-merge');
const TerserJsPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PacktrackerPlugin = require('@packtracker/webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');
const nusmods = require('../src/apis/nusmods');
const config = require('../src/config/app-config.json');

const NUSMODS_ENV = parts.env();

/**
 * `true` if we're in the primary CI environment where we run our tests, e.g.
 * CircleCI. Do not use the `CI` variable as it will be true in hosting
 * services' build enviroments, e.g. Vercel, Netlify, etc.
 */
const IS_PRIMARY_CI = !!process.env.CIRCLE;

const productionConfig = ({ browserWarningPath }) =>
  merge([
    commonConfig,
    {
      // Don't attempt to continue if there are any errors.
      bail: true,
      mode: 'production',
      // We generate sourcemaps in production. This is slow but gives good results.
      // You can exclude the *.map files from the build during deployment.
      devtool: 'source-map',
      plugins: [
        // SEE: https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
        new HtmlWebpackPlugin({
          template: path.join(parts.PATHS.src, 'index.ejs'),

          // Inject CSS and JS files manually for optimization purposes
          inject: false,

          templateParameters: (compilation, assets, assetTags, options) => {
            const [inlinedJsFiles, loadedJsFiles] = partition(assets.js, (file) =>
              file.includes('runtime'),
            );
            return {
              // Passthrough parameters
              // See: https://github.com/jantimon/html-webpack-plugin/blob/master/examples/template-parameters/index.ejs
              compilation,
              webpackConfig: compilation.options,
              htmlWebpackPlugin: {
                tags: assetTags,
                files: assets,
                options,
              },
              // Embed the browser warning code from the browser-warning Webpack bundle
              browserWarningPath,
              // Other custom parameters
              loadedJsFiles,
              inlinedJsFiles,
              moduleListUrl: nusmods.moduleListUrl(),
              venuesUrl: nusmods.venuesUrl(config.semester),
              brandName: config.brandName,
              description: config.defaultDescription,
            };
          },
        }),
        IS_PRIMARY_CI &&
          new PacktrackerPlugin({
            upload: true,
          }),
        // Copy files from static folder over to dist
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'static/base',
              context: parts.PATHS.root,
            },
            (NUSMODS_ENV === 'preview' || NUSMODS_ENV === 'staging') && {
              from: 'static/preview-and-staging-only',
              context: parts.PATHS.root,
            },
            NUSMODS_ENV === 'production' && {
              from: 'static/production-only',
              context: parts.PATHS.root,
            },
          ].filter(Boolean),
        }),
      ].filter(Boolean),
      optimization: {
        minimizer: [
          new TerserJsPlugin({
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
    // If the file size is below the specified limit
    // the file is converted into a data URL and inlined to avoid requests.
    parts.loadImages({
      include: parts.PATHS.images,
      options: {
        limit: 15000,
        name: 'img/[name].[contenthash].[ext]',
      },
    }),
    parts.productionCSS(),
  ]);

module.exports = productionConfig;
