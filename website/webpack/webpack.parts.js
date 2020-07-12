const path = require('path');
const webpack = require('webpack');

const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const childProcess = require('child_process');
const moment = require('moment');

const packageJson = require('../package.json');

const ROOT = path.join(__dirname, '..');
const SRC = 'src';

const PATHS = {
  root: ROOT,
  // Using an absolute path will cause transient dependencies to be resolved to OUR
  // version of the same module, so this is kept relative
  node: 'node_modules',
  src: path.join(ROOT, SRC),
  styles: [path.join(ROOT, SRC, 'styles'), path.join(ROOT, 'node_modules')],
  images: path.join(ROOT, SRC, 'img'),
  build: path.join(ROOT, 'dist'),
  buildTimetable: path.join(ROOT, 'dist-timetable'),
  fixtures: path.join(ROOT, SRC, '__mocks__'),
};

// These dependencies will be extracted out into `vendor.js` in production build.
// App bundle changes more often than vendor bundle and splitting app bundle from
// 3rd-party vendor bundle allows the vendor bundle to be cached.
const VENDOR = [
  ...Object.keys(packageJson.dependencies),
  // Secondary dependencies
  'history', // History module used by router
  'fbjs', // facebook deps
  'prop-types', // gone but not forgotten
];

/**
 * Set environment variables (and more).
 *
 * @see https://webpack.js.org/plugins/define-plugin/
 * @see https://survivejs.com/webpack/optimizing/environment-variables/
 */
exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [new webpack.DefinePlugin(env)],
  };
};

/**
 * For extracting chunks into different bundles for caching.
 *
 * @see https://webpack.js.org/plugins/commons-chunk-plugin/#options
 * @see https://survivejs.com/webpack/building/bundle-splitting/
 * @see https://survivejs.com/webpack/building/bundle-splitting/#loading-dependencies-to-a-vendor-bundle-automatically
 */
exports.extractBundle = ({ name, entries }) => ({
  plugins: [
    // Extract bundle and manifest files. Manifest is
    // needed for reliable caching.
    new webpack.optimize.CommonsChunkPlugin({
      names: [name],
      minChunks: ({ resource }) =>
        resource &&
        resource.includes('node_modules') &&
        resource.match(/\.js$/) &&
        entries.some((entry) => resource.includes(entry)),
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: 'manifest',
      minChunks: Infinity,
    }),
  ],
});

/**
 * Lints javascript to make sure code is up to standard.
 *
 * @see https://survivejs.com/webpack/developing/linting/
 */
exports.lintJavaScript = ({ include, exclude, options }) =>
  process.env.DISABLE_ESLINT
    ? {}
    : {
        module: {
          rules: [
            {
              test: /\.[j|t]sx?$/,
              include,
              exclude,
              enforce: 'pre',

              use: [{ loader: 'eslint-loader', options }],
            },
          ],
        },
      };

/**
 * Uses StyleLint to lint CSS
 * @returns {*}
 */
exports.lintCSS = (options) =>
  process.env.DISABLE_STYLELINT
    ? {}
    : {
        plugins: [
          new StyleLintPlugin({
            context: PATHS.src,
            ...options,
          }),
        ],
      };

/**
 * Allows us to write ES6/ES2015 Javascript.
 *
 * @see https://webpack.js.org/loaders/babel-loader/
 * @see https://survivejs.com/webpack/loading/javascript/#setting-up-babel-loader-
 */
exports.transpileJavascript = ({ include, exclude, options }) => ({
  module: {
    rules: [
      {
        test: /\.[j|t]sx?$/,
        include,
        exclude,

        use: [{ loader: 'babel-loader', options }],
      },
    ],
  },
});

exports.getCSSConfig = ({ options } = {}) => [
  {
    loader: 'css-loader',
    // Enable 'composes' from other scss files
    options: { ...options, importLoaders: 2 },
  },
  {
    loader: 'postcss-loader',
    // See .postcssrc.js for plugin and plugin config
  },
  {
    loader: 'sass-loader',
    options: {
      sassOptions: {
        // @material packages uses '@material' directly as part of their import paths.
        // Without this those imports will not resolve properly
        includePaths: [PATHS.node],
      },
    },
  },
];

/**
 * Enables importing CSS with Javascript. This is all in-memory.
 *
 * @see https://survivejs.com/webpack/styling/loading/
 */
exports.loadCSS = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        include,
        exclude,

        use: ['style-loader', ...exports.getCSSConfig({ options })],
      },
    ],
  },
});

exports.productionCSS = ({ options } = {}) => ({
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].css',
      ignoreOrder: true,

      ...options,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        include: PATHS.styles,
        use: [MiniCssExtractPlugin.loader, ...exports.getCSSConfig(options)],
      },
      {
        test: /\.(css|scss)$/,
        include: PATHS.src,
        exclude: PATHS.styles,
        use: [
          MiniCssExtractPlugin.loader,
          ...exports.getCSSConfig({
            options: {
              modules: {
                localIdentName: '[hash:base64:8]',
              },
            },
          }),
        ],
      },
    ],
  },
});

/**
 * Allows importing images into javascript.
 *
 * @see https://webpack.js.org/guides/asset-management/#loading-images
 * @see https://survivejs.com/webpack/loading/images/
 */
exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        include,
        exclude,
        oneOf: [
          {
            test: /\.(ico|jpg|jpeg|png|gif)(\?.*)?$/,
            use: {
              loader: 'url-loader',
              options,
            },
          },
          /**
           * Load SVG as URL if ?url query is specified, eg.
           * import marker from 'img/marker.svg?url'
           */
          {
            test: /\.(svg)(\?.*)?$/,
            resourceQuery: /url/,
            use: {
              loader: 'url-loader',
              options,
            },
          },
          /**
           * Load SVG as React component
           * @see https://github.com/smooth-code/svgr
           */
          {
            test: /\.(svg)(\?.*)?$/,
            use: {
              loader: '@svgr/webpack',
              options: {
                titleProp: true,
              },
            },
          },
        ],
      },
    ],
  },
});

/**
 * Some libraries import Node modules but don't use them in the browser.
 * Tell Webpack to provide empty mocks for them so importing them works.
 *
 * @see https://webpack.js.org/configuration/node/#node
 */
exports.mockNode = () => ({
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
});

/**
 * Generates an app version string using the git commit hash and current date.
 *
 * @returns Object with keys `commitHash` and `versionStr`.
 */
exports.appVersion = () => {
  let commitHash;
  try {
    commitHash =
      process.env.GIT_COMMIT_HASH ||
      childProcess.execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
  } catch (e) {
    commitHash = 'UNSET';
  }
  // Version format: <YYYYMMDD date>-<7-char hash substring>
  const versionStr = commitHash && `${moment().format('YYYYMMDD')}-${commitHash.substring(0, 7)}`;
  return { commitHash, versionStr };
};

exports.PATHS = PATHS;
exports.VENDOR = VENDOR;
