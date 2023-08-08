// This script checks for browser compatibility and is executed outside React's scope. If a browser
// is incompatible or not optimal for using the app, a banner is appended into the DOM body.
// This is so that in cases where the React app completely fails to render anything at all, the
// user will at least be able to see the dialog warning them of the browser incompatibility.
import 'core-js/stable';

import { BROWSER_WARNING_KEY } from '../../storage/keys';
import { isBrowserSupported, isIOS, isAndroidChrome } from '../../bootstrapping/browser';
import { canUseBrowserLocalStorage } from '../../storage/localStorage';

import styles from './browser-warning.scss';

const composeAnchorText = (innerHTML: string, href: string) =>
  `<a href=${href} target="_blank" rel="noopener noreferrer">${innerHTML}</a>`;
const linkForChrome = composeAnchorText('Google Chrome', 'https://www.google.com/chrome/');
const linkForFirefox = composeAnchorText('Mozilla Firefox', 'https://www.mozilla.org/en-US/');
const linkForChromePlayStore = composeAnchorText(
  'updating your web browser',
  'http://play.google.com/store/apps/details?id=com.android.chrome',
);

const browserCanUseLocalStorage = canUseBrowserLocalStorage();
if (
  !isBrowserSupported() &&
  ((browserCanUseLocalStorage && !localStorage.getItem(BROWSER_WARNING_KEY)) ||
    !browserCanUseLocalStorage)
) {
  let promptText = `NUSMods may not work properly. Please consider updating your web browser or switching to the latest version of ${linkForChrome} or ${linkForFirefox}.`;
  if (isIOS) {
    promptText = `NUSMods may not work properly. Please consider updating your device to iOS 11 or higher.`;
  }
  if (isAndroidChrome) {
    promptText = `NUSMods may not work properly. Please consider ${linkForChromePlayStore}.`;
  }

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
  document.body.appendChild(container);

  const element = document.getElementById('browserWarning-continue');
  if (element) {
    element.addEventListener('click', () => {
      const checkbox = document.getElementById('browserWarning-ignore');
      if (browserCanUseLocalStorage && checkbox && (checkbox as HTMLInputElement).checked) {
        localStorage.setItem(BROWSER_WARNING_KEY, navigator.userAgent);
      }
      document.body.removeChild(container);
    });
  }
}
