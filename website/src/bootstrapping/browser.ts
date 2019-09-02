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

function setMinVersion(versionMap: VersionMap, key: string, version: number) {
  const currentVersion = versionMap[key];
  if (currentVersion == null || version < currentVersion) {
    // eslint-disable-next-line no-param-reassign
    versionMap[key] = version;
  }
}

export function browserlistToBowser(browserlist: string[]): Bowser.Parser.checkTree {
  const minVersions: VersionMap = {
    desktop: {},
    mobile: {},
    tablet: {},
  };

  browserlist.forEach((browser) => {
    const [browserName, versions] = browser.split(/\s+/g);

    const parsedBrowser = parseBrowser(browserName);
    const minVersion = parseVersion(versions);

    if (parsedBrowser.platform != null) {
      setMinVersion(minVersions[parsedBrowser.platform], parsedBrowser.browser, minVersion);

      // Bowser treats tablet and phones OS separate, but we don't want that distinction
      if (parsedBrowser.platform === 'mobile') {
        setMinVersion(minVersions.tablet, parsedBrowser.browser, minVersion);
      }
    } else {
      setMinVersion(minVersions, parsedBrowser.browser, minVersion);
    }
  });

  return convertToCheckTree(minVersions);
}

const checkTree = browserlistToBowser(browsersList);
const parser = Bowser.getParser(window.navigator.userAgent);
export const isBrowserSupported =
  parser.satisfies(checkTree) ||
  // Alias Mobile Safari version to iOS version so that all browsers on iOS are supported
  parser.satisfies({ ios: checkTree.mobile.safari });
export const isIOS = parser.is('ios');
export const isAndroidChrome = parser.satisfies({ mobile: { chrome: '>1' } });
