const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const parts = require('./webpack.parts');

const config = merge([
  // We only use dlls for development builds. Technically possible to
  // use for production builds but will need more tweaking.
  parts.setFreeVariable('process.env.NODE_ENV', 'development'),
  parts.clean(parts.PATHS.dll),
  {
    entry: parts.DLL.ENTRIES,
    output: {
      // The dll folder.
      path: parts.PATHS.dll,
      filename: parts.DLL.FILE_FORMAT,
      // The name of the global variable which the library's
      // require() function will be assigned to.
      library: '[name]_dll',
    },
    plugins: [
      new webpack.DllPlugin({
        // The path to the manifest file which maps between
        // modules included in a bundle and the internal IDs
        // within that bundle.
        path: path.join(parts.PATHS.dll, parts.DLL.MANIFEST_FILE_FORMAT),
        // The name of the global variable which the library's
        // require function has been assigned to. This must match the
        // output.library option above.
        name: '[name]_dll',
      }),
    ],
  },
  parts.mockNode(),
]);

module.exports = config;
