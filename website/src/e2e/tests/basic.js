const url = require('url');
const config = require('../config');

module.exports = {
  'Load homepage': (client) => {
    const home = client.page.timetable();

    home
      .navigate()
      .waitForElementVisible('.main-container', config.timeout)
      .assert.elementPresent('.page-container')
      // Logo
      .assert.elementPresent('a[href="/"]');
  },

  'Add module': (client) => {
    const home = client.page.timetable();

    home
      .click('@addModuleBtn')
      .sendKeys('@addModuleInput', ['CS1010S'])
      .sendKeys('@addModuleInput', [client.Keys.RETURN]);

    client.pause(100);

    home
      .sendKeys('@addModuleInput', [client.Keys.ESCAPE])
      .waitForElementVisible('@timetableLessons', config.timeout)
      .assert.containsText('@timetableLessons', 'CS1010S')
      .assert.containsText('@moduleTable', 'CS1010S');
  },

  'Exam calendar': (client) => {
    const home = client.page.timetable();

    home
      .click('@examCalendarBtn')
      .waitForElementVisible('@examCalendar', 500)
      .assert.containsText('@examCalendar', 'CS1010S');

    client.end();
  },

  'Load module page': (client) => {
    client
      .url(url.resolve(client.launch_url, '/modules/CS1010S'))
      .waitForElementVisible('.page-container h1', config.timeout)
      .assert.containsText('.page-container h1', 'Programming Methodology');
  },

  'Load venue page': (client) => {
    client
      .url(url.resolve(client.launch_url, '/venues/COM1-0120'))
      .waitForElementVisible('.page-container', config.timeout)
      .assert.containsText('h1', 'COM1-0120')
      .end();
  },
  // STOP! Are you adding another test? Make sure the test has .end() at the end
};
