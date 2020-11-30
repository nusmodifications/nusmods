import fs from 'fs-extra';
import Sentry from '@sentry/node';
import gracefulShutdown from 'http-graceful-shutdown';

import config from './config';
import app from './app';
import * as render from './render';

// Config check
if (!config.academicYear || !/\d{4}-\d{4}/.test(config.academicYear)) {
  throw new Error(
    'academicYear is not set - check config.ts. ' +
      'This should be in the form of <year>-<year> (e.g. 2019-2020).',
  );
}

if (process.env.NODE_ENV === 'production') {
  if (
    config.moduleData &&
    (!fs.existsSync(config.moduleData) || !fs.lstatSync(config.moduleData).isDirectory())
  ) {
    throw new Error(
      'moduleData path does not exist or is not a directory - check config.ts. ' +
        'This should be the path to the api/v2/<academic year>/modules folder.',
    );
  }

  // Set up Raven
  if (config.sentryDsn) {
    Sentry.init({
      dsn: config.sentryDsn,
    });
  } else {
    // TODO: Replace with Bunyan log?
    console.error('[WARNING] Sentry DSN is not specified - check config.ts');
  }
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

    const server = app.listen(Number(process.env.PORT) || 3000, process.env.HOST);
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
