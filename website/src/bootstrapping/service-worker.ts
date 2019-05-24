import { Workbox } from 'workbox-window';
import { Store } from 'redux';
import { promptRefresh } from 'actions/app';
import { captureException } from 'utils/error';

// Code follows documentation in
// https://developers.google.com/web/tools/workbox/modules/workbox-window
const workbox = new Workbox('/service-worker.js');

export function updateServiceWorker() {
  // Set up a listener that will reload the page
  // as soon as the previously waiting service worker has taken control.
  workbox.addEventListener('controlling', () => {
    window.location.reload();
  });
  // Send a message telling the service worker to skip waiting.
  // This will trigger the `controlling` event handler above.
  // @ts-ignore messageSW should receive an argument
  workbox.messageSW({ type: 'skipWaiting' });
}

export default function initializeServiceWorker(store: Store<any, any>) {
  let updateIntervalId: number;
  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  workbox.addEventListener('waiting', () => {
    store.dispatch(promptRefresh());
    window.clearInterval(updateIntervalId);
  });

  workbox.register()
    .then((registration) => {
      // Track updates to the Service Worker.
      if (!workbox.controlling) {
        // The window client isn't currently controlled so it's a new service
        // worker that will activate immediately
        return;
      }

      // Refresh the service worker regularly so that the user gets the update
      // notice if they leave the tab open for a while
      updateIntervalId = window.setInterval(() => {
        if (navigator.onLine) {
          registration.update();
        }
      }, 60 * 60 * 1000);
    })
    .catch(captureException);
}
