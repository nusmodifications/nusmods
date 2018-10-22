// @flow

import type { RouterHistory } from 'react-router-dom';
import type { Tracker } from 'types/views';
import Raven from 'raven-js';
import insertScript from 'utils/insertScript';

let tracker: ?Tracker; // eslint-disable-line import/no-mutable-exports

// Code mostly adopted from https://github.com/AmazingDreams/vue-matomo
function configureMamoto(history: RouterHistory) {
  const siteId = '1';
  const host = 'https://analytics.nusmods.com';
  const scriptSrc = `${host}/piwik.js`;

  insertScript(scriptSrc, { defer: true, async: true })
    .then(() => {
      // Save a non-null instance of the tracker
      const mamoto: Tracker = window.Piwik.getTracker(`${host}/piwik.php`, siteId);
      tracker = mamoto;

      // Track initial page view
      mamoto.trackPageView();

      history.listen((location, action) => {
        if (action === 'PUSH') {
          // Wait a bit for the page title to update
          setTimeout(() => {
            mamoto.trackPageView(document.title);
          }, 100);
        }
      });
    })
    .catch((e) => Raven.captureException(e));
}

export { tracker, configureMamoto };
