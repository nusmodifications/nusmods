import childProcess from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { format } from 'date-fns';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'src';
const DIST = 'dist';

// Used by Webpack to resolve the path to assets on the client side
// See: https://webpack.js.org/guides/public-path/
export const WEBSITE_PUBLIC_PATH = '/';
export const TIMETABLE_ONLY_PUBLIC_PATH = '/timetable-only/';

const PATHS = {
  root: ROOT,
  // Using an absolute path will cause transient dependencies to be resolved to OUR
  // version of the same module, so this is kept relative
  node: 'node_modules',
  src: path.join(ROOT, SRC),
  styles: [path.join(ROOT, SRC, 'styles'), path.join(ROOT, 'node_modules')],
  images: path.join(ROOT, SRC, 'img'),
  fixtures: path.join(ROOT, SRC, '__mocks__'),
  build: path.join(ROOT, DIST),
  buildTimetable: path.join(ROOT, DIST, TIMETABLE_ONLY_PUBLIC_PATH),
};

const sassOptions = {
  // @material packages use '@material' directly as part of their import paths.
  // Without this those imports will not resolve properly.
  includePaths: [PATHS.node],
  // Bootstrap 4 and sass-loader 10 still emit a large amount of deprecation
  // output under modern Dart Sass. Keep build logs readable until those
  // dependencies are upgraded.
  quietDeps: true,
  silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
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
      sassOptions,
    },
  },
];

/**
 * Enables importing CSS with Javascript. This is all in-memory.
 *
 * @see https://survivejs.com/webpack/styling/loading/
 */
export const loadCSS = ({ include, exclude, options } = {}) => ({
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

export const productionCSS = ({ options } = {}) => ({
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[contenthash:8].css',
      chunkFilename: 'assets/[name].[contenthash:8].css',
      ignoreOrder: true,

      ...options,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        include: PATHS.styles,
        use: [MiniCssExtractPlugin.loader, ...getCSSConfig({ options })],
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
export const loadImages = ({ include, exclude, options } = {}) => ({
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

export const devServer = () => ({
  devServer: {
    client: {
      // Overlay compiler errors, useful when something breaks
      overlay: true,
    },
    // Enable history API fallback so HTML5 History API based
    // routing works. Good for complex setups.
    historyApiFallback: true,
    // Open browser unless told otherwise
    open: process.env.OPEN_BROWSER !== '0',
    // Enable hot reloading server.
    hot: 'only',
  },
});

/**
 * Returns the current Singapore date, but with the time zone changed to the
 * local machine's. E.g. if it is 1965-08-09 0000hrs SGT, this function
 * returns 1965-08-09 0000hrs local time.
 *
 * Port of `toSingaporeTime` from timify.ts.
 */
function singaporeTime() {
  const SGT_OFFSET = -8 * 60;
  const localDate = new Date();
  return new Date(localDate.getTime() + (localDate.getTimezoneOffset() - SGT_OFFSET) * 60 * 1000);
}

/**
 * Generates an app version string using the git commit hash and current date.
 *
 * @returns Object with keys `commitHash` and `versionStr`.
 */
export const appVersion = () => {
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
    commitHash && `${format(singaporeTime(), 'yyyyMMdd')}-${commitHash.substring(0, 7)}`;
  return { commitHash, versionStr };
};

/**
 * Decide NUSMods environment based on some basic heuristics.
 *
 * @returns {typeof NUSMODS_ENV} The NUSMods environment. For more information,
 * see the docstring for the `NUSMODS_ENV` global variable.
 */
export const env = () => {
  if (process.env.NODE_ENV === 'test') return 'test';

  // Vercel deployments
  if (process.env.VERCEL_ENV === 'production') return 'production';
  if (process.env.VERCEL_ENV === 'preview') {
    if (process.env.VERCEL_GIT_COMMIT_REF === 'master') return 'staging';
    return 'preview';
  }

  // CI builds, if ever ran (e.g. if build artifacts are uploaded to Netlify), are previews
  if (process.env.NODE_ENV === 'production' && process.env.CI) return 'preview';

  // Others
  return 'development';
};

export { PATHS };
