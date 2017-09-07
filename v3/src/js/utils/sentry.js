// @flow

import Raven from 'raven-js';

// Configure Raven - the client for Sentry, which we use to handle errors
if (process.env.NODE_ENV === 'production') {
  Raven
    .config('https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986', {
      ignoreErrors: [
        // Random plugins/extensions
        'top.GLOBALS',
        'canvas.contentDocument',
      ],
      ignoreUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
      ],
    })
    .install();

  // Capture unhandled Promise rejections
  window.addEventListener('unhandledrejection', (evt) => {
    Raven.captureException(evt.reason);
  });
}
