// @flow
import * as Sentry from '@sentry/browser';
import { each, size } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export function captureException(error: any, extra: Object = {}) {
  Sentry.withScope((scope) => {
    each(extra, (data, key) => {
      scope.setExtra(key, extra[key]);
    });

    Sentry.captureException(error);

    console.error(error); // eslint-disable-line no-console
    if (size(extra) > 0) console.error(extra); // eslint-disable-line no-console
  });
}

export function getScriptErrorHandler(scriptName: string) {
  return (error: any) => {
    if (error instanceof Error) {
      captureException(error);
    } else {
      captureException(new Error(`Error instantiating ${scriptName}`), {
        error,
      });
    }
  };
}
