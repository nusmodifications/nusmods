const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const config = require('./config');

async function launch() {
  const browser = await puppeteer.launch({
    headless: !process.env.DISABLE_HEADLESS,
  });

  const [page, content] = await Promise.all([
    browser.newPage(),
    fs.readFile(config.page, 'utf-8'),
  ]);

  await page.setContent(content);

  return [browser, page];
}

async function injectData(page, data) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      // TODO: Inject data into page here
      resolve();
    });
  });
}

async function image(page, data) {
  await injectData(page, data);
  return page.screenshot();
}

async function pdf(page, data) {
  await injectData(page, data);
  return page.pdf();
}

module.exports = {
  launch,
  image,
  pdf,
};
