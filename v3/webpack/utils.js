const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

exports.minify = function () {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        // Don't beautify output (enable for neater output).
        beautify: false,
        // Eliminate comments.
        comments: false,
        // Compression specific options.
        compress: {
          warnings: false,
          // Drop `console` statements.
          drop_console: true,
        },
        // Mangling specific options.
        mangle: {
          // Don't mangle $.
          except: ['$'],
          // Don't care about IE8 because React doesn't support IE8.
          screw_ie8 : true,
          // Don't mangle function names.
          keep_fnames: true,
        },
      }),
    ],
  };
}

exports.setFreeVariable = function (key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env),
    ],
  };
}

exports.extractBundle = function (options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting.
    entry: entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest'],
      }),
    ],
  };
}

exports.clean = function (path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without `root` CleanWebpackPlugin won't point to our
        // project and will fail to work.
        root: process.cwd(),
      }),
    ],
  };
}

// CSS-related utils

function postcss() {
  return [
    autoprefixer({
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9', // React doesn't support IE8 anyway.
      ]
    }),
  ];
}

exports.setupCSS = function (paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.(css|scss)$/,
          loaders: ['style', 'css', 'postcss', 'sass'],
          include: paths,
          happy: { id: 'styles' },
        },
      ],
    },
    postcss: postcss,
  };
}

exports.extractCSS = function (paths) {
  return {
    module: {
      loaders: [
        // Extract CSS during build.
        {
          test: /\.(css|scss)$/,
          // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
          loader: ExtractTextPlugin.extract(['css', 'postcss', 'sass']),
          include: paths,
        },
      ],
    },
    postcss: postcss,
    plugins: [
      // Output extracted CSS to a file.
      new ExtractTextPlugin('[name].[chunkhash].css'),
    ],
  };
}
