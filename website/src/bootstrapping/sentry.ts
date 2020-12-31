import { get } from 'lodash';
import * as Sentry from '@sentry/browser';

import { isBrowserSupported } from './browser';

// Decide Sentry environment based on some basic heuristics.
function sentryEnv(): string | undefined {
  if (VERCEL_ENV === 'preview') return 'preview';
  if (VERCEL_ENV === 'production') {
    if (VERCEL_GIT_COMMIT_REF === 'production') return 'production';
    if (window.location.host === 'nusmods.com') return 'production';
    if (VERCEL_GIT_COMMIT_REF === 'master') return 'staging';
    // Don't expect Vercel production deployments to be made from other
    // branches.
  }
  return 'development';
}

// Configure Raven - the client for Sentry, which we use to handle errors
const loadRaven = !__DEV__ && !__TEST__;
if (loadRaven) {
  Sentry.init({
    dsn: 'https://4b4fe71954424fd39ac88a4f889ffe20@sentry.io/213986',

    release: VERSION_STR || 'UNKNOWN_RELEASE',

    environment: sentryEnv(),

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
