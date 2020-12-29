import * as Sentry from '@sentry/node';
import type { NowApiHandler, NowRequest, NowResponse } from '@vercel/node';
import type { Page } from 'puppeteer';

import * as render from '../../src/render-serverless';
import config from '../../src/config';
import { validateExportData } from '../../src/data';
import { render422, render500 } from '../../src/views';
import { HttpError } from '../../src/HttpError';
import { setUpSentry, throwIfAcademicYearNotSet } from '../../src/serverless-helpers';

const handler: NowApiHandler = async (request, response) => {
  try {
    await main(request, response);
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

async function main(request: NowRequest, response: NowResponse) {
  throwIfAcademicYearNotSet();
  setUpSentry();

  // Validate input before starting the browser (which is expensive)
  let data = undefined;
  try {
    const dataCandidate = JSON.parse(request.query.data as never);
    validateExportData(dataCandidate);
    data = dataCandidate;
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
    throw new HttpError(500, 'Cannot start browser', e);
  }

  // Export
  const body = await render.pdf(page, data);
  response.setHeader('Content-Disposition', 'attachment; filename="My Timetable.pdf"');
  response.setHeader('Content-Type', 'application/pdf');
  response.status(200).send(body);

  // Cleanup
  await page.close();
}

export default handler;
