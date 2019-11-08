import { Store } from 'redux';
import { promptRefresh } from 'actions/app';
import { captureException } from 'utils/error';

let currentRegistration: ServiceWorkerRegistration;

export function updateServiceWorker() {
  // Ensure new service worker is waiting before asking it to skip waiting.
  if (currentRegistration && currentRegistration.waiting) {
    currentRegistration.waiting.postMessage('skipWaiting');
  }
}

// Code adapted from https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68
function onNewServiceWorkerWaiting(registration: ServiceWorkerRegistration, callback: () => void) {
  if (registration.waiting) {
    // SW is already waiting to activate.
    // This can occur if multiple clients are open and one of the clients is refreshed.
    callback();
    return;
  }

  function awaitStateChange() {
    if (!registration.installing) return;
    registration.installing.addEventListener('statechange', (event) => {
      if (event.target && (event.target as ServiceWorker).state === 'installed') {
        // A new service worker is available, inform the user
        callback();
      }
    });
  }

  // Trigger immediately just in case it's already installing
  awaitStateChange();
  // Add a listener when a new service worker is installing
  // See: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/onupdatefound
  registration.addEventListener('updatefound', awaitStateChange);
}

export default function registerServiceWorker(store: Store<any, any>) {
  const { serviceWorker } = navigator;
  if (!serviceWorker) {
    return;
  }

  serviceWorker
    .register('/service-worker.js')
    .then((registration) => {
      if (!serviceWorker.controller) {
        // The window client isn't currently controlled so it's a
        // new service worker that will activate on next load on its own.
        return;
      }

      // When the user asks to refresh the UI, we'll need to reload the window
      // in order for the activated service worker to take over.
      let isRefreshing: boolean;
      serviceWorker.addEventListener('controllerchange', () => {
        // Ensure refresh is only called once - This works around a bug in "force update on reload".
        if (isRefreshing) return;
        isRefreshing = true;
        window.location.reload();
      });

      // Browsers' default checking interval is 24 hours, which is too long.
      // Instead, we check for the new service worker hourly so that the user gets
      // the update notice if they leave the tab open for a while.
      const updateIntervalId = window.setInterval(() => {
        if (navigator.onLine) {
          registration.update();
        }
      }, 60 * 60 * 1000);

      onNewServiceWorkerWaiting(registration, () => {
        currentRegistration = registration;
        store.dispatch(promptRefresh());
        window.clearInterval(updateIntervalId);
      });
    })
    .catch(captureException);
}
