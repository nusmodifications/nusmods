// @flow
import type { RouterHistory } from 'react-router-dom';
import type { Tracker } from 'types/views';
import { each } from 'lodash';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';

// Custom dimension keys mapped to their human readable names
// Go to the Settings > Website > Custom Dimensions on https://analytics.nusmods.com
// to set up additional custom dimensions
export const DIMENSIONS = {
  theme: 1,
  beta: 2,
};

const queuedTasks = [];
let mamoto: ?Tracker;
let initialDimensions = false;
let initialViewTracked = false;

// This function is called by both initializeMamoto and setCustomDimensions
// so that the initial page view is only tracked if both the tracker and the
// store is ready
function trackInitialPageView() {
  const tracker = mamoto;
  if (initialViewTracked || !initialDimensions || !tracker) return;

  // Run all queued tasks then track initial page view
  queuedTasks.forEach((action) => action(tracker));
  tracker.trackPageView();

  initialViewTracked = true;
}

// Code mostly adopted from https://github.com/AmazingDreams/vue-matomo
export function initializeMamoto() {
  const siteId = '1';
  const host = 'https://analytics.nusmods.com';
  const scriptSrc = `${host}/piwik.js`;

  insertScript(scriptSrc, { defer: true, async: true })
    .then(() => {
      mamoto = window.Piwik.getTracker(`${host}/piwik.php`, siteId);
      trackInitialPageView();
    })
    .catch(getScriptErrorHandler('Mamoto'));
}

export function withTracker(action: (Tracker) => void) {
  if (mamoto) {
    action(mamoto);
  } else {
    queuedTasks.push(action);
  }
}

export function setCustomDimensions(dimensions: { [number]: string }) {
  // Set custom dimensions
  each(dimensions, (value, id) => {
    withTracker((tracker) => tracker.setCustomDimension(+id, value));
  });

  initialDimensions = true;
  trackInitialPageView();
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
