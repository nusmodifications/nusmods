import * as Sentry from '@sentry/node';
import type { NowApiHandler } from '@vercel/node';
import type { Page } from 'puppeteer';

import * as render from '../../src/render-serverless';
import config from '../../src/config';
import { validateExportData } from '../../src/data';

const handler: NowApiHandler = async (request, response) => {
  // Config check
  if (!config.academicYear || !/\d{4}-\d{4}/.test(config.academicYear)) {
    throw new Error(
      'academicYear is not set - check config.ts. ' +
        'This should be in the form of <year>-<year> (e.g. 2019-2020).',
    );
  }

  if (process.env.NODE_ENV === 'production') {
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

  // Check input before starting the browser (which is expensive)
  const data = JSON.parse(request.query.data as string); // TODO: Fix unsafe cast
  validateExportData(data);
  // TODO: Catch errors

  const url = config.page;
  let page: Page;
  try {
    page = await render.open(url);
  } catch (e) {
    console.error('Cannot start browser:');
    console.error(e);

    if (e.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error(
        `Could not open the page located at process.env.PAGE (${url}). Try opening it in your browser?`,
      );
    }

    return response.status(500);
  }

  // TODO: errorHandler

  // TODO:
  // await setViewport(page);

  // Do the exporting
  const body = await render.pdf(page, data);
  response.setHeader('Content-Disposition', 'attachment; filename="My Timetable.pdf"');
  response.setHeader('Content-Type', 'application/pdf');
  response.status(200).send(body);

  await page.close();
};

export default handler;
