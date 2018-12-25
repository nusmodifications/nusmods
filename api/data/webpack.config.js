require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');

const IS_DEV = process.env.NODE_ENV === 'development';

module.exports = {
  mode: IS_DEV ? 'development' : 'production',
  entry: ['webpack/hot/poll?1000', './src/index'],
  watch: IS_DEV,
  target: 'node',
  stats: 'minimal',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new StartServerPlugin('server.js'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server.js',
  },
};
