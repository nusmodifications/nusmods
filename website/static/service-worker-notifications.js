// Code taken from https://developers.google.com/web/tools/workbox/guides/advanced-recipes
self.addEventListener('message', (event) => {
  if (!event.data) {
    return;
  }

  switch (event.data) {
    // When the user clicks on the update button, we skipWaiting and refresh the
    // page
    case 'skipWaiting':
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});

self.importScripts('https://browser.sentry-cdn.com/4.5.3/bundle.min.js');
Sentry.init({ dsn: 'https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986' });

self.addEventListener('error', (error) => {
  Sentry.captureException(error);
});
