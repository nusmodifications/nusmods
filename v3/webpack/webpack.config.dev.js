const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.config.common');
const dll = require('./webpack.config.dll');
const utils = require('./utils');
const devServer = require('./dev-server');

const config = merge(
  common,
  {
    devtool: 'eval-source-map',
    plugins: [].concat(
      new HtmlWebpackPlugin({
        // We use ejs because there's custom logic to include the dll script tags.
        template: path.join(common.PATHS.app, 'index.ejs'),
        cache: true,
        // `dll` is a self-defined option to pass the paths of the built dll files
        // to the template. The dll JavaScript files are loaded in script tags
        // within the template and are available to the application.
        dll: {
          paths: Object.keys(dll.DLL_ENTRIES).map(function (entryName) {
            return path.join(common.DLL, dll.DLL_FILE_FORMAT.replace(/\[name\]/g, entryName));
          }),
        },
      }),
      Object.keys(dll.DLL_ENTRIES).map(function (entryName) {
        return new webpack.DllReferencePlugin({
          context: '.',
          manifest: require(path.join(common.PATHS.dll, dll.DLL_MANIFEST_FILE_FORMAT.replace(/\[name\]/g, entryName)))
        });
      })
    ),
  },
  utils.setFreeVariable('process.env.NODE_ENV', 'development'),
  utils.setupCSS(common.PATHS.styles),
  devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  })
);

module.exports = config;
