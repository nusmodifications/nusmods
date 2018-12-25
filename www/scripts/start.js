const chalk = require('chalk');

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const openBrowser = require('react-dev-utils/openBrowser');

// Dynamically import webpack config. Default to webpack.config.dev
const CONFIG_FILE = `../webpack/webpack.config.${process.env.CONFIG || 'dev'}`;
const developmentConfig = require(CONFIG_FILE); // eslint-disable-line import/no-dynamic-require

// If you use Docker, Vagrant or Cloud9, set
// host: options.host || '0.0.0.0';
const DEFAULT_HOST = process.env.HOST || 'localhost';
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080;
const DEFAULT_EXPORT_PORT = parseInt(process.env.EXPORT_PORT, 10) || 3000;
const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http';
const OPEN_BROWSER = process.env.OPEN_BROWSER !== '0'; // Open browser unless told otherwise

function runDevServer(host, port, exportPort, protocol, shouldOpenBrowser) {
  const compiler = Webpack(developmentConfig);
  const devServer = new WebpackDevServer(compiler, {
    // Enable history API fallback so HTML5 History API based
    // routing works. Good for complex setups.
    historyApiFallback: true,
    // Enable hot reloading server.
    hotOnly: true,
    // Overlay compiler errors, useful when something breaks
    overlay: {
      warnings: false,
      errors: true,
    },
    // Display only time, warning and errors
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: true,
      assets: false,
      chunks: false,
      chunkModules: false,
      modules: false,
      errors: true,
      errorDetails: true,
      warnings: true,
      entrypoints: false,
      performance: false,
    },
    https: protocol === 'https',

    proxy: {
      // Proxy the short_url.php endpoint because it does not support CORS
      '/short_url.php': {
        target: 'https://nusmods.com',
        changeOrigin: true,
      },

      // Proxy export endpoints to the local version for development
      '/export': {
        target: `http://${host}:${exportPort}`,
        pathRewrite: {
          '^/export': '',
        },
      },
    },
  });

  // Launch WebpackDevServer.
  devServer.listen(port, host, (err) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(chalk.cyan('Starting the development server...'));
    console.log();

    if (shouldOpenBrowser) {
      openBrowser(`${protocol}://${host}:${port}/`);
    }
  });
}

runDevServer(DEFAULT_HOST, DEFAULT_PORT, DEFAULT_EXPORT_PORT, PROTOCOL, OPEN_BROWSER);
