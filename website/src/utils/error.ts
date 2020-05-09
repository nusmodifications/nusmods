import * as Sentry from '@sentry/browser';
import { each, size } from 'lodash';
import { retry } from 'utils/promise';

export function captureException(error: Error, extra: { [key: string]: unknown } = {}) {
  Sentry.withScope((scope) => {
    each(extra, (data, key) => {
      scope.setExtra(key, extra[key]);
    });

    Sentry.captureException(error);

    console.error(error); // eslint-disable-line no-console
    if (size(extra) > 0) console.error(extra); // eslint-disable-line no-console
  });
}

/**
 * Higher order function that returns a error handler useful when injecting
 * scripts using <script> tags
 */
export function getScriptErrorHandler(scriptName: string) {
  return (error: unknown) => {
    if (error instanceof Error) {
      captureException(error);
    } else {
      captureException(new Error(`Error instantiating ${scriptName}`), {
        error,
      });
    }
  };
}

/**
 * Wrap an async import() so that it automatically retries in case of a chunk
 * load error and when the user is online
 */
export function retryImport<T>(importFactory: () => Promise<T>, retries = 3) {
  return retry(
    retries,
    importFactory,
    (error) => error.message.includes('Loading chunk ') && window.navigator.onLine,
  );
}
