// @flow
import * as webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import BabiliPlugin from 'babili-webpack-plugin';
import DotenvPlugin from 'dotenv-webpack';
import path from 'path';

// Redefine environment variables
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

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
    new DotenvPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new BabiliPlugin(),
  ],
  target: 'node',
  externals: [nodeExternals()],
};

export default config;
