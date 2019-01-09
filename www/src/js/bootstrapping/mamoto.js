// @flow

import type { RouterHistory } from 'react-router-dom';
import type { Tracker } from 'types/views';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';

/* eslint-disable no-underscore-dangle */

// Code mostly adopted from https://github.com/AmazingDreams/vue-matomo
export function initializeMamoto() {
  const siteId = '1';
  const host = 'https://analytics.nusmods.com';
  const scriptSrc = `${host}/piwik.js`;

  window._paq = window._paq || [];

  insertScript(scriptSrc, { defer: true, async: true })
    .then(() => {
      // Save a non-null instance of the tracker
      const mamoto: Tracker = window.Piwik.getTracker(`${host}/piwik.php`, siteId);

      // Track initial page view
      mamoto.trackPageView();
    })
    .catch(getScriptErrorHandler('Mamoto'));
}

export function withTracker(action: (Tracker) => void) {
  window._paq = window._paq || [];

  window._paq.push([
    // eslint-disable-next-line func-names
    function() {
      action(this);
    },
  ]);
}

export function trackPageView(history: RouterHistory) {
  history.listen((location, action) => {
    if (action === 'PUSH') {
      // Wait a bit for the page title to update
      setTimeout(() => {
        withTracker((tracker) => tracker.trackPageView(document.title));
      }, 100);
    }
  });
}

// Go to the Settings > Website > Custom Dimensions on https://analytics.nusmods.com
// to set up additional custom dimensions
export const DIMENSIONS = {
  theme: 1,
  beta: 2,
};
