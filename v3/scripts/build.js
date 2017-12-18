const chalk = require('chalk');
const webpack = require('webpack');
const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = require('react-dev-utils/FileSizeReporter');

const config = require('../webpack/webpack.config.prod');
const parts = require('../webpack/webpack.parts');

// Print out errors
function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach((err) => {
    console.log(err.message || err);
    console.log();
  });
}

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('Building version', chalk.cyan(parts.appVersion().versionStr));
  console.log(chalk.cyan('Creating an optimized production build...'));
  console.log();

  webpack(config).run((err, stats) => {
    if (err) {
      printErrors('Failed to compile.', [err]);
      process.exit(1);
    }

    if (stats.compilation.errors.length) {
      printErrors('Failed to compile.', stats.compilation.errors);
      process.exit(1);
    }

    if (process.env.CI && stats.compilation.warnings.length) {
      // eslint-disable-next-line max-len
      printErrors('Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.', stats.compilation.warnings);
      process.exit(1);
    }

    console.log(chalk.green('Compiled successfully.'));
    console.log();

    console.log('File sizes after gzip:');
    console.log();
    printFileSizesAfterBuild(stats, previousFileSizes);
    console.log();

    console.log(`The ${chalk.cyan(parts.PATHS.build)} folder is ready to be deployed.`);
  });
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(parts.PATHS.build).then((previousFileSizes) => {
  // Start the webpack build
  build(previousFileSizes);
});
