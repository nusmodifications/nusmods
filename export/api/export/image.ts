import type { NowApiHandler } from '@vercel/node';
import fs from 'fs-extra';
import * as Sentry from '@sentry/node';

import app from '../../src/app';
import * as render from '../../src/render-serverless';
import config from '../../src/config';
import { validateExportData } from '../../src/data';
import type { Browser } from 'puppeteer';
import type { Page } from 'chrome-aws-lambda';

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

  let context: { [key: string]: unknown } = {};
  let browser: Browser;
  try {
    browser = await render.launch();

    // Attach page content or URL
    if (/^https?:\/\//.test(config.page)) {
      context.pageUrl = config.page;
    } else {
      context.pageContent = await fs.readFile(config.page, 'utf-8');
    }
    console.log('Export server started');
  } catch (e) {
    console.error('Cannot start browser:');
    console.error(e);

    if (e.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error('Check that the export page dev server has been started');
    }

    return response.status(500);
  }

  // TODO: errorHandler

  const data = JSON.parse(request.query.data as string); // TODO: Fix unsafe cast
  validateExportData(data);
  // TODO: Catch errors

  let page: Page;
  try {
    page = await browser.newPage();
  } catch (e) {
    // Try launching a new browser object
    // TODO: Don't do this since it's already a new browser, but do something else instead
    // ctx.app.context.browser = await launch();
    // page = await ctx.browser.newPage();
    return response.status(500);
  }

  if (context.pageUrl) {
    // @ts-expect-error
    await page.goto(context.pageUrl, { waitUntil: 'load' });
  } else {
    // @ts-expect-error
    await page.setContent(context.pageContent);
  }

  // TODO:
  // await setViewport(page);

  // Do the exporting
  response.status(200).send(await render.pdf(page, data));
  // ctx.body = await render.pdf(page, data);
  // ctx.attachment('My Timetable.pdf');

  // await page.close();

  const { name = 'World' } = request.query;
  response.status(200).send(`Hello ${name}!`);
};

export default handler;
