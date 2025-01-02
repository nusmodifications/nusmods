import fs from 'fs-extra';
import puppeteer, { Page } from 'puppeteer-core';
import type { Middleware } from 'koa';

import { getModules } from './data';
import config from './config';
import type { ExportData, State } from './types';

// Arbitrarily high number - just make sure it doesn't clip the timetable
const VIEWPORT_HEIGHT = 2000;

export interface ViewportOptions {
  pixelRatio?: number;
  width?: number;
  height?: number;
}

async function setViewport(page: Page, options: ViewportOptions = {}) {
  await page.setViewport({
    deviceScaleFactor: options.pixelRatio || 1,
    width: options.width || config.pageWidth,
    height: options.height || VIEWPORT_HEIGHT,
  });
}

export async function launch() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: config.chromeExecutable,
    devtools: !!process.env.DEVTOOLS,
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

export const openPage: Middleware<State> = async (ctx, next) => {
  let page: Page;
  try {
    page = await ctx.browser.newPage();
  } catch (e) {
    // Try launching a new browser object
    ctx.app.context.browser = await launch();
    page = await ctx.browser.newPage();
  }

  if (ctx.pageUrl) {
    await page.goto(ctx.pageUrl, { waitUntil: 'load' });
  } else {
    await page.setContent(ctx.pageContent);
  }

  await setViewport(page);
  ctx.state.page = page;

  await next();

  await ctx.state.page.close();
};

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
  if (!appEle) throw new Error('#timetable-only element not found');

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
    printBackground: true,
    format: 'a4',
    landscape: data.theme.timetableOrientation === 'HORIZONTAL',
  });
}
