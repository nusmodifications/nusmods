const url = require('url');
const config = require('../config');

module.exports = {
  'Load homepage': (browser) => {
    browser
      .url(browser.launch_url)
      .waitForElementVisible('.main-container', config.timeout)
      .assert.elementPresent('.page-container')
      .assert.elementPresent('a[href="/"]');
  },
  'Load module page': (browser) => {
    browser
      .url(url.resolve(browser.launch_url, '/modules/CS1010S'))
      .waitForElementVisible('.page-container h1', config.timeout)
      .assert.containsText('.page-container h1', 'Programming Methodology');
  },

  'Load venue page': (browser) => {
    browser
      .url(url.resolve(browser.launch_url, '/venues/COM1-0120'))
      .waitForElementVisible('.page-container', config.timeout)
      .assert.containsText('h1', 'COM1-0120')
      .end();
  },
  // STOP! Are you adding another test? Make sure the test has .end() at the end
};
