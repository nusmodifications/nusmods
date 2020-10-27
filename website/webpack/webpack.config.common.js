const { merge } = require('webpack-merge');

const parts = require('./webpack.parts');

// Used by Webpack to resolve the path to assets on the client side
// See: https://webpack.js.org/guides/public-path/
const publicPath = process.env.PUBLIC_PATH || '/';

const commonConfig = merge([
  {
    // This tells Webpack where to look for modules. Remember to update the
    // corresponding entry in tsconfig.json if you're updating these
    resolve: {
      // Specify a few root paths when importing our own modules,
      // so that we can use absolute paths in our imports.
      // E.g. Importing our own module at `/website/src/path/to/module` will simply be:
      // `import module from 'path/to/module;`
      modules: [parts.PATHS.src, parts.PATHS.node],
      // Maps specific modules, similar to modules above, except in this case
      // we map the folders directly - for instance we only want __mocks__ and not
      // any of the other folders under root to be imported from root, so we use
      // this instead of modules
      alias: {
        __mocks__: parts.PATHS.fixtures,
      },
      // Importing modules from these files will not require the extension.
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      // We don't use symlinks, so disable for performance
      symlinks: false,
      // ical-generator imports Node.js core modules, which don't exist in a
      // browser environment. Tell Webpack to provide empty modules for them so
      // importing them works.
      fallback: {
        fs: false,
        os: false,
      },
    },
    // Entry accepts a path or an object of entries.
    // We'll be using the latter form given it's
    // convenient with more complex configurations.
    entry: {
      // This will build an app.js file from the `main` module.
      app: ['entry/main'],
    },
    context: parts.PATHS.src,
    output: {
      publicPath,
      path: parts.PATHS.build,
      filename: '[name].js',
      pathinfo: false,
    },
    performance: {
      // Disable performance hints since we use our own size reporter
      hints: false,
    },
  },
  parts.transpileJavascript({
    include: parts.PATHS.src,
  }),
  parts.setFreeVariable('process.env.DISPLAY_COMMIT_HASH', parts.appVersion().commitHash),
  parts.setFreeVariable('process.env.VERSION_STR', parts.appVersion().versionStr),
]);

module.exports = commonConfig;
