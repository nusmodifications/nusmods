const util = require('util');
const fs = require('fs-extra');
const path = require('path');
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
 * @param {function} log
 * @param {string} summary
 * @param {Error[]} errors
 */
function printErrors(log, summary, errors) {
  log(chalk.red(summary));
  log();
  errors.forEach((err, i) => {
    log(err);
    if (i !== errors.length - 1) {
      log();
    }
  });
  console.log();
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

    // Remove dist folders
    await fs.remove(parts.PATHS.build);
    log(`${parts.PATHS.build} has been removed`);

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

    log(`The ${chalk.cyan(parts.PATHS.build)} folder is ready to be deployed.`);
  } catch (err) {
    printErrors(log, 'Failed to compile prod.', _.castArray(err));
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
    await fs.remove(parts.PATHS.buildTimetable);
    log(`${parts.PATHS.buildTimetable} has been removed`);

    const timetableOnlyStats = await runWebpack(timetableOnly);
    handleErrors(log, timetableOnlyStats);

    log(chalk.green('Compiled timetable-only successfully.'));
    log(`The ${chalk.cyan(parts.PATHS.buildTimetable)} folder is ready to be deployed.`);
  } catch (err) {
    printErrors(log, 'Failed to compile timetable-only.', _.castArray(err));
    throw err;
  }
}

const targets = {
  prod: buildProd,
  'timetable-only': buildTimetableOnly,

  async all(previousDistFileSizes) {
    const results = await Promise.allSettled(
      Object.entries(targets)
        .filter(([target]) => target !== 'all')
        .map(([, buildFn]) => buildFn(previousDistFileSizes)),
    );
    const errors = results.filter((r) => r.status === 'rejected').map((r) => r.reason);
    if (errors.length > 0) {
      throw errors;
    }
  },
};

async function main() {
  const args = process.argv.slice(2);

  const targetName = args[0];
  if (!targetName || !Object.keys(targets).includes(targetName)) {
    console.error(
      `Please specify a valid build target. Available options: ${Object.keys(targets).join(', ')}`,
    );
    process.exit(1);
  }
  const buildFn = targets[targetName];

  console.log('Building version', chalk.cyan(parts.appVersion().versionStr));

  // First, read the current file sizes in build directory.
  // This lets us display how much they changed later.
  const previousDistFileSizes = await measureFileSizesBeforeBuild(parts.PATHS.build);

  try {
    await buildFn(previousDistFileSizes);
  } catch (e) {
    // errors should've been logged by the respective build functions.
    console.log('Build failed.');
    process.exit(1);
  }

  await writeCommitHash();
}

main();
