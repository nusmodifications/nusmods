// @flow
import type { Middleware } from 'redux';
import type { State } from 'reducers';
import axios from 'axios';

function makeRequest(request) {
  return axios({
    ...request,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const API_REQUEST: any = Symbol('API_REQUEST');
export const REQUEST = '_REQUEST';
export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

const requestMiddleware: Middleware<State, *, *> = () => (next) => (action) => {
  if (!action.meta || !action.meta[API_REQUEST]) {
    // Non-api request action
    return next(action);
  }

  // type     is the base action type that will trigger
  // payload  is the request body to be processed
  const { type, payload, meta } = action;

  // Swap the action content and structured api results
  function constructActionWith(data) {
    const finalAction = { ...action, ...data };
    delete finalAction[API_REQUEST];
    return finalAction;
  }

  // Propagate the start of the request
  next(
    constructActionWith({
      type: type + REQUEST,
      payload,
      meta: {
        ...meta,
        requestStatus: REQUEST,
      },
    }),
  );

  // Propagate the response of the request.
  return makeRequest(payload).then(
    (response) =>
      next(
        constructActionWith({
          type: type + SUCCESS,
          payload: response.data,
          meta: {
            ...meta,
            requestStatus: SUCCESS,
            request: payload,
            responseHeaders: response.headers,
          },
        }),
      ),
    (error) => {
      next(
        constructActionWith({
          type: type + FAILURE,
          payload: error,
          meta: {
            ...meta,
            requestStatus: FAILURE,
            request: payload,
          },
        }),
      );

      throw error;
    },
  );
};

export default requestMiddleware;
