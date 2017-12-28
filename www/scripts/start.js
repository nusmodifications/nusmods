const chalk = require('chalk');

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const openBrowser = require('react-dev-utils/openBrowser');

const developmentConfig = require('../webpack/webpack.config.dev');

// If you use Docker, Vagrant or Cloud9, set
// host: options.host || '0.0.0.0';
//
// 0.0.0.0 is available to all network devices
// unlike default `localhost`.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080;
const DEFAULT_HOST = process.env.HOST || 'localhost';
const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http';

function runDevServer(host, port, protocol) {
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
      performance: false,
    },
    https: protocol === 'https',
    host,
    port,
  });

  // Launch WebpackDevServer.
  devServer.listen(port, (err) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log(chalk.cyan('Starting the development server...'));
    console.log();

    openBrowser(`${protocol}://${host}:${port}/`);
  });
}

runDevServer(DEFAULT_HOST, DEFAULT_PORT, PROTOCOL);
