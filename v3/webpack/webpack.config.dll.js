const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.config.common');
const utils = require('./utils');

// Extract out these entry bundles into a dll.
const DLL_ENTRIES = {
  vendor: common.VENDOR,
};

const DLL_FILE_FORMAT = '[name].dll.js';
const DLL_MANIFEST_FILE_FORMAT = '[name]-manifest.json';

const config = merge(
  utils.clean(common.PATHS.dll),
  {
    entry: DLL_ENTRIES,
    output: {
      // The dll folder.
      path: common.PATHS.dll,
      filename: DLL_FILE_FORMAT,
      // The name of the global variable which the library's
      // require() function will be assigned to.
      library: '[name]_dll',
    },
    plugins: [
      new webpack.DllPlugin({
        // The path to the manifest file which maps between
        // modules included in a bundle and the internal IDs
        // within that bundle.
        path: path.join(common.PATHS.dll, DLL_MANIFEST_FILE_FORMAT),
        // The name of the global variable which the library's
        // require function has been assigned to. This must match the
        // output.library option above.
        name: '[name]_dll',
      }),
    ],
  },
  // We only use dlls for development builds. Technically possible to
  // use for production builds but will need more tweaking.
  utils.setFreeVariable('process.env.NODE_ENV', 'development')
);

module.exports = config;
module.exports.DLL_ENTRIES = DLL_ENTRIES;
module.exports.DLL_FILE_FORMAT = DLL_FILE_FORMAT;
module.exports.DLL_MANIFEST_FILE_FORMAT = DLL_MANIFEST_FILE_FORMAT;
