const puppeteer = require('puppeteer');

async function launch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto();
}

async function render(page, data) {

}
