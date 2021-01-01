const { merge } = require('webpack-merge');

const parts = require('./webpack.parts');

module.exports = merge([
  {
    // Don't attempt to continue if there are any errors.
    bail: true,
    mode: 'production',
    entry: 'entry/browser-warning/main',

    output: {
      path: parts.PATHS.build,
      filename: 'assets/browser-warning.[contenthash].js',
    },

    resolve: {
      modules: [parts.PATHS.src, parts.PATHS.node],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      symlinks: false,
    },

    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',

    module: {
      rules: [
        {
          test: /\.[j|t]sx?$/,
          // Do not transpile core-js - this causes compat issues on IE
          exclude: /node_modules\/core-js/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-typescript',
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      ie: '11',
                    },
                  },
                ],
              ],
            },
          },
        },
      ],
    },
  },

  parts.loadCSS({
    options: {
      modules: true,
    },
  }),
]);
