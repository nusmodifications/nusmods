const config = {
  src_folders: ['src/e2e/tests'],
  page_objects_path: 'src/e2e/page-objects',
  output_folder: 'reports/junit/e2e',

  webdriver: {
    start_process: false,
    host: 'hub-cloud.browserstack.com',
    port: 443,
    ssl: true,
  },

  test_settings: {
    default: {
      launch_url: process.env.LAUNCH_URL || 'http://latest.nusmods.com',

      desiredCapabilities: {
        'bstack:options': {
          userName: process.env.BROWSERSTACK_USER,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          debug: true,
          consoleLogs: 'errors'
        },

        browserName: 'Firefox',
        // Latest ESR
        browserVersion: '78',
      },
    },

    safariMobile: {
      desiredCapabilities: {
        device: 'iPhone 6',
        realMobile: 'true',
        os_version: '11.0',
      },
    },

    safariDesktop: {
      desiredCapabilities: {
        os: 'OS X',
        browserName: 'Safari',
        browserVersion: '11.1',
      },
    },

    edge: {
      browserName: 'Edge',
      browserVersion: '18.0',
    },
  },
};

if (process.env.LOCAL_TEST) {
  config.test_settings.default.desiredCapabilities['bstack:options']['local'] = true;
}

module.exports = config;
