import * as Sentry from '@sentry/node';
import type { VercelApiHandler, VercelRequest, VercelResponse } from '@vercel/node';

import config from './config';
import { render422, render500 } from './views';
import { HttpError } from './HttpError';

function throwIfAcademicYearNotSet() {
  if (!config.academicYear || !/\d{4}-\d{4}/.test(config.academicYear)) {
    throw new HttpError(
      500,
      'academicYear is not set - check config.ts. ' +
        'This should be in the form of <year>-<year> (e.g. 2019-2020).',
    );
  }
}

function setUpSentry() {
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

/**
 * Convenience higher-order function that encapsulates most of the logic shared
 * by all export serverless functions.
 * @returns A Vercel serverless function handler.
 */
export function makeExportHandler<T>(
  parseExportData: (request: VercelRequest) => T,
  performExport: (response: VercelResponse, data: T) => void | Promise<void>,
): VercelApiHandler {
  return async function handler(request, response) {
    try {
      throwIfAcademicYearNotSet();
      setUpSentry();

      // Validate input before rendering
      let data = undefined;
      try {
        data = parseExportData(request);
      } catch (error) {
        throw new HttpError(422, 'Invalid timetable data', error);
      }

      await performExport(response, data);
    } catch (error) {
      const eventId = Sentry.captureException(error.original || error);

      console.error(error);

      if (error instanceof HttpError) {
        if (error.code === 422) {
          response.status(422).send(render422());
          return;
        }
      }
      response.status(500).send(render500(eventId));
    }
  };
}
