import type { Middleware } from 'redux';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import axios from 'axios';

import type { State } from 'types/state';
import type { Dispatch } from 'types/redux';
import { FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import { API_REQUEST, RequestsDispatchExt } from 'actions/requests';

export type ActionType<Action extends string, Type extends string> = Action & { __type: Type };

// eslint-disable-next-line @typescript-eslint/ban-types
type DefaultMeta = {};

export type RequestAction<Type extends string, Meta = DefaultMeta> = {
  type: ActionType<Type, typeof REQUEST>;
  payload: AxiosRequestConfig;
  meta?: Meta;
};

export type SuccessAction<Type extends string, Response, Meta = DefaultMeta> = {
  type: ActionType<Type, typeof SUCCESS>;
  payload: Response;
  meta?: Meta & {
    requestStatus: typeof SUCCESS;
    responseHeaders: { [header: string]: string };
  };
};

export type FailureAction<Type extends string, Meta = DefaultMeta> = {
  type: ActionType<Type, typeof FAILURE>;
  payload: Error;
  meta?: Meta & {
    requestStatus: typeof FAILURE;
  };
};

export type RequestActions<Type extends string, Response, Meta = DefaultMeta> =
  | RequestAction<Type, Meta>
  | SuccessAction<Type, Response, Meta>
  | FailureAction<Type, Meta>;

function makeRequest(request: AxiosRequestConfig) {
  return axios.request({
    ...request,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function SUCCESS_KEY<Type extends string>(key: Type): ActionType<Type, typeof SUCCESS> {
  return (key + SUCCESS) as ActionType<Type, typeof SUCCESS>;
}

export function FAILURE_KEY<Type extends string>(key: Type): ActionType<Type, typeof FAILURE> {
  return (key + FAILURE) as ActionType<Type, typeof FAILURE>;
}

const requestMiddleware: Middleware<RequestsDispatchExt, State, Dispatch> =
  () => (next) => (action) => {
    if (!action.meta || !action.meta[API_REQUEST]) {
      // Non-api request action
      return next(action);
    }

    // type     is the base action type that will trigger
    // payload  is the request body to be processed
    const { type, payload, meta } = action;

    // Propagate the start of the request
    next({
      type: type + REQUEST,
      payload,
      meta: {
        ...meta,
        requestStatus: REQUEST,
      },
    });

    // Propagate the response of the request.
    return makeRequest(payload).then(
      (response) => {
        next({
          type: SUCCESS_KEY(type),
          payload: response.data,
          meta: {
            ...meta,
            requestStatus: SUCCESS,
            request: payload,
            responseHeaders: response.headers,
          },
        });

        return response.data;
      },
      (error: AxiosError) => {
        next({
          type: FAILURE_KEY(type),
          payload: error,
          meta: {
            ...meta,
            requestStatus: FAILURE,
            request: payload,
          },
        });

        throw error;
      },
    );
  };

export default requestMiddleware;
