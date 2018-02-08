// @flow
import bowser from 'bowser';
import { checkBrowserSupportsLocalStorage } from '../storage/localStorage';

const LOCAL_STORAGE_KEY = 'dismissedBrowserWarning';
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
    const template = `
      <div class="browser-warning__overlay">
      <div class="browser-warning__modal">
      <h1>Your web browser is outdated or unsupported</h1>
      <p>NUSMods may not work or may work poorly. Please consider upgrading your web browser.</p>
      <button class="btn btn-primary" id="browser-warning-continue">Continue to NUSMods</button>
      ${
        // Show "don't show again" only if the browser supports localStorage
        browserSupportsLocalStorage
          ? '<button class="btn" id="browser-warning-ignore">Don\'t show again</button>'
          : ''
      }
      </div>
      </div>
      `;
    const container = document.createElement('div');
    container.className = 'browser-warning';
    container.innerHTML = template;
    const body = document.body;
    if (body) body.appendChild(container);

    const addDismissListener = (elementId, composedFunction) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('click', (event) => {
          event.preventDefault();
          if (body) body.removeChild(container);
          if (composedFunction && typeof composedFunction === 'function') composedFunction();
        });
      }
    };

    addDismissListener('browser-warning-continue');
    addDismissListener('browser-warning-ignore', () => {
      if (browserSupportsLocalStorage) localStorage.setItem(LOCAL_STORAGE_KEY, navigator.userAgent);
    });
  }
}
