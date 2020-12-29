const parts = require('./webpack.parts');

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

  entry: 'entry/main',
  context: parts.PATHS.src,
  output: {
    publicPath: parts.WEBSITE_PUBLIC_PATH,
    // Place all built bundles in an assets folder. Since they should all have
    // version hashes in their names, they can be easily long-term cached.
    path: parts.PATHS.build,
    filename: 'assets/[name].[contenthash:8].js',
    // This is used for require.ensure. The setup
    // will work without but this is useful to set.
    chunkFilename: 'assets/[name].[contenthash:8].js',
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
        include: [
          parts.PATHS.src,
          // React Leaflet's MapContainer destructures an object using the ...
          // operator, which isn't supported on Mobile Safari <= 11.2.
          // TODO: Remove after we drop support for iOS <= 11.2
          /node_modules\/react-leaflet/,
        ],
        use: ['babel-loader'],
      },
    ],
  },
};

module.exports = commonConfig;
