// @flow

import type { RouterHistory } from 'react-router-dom';
import insertScript from 'utils/insertScript';
import type { Tracker } from 'types/views';

let tracker: ?Tracker; // eslint-disable-line import/no-mutable-exports

// Code mostly adopted from https://github.com/AmazingDreams/vue-matomo
function configureMamoto(history: RouterHistory) {
  const siteId = '1';
  const host = 'https://analytics.nusmods.com';
  const scriptSrc = `${host}/piwik.js`;

  insertScript(scriptSrc, { defer: true, async: true }).then(() => {
    // Save a non-null instance of the tracker
    const mamoto: Tracker = window.Piwik.getTracker(`${host}/piwik.php`, siteId);
    tracker = mamoto;

    // Track initial page view
    mamoto.trackPageView();

    history.listen((location, action) => {
      if (action === 'PUSH') {
        // Wait a bit for the page title to update
        setTimeout(() => {
          mamoto.trackPageView();
        }, 100);
      }
    });
  });
}

export { tracker, configureMamoto };
