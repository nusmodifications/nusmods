const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');
const source = (file) => path.join('js/ssr', file);

const productionConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', process.env.NODE_ENV || 'production'),
  parts.setFreeVariable('process.env.IS_SSR', true),
  commonConfig,
  {
    target: 'node',
    // Override common's entry point
    entry: source('app.js'),
    // Don't attempt to continue if there are any errors.
    bail: true,
    output: {
      // The build folder.
      path: parts.PATHS.buildServer,
      filename: '[name].js',
      // This is used for require.ensure. The setup
      // will work without but this is useful to set.
      chunkFilename: '[chunkhash].js',
    },
    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          use: 'null-loader',
        },
      ],
    },
    plugins: [
      // SEE: https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
      new webpack.optimize.ModuleConcatenationPlugin(),
    ],
    // Ensures Webpack will not try to bundle node_modules
    externals: [nodeExternals()],
  },
  // parts.minifyJavascript(),
  parts.loadImages({
    include: parts.PATHS.images,
    options: {
      name: 'img/[name].[hash].[ext]',
    },
  }),
  parts.clean(parts.PATHS.buildServer),
]);

module.exports = productionConfig;
