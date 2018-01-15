// @flow

import Raven from 'raven-js';

// Configure Raven - the client for Sentry, which we use to handle errors
const loadRaven = process.env.NODE_ENV === 'production';
if (loadRaven) {
  Raven.config('https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986', {
    release: process.env.versionStr || 'UNKNOWN_RELEASE',

    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      'canvas.contentDocument',
    ],
    ignoreUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Disqus
      /embed\.js$/i,
    ],
  }).install();

  // Capture unhandled Promise rejections
  window.addEventListener('unhandledrejection', (evt) => {
    Raven.captureException(evt.reason);
  });
}
