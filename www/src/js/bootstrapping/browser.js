// @flow
import bowser from 'bowser';
import { checkBrowserSupportsLocalStorage } from '../storage/localStorage';
import styles from './browser.scss';

const LOCAL_STORAGE_KEY = 'dismissedBrowserWarning';
const LINK_FOR_CHROME = 'https://www.google.com/chrome/';
const LINK_FOR_FIREFOX = 'https://www.mozilla.org/en-US/';

const browserSupportsLocalStorage = checkBrowserSupportsLocalStorage();

if (
  !bowser.check(
    {
      edge: '14',
      chrome: '56',
      firefox: '52',
      safari: '9',
    },
    true,
  )
) {
  if (
    (browserSupportsLocalStorage && !localStorage.getItem(LOCAL_STORAGE_KEY)) ||
    !browserSupportsLocalStorage
  ) {
    const promptText = (() => {
      if (bowser.ios && bowser.safari)
        return `NUSMods may not work properly. Please consider updating your OS or switching to the latest version of <a href="${LINK_FOR_CHROME}">Google Chrome</a></a>.`;
      if (bowser.android && bowser.chrome)
        return `NUSMods may not work properly. Please consider updating your web browser.`;
      return `NUSMods may not work properly. Please consider updating your web browser or switching to the latest version of <a href="${LINK_FOR_CHROME}">Google Chrome</a> or <a href=${LINK_FOR_FIREFOX}>Mozilla Firefox</a>.`;
    })();
    const template = `
    <div class="${styles.overlay}">
      <div class="${styles.modal}">
      <h3>Your web browser is outdated or unsupported</h3>
      <p>${promptText}</p>
      <div class="form-row align-items-center">
        <div class="col-auto">
          <button class="btn btn-primary" id="browserWarning-continue" type="button">Continue to NUSMods</button>
        </div>
        ${
          // Show "don't show again" only if the browser supports localStorage
          browserSupportsLocalStorage
            ? `
              <div class="col-auto ${styles.checkboxContainer}">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" id="browserWarning-ignore" type="checkbox">
                  <label class="form-check-label" for="browserWarning-ignore">Don't show this dialog again</label>
                </div>
              </div>
              `
            : ''
        }
        </div>
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
        if (browserSupportsLocalStorage && checkbox && checkbox.checked)
          localStorage.setItem(LOCAL_STORAGE_KEY, navigator.userAgent);
        if (body) body.removeChild(container);
      });
    }
  }
}
