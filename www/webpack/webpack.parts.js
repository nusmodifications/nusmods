const path = require('path');
const webpack = require('webpack');
const _ = require('lodash');

const { GenerateSW } = require('workbox-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const childProcess = require('child_process');
const moment = require('moment');

const packageJson = require('../package.json');
const nusmods = require('../src/js/apis/nusmods');
const config = require('../src/js/config/app-config.json');

const ROOT = path.join(__dirname, '..');
const SRC = 'src';

const ONE_MONTH = 30 * 24 * 60 * 60;
const staleWhileRevalidatePaths = [nusmods.venuesUrl(config.semester), nusmods.modulesUrl()];

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
exports.lintJavaScript = ({ include, exclude, options }) =>
  process.env.DISABLE_ESLINT
    ? {}
    : {
        module: {
          rules: [
            {
              test: /\.(js|jsx)$/,
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
            context: PATHS.app,
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
        test: /\.(js|jsx)$/,
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
 * Use {@link https://flow.org/ Flow} to lint our javscript.
 *
 * @see https://survivejs.com/webpack/loading/javascript/#setting-up-flow
 */
exports.flow = ({ failOnError, flowArgs }) =>
  process.env.DISABLE_FLOW
    ? {}
    : {
        // TODO: Check out https://codemix.github.io/flow-runtime/#/
        plugins: [
          new FlowStatusWebpackPlugin({
            // No reason to restart flow server if there's already one running.
            restartFlow: false,
            failOnError,
            flowArgs,
          }),
        ],
      };

/**
 * Use Workbox to enable offline support with service worker
 *
 * @see https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#generatesw_plugin_1
 *
 */
exports.workbox = () => ({
  plugins: [
    new GenerateSW({
      // Cache NUSMods API requests so that pages which depend on them can be
      // viewed offline
      runtimeCaching: [
        // Module and venue info are served from cache first, because they are
        // large, so this will improve perceived performance
        {
          urlPattern: new RegExp(staleWhileRevalidatePaths.map(_.escapeRegExp).join('|')),
          handler: 'staleWhileRevalidate',
          options: {
            cacheName: 'api-stale-while-revalidate-cache',
            cacheableResponse: {
              // Do not cache opaque responses. All normal API responses should have
              // CORS headers, so if it doesn't then the response is non-cachable
              // and should be ignored
              statuses: [200],
            },
            expiration: {
              maxAgeSeconds: ONE_MONTH,
            },
          },
        },
        // Everything else (module info, module list) uses network first because
        // they are relatively small and needs to be as updated as possible
        {
          urlPattern: new RegExp(_.escapeRegExp(nusmods.ayBaseUrl())),
          handler: 'networkFirst',
          options: {
            cacheName: 'api-network-first-cache',
            cacheableResponse: {
              statuses: [200],
            },
            expiration: {
              maxEntries: 500,
              maxAgeSeconds: ONE_MONTH,
            },
          },
        },
      ],

      // Exclude hot reload related code in development
      exclude: [/\.hot-update\.js(on)?$/],

      // Include additional service worker code
      importScripts: ['service-worker-notifications.js'],

      // Always serve index.html since we're a SPA using HTML5 history
      navigateFallback: 'index.html',

      // Exclude /export, which are handled by the server
      // short_url is not excluded because it is fetched, not navigated to
      navigateFallbackBlacklist: [/^.*\/export.*$/],
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
