import path from 'path';
import bunyan, { Stream } from 'bunyan';
import { lightFormat } from 'date-fns';
import getSentryStream from './SentryStream';
import { errorSerializer } from './serializer';

type LoggingFunction = {
  (error: Error, message?: string, ...params: any[]): void;
  (message: string, ...params: any[]): void;
  (data: Record<string, any>, message: string, ...params: any[]): void;
};

export interface Logger {
  trace: LoggingFunction;
  debug: LoggingFunction;
  info: LoggingFunction;
  warn: LoggingFunction;
  error: LoggingFunction;
  fatal: LoggingFunction;

  child(options: Record<string, any>): Logger;
}

const logRoot = path.join(__dirname, '../../../logs');

// In production, create a new log for each run
const logSuffix = lightFormat(new Date(), 'yyyy-MM-dd.HH-mm-ss');

const streams: Stream[] =
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

export default rootLogger;
