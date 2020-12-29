import * as Sentry from '@sentry/node';
import config from './config';
import { HttpError } from './HttpError';

export function throwIfAcademicYearNotSet() {
  if (!config.academicYear || !/\d{4}-\d{4}/.test(config.academicYear)) {
    throw new HttpError(
      500,
      'academicYear is not set - check config.ts. ' +
        'This should be in the form of <year>-<year> (e.g. 2019-2020).',
    );
  }
}

export function setUpSentry() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (config.sentryDsn) {
    Sentry.init({
      dsn: config.sentryDsn,
    });
  } else {
    // TODO: Replace with Bunyan log?
    console.error('[WARNING] Sentry DSN is not specified - check config.ts');
  }
}
