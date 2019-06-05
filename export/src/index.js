const fs = require('fs-extra');
const Sentry = require('@sentry/node');
const gracefulShutdown = require('http-graceful-shutdown');

const config = require('./config');
const app = require('./app');
const render = require('./render');

// Config check
if (process.env.NODE_ENV === 'production') {
  if (
    config.moduleData &&
    (!fs.existsSync(config.moduleData) || !fs.lstatSync(config.moduleData).isDirectory())
  ) {
    throw new Error(
      'moduleData path does not exist or is not a directory - check config.js. ' +
        'This should be the path to the api/<academic year>/modules folder.',
    );
  }

  if (!config.ravenDsn) {
    // TODO: Replace with Bunyan log?
    console.error('[WARNING] Raven DSN is not specified - check config.js');
  }
}

// Set up Raven
if (process.env.NODE_ENV === 'production' && config.ravenDsn) {
  Sentry.init({
    dsn: config.ravenDsn,
  });
}

// Wait for the browser to finish launching before starting the server
render
  .launch()
  .then(async (browser) => {
    // Attach the page and browser objects to context
    app.context.browser = browser;

    // Attach page content or URL
    if (/^https?:\/\//.test(config.page)) {
      app.context.pageUrl = config.page;
    } else {
      app.context.pageContent = await fs.readFile(config.page, 'utf-8');
    }

    const server = app.listen(process.env.PORT || 3000, process.env.HOST);
    console.log('Export server started');

    gracefulShutdown(server);
  })
  .catch((e) => {
    console.error('Cannot start browser:');
    console.error(e);

    if (e.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error('Check that the export page dev server has been started');
    }

    process.exit(1);
  });
