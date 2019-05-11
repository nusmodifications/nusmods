const fs = require('fs-extra');
const puppeteer = require('puppeteer');

const config = require('./config');
const { getModules } = require('./data');

// Arbitrarily high number - just make sure it doesn't clip the timetable
const VIEWPORT_HEIGHT = 2000;

async function setViewport(page, options = {}) {
  await page.setViewport({
    deviceScaleFactor: options.deviceScaleFactor || 1,
    width: options.width || config.pageWidth,
    height: options.height || VIEWPORT_HEIGHT,
  });
}

async function launch() {
  const executablePath = config.chromeExecutable ? config.chromeExecutable : undefined;
  const browser = await puppeteer.launch({
    executablePath,
    devtools: !!process.env.DEVTOOLS,
    args: [
      '--headless',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-dev-shm-usage',
    ],
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

async function openPage(ctx, next) {
  let page;
  try {
    page = await ctx.browser.newPage();
  } catch (e) {
    // Try launching a new browser object
    ctx.app.context.browser = await launch();
    page = await ctx.browser.newPage();
  }

  if (ctx.pageUrl) {
    await page.goto(ctx.pageUrl, { waitFor: 'load' });
  } else {
    await page.setContent(ctx.pageContent);
  }

  await setViewport(page);
  ctx.state.page = page;

  await next();

  ctx.state.page.close();
}

async function injectData(page, data) {
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

  return appEle.boundingBox();
}

async function image(page, data, options = {}) {
  if (options.pixelRatio || (options.height && options.width)) {
    await setViewport(page, options);
  }

  const boundingBox = await injectData(page, data);
  return await page.screenshot({
    clip: boundingBox,
  });
}

async function pdf(page, data) {
  await injectData(page, data);
  await page.emulateMedia('screen');

  return await page.pdf({
    printBackground: true,
    format: 'A4',
    landscape: data.theme.timetableOrientation === 'HORIZONTAL',
  });
}

module.exports = {
  launch,
  openPage,
  image,
  pdf,
};
