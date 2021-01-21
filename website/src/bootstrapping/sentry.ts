import { get } from 'lodash';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

import { isBrowserSupported } from './browser';

function sentryEnv() {
  if (NUSMODS_ENV === 'test') {
    throw new Error('Do not load Sentry in tests');
  }
  return NUSMODS_ENV;
}

// Configure Sentry client, which we use to handle errors
if (NUSMODS_ENV === 'production') {
  Sentry.init({
    dsn: 'https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986',

    release: VERSION_STR || 'UNKNOWN_RELEASE',

    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: NUSMODS_ENV === 'production' ? 0.2 : 1.0,

    environment: sentryEnv(),

    beforeSend(event, hint) {
      const message = get(hint, ['originalException', 'message']);
      if (message && message.match(/top\.globals|canvas\.contentDocument/i)) {
        return null;
      }
      return event;
    },

    denyUrls: [
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
