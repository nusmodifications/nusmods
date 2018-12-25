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
      // Local file system
      /^file:\/\//i,
      // Chrome and Firefox extensions
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      // UC Browser injected script
      /u\.c\.b\.r\.o\.w\.s\.e\.r/i,
      // Disqus
      /embed\.js$/i,
      /alfalfa\.[0-9a-f]+\.js$/i,
    ],
  }).install();
}
