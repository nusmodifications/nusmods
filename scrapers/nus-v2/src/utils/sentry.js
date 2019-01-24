// @flow

import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://4d9f8987a48c4752afec87164318da5c@sentry.io/1378632' });
}
