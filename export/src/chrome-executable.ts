import fs from 'fs-extra';

const CHROME_EXECUTABLE_CANDIDATES: Partial<Record<NodeJS.Platform, Array<string>>> = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ],
  win32: [
    String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`,
    String.raw`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`,
  ],
};

export async function resolveChromeExecutable(fallback?: () => Promise<string | undefined>) {
  const fallbackExecutablePath = await fallback?.();
  if (fallbackExecutablePath) {
    return fallbackExecutablePath;
  }

  for (const candidate of CHROME_EXECUTABLE_CANDIDATES[process.platform] || []) {
    if (await fs.pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error('Could not find a Chrome/Chromium executable for puppeteer-core.');
}
