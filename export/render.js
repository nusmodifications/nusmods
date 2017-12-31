const fs = require('fs-extra');
const puppeteer = require('puppeteer');

const config = require('./config');
const { getModules } = require('./data');

// Arbitrarily high number - just make sure it doesn't clip the timetable
const VIEWPORT_HEIGHT = 2000;

async function launch() {
  const executablePath = config.chromeExecutable ?
    config.chromeExecutable : undefined;
  const browser = await puppeteer.launch({
    executablePath,
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

  await page.setViewport({
    width: config.pageWidth,
    height: VIEWPORT_HEIGHT,
  });

  return [browser, page];
}

async function injectData(page, encodedData) {
  const data = JSON.parse(encodedData);
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

async function image(page, data) {
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
    landscape: true,
  });
}

module.exports = {
  launch,
  image,
  pdf,
};
