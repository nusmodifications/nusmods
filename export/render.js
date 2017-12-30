const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const config = require('./config');

const { getModules } = require('./data');

async function launch() {
  const browser = await puppeteer.launch({
    devtools: !!process.env.DEVTOOLS,
  });
  const page = await browser.newPage();

  // If config.page is local, use setContent
  // Otherwise connect to the page using goto
  if (/^https?:\/\//.test(config.page)) {
    await page.goto(config.page);
  } else {
    const content = fs.readFile(config.page, 'utf-8');
    await page.setContent(content);
  }

  await page.setViewport({
    width: 1024,
    height: 900,
  });

  return [browser, page];
}

async function injectData(page, encodedData) {
  const data = JSON.parse(encodedData);
  const moduleCodes = Object.keys(data.timetable);
  const modules = await getModules(moduleCodes);

  await page.evaluate(`window.setData(${JSON.stringify(modules)}, ${encodedData})`);
}

async function image(page, data) {
  await injectData(page, data);
  return page.screenshot();
}

async function pdf(page, data) {
  await injectData(page, data);
  await page.emulateMedia('screen');
  return page.pdf();
}

module.exports = {
  launch,
  image,
  pdf,
};
