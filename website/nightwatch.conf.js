const config = {
  src_folders: ['src/js/e2e/tests'],
  page_objects_path: 'src/js/e2e/page-objects',
  output_folder: 'reports/junit/e2e',

  selenium: {
    start_process: false,
    host: 'hub-cloud.browserstack.com',
    port: 80,
  },

  test_settings: {
    default: {
      launch_url: process.env.LAUNCH_URL || 'http://staging.nusmods.com',
      desiredCapabilities: {
        'browserstack.user': process.env.BROWSERSTACK_USER,
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
        'browserstack.debug': true,
        'browserstack.console': 'errors',

        browser: 'Firefox',
        // Latest ESR
        browserVersion: '60',
      },
    },

    safariMobile: {
      desiredCapabilities: {
        device: 'iPhone 7',
        realMobile: 'true',
        os_version: '10.3',
      },
    },

    safariDesktop: {
      desiredCapabilities: {
        os: 'OS X',
        browser: 'Safari',
        browserVersion: '9.1',
      },
    },

    edge: {
      browser: 'Edge',
      browserVersion: '16.0',
    },
  },
};

// Copy seleniumhost/port into test settings
Object.values(config.test_settings).forEach((setting) => {
  setting.selenium_host = config.selenium.host;
  setting.selenium_port = config.selenium.port;
});

if (process.env.LOCAL_TEST) {
  config.test_settings.default.desiredCapabilities['browserstack.local'] = true;
}

module.exports = config;
