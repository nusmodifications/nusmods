module.exports = {
  academicYear: '2017-2018',

  // Width of the page in pixels
  pageWidth: 1024,

  // Path to the Chrome executable - for Puppeteer 0.13, use Chrome 64.
  // If left blank this will use the version of Chromium that comes with Puppeteer
  // instead
  chromeExecutable: null,

  // If set to a local path, the page will be loaded using setContent - use this
  // for production
  // If set to a URL, the page will be loaded instead - use 0.0.0.0:8081 in
  // development with Webpack hot reload server
  page: 'http://0.0.0.0:8081',

  // Path to a folder containing module data. If null, during development the
  // NUSMods API will be used instead. In production leaving this as null will
  // throw an error.
  moduleData: null,

  // Full DSN string used to report errors to Raven from the server - used only in production
  ravenDsn: '',

  // Public key only DSN string used for the Raven error feedback form
  publicDsn: 'https://37215374a3fd42a198c7b144c8886335@sentry.io/265295',
};
