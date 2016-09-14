const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');
const pkg = require('./package.json');
const validate = require('webpack-validator');
const webpack = require('webpack');

const PATHS = {
  app: path.join(__dirname, 'app/scripts/main.js'),
  style: path.join(__dirname, 'app', 'styles'),
  build: path.join(__dirname, 'dist')
}

const devServerOpts = function(options) {
  return {
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      stats: 'errors-only',
      host: options.host,
      port: options.port
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  };
}

const extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    entry: entry,
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest']
      })
    ]
  };
}

const setupCSS = function() {
  return {
    module: {
      loaders: [{
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
      }, {
        test: /\.css$/,
        loaders: ['style', 'css'],
      }]
    }
  }
}

const extractCSS = function() {
  return {
    module: {
      loaders: [{
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(['css', 'sass'])
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(['css'])
      }]
    },
    plugins: [
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  };
}

const common = {
  entry: {
    app: PATHS.app,
    style: path.join(PATHS.style, 'main.scss')
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  module: {
    loaders: [
      // font related loaders
      {
        // Matches both node_modules/font-awesome/fonts and src/fonts
        test: /fonts\/.*\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file',
        query: {
          name: 'fonts/[name].[ext]',
          limit: 10000,
          mimetype: 'application/font-woff'
        }
      },
      {
        // Matches both node_modules/font-awesome/fonts and src/fonts
        test: /fonts\/.*\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file',
        query: {
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          mimetype: 'image/svg+xml',
          name: 'images/[path][name].[ext]'
        }
      },
      {
        test: /\.swf$/,
        loader: 'file'
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/,
        loader: 'file',
        query: {
          name: 'images/[md5:hash].[ext]'
        }
      },
      // copy favicons to root
      {
        test: /favicon-\d+.png$|favicon.ico$/,
        loader: 'file?name=[name].[ext]'
      },
      // copy htaccess to root
      {
        test: /.htaccess$/,
        loader: 'file'
      },
      // copy php files to root
      {
        test: /\.php$/,
        loader: 'file'
      },
      {
        test: /\.xml$/,
        loader: 'file'
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'app/index.ejs',
      inject: false
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ],
  resolve: {
    alias: {
      bootstrap: 'bootstrap-sass/assets/javascripts/bootstrap',
      localforage: 'localforage/dist/localforage.nopromises.js',
    }
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "./node_modules")]
  }
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      {
        devtool: 'source-map'
      },
      extractCSS(),
      {
        plugins: [
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false
            }
          })
        ]
      }
    );
    break;
  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      setupCSS(),
      devServerOpts({
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

// module.exports = validate(config);
module.exports = config;
