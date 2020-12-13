const parts = require('./webpack.parts');

// Used by Webpack to resolve the path to assets on the client side
// See: https://webpack.js.org/guides/public-path/
const publicPath = process.env.PUBLIC_PATH || '/';

const commonConfig = {
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

  module: {
    rules: [
      {
        test: /\.[j|t]sx?$/,
        include: parts.PATHS.src,
        use: ['babel-loader'],
      },
    ],
  },
};

module.exports = commonConfig;
