import { AxiosRequestConfig } from 'axios';
import { RequestKey } from 'types/reducers';

export const API_REQUEST = 'API_REQUEST';

export type RequestAction = {
  type: string;
  payload: AxiosRequestConfig;
  meta: {
    [key: string]: string;
  };
};

/**
 * Create an action that makes a HTTP request. key is a string that uniquely
 * identifies each request. If type is not provided then it is assumed to be
 * the same as key.
 *
 * For example, fetching individual module info uses the type
 * FETCH_MODULE, while the key is FETCH_MODULE_[Module Code]. This allows the
 * status of each individual request to be stored, while the actions are still
 * grouped by their type.
 *
 * Options is passed directly into axios config, so minimally url should be
 * provided.
 */
export function requestAction(key: RequestKey, options: AxiosRequestConfig): RequestAction;
export function requestAction(
  key: RequestKey,
  type: string,
  options: AxiosRequestConfig,
): RequestAction;
export function requestAction(
  key: RequestKey,
  type: string | AxiosRequestConfig,
  options?: AxiosRequestConfig,
): RequestAction {
  let payload: AxiosRequestConfig;

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
}
