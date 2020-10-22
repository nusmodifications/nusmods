import { get } from 'lodash';
import * as Sentry from '@sentry/browser';

import { isBrowserSupported } from './browser';

// Configure Raven - the client for Sentry, which we use to handle errors
// const loadRaven = process.env.NODE_ENV === 'production';
const loadRaven = false; // TODO: Reenable before merging
if (loadRaven) {
  Sentry.init({
    dsn: 'https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986',

    release: process.env.VERSION_STR || 'UNKNOWN_RELEASE',

    beforeSend(event, hint) {
      const message = get(hint, ['originalException', 'message']);
      if (message && message.match(/top\.globals|canvas\.contentDocument/i)) {
        return null;
      }
      return event;
    },

    blacklistUrls: [
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
  });

  // Add unsupported tag so that we can filter out reports from those users
  Sentry.configureScope((scope) => {
    scope.setTag('unsupported', String(!isBrowserSupported()));
  });
}
