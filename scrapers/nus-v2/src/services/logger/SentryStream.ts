/**
 * Sentry stream for Bunyan. Modified from https://github.com/transcovo/bunyan-sentry-stream
 * for compatibility with new API
 */

import * as Sentry from '@sentry/node';
import { each, pick } from 'lodash';
import { Stream } from 'bunyan';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SentryError extends Error {
  code?: string;
  signal?: string;
}

type BunyanRecord = {
  msg: string;
  level: number;
  err?: Error;
  code?: string;
  signal?: number;
};

/**
 * Convert Bunyan level number to Sentry level label.
 * Rule : >50=error ; 40=warning ; info otherwise
 * @param  {Object} record Bunyan log record
 * @return {String}        Sentry level
 */
function getSentryLevel(record: BunyanRecord): Sentry.Severity {
  const { level } = record;

  if (level >= 60) return Sentry.Severity.Critical;
  if (level >= 50) return Sentry.Severity.Error;
  if (level === 40) return Sentry.Severity.Warning;

  return Sentry.Severity.Info;
}

/**
 * Error deserialiazing function. Bunyan serialize the error to object
 * https://github.com/trentm/node-bunyan/blob/master/lib/bunyan.js#L1089
 * @param  {object} data serialized Bunyan
 * @return {Error}       the deserialiazed error
 */
function deserializeError(data: any) {
  if (data instanceof Error) return data;

  const error: SentryError = new Error(data.message);
  error.name = data.name;
  error.stack = data.stack;

  if (data.code) error.code = data.code;
  if (data.signal) error.signal = data.signal;

  return error;
}

type StreamConfig = {
  /** Array of properties to turn into tags */
  tags?: string[];

  /** Array of properties to turn into extra data */
  extra?: string[];
};

export default function getSentryStream(config: StreamConfig = {}): Stream {
  const tagProps = config.tags || [];
  const extraProps = config.extra || [];

  const stream: any = {
    write(record: BunyanRecord) {
      const tags = pick(record, tagProps);
      const extra = pick(record, extraProps);
      const level = getSentryLevel(record);

      Sentry.withScope((scope) => {
        scope.setLevel(level);

        each(tags, (value, prop) => {
          scope.setTag(prop, String(value));
        });

        each(extra, (value, prop) => {
          scope.setExtra(prop, value || null);
        });

        if (record.err) {
          scope.setExtra('msg', record.msg);
          Sentry.captureException(deserializeError(record.err));
        } else {
          Sentry.captureMessage(record.msg);
        }
      });

      return true;
    },
  };

  return stream;
}
