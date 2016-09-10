const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const merge = require('webpack-merge');
const parts = require('./libs/parts');
const pkg = require('./package.json');

const SRC = 'src';
const BUILD = 'dist';
const PATHS = {
  app: path.join(__dirname, SRC),
  scripts: path.join(__dirname, SRC, 'js'),
  styles: path.join(__dirname, SRC, 'styles'),
  images: path.join(__dirname, SRC, 'img'),
  build: path.join(__dirname, BUILD)
};
const vendor = [
  'axios',
  'lodash',
  'react',
  'redux',
  'react-redux',
  'react-router',
  'react-router-redux',
  'redux-logger',
  'redux-thunk'
];

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  resolve: {
    root: [
      PATHS.app,
      PATHS.scripts,
      PATHS.styles
    ],
    extensions: ['', '.js', '.jsx']
  },
  entry: {
    app: ['main']
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      cache: true
    }),
    new StyleLintPlugin({
      context: PATHS.styles
    })
  ],
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: ['eslint'],
        include: PATHS.scripts
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        // Enable caching for improved performance during development
        // It uses default OS directory by default. If you need
        // something more custom, pass a path to it.
        // I.e., babel?cacheDirectory=<path>
        loaders: ['babel?cacheDirectory'],
        // Parse only app js files! Without this it will go through
        // the entire project. In addition to being slow,
        // that will most likely result in an error.
        include: PATHS.scripts
      },
      {
        test: /\.(jpe?g|png|svg)$/,
        loader: 'file?name=img/[name].[hash].[ext]',
        include: PATHS.images
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  devServer: parts.devServer,
  node: {
    fs: 'empty'
  }
};

var config;
var environment;

// Detect how npm is run and branch based on that
switch (process.env.npm_lifecycle_event) {
  case 'build':
    environment = 'production';
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable('process.env.NODE_ENV', environment),
      parts.extractBundle({
        name: 'vendor',
        entries: vendor
      }),
      parts.minify(),
      parts.extractCSS(PATHS.styles)
    );
    break;
  default:
    environment = 'development';
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      parts.setFreeVariable('process.env.NODE_ENV', environment),
      parts.setupCSS(PATHS.styles),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = config;
