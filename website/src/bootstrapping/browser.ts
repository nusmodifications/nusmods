import Bowser from 'bowser';
import browsersList from 'browserslist-config-nusmods';

export type Platform = 'mobile' | 'desktop';
export type VersionMap = Record<string, any>; // Too fiddly to type properly

function parseBrowser(browser: string): { platform?: Platform; browser: string } {
  // Split desktop and mobile Safari because we support different versions of each
  if (browser === 'ios_safari') return { platform: 'mobile', browser: 'safari' };
  if (browser === 'safari') return { platform: 'desktop', browser: 'safari' };

  // Samsung internet browser has a different name under bowser
  if (browser === 'samsung') return { platform: 'mobile', browser: 'samsung_internet' };

  return { browser };
}

function parseVersion(version: string): number {
  const versions = version.split(/-/g).map((versionStr) => parseFloat(versionStr));
  return Math.min(...versions);
}

function convertToCheckTree(versionMap: VersionMap): Bowser.Parser.checkTree {
  const checkTree: Bowser.Parser.checkTree = {};

  Object.keys(versionMap).forEach((key) => {
    if (typeof versionMap[key] === 'number') {
      checkTree[key] = `>=${versionMap[key]}`;
    } else {
      checkTree[key] = convertToCheckTree(versionMap[key]);
    }
  });

  return checkTree;
}

export function browserlistToBowser(browserlist: string[]): Bowser.Parser.checkTree {
  const minVersions: VersionMap = {
    desktop: {},
    mobile: {},
  };

  browserlist.forEach((browser) => {
    const [browserName, versions] = browser.split(/\s+/g);

    const parsedBrowser = parseBrowser(browserName);
    const minVersion = parseVersion(versions);

    if (parsedBrowser.platform != null) {
      minVersions[parsedBrowser.platform][parsedBrowser.browser] = Math.min(
        minVersion,
        minVersions[parsedBrowser.platform][parsedBrowser.browser] || Number.MAX_VALUE,
      );
    } else {
      minVersions[parsedBrowser.browser] = Math.min(
        minVersion,
        minVersions[parsedBrowser.browser] || Number.MAX_VALUE,
      );
    }
  });

  return convertToCheckTree(minVersions);
}

const parser = Bowser.getParser(window.navigator.userAgent);
export const isBrowserSupported = parser.satisfies(browserlistToBowser(browsersList));
export const isIOS = parser.is('ios');
export const isAndroidChrome = parser.satisfies({ mobile: { chrome: '>1' } });
