import fs from 'fs-extra';
import chromium, { Page } from 'chrome-aws-lambda';

import { getModules } from './data';
import config from './config';
import type { PageData, State } from './types';

// Arbitrarily high number - just make sure it doesn't clip the timetable
const VIEWPORT_HEIGHT = 2000;

export interface ViewportOptions {
  pixelRatio?: number;
  width?: number;
  height?: number;
}

async function setViewport(page: Page, options: ViewportOptions = {}) {
  // TODO:
  // await page.setViewport({
  //   deviceScaleFactor: options.pixelRatio || 1,
  //   width: options.width || config.pageWidth,
  //   height: options.height || VIEWPORT_HEIGHT,
  // });
}

export async function launch() {
  const executablePath = await chromium.executablePath;
  console.log('EXECUTABLE PATH', executablePath);
  const browser = await chromium.puppeteer.launch({
    // executablePath: config.chromeExecutable,
    // devtools: !!process.env.DEVTOOLS, // TODO: Query string && __DEV__?
    // args: [
    //   '--headless',
    //   '--disable-gpu',
    //   '--disable-software-rasterizer',
    //   '--disable-dev-shm-usage',
    // ],

    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // If config.page is local, use setContent. Otherwise connect to the page using goto.
  if (/^https?:\/\//.test(config.page)) {
    await page.goto(config.page);
  } else {
    const content = await fs.readFile(config.page, 'utf-8');
    await page.setContent(content);
  }

  return browser;
}

async function injectData(page: Page, data: PageData) {
  const moduleCodes = Object.keys(data.timetable);
  const modules = await getModules(moduleCodes);

  // @ts-expect-error
  await page.evaluate(`
    new Promise((resolve) =>
      window.setData(${JSON.stringify(modules)}, ${JSON.stringify(data)}, resolve)
    )
  `);

  // Calculate element height to get bounding box for screenshot
  // @ts-expect-error
  const appEle = await page.$('#timetable-only');
  if (!appEle) throw new Error('#timetable-only element not found');

  return (await appEle.boundingBox()) || undefined;
}

export async function image(page: Page, data: PageData, options: ViewportOptions = {}) {
  if (options.pixelRatio || (options.height && options.width)) {
    await setViewport(page, options);
  }

  const boundingBox = await injectData(page, data);
  // @ts-expect-error
  return await page.screenshot({
    clip: boundingBox,
  });
}

export async function pdf(page: Page, data: PageData) {
  await injectData(page, data);
  // @ts-expect-error
  await page.emulateMediaType('screen');

  // @ts-expect-error
  return await page.pdf({
    printBackground: true,
    format: 'A4',
    landscape: data.theme.timetableOrientation === 'HORIZONTAL',
  });
}
