import { History } from 'history';
import { each } from 'lodash';

import { Tracker } from 'types/vendor/piwik';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';

// Custom dimension keys mapped to their human readable names
// Go to the Settings > Website > Custom Dimensions on https://analytics.nusmods.com
// to set up additional custom dimensions
export const DIMENSIONS = {
  theme: 1,
  beta: 2,
};

type TrackerAction = (tracker: Tracker) => void;

const queuedTasks: TrackerAction[] = [];
let matomo: Tracker | undefined;
let initialDimensions = false;
let initialViewTracked = false;

// This function is called by both initializeMamoto and setCustomDimensions
// so that the initial page view is only tracked if both the tracker and the
// store is ready
function trackInitialPageView() {
  const tracker = matomo;
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
      matomo = window.Piwik.getTracker(`${host}/piwik.php`, siteId);
      trackInitialPageView();
    })
    .catch(getScriptErrorHandler('Mamoto'));
}

export function withTracker(action: TrackerAction) {
  if (matomo) {
    action(matomo);
  } else {
    queuedTasks.push(action);
  }
}

export function setCustomDimensions(dimensions: { [id: number]: string }) {
  // Set custom dimensions
  each(dimensions, (value, id) => {
    withTracker((tracker) => tracker.setCustomDimension(+id, value));
  });

  initialDimensions = true;
  trackInitialPageView();
}

export function trackPageView(history: History) {
  return history.listen(({ action }) => {
    if (action === 'PUSH') {
      // Wait a bit for the page title to update
      setTimeout(() => {
        withTracker((tracker) => tracker.trackPageView(document.title));
      }, 100);
    }
  });
}
