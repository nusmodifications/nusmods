const webpack = require('webpack');
const path = require('path');
const { partition } = require('lodash');

const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');
const nusmods = require('../src/apis/nusmods');
const config = require('../src/config/app-config.json');

const developmentConfig = merge([
  commonConfig,
  {
    mode: 'development',
    // Use a fast source map for good-enough debugging usage
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: 'eval-cheap-module-source-map',
    // Fixes HMR in Webpack 5
    // TODO: Remove once one of these issues are fixed:
    // https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/235
    // https://github.com/webpack/webpack-dev-server/issues/2758
    target: 'web',
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(parts.PATHS.src, 'index.ejs'),
        cache: true,

        // Our production Webpack config manually injects CSS and JS files.
        // Do the same in development so that we can reuse the same index.html
        // file without having double/triple-injected scripts.
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
      // Copy files from static folder over (in-memory)
      new CopyWebpackPlugin({
        patterns: [{ from: 'static/base', context: parts.PATHS.root }],
      }),
      // Ignore node_modules so CPU usage with poll watching drops significantly.
      new webpack.WatchIgnorePlugin({
        paths: [parts.PATHS.node, parts.PATHS.build],
      }),
      new ReactRefreshWebpackPlugin(),
    ],
  },
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
