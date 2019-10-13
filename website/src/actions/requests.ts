import { AxiosRequestConfig } from 'axios';
import { RequestKey } from 'types/reducers';

export const API_REQUEST = 'API_REQUEST';

export type RequestAction<Type extends string> = {
  type: Type;
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
type RequestActionCreator = {
  <Key extends string>(key: Key, options: AxiosRequestConfig): RequestAction<Key>;
  <Type extends string>(key: RequestKey, type: Type, options: AxiosRequestConfig): RequestAction<
    Type
  >;
};

export const requestAction: RequestActionCreator = (
  key: RequestKey,
  type: string | AxiosRequestConfig,
  options?: AxiosRequestConfig,
): RequestAction<any> => {
  let payload: AxiosRequestConfig;

  if (typeof type !== 'string') {
    payload = type;
    // eslint-disable-next-line no-param-reassign
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
