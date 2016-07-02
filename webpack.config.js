const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const parts = require('./libs/parts');

const SRC = 'src';
const BUILD = 'dist';
const PATHS = {
  app: path.join(__dirname, SRC),
  build: path.join(__dirname, BUILD)
};


const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  resolve: {
    root: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'src/js'),
      path.join(__dirname, 'src/styles')
    ]
  },
  entry: {
    app: 'main'
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ],
  devServer: parts.devServer
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      {
        devtool: 'source-map'
      },
      parts.minify(),
      parts.setupCSS(PATHS.app)
    );
    break;
  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      parts.setupCSS(PATHS.app),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = config;
