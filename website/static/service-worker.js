/**
 * This is the entrypoint of the service worker.
 *
 * ---   IMPORTANT   ---
 * 1. This file must be called "service-worker.js".
 * 2. This file must be at the root of /dist.
 * --- END IMPORTANT ---
 */

/**
 * A service worker has 3 lifecycle events you can listen to.
 * 1. `install`:  Service worker is downloaded.
 *                This is when you should prepare the cache.
 * 2. `activate`: Service worker is ready to take over and waiting.
 *                This is when you should clean up the previous service worker's cache.
 *                Note: The previous service worker will be running until all clients are stopped,
 *                which means that all tabs must be closed. Refreshing will not work.
 *                However, one may call `skipWaiting` to force the previous service worker to stop.
 * 3. `fetch`:    Service worker is running and client is fetching for a resource.
 *                This is when you handle runtime caching and/or offline fallbacks.
 *
 * For other events: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope#Events
 */

self.addEventListener('install', () => {
  /**
   * Force the waiting service worker to become the active service worker.
   * Note: If we're adding functionalities here, do not run `skipWaiting` on install
   * but instead wait for user to give approval and send the `skipWaiting` message.
   * By force-stopping the previous worker, we may break things.
   * E.g. New service worker may fetch and return a newer code-split code which does not
   *      work with the existing script.
   */
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove all the cache
  event.waitUntil(
    caches.keys().then((keyList) => Promise.all(keyList.map((key) => caches.delete(key)))),
  );
});

/**
 * A service worker is a type of worker, which means it has no access to the DOM,
 * and must communicate with the main JavaScript file via messages.
 *
 * Since messages are passed from the main JavaScript file,
 * a newly installed service worker will receive old messages
 * from the previous service worker's cached JavaScript file.
 *
 * As such, you must not immediately rename a key but instead deprecate the old key
 * and introduce a new one. The service worker will need to handle both keys for while,
 * before the old key can be safely removed. If possible, avoid renaming keys at all.
 */
self.addEventListener('message', (event) => {
  if (!event.data) {
    return;
  }

  switch (event.data) {
    case 'skipWaiting':
      // Forces the waiting service worker to become the active service worker.
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});

/**
 * Some adblockers will block access to Sentry's domains
 * which will result in `importScripts` failing and crashing the new service worker.
 * As this prevents the new service worker from taking over,
 * we have to wrap everything below in a try/catch block.
 */
try {
  self.importScripts('https://browser.sentry-cdn.com/5.5.0/bundle.min.js');
  Sentry.init({ dsn: 'https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986' });

  self.addEventListener('error', (error) => {
    Sentry.captureException(error);
  });
} catch (error) {
  // Ignore all errors produced here as they are uncapturable.
  console.warn(error);
}
