// @flow

/**
 * Sentry stream for Bunyan. Modified from https://github.com/transcovo/bunyan-sentry-stream
 * for compatibility with new API
 */

import type { BunyanRecord } from 'bunyan';
import * as Sentry from '@sentry/node';
import { each, pick } from 'lodash';

/**
 * Convert Bunyan level number to Sentry level label.
 * Rule : >50=error ; 40=warning ; info otherwise
 * @param  {Object} record Bunyan log record
 * @return {String}        Sentry level
 */
function getSentryLevel(record: BunyanRecord) {
  const { level } = record;

  if (level >= 50) return 'error';
  if (level === 40) return 'warning';

  return 'info';
}

/**
 * Error deserialiazing function. Bunyan serialize the error to object
 * https://github.com/trentm/node-bunyan/blob/master/lib/bunyan.js#L1089
 * @param  {object} data serialized Bunyan
 * @return {Error}       the deserialiazed error
 */
function deserializeError(data: any) {
  if (data instanceof Error) return data;

  const error = new Error(data.message);
  error.name = data.name;
  error.stack = data.stack;

  // $FlowFixMe
  if (data.code) error.code = data.code;
  // $FlowFixMe
  if (data.signal) error.signal = data.signal;

  return error;
}

type StreamConfig = {
  /** Array of properties to turn into tags */
  tags?: string[],

  /** Array of properties to turn into extra data */
  extra?: string[],
};

export default function getSentryStream(config: StreamConfig = {}) {
  const tagProps = config.tags || [];
  const extraProps = config.extra || [];

  return {
    write(record: BunyanRecord) {
      const tags = pick(record, tagProps);
      const extra = pick(record, extraProps);
      const level = getSentryLevel(record);

      Sentry.withScope((scope) => {
        scope.setLevel(level);

        each(tags, (value, prop) => {
          scope.setTag(prop, value || null);
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
}
