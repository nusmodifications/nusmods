const path = require('path');
const webpack = require('webpack');

const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const childProcess = require('child_process');
const { format } = require('date-fns');

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

const getCSSConfig = ({ options } = {}) => [
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

        use: ['style-loader', ...getCSSConfig({ options })],
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
        use: [MiniCssExtractPlugin.loader, ...getCSSConfig(options)],
      },
      {
        test: /\.(css|scss)$/,
        include: PATHS.src,
        exclude: PATHS.styles,
        use: [
          MiniCssExtractPlugin.loader,
          ...getCSSConfig({
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
  // Version format: <yyyyMMdd date>-<7-char hash substring>
  const versionStr =
    commitHash && `${format(new Date(), 'yyyyMMdd')}-${commitHash.substring(0, 7)}`;
  return { commitHash, versionStr };
};

exports.PATHS = PATHS;
