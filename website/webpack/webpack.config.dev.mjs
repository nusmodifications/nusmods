import path from 'node:path';
import { createRequire } from 'node:module';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { partition } from 'lodash-es';
import webpack from 'webpack';
import { merge } from 'webpack-merge';

import commonConfig from './webpack.config.common.mjs';
import * as parts from './webpack.parts.mjs';

const require = createRequire(import.meta.url);
const nusmods = require('../src/apis/nusmods');
const config = require('../src/config/app-config.json');

const developmentConfig = merge([
  commonConfig,
  {
    mode: 'development',
    // Use a fast source map for good-enough debugging usage
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: 'eval-cheap-module-source-map',
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

export default developmentConfig;
