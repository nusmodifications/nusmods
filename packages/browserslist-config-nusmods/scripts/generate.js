const path = require('path');
const fs = require('fs-extra');
const browserslist = require('browserslist');
const axios = require('axios');
const prettier = require('prettier');
const helpers = require('./helpers');
const prettierConfig = require('../../../.prettierrc.js');

const API_URL =
  'https://analytics.nusmods.com/?module=API&method=DevicesDetection.getBrowserVersions&idSite=1&period=year&date=today&format=JSON';

async function fetch() {
  const payload = await axios.get(API_URL);
  const rawData = payload.data;
  if (!Array.isArray(rawData)) {
    throw Error('rawData is not an array');
  }
  if (!rawData.length) {
    throw Error('rawData is not empty');
  }
  return rawData;
}

/**
 * Mapping obtained from
 * matomo: https://github.com/matomo-org/device-detector/blob/master/Parser/Client/Browser.php
 * browserslist: https://github.com/browserslist/browserslist#browsers
 *
 * If browser exists on both Android and iOS,
 * we assume Android due to its ease of adoption of alternate browsers.
 */
const MATOMO_TO_BROWSERSLIST = {
  AN: 'android',
  BD: 'baidu',
  BB: 'bb',
  HC: 'chrome',
  CH: 'chrome',
  CI: 'ios_saf', // treat chrome on iOS as iOS due to it being a reskin
  CR: 'chrome',
  CM: 'chrome', // treat chrome mobile as chrome
  PS: 'edge',
  IE: 'ie',
  IM: 'ie_mob',
  FF: 'firefox',
  FM: 'and_ff', // firefox mobile exists on iOS too
  FK: 'and_ff', // firefox focus exists on iOS too
  MF: 'ios_saf',
  OP: 'opera',
  ON: 'opera',
  OI: 'op_mini',
  OM: 'op_mob',
  QQ: 'and_qq',
  SF: 'safari',
  SB: 'samsung',
  UC: 'and_uc',
};
const BROWSER_REGEX = /browserCode==(?<code>\w+);browserVersion==(?<version>\S+)?/;
function process(rawData) {
  const total = rawData.reduce((count, row) => count + row.sum_daily_nb_uniq_visitors, 0);

  const output = helpers.getTemplate();
  for (const row of rawData) {
    const regexpCapture = BROWSER_REGEX.exec(row.segment);
    if (!regexpCapture || !regexpCapture.groups) {
      console.warn(`Ignoring segment: ${segment}`);
      continue;
    }
    const { code, version } = regexpCapture.groups;
    const usage = (row.sum_daily_nb_uniq_visitors / total) * 100;
    const browserslistCode = MATOMO_TO_BROWSERSLIST[code];
    if (!browserslistCode) {
      console.warn(`Ignoring browser: ${code} with usage of ${usage}%`);
      continue;
    }
    let versionMapping = helpers.getVersionMapping(browserslistCode, version);
    if (!versionMapping) {
      console.warn(`Ignoring browser ${code}'s version ${version} with usage of ${usage}%`);
      continue;
    }
    output[browserslistCode][versionMapping] += usage;
  }
  return output;
}

async function output(stats) {
  const browsers = browserslist('cover 98% in my stats', { stats });
  const browserslistString = prettier.format(JSON.stringify(browsers), {
    ...prettierConfig,
    parser: 'babel',
  });
  console.log(`\nSupported browsers:\n${browsers.join('\n')}`);

  const pathAtRoot = (filename) => path.resolve(__dirname, '..', filename);
  return Promise.all([
    fs.outputFile(pathAtRoot('index.js'), `module.exports = ${browserslistString}`),
    fs.outputJson(pathAtRoot('browserslist-stats.json'), stats, { spaces: '\t' }),
  ]);
}

fetch().then(process).then(output);
