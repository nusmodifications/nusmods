const childProcess = require('child_process');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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

exports.devServer = () => ({
  devServer: {
    // Enable history API fallback so HTML5 History API based
    // routing works. Good for complex setups.
    historyApiFallback: true,
    // Open browser unless told otherwise
    open: process.env.OPEN_BROWSER !== '0',
    // Enable hot reloading server.
    hotOnly: true,
    // Overlay compiler errors, useful when something breaks
    overlay: true,
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
