import path from 'node:path';
import bunyan, { Stream } from 'bunyan';
import { lightFormat } from 'date-fns';
import getSentryStream from './SentryStream';
import { errorSerializer } from './serializer';

type LoggingFunction = {
  (error: Error, message?: string, ...params: Array<any>): void;
  (message: string, ...params: Array<any>): void;
  (data: Record<string, any>, message: string, ...params: Array<any>): void;
};

export interface Logger {
  child(options: Record<string, any>): Logger;
  debug: LoggingFunction;
  error: LoggingFunction;
  fatal: LoggingFunction;
  info: LoggingFunction;
  trace: LoggingFunction;

  warn: LoggingFunction;
}

const logRoot = path.join(__dirname, '../../../logs');

// In production, create a new log for each run
const logSuffix = lightFormat(new Date(), 'yyyy-MM-dd.HH-mm-ss');

const streams: Array<Stream> =
  process.env.NODE_ENV === 'production'
    ? [
        // stdout is not used in production because we're running it in a cron job
        {
          level: 'info',
          path: path.join(logRoot, `info-${logSuffix}.log`),
        },
        {
          level: 'error',
          path: path.join(logRoot, `errors-${logSuffix}.log`),
        },
        // Log errors to Sentry
        {
          level: 'error',
          stream: getSentryStream({
            extra: ['moduleCode'],
            tags: ['service', 'task'],
          }),
          type: 'raw',
        },
      ]
    : [
        {
          level: 'info',
          stream: process.stdout,
        },
        {
          level: 'debug',
          path: path.join(logRoot, 'info.log'),
        },
        {
          level: 'error',
          path: path.join(logRoot, 'errors.log'),
        },
      ];

const rootLogger = bunyan.createLogger({
  name: 'scraper',

  serializers: {
    err: errorSerializer,
  },

  streams,
});

export default rootLogger;
