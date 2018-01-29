const util = require('util');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter');

const production = require('../webpack/webpack.config.prod');
const timetableOnly = require('../webpack/webpack.config.timetable-only');
const parts = require('../webpack/webpack.parts');

function runWebpack(config) {
  const compiler = webpack(config);
  return util.promisify(compiler.run).call(compiler);
}

// Print out errors
function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach((err) => {
    console.log(err.message || err);
    console.log();
  });
}

function handleErrors(stats) {
  if (stats.compilation.errors.length) {
    printErrors('Failed to compile.', stats.compilation.errors);
    process.exit(1);
  }

  if (process.env.CI && stats.compilation.warnings.length) {
    // eslint-disable-next-line max-len
    printErrors(
      'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
      stats.compilation.warnings,
    );
    process.exit(1);
  }
}

// Create the production build and print the deployment instructions.
async function build(previousFileSizes) {
  console.log('Building version', chalk.cyan(parts.appVersion().versionStr));
  console.log(chalk.cyan('Creating an optimized production build...'));
  console.log();

  try {
    const mainStats = await runWebpack(production);
    handleErrors(mainStats);

    console.log(chalk.green('Compiled successfully.'));
    console.log();

    console.log('File sizes after gzip:');
    console.log();
    printFileSizesAfterBuild(mainStats, previousFileSizes, parts.PATHS.build);
    console.log();

    console.log(`The ${chalk.cyan(parts.PATHS.build)} folder is ready to be deployed.`);
    console.log();

    console.log(chalk.cyan('Creating timetable-only build...'));
    console.log();

    const timetableOnlyStats = await runWebpack(timetableOnly);
    handleErrors(timetableOnlyStats);

    console.log(chalk.green('Compiled successfully.'));
    console.log();
  } catch (err) {
    printErrors('Failed to compile.', [err]);
    process.exit(1);
  }
}

// Write commit hash into `commit-hash.txt` for reference during deployment.
function writeCommitHash() {
  const { commitHash } = parts.appVersion();
  // Sync filename with `scripts/promote-staging.sh`.
  fs.writeFileSync(path.join(parts.PATHS.build, 'commit-hash.txt'), `${commitHash.slice(0, 7)}\n`);
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(parts.PATHS.build)
  .then((previousFileSizes) => build(previousFileSizes))
  .then(writeCommitHash);
