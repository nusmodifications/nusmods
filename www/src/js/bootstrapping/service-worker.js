// @flow
import type { Store } from 'redux';
import Raven from 'raven-js';
import { promptRefresh } from 'actions/app';

let currentRegistration: ServiceWorkerRegistration;

export function getRegistration() {
  return currentRegistration;
}

// Code taken from https://developers.google.com/web/tools/workbox/guides/advanced-recipes
function onNewServiceWorker(registration: ServiceWorkerRegistration, callback: () => void) {
  if (registration.waiting) {
    // SW is waiting to activate. Can occur if multiple clients open and
    // one of the clients is refreshed.
    callback();
    return;
  }

  const listenInstalledStateChange = () => {
    if (!registration.installing) {
      return;
    }

    registration.installing.addEventListener('statechange', (event) => {
      // $FlowFixMe - Flow doesn't recognize the event's target as being a ServiceWorker object
      if (event.target.state === 'installed') {
        // A new service worker is available, inform the user
        callback();
      }
    });
  };

  if (registration.installing) {
    listenInstalledStateChange();
  } else {
    // We are currently controlled so a new SW may be found...
    // Add a listener in case a new SW is found,
    registration.addEventListener('updatefound', listenInstalledStateChange);
  }
}

export default function initializeServiceWorker(store: Store<*, *, *>) {
  const { serviceWorker } = navigator;
  if (!serviceWorker) {
    return;
  }

  serviceWorker
    .register('/service-worker.js')
    .then((registration) => {
      // Track updates to the Service Worker.
      if (!serviceWorker.controller) {
        // The window client isn't currently controlled so it's a new service
        // worker that will activate immediately
        return;
      }

      // Refresh the service worker regularly so that the user gets the update
      // notice if they leave the tab open for a while
      const updateIntervalId = window.setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // When the user asks to refresh the UI, we'll need to reload the window
      let preventDevToolsReloadLoop;
      serviceWorker.addEventListener('controllerchange', () => {
        // Ensure refresh is only called once - This works around a bug in "force update on reload".
        if (preventDevToolsReloadLoop) return;
        preventDevToolsReloadLoop = true;
        window.location.reload();
      });

      onNewServiceWorker(registration, () => {
        currentRegistration = registration;
        store.dispatch(promptRefresh());
        window.clearInterval(updateIntervalId);
      });
    })
    .catch((e) => {
      Raven.captureException(e);
    });
}
