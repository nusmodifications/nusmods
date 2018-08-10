// @flow

import type { AxiosXHRConfig } from 'axios';
import type { FSA } from 'types/redux';
import type { RequestKey } from 'types/reducers';

export const API_REQUEST = 'API_REQUEST';

export type RequestAction = FSA & {
  payload: AxiosXHRConfig<*>,
  meta: {
    [typeof API_REQUEST]: string,
  },
};

/* eslint-disable import/prefer-default-export, no-param-reassign */
type RequestActionCreator = {
  (key: RequestKey, options: AxiosXHRConfig<*>): RequestAction,
  (key: RequestKey, type: string, options: AxiosXHRConfig<*>): RequestAction,
};

/**
 * Create an action that makes a HTTP request. key is a string that uniquely
 * identifies each request. If type is not provided then it is assumed to be
 * the same as key. Options is passed directly into axios config.
 */
export const requestAction: RequestActionCreator = (key, type, options) => {
  let payload: AxiosXHRConfig<*>;

  if (typeof type !== 'string') {
    payload = type;
    type = key;
  } else if (options) {
    payload = options;
  } else {
    // Keeps Flow happy
    throw new Error();
  }

  return {
    type,
    payload,
    meta: {
      [API_REQUEST]: key,
    },
  };
};
