// @flow
import 'dotenv/config';
import * as webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import BabiliPlugin from 'babili-webpack-plugin';
import path from 'path';
import assert from 'assert';

// Undefine compilation environment
delete process.env.BABEL_ENV;

assert.equal(process.env.NODE_ENV, 'production', 'Not compiling in production environment');

const config: webpack.Configuration = {
  entry: './gulpfile.babel.js',
  output: {
    filename: 'gulpfile.compiled.js',
    path: path.resolve(__dirname),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new BabiliPlugin(),
  ],
  target: 'node',
  externals: [nodeExternals()],
};

export default config;
