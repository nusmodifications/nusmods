const axios = require('axios');

// Script adapted from https://github.com/ebidel/lighthouse-ci
const CI_HOST = 'https://lighthouse-ci.appspot.com';
const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY;
const RUNNERS = { chrome: 'chrome', wpt: 'wpt' };

/**
 * Collects command lines flags and creates settings to run LH CI.
 * @return {!Object} Settings object.
 */
function getConfig() {
  const config = {};

  config.testUrl = 'https://latest.nusmods.com';
  config.runner = RUNNERS.chrome;
  config.addComment = true;

  config.repo = {
    owner: 'nusmodifications',
    name: 'nusmods',
  };

  config.thresholds = {
    performance: 50,
    pwa: 90,
    seo: 90,
    accessibility: 70,
    'best-practices': 90,
  };

  const PR_NUMBER_REGEX = /\/pull\/(\d+)$/;
  const prNumberMatch = PR_NUMBER_REGEX.exec(process.env.CIRCLE_PULL_REQUEST);
  if (prNumberMatch) {
    config.pr = {
      number: parseInt(prNumberMatch[1], 10),
      sha: process.env.CIRCLE_SHA1,
    };
  }

  return config;
}

/**
 * @param {!Object} config Settings to run the Lighthouse CI.
 */
function run(config) {
  let endpoint;
  let body = config;

  switch (config.runner) {
    case RUNNERS.wpt:
      endpoint = `${CI_HOST}/run_on_wpt`;
      break;
    case RUNNERS.chrome: // same as default
    default:
      endpoint = `${CI_HOST}/run_on_chrome`;
      body = Object.assign({ output: 'json' }, config);
  }

  axios({
    url: endpoint,
    method: 'POST',
    data: body,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': LIGHTHOUSE_API_KEY,
    },
  })
    .then((json) => {
      if (config.runner === RUNNERS.wpt) {
        console.log(`Started Lighthouse run on WebPageTest: ${json.data.target_url}`);
      }
    })
    .catch((err) => {
      console.log('Lighthouse CI failed', err);
      process.exit(1);
    });
}

// Run LH if this is a PR.
const config = getConfig();
if (process.env.CIRCLE_PULL_REQUEST) {
  run(config);
} else {
  console.log('Lighthouse is not run for non-PR commits.');
}
