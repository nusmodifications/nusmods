const webpack = require('webpack');
const HappyPack = require('happypack');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const utils = require('./utils');

const ROOT = '..';
const SRC = 'src';
const BUILD = 'dist';
const DLL = 'dll';
const PATHS = {
  app: path.join(__dirname, ROOT, SRC),
  scripts: path.join(__dirname, ROOT, SRC, 'js'),
  styles: path.join(__dirname, ROOT, SRC, 'styles'),
  images: path.join(__dirname, ROOT, SRC, 'img'),
  build: path.join(__dirname, ROOT, BUILD),
  dll: path.join(__dirname, ROOT, DLL),
};

// These dependencies will be extracted out into `vendor.js` in production build.
// App bundle changes more often than vendor bundle and splitting app bundle from
// 3rd-party vendor bundle allows the vendor bundle to be cached.
const VENDOR = [
  'axios',
  'babel-polyfill',
  'classnames',
  'lodash',
  'ical-generator',
  'react',
  'react-addons-shallow-compare',
  'react-autobind',
  'react-document-title',
  'react-dom',
  'redux',
  'react-redux',
  'react-router',
  'react-router-redux',
  'react-select-fast-filter-options',
  'react-virtualized-select',
  'redux-thunk',
  'nusmoderator',
];

const common = {
  // This tells Webpack where to look for modules.
  resolve: {
    // Specify a few root paths when importing our own modules,
    // so that we can use absolute paths in our imports.
    // E.g. Importing our own module at `/js/path/to/module` will simply be:
    // `import module from 'path/to/module;`
    root: [
      PATHS.app,
      PATHS.scripts,
      PATHS.styles,
    ],
    // Importing modules from these files will not require the extension.
    extensions: ['', '.js', '.jsx', '.json'],
    moduleDirectories: ['node_modules'],
  },
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
    // This will build an app.js file from the `main` module.
    app: ['babel-polyfill', 'main'],
  },
  output: {
    path: PATHS.build,
    filename: '[name].js',
  },
  plugins: [
    new HappyPack({
      id: 'js',
      cacheContext: {
        env: process.env.NODE_ENV,
      },
    }),
    new StyleLintPlugin({
      context: PATHS.styles,
    }),
    new LodashModuleReplacementPlugin({
      caching: true,
      collections: true,
      flattening: true,
      paths: true,
    }),
    new webpack.PrefetchPlugin('./src/styles/main.scss'),
    new webpack.PrefetchPlugin('./src/js/routes.jsx'),
  ],
  module: {
    preLoaders: [
      {
        // Before everything else, run the linter.
        // It's important to do this before Babel processes the JS.
        test: /\.(js|jsx)$/,
        loaders: ['eslint'],
        include: PATHS.scripts,
      },
    ],
    loaders: [
      {
        // Process js and jsx files using Babel.
        test: /\.(js|jsx)$/,
        // Parse only our own js files! Without this it will go through
        // the node_modules code.
        include: PATHS.scripts,
        loader: 'babel',
        query: {
          // Enable caching for improved performance during development
          // It uses default OS directory by default. If you need
          // something more custom, pass a path to it.
          // i.e., cacheDirectory: <path>
          cacheDirectory: true
        },
        happy: { id: 'js' },
      },
      {
        // JSON is not enabled by default in Webpack but both Node and Browserify
        // allow it implicitly so we also enable it.
        test: /\.json$/,
        exclude: /webmanifest\.json$/,
        loader: 'json'
      },
      {
        // Works like file-loader but if the file size is below the specified limit
        // the file is converted into a data URL and inlined to avoid requests.
        test: /\.(ico|jpg|jpeg|png|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: 'img/[name].[hash].[ext]',
        },
        include: PATHS.images,
      },
      // TODO: Support font loading?
    ],
  },
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

module.exports = common;
module.exports.PATHS = PATHS;
module.exports.DLL = DLL;
module.exports.VENDOR = VENDOR;
