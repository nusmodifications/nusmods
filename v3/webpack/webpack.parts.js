const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');

const IS_DEV = process.env.NODE_ENV === 'development';
const ROOT = path.join(__dirname, '..');
const SRC = 'src';

const PATHS = {
  root: ROOT,
  node: path.join(ROOT, 'node_modules'),
  app: path.join(ROOT, SRC),
  scripts: path.join(ROOT, SRC, 'js'),
  styles: path.join(ROOT, SRC, 'styles'),
  images: path.join(ROOT, SRC, 'img'),
  build: path.join(ROOT, 'dist'),
  fixtures: path.join(ROOT, '__mocks__'),
};

// These dependencies will be extracted out into `vendor.js` in production build.
// App bundle changes more often than vendor bundle and splitting app bundle from
// 3rd-party vendor bundle allows the vendor bundle to be cached.
const VENDOR = [
  'axios',
  'babel-polyfill',
  'classnames',
  'ical-generator',
  'react',
  'react-document-title',
  'react-dom',
  'redux',
  'react-redux',
  'react-router-dom',
  'react-select-fast-filter-options',
  'react-virtualized-select',
  'redux-thunk',
  'nusmoderator',
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
    plugins: [
      new webpack.DefinePlugin(env),
    ],
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
 */
exports.extractBundle = ({ name, entries }) => {
  const entry = {};
  entry[name] = entries;

  return {
    // Define an entry point needed for splitting.
    entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [name],
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: 'manifest',
        minChunks: Infinity,
      }),
    ],
  };
};

/**
 * Function to identify vendor chunks.
 *
 * @see https://survivejs.com/webpack/building/bundle-splitting/#loading-dependencies-to-a-vendor-bundle-automatically
 */
exports.isVendor = ({ resource }) => {
  return resource &&
    resource.indexOf('node_modules') >= 0 &&
    resource.match(/\.js$/);
};

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

        use: [
          ...insertIf(IS_DEV, 'cache-loader'),
          { loader: 'eslint-loader', options },
        ],
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

        use: [
          ...insertIf(IS_DEV, 'cache-loader'),
          { loader: 'babel-loader', options },
        ],
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
exports.minifyJavascript = () => {
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
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        // Don't beautify output (enable for neater output).
        beautify: false,
        // Eliminate comments.
        comments: false,
        // Compression specific options.
        compress: {
          warnings: false,
          // Drop `console` statements.
          drop_console: true,
        },
        sourceMap: true,
        // Mangling specific options.
        mangle: {
          // Don't mangle $.
          except: ['$'],
          // Don't care about IE8 because React doesn't support IE8.
          screw_ie8: true,
          // Don't mangle function names.
          keep_fnames: true,
        },
      }),
    ],
  };
};

const cssConfig = [
  ...insertIf(IS_DEV, 'cache-loader'), // Because css-loader is slow
  'css-loader',
  {
    loader: 'postcss-loader',
    options: {
      plugins: () => [ // eslint-disable-next-line global-require
        require('autoprefixer'),
      ],
    },
  },
  'sass-loader',
];

/**
 * Enables importing CSS with Javascript. This is all in-memory.
 *
 * @see https://survivejs.com/webpack/styling/loading/
 */
exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        include,
        exclude,

        use: [].concat('style-loader', cssConfig),
      },
    ],
  },
});

/**
 * Extracts css into their own file.
 *
 * @see https://webpack.js.org/guides/code-splitting-css/
 * @see https://survivejs.com/webpack/styling/separating-css/
 */
exports.extractCSS = ({ include, exclude } = {}) => {
  // Output extracted CSS to a file
  const plugin = new ExtractTextPlugin('[name].[chunkhash].css');

  return {
    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          include,
          exclude,

          use: plugin.extract({
            use: cssConfig,
            fallback: 'style-loader',
          }),
        },
      ],
    },
    plugins: [plugin],
  };
};

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

exports.PATHS = PATHS;
exports.VENDOR = VENDOR;
exports.DLL = DLL;
