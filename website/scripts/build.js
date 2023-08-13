const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter');
const _ = require('lodash');

const production = require('../webpack/webpack.config.prod');
const timetableOnly = require('../webpack/webpack.config.timetable-only');
const browserWarning = require('../webpack/webpack.config.browser-warning');
const parts = require('../webpack/webpack.parts');

function runWebpack(config) {
  const compiler = webpack(config);
  return util.promisify(compiler.run).call(compiler);
}

/**
 * Print out errors.
 * @param {function} log console.log-compatible function used to print errors
 * @param {string} summary
 * @param {Error|Error[]} errorOrErrors
 */
function printErrors(log, summary, errorOrErrors) {
  log(chalk.red(summary));
  log();
  const errors = _.castArray(errorOrErrors);
  errors.forEach((err, i) => {
    log(err);
    if (i !== errors.length - 1) {
      log();
    }
  });
  console.log(); // Use native console.log to force an unprefixed line after the error block
}

/**
 * @param {function} log
 * @param {webpack.Stats} stats
 */
function handleErrors(log, stats) {
  if (stats.hasErrors()) {
    printErrors(log, 'Failed to compile.', stats.compilation.errors);
    throw stats.compilation.errors;
  }

  const statsJson = stats.toJson({
    warnings: true,
  });

  if (process.env.CI && statsJson.warnings.length) {
    printErrors(
      log,
      'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
      stats.compilation.warnings,
    );
    throw stats.compilation.errors;
  }
}

/**
 * Write commit hash into `commit-hash.txt`, which are used by
 * scripts/promote-staging.sh and https://launch.nusmods.com.
 */
async function writeCommitHash() {
  const { commitHash } = parts.appVersion();
  // Sync filename with `scripts/promote-staging.sh`.
  return fs.outputFile(
    path.join(parts.PATHS.build, 'commit-hash.txt'),
    `${commitHash.slice(0, 7)}\n`,
  );
}

async function buildProd(previousDistFileSizes) {
  const log = (...args) => console.log('prod:', ...args);
  try {
    log(chalk.cyan('Creating build...'));

    // Build the browser warning bundle first so we can pass it to the main bundle
    const browserWarningStats = await runWebpack(browserWarning);
    handleErrors((...args) => console.log('prod (browser-warning):', ...args), browserWarningStats);

    // The browser warning bundle should only have one JS file which includes both the JS and CSS
    // for the browser warning. We pass this to the main site's Webpack config so it can be loaded
    // in the HTML using a script tag
    const browserWarningPath = browserWarningStats
      .toJson()
      .assets.map((asset) => asset.name)
      .filter((name) => !name.endsWith('.map'))[0];

    // Build the main website bundle
    const mainStats = await runWebpack(production({ browserWarningPath }));
    handleErrors(log, mainStats);

    log(chalk.green('Compiled successfully.'));
    log('File sizes after gzip:');
    printFileSizesAfterBuild(mainStats, previousDistFileSizes, parts.PATHS.build);
  } catch (err) {
    printErrors(log, 'Failed to compile prod.', err);
    throw err;
  }
}

/**
 * Build the timetable-only build for the export service.
 */
async function buildTimetableOnly() {
  const log = (...args) => console.log('timetable-only:', ...args);
  try {
    log(chalk.cyan('Creating build...'));

    const timetableOnlyStats = await runWebpack(timetableOnly);
    handleErrors(log, timetableOnlyStats);

    log(chalk.green('Compiled timetable-only successfully.'));
  } catch (err) {
    printErrors(log, 'Failed to compile timetable-only.', err);
    throw err;
  }
}

async function buildAll(previousDistFileSizes) {
  const results = await Promise.allSettled([
    buildProd(previousDistFileSizes),
    buildTimetableOnly(),
  ]);
  const errors = results.filter((r) => r.status === 'rejected').map((r) => r.reason);
  if (errors.length > 0) {
    throw errors;
  }
}

async function main() {
  console.log('Building version', chalk.cyan(parts.appVersion().versionStr));

  // First, read the current file sizes in build directory.
  // This lets us display how much they changed later.
  const previousDistFileSizes = await measureFileSizesBeforeBuild(parts.PATHS.build);

  // Clear previous build
  await fs.remove(parts.PATHS.build);
  console.log(`${parts.PATHS.build} has been removed`);

  try {
    await buildAll(previousDistFileSizes);
  } catch {
    // errors should've been logged by the respective build functions.
    console.log('Build failed.');
    process.exit(1);
  }

  await writeCommitHash();

  console.log(`The ${chalk.cyan(parts.PATHS.build)} folder is ready to be deployed.`);
}

main();
