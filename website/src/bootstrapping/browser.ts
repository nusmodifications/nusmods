// This script checks for browser compatibility and is executed outside React's scope. If a browser
// is incompatible or not optimal for using the app, a pop-up dialog is appended into the DOM body.
// This is so that in cases where the React app completely fails to render anything at all, the
// user will at least be able to see the dialog warning them of the browser incompatibility.

import bowser from 'bowser';
import * as Sentry from '@sentry/browser';

import { parseFloat } from 'types/utils';
import { canUseBrowserLocalStorage } from 'storage/localStorage';
import { BROWSER_WARNING_KEY } from 'storage/keys';
import styles from './browser.scss';

const composeAnchorText = (innerHTML: string, href: string) =>
  `<a href=${href} target="_blank" rel="noopener noreferrer">${innerHTML}</a>`;
const linkForChrome = composeAnchorText('Google Chrome', 'https://www.google.com/chrome/');
const linkForFirefox = composeAnchorText('Mozilla Firefox', 'https://www.mozilla.org/en-US/');
const linkForChromePlayStore = composeAnchorText(
  'updating your web browser',
  'http://play.google.com/store/apps/details?id=com.android.chrome',
);

const browserCanUseLocalStorage = canUseBrowserLocalStorage();
const isBrowserSupported =
  bowser.check(
    {
      msedge: '14',
      chrome: '56',
      firefox: '52',
      safari: '10',
    },
    true,
  ) ||
  (bowser.ios && parseFloat(bowser.osversion));

// Add unsupported tag so that we can filter out reports from those users
Sentry.configureScope((scope) => {
  scope.setTag('unsupported', String(!isBrowserSupported));
});

if (!isBrowserSupported) {
  // Show unsupported browser warning
  if (
    (browserCanUseLocalStorage && !localStorage.getItem(BROWSER_WARNING_KEY)) ||
    !browserCanUseLocalStorage
  ) {
    const promptText = (() => {
      // Users can only update Safari by updating the OS in iOS
      if (bowser.ios)
        return `NUSMods may not work properly. Please consider updating your device to iOS 11 or higher.`;
      if (bowser.android && bowser.chrome)
        return `NUSMods may not work properly. Please consider ${linkForChromePlayStore}.`;
      return `NUSMods may not work properly. Please consider updating your web browser or switching to the latest version of ${linkForChrome} or ${linkForFirefox}.`;
    })();
    const template = `
      <div class="${styles.modal}">
      <h3>Your web browser is outdated or unsupported</h3>
      <p>${promptText}</p>
      <div class="form-row align-items-center">
        <div class="col-auto">
          <button class="btn btn-primary" id="browserWarning-continue" type="button">Continue to NUSMods</button>
        </div>
        ${
          // Show "don't show again" only if the browser supports localStorage
          browserCanUseLocalStorage
            ? `
              <div class="col-auto ${styles.checkboxContainer}">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" id="browserWarning-ignore" type="checkbox">
                  <label class="form-check-label" for="browserWarning-ignore">Don't show this message again</label>
                </div>
              </div>
              `
            : ''
        }
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.className = styles.browserWarning;
    container.innerHTML = template;
    const body = document.body;
    if (body) body.appendChild(container);

    const element = document.getElementById('browserWarning-continue');
    if (element) {
      element.addEventListener('click', () => {
        const checkbox = document.getElementById('browserWarning-ignore');
        if (
          browserCanUseLocalStorage &&
          checkbox &&
          checkbox instanceof HTMLInputElement &&
          checkbox.checked
        )
          localStorage.setItem(BROWSER_WARNING_KEY, navigator.userAgent);
        if (body) body.removeChild(container);
      });
    }
  }
}
