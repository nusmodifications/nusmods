// @flow
import type { Middleware } from 'redux';
import type { State } from 'reducers';
import axios from 'axios';
import { FAILURE, REQUEST, SUCCESS } from 'types/reducers';
import { API_REQUEST } from 'actions/requests';

function makeRequest(request) {
  return axios({
    ...request,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const requestMiddleware: Middleware<State, *, *> = () => (next) => (action) => {
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
    (error) => {
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
