// @flow

import path from 'path';
import bunyan from 'bunyan';
import { lightFormat } from 'date-fns';
import getSentryStream from './SentryStream';
import { errorSerializer } from './serializer';

const logRoot = path.join(__dirname, '../../../logs');

// In production, create a new log for each run
const logSuffix = lightFormat(new Date(), 'yyyy-MM-dd.HH-mm-ss');

const streams =
  process.env.NODE_ENV === 'production'
    ? [
        // stdout is not used in production because we're running it in a cron job
        {
          path: path.join(logRoot, `info-${logSuffix}.log`),
          level: 'info',
        },
        {
          path: path.join(logRoot, `errors-${logSuffix}.log`),
          level: 'error',
        },
        // Log errors to Sentry
        {
          type: 'raw',
          level: 'error',
          stream: getSentryStream({
            tags: ['service', 'task'],
            extra: ['moduleCode'],
          }),
        },
      ]
    : [
        {
          stream: process.stdout,
          level: 'info',
        },
        {
          path: path.join(logRoot, 'info.log'),
          level: 'debug',
        },
        {
          path: path.join(logRoot, 'errors.log'),
          level: 'error',
        },
      ];

const rootLogger = bunyan.createLogger({
  name: 'scraper',

  serializers: {
    err: errorSerializer,
  },

  streams,
});

// Reexport Logger class to allow for easier refactoring in the future
export { Logger } from 'bunyan';
export default rootLogger;
