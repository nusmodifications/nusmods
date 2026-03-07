import fs from 'fs-extra';
import * as Sentry from '@sentry/node';
import gracefulShutdown from 'http-graceful-shutdown';

import config from './config';
import app from './app';

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

const server = app.listen(Number(process.env.PORT) || 3000, process.env.HOST);
console.log('Export server started');

gracefulShutdown(server);
