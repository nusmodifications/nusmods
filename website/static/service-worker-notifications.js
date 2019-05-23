/**
 * SW Lifecycle 1:
 * In the service worker, listen formessages from the browser.
 * If the message is 'skipWaiting',
 * the service worker's skipWaiting phase is triggered
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
 */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.importScripts('https://browser.sentry-cdn.com/4.5.3/bundle.min.js');
Sentry.init({ dsn: 'https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986' });

self.addEventListener('error', (error) => {
  Sentry.captureException(error);
});
