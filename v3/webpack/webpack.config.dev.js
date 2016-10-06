const webpack = require('webpack');
const merge = require('webpack-merge');
const HappyPack = require('happypack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.config.common');
const dll = require('./webpack.config.dll');
const utils = require('./utils');
const devServer = require('./dev-server');

let dllPlugins = [];
let dllHtmlWebpackConfig = {};
const args = process.argv.slice(2);

// Disable using of dll if -no-dll is present.
if (args.indexOf('-no-dll') === -1) {
  dllPlugins = dllPlugins.concat(Object.keys(dll.DLL_ENTRIES).map(function (entryName) {
    return new webpack.DllReferencePlugin({
      context: '.',
      manifest: require(path.join(common.PATHS.dll, dll.DLL_MANIFEST_FILE_FORMAT.replace(/\[name\]/g, entryName)))
    });
  }));
  // `dll` is a self-defined option to pass the paths of the built dll files
  // to the template. The dll JavaScript files are loaded in <script> tags
  // within the template and are available to the application.
  dllHtmlWebpackConfig = {
    dll: {
      paths: Object.keys(dll.DLL_ENTRIES).map(function (entryName) {
        return path.join(common.DLL, dll.DLL_FILE_FORMAT.replace(/\[name\]/g, entryName));
      }),
    }
  };
}

const config = merge(
  common,
  {
    devtool: 'eval-source-map',
    plugins: [].concat(
      new HappyPack({ id: 'styles' }),
      new HtmlWebpackPlugin(Object.assign({},
        {
          // We use ejs because there's custom logic to include the dll script tags.
          template: path.join(common.PATHS.app, 'index.ejs'),
          cache: true,
          chunks: [
            'app',
          ],
        },
        dllHtmlWebpackConfig
      )),
      dllPlugins
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
