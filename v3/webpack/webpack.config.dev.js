const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

const commonConfig = require('./webpack.config.common');
const parts = require('./webpack.parts');

let dllPlugins = [];
let dllHtmlWebpackConfig = {};
const args = process.argv.slice(2);

// DLL stands for Dynamically Linked Libraries. These are here to make webpack faster.
// Disable using of dll if -no-dll is present.
if (!args.includes('-no-dll')) {
  dllPlugins = Object.keys(parts.DLL.ENTRIES).map((entryName) => {
    const manifestFileName = parts.DLL.MANIFEST_FILE_FORMAT.replace(/\[name\]/g, entryName);
    return new webpack.DllReferencePlugin({
      context: '.',
      manifest: require(path.join(parts.PATHS.dll, manifestFileName)),  // eslint-disable-line
    });
  });
  // `dll` is a self-defined option to pass the paths of the built dll files
  // to the template. The dll JavaScript files are loaded in <script> tags
  // within the template and are available to the application.
  dllHtmlWebpackConfig = {
    dll: {
      paths: Object.keys(parts.DLL.ENTRIES).map((entryName) => {
        return path.join(parts.DLL.NAME, parts.DLL.FILE_FORMAT.replace(/\[name\]/g, entryName));
      }),
    },
  };
}

const developmentConfig = merge([
  parts.setFreeVariable('process.env.NODE_ENV', 'development'),
  commonConfig,
  {
    // Use a fast source map for good-enough debugging usage
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: 'cheap-module-eval-source-map',
    entry: [
      'react-hot-loader/patch',
      // Modify entry for hot module reload to work
      // See: https://survivejs.com/webpack/appendices/hmr/#setting-wds-entry-points-manually
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      'main',
    ],
    plugins: [
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      new WatchMissingNodeModulesPlugin(parts.PATHS.node),
      new HtmlWebpackPlugin({
        ...dllHtmlWebpackConfig,
        template: path.join(parts.PATHS.app, 'index.ejs'),
        cache: true,
      }),
      // Ignore node_modules so CPU usage with poll watching drops significantly.
      new webpack.WatchIgnorePlugin([
        parts.PATHS.node,
        parts.PATHS.build,
      ]),
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        multiStep: true,
      }),
      // prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin(),
     // do not emit compiled assets that include errors
      new webpack.NoEmitOnErrorsPlugin(),
      ...dllPlugins,
    ],
  },
  parts.loadImages({
    include: parts.PATHS.images,
  }),
  parts.loadCSS({
    include: parts.PATHS.app,
  }),
  parts.flow({ failOnError: false }),
]);

module.exports = developmentConfig;
