// @flow
import 'dotenv/config';
import { EnvironmentPlugin, type Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import path from 'path';
import assert from 'assert';

// Undefine compilation environment
delete process.env.BABEL_ENV;

assert.equal(process.env.NODE_ENV, 'production', 'Not compiling in production environment');

const config: Configuration = {
  mode: process.env.NODE_ENV, // production
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
  plugins: [new EnvironmentPlugin(['NODE_ENV'])],
  target: 'node',
  externals: [
    nodeExternals(),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules'),
    }),
  ],
};

export default config;
