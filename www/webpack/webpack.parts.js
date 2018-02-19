const path = require('path');
const webpack = require('webpack');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');
const childProcess = require('child_process');
const moment = require('moment');

const packageJson = require('../package.json');

const IS_DEV = process.env.NODE_ENV === 'development';
const ROOT = path.join(__dirname, '..');
const SRC = 'src';

const PATHS = {
  root: ROOT,
  // Using an absolute path will cause transient dependencies to be resolved to OUR
  // version of the same module, so this is kept relative
  node: 'node_modules',
  app: path.join(ROOT, SRC),
  scripts: path.join(ROOT, SRC, 'js'),
  styles: path.join(ROOT, SRC, 'styles'),
  images: path.join(ROOT, SRC, 'img'),
  build: path.join(ROOT, 'dist'),
  buildTimetable: path.join(ROOT, 'dist-timetable'),
  fixtures: path.join(ROOT, '__mocks__'),
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
  'loader', // style loader fallbacks
  'equal', // various comparison libs used by deps
];

const DLL = {
  ENTRIES: {
    vendor: VENDOR,
  },
  FILE_FORMAT: '[name].dll.js',
};

function insertIf(condition, element) {
  return condition ? [element] : [];
}

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
 * Removes the folder/file to make way for new changes.
 *
 * @see https://survivejs.com/webpack/building/tidying-up/#setting-up-cleanwebpackplugin-
 */
exports.clean = (...pathsToBeCleaned) => ({
  plugins: [
    new CleanWebpackPlugin([...pathsToBeCleaned], {
      // Without `root` CleanWebpackPlugin won't point to our
      // project and will fail to work.
      root: process.cwd(),
    }),
  ],
});

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
exports.lintJavaScript = ({ include, exclude, options }) => ({
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include,
        exclude,
        enforce: 'pre',

        use: [...insertIf(IS_DEV, 'cache-loader'), { loader: 'eslint-loader', options }],
      },
    ],
  },
});

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
        test: /\.(js|jsx)$/,
        include,
        exclude,

        use: [...insertIf(IS_DEV, 'cache-loader'), { loader: 'babel-loader', options }],
      },
    ],
  },
});

/**
 * Minifies Javascript to make them smaller and faster.
 *
 * @see https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
 * @see https://survivejs.com/webpack/optimizing/minifying/
 */
exports.minifyJavascript = () =>
  // TODO: Use Babili instead when it's out of beta
  // Currently breaks Timify.js
  // SEE: https://webpack.js.org/plugins/babili-webpack-plugin/
  /*
  plugins: [
    new BabiliPlugin({
      mangle: {
        blacklist: ['$'],
      },
      removeConsole: false,
      keepFnName: true,
    }),
  ],
  */
  ({
    plugins: [
      new UglifyJsPlugin({
        sourceMap: true,
        // See: https://github.com/mishoo/UglifyJS2/tree/harmony
        uglifyOptions: {
          // Don't beautify output (enable for neater output).
          beautify: false,
          // Eliminate comments.
          comments: false,
          // Compression specific options.
          compress: {
            // Two passes yield the most optimal results
            passes: 2,
          },
          // Required to avoid Safari 10/11 bugs
          safari10: true,
        },
      }),
    ],
  });

exports.getCSSConfig = ({ options } = {}) => [
  ...insertIf(IS_DEV, 'cache-loader'), // Because css-loader is slow
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
      // @material packages uses '@material' directly as part of their import paths.
      // Without this those imports will not resolve properly
      includePaths: [PATHS.node],
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

        use: [].concat('style-loader', exports.getCSSConfig({ options })),
      },
    ],
  },
});

/**
 * Minifies CSS to make it super small.
 *
 * @see https://survivejs.com/webpack/optimizing/minifying/#minifying-css
 */
exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
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
        test: /\.(ico|jpg|jpeg|png|gif|svg)(\?.*)?$/,
        include,
        exclude,

        use: {
          loader: 'url-loader',
          options,
        },
      },
    ],
  },
});

/**
 * Use {@link https://flow.org/ Flow} to lint our javscript.
 *
 * @see https://survivejs.com/webpack/loading/javascript/#setting-up-flow
 */
exports.flow = ({ failOnError, flowArgs }) => ({
  // TODO: Use https://github.com/facebookincubator/create-react-app/pull/1152 instead
  // TODO: Check out https://codemix.github.io/flow-runtime/#/
  plugins: [
    new FlowStatusWebpackPlugin({
      // No reason to restart flow server
      // if there's already one running.
      restartFlow: false,
      failOnError,
      flowArgs,
    }),
  ],
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
  const commitHash = childProcess
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();
  // Version format: <YYYYMMDD date>-<7-char hash substring>
  const versionStr = commitHash && `${moment().format('YYYYMMDD')}-${commitHash.substring(0, 7)}`;
  return { commitHash, versionStr };
};

exports.PATHS = PATHS;
exports.VENDOR = VENDOR;
exports.DLL = DLL;
