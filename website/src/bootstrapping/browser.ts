import Detective from 'obsolete-web/cjs/detective';
import browsersList from 'browserslist-config-nusmods';

const detective = new Detective();

export const isBrowserSupported = detective.detect(navigator.userAgent, browsersList, true, true);
export const isIOS = detective.detect(navigator.userAgent, ['ios'], false, false);
export const isAndroidChrome = detective.detect(
  navigator.userAgent,
  ['ChromeAndroid'],
  false,
  false,
);
