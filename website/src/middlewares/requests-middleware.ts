import { Middleware } from 'redux';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import { API_REQUEST } from 'actions/requests';
import { State } from 'types/state';

function makeRequest(request: AxiosRequestConfig) {
  return axios.request({
    ...request,
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
        type: type + SUCCESS,
        payload: response.data,
        meta: {
          ...meta,
          requestStatus: SUCCESS,
          request: payload,
          responseHeaders: response.headers,
        },
      }),
    (error: AxiosError) => {
      next({
        type: type + FAILURE,
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
