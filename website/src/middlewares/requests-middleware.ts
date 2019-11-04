import { Middleware } from 'redux';
import axios, { AxiosRequestConfig } from 'axios';
import { FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import { API_REQUEST } from 'actions/requests';
import { State } from 'types/state';

export type RequestType<Type extends string> = Type & { __requestType: any };
export type SuccessType<Type extends string> = Type & { __successType: any };
export type ErrorType<Type extends string> = Type & { __errorType: any };

export type RequestAction<Type extends string, Meta = {}> = {
  type: RequestType<Type>;
  payload: AxiosRequestConfig;
  meta: Meta;
};

export type SuccessAction<Type extends string, Response, Meta = {}> = {
  type: SuccessType<Type>;
  payload: Response;
  meta: Meta & {
    requestStatus: typeof SUCCESS;
    responseHeaders: { [header: string]: string };
  };
};

export type FailureAction<Type extends string, Meta = {}> = {
  type: ErrorType<Type>;
  payload: Error;
  meta: Meta & {
    requestStatus: typeof FAILURE;
  };
};

export type RequestActions<Type extends string, Response, Meta = {}> =
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

export function SUCCESS_KEY<Type extends string>(key: Type): SuccessType<Type> {
  return (key + SUCCESS) as SuccessType<Type>;
}

export function FAILURE_KEY<Type extends string>(key: Type): ErrorType<Type> {
  return (key + FAILURE) as ErrorType<Type>;
}

// TODO: Figure out how to type Dispatch correctly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestMiddleware: Middleware<any, State, any> = () => (next) => (action) => {
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
    (response) =>
      next({
        type: SUCCESS_KEY(type),
        payload: response.data,
        meta: {
          ...meta,
          requestStatus: SUCCESS,
          request: payload,
          responseHeaders: response.headers,
        },
      }),
    (error) => {
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
