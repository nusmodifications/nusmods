import chromium from '@sparticuz/chromium';
import puppeteer, { Page } from 'puppeteer-core';

import { resolveChromeExecutable } from './chrome-executable';
import { getModules } from './data';
import config from './config';
import type { ExportData } from './types';

// Arbitrarily high number - just make sure it doesn't clip the timetable
const VIEWPORT_HEIGHT = 2000;

export interface ViewportOptions {
  height?: number;
  pixelRatio?: number;
  width?: number;
}

async function setViewport(page: Page, options: ViewportOptions = {}) {
  await page.setViewport({
    deviceScaleFactor: options.pixelRatio || 1,
    height: options.height || VIEWPORT_HEIGHT,
    width: options.width || config.pageWidth,
  });
}

export async function open(url: string) {
  const executablePath = await resolveChromeExecutable(() => chromium.executablePath());

  chromium.setGraphicsMode = false;

  const browser = await puppeteer.launch({
    // devtools: !!process.env.DEVTOOLS, // TODO: Query string && NODE_ENV === 'development'?
    args: chromium.args,
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await setViewport(page);

  return page;
}

async function injectData(page: Page, data: ExportData) {
  const moduleCodes = Object.keys(data.timetable);
  const modules = await getModules(moduleCodes);

  await page.evaluate(`
    new Promise((resolve) =>
      window.setData(${JSON.stringify(modules)}, ${JSON.stringify(data)}, resolve)
    )
  `);

  // Calculate element height to get bounding box for screenshot
  const appEle = await page.$('#timetable-only');
  if (!appEle) {
    throw new Error('#timetable-only element not found');
  }

  return (await appEle.boundingBox()) || undefined;
}

export async function image(page: Page, data: ExportData, options: ViewportOptions = {}) {
  if (options.pixelRatio || (options.height && options.width)) {
    await setViewport(page, options);
  }

  const boundingBox = await injectData(page, data);
  return await page.screenshot({
    clip: boundingBox,
  });
}

export async function pdf(page: Page, data: ExportData) {
  await injectData(page, data);
  await page.emulateMediaType('screen');

  return await page.pdf({
    format: 'a4',
    landscape: data.theme.timetableOrientation === 'HORIZONTAL',
    printBackground: true,
  });
}
