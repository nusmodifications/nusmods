import * as Sentry from '@sentry/node';
import type { NowApiHandler, NowRequest, NowResponse } from '@vercel/node';
import type { Page } from 'puppeteer-core';

import * as render from './render-serverless';
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
  parseExportData: (request: NowRequest) => T,
  performExport: (response: NowResponse, page: Page, data: T) => void | Promise<void>,
): NowApiHandler {
  return async function handler(request, response) {
    try {
      throwIfAcademicYearNotSet();
      setUpSentry();

      // Validate input before starting the browser (which is expensive)
      let data = undefined;
      try {
        data = parseExportData(request);
      } catch (e) {
        throw new HttpError(422, 'Invalid timetable data', e);
      }

      // Prepare browser for export
      const url = config.page;
      let page: Page;
      try {
        page = await render.open(url);
      } catch (e) {
        if (e.message.includes('ERR_CONNECTION_REFUSED')) {
          throw new HttpError(
            500,
            `Could not open the page located at process.env.PAGE (${url}). Try opening it in your browser?`,
            e,
          );
        }
        throw new HttpError(500, 'Cannot start browseraa', e);
      }

      // Export
      await performExport(response, page, data);

      // Cleanup
      await page.close();
    } catch (e) {
      const eventId = Sentry.captureException(e.original || e);

      console.error(e);

      if (e instanceof HttpError) {
        if (e.code === 422) {
          response.status(422).send(render422());
          return;
        }
      }
      response.status(500).send(render500(eventId));
    }
  };
}
