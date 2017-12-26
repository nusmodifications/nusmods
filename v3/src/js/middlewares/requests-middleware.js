import axios from 'axios';
import _ from 'lodash';

function makeRequest(request, accessToken) {
  const req = _.cloneDeep(request);
  req.headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    req.headers.Authorization = accessToken;
  }

  return axios(req);
}

export const API_REQUEST = Symbol('API_REQUEST');
export const REQUEST = '_REQUEST';
export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

export default store => next => (action) => {
  if (!action.meta || !action.meta[API_REQUEST]) {
    // Non-api request action
    return next(action);
  }

  // type     is the base action type that will trigger
  // payload  is the request body to be processed
  const { type, payload, meta } = action;

  // Swap the action content and structured api results
  function constructActionWith(data) {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[API_REQUEST];
    return finalAction;
  }

  // Propagate the start of the request
  next(constructActionWith({
    type: type + REQUEST,
    payload,
    meta: {
      ...meta,
      requestStatus: REQUEST,
    },
  }));

  // Get the access token from store.
  let accessToken = '';
  if (_.get(store.getState(), 'user.accessToken')) {
    accessToken = store.getState().user.accessToken;
  }

  // Propagate the response of the request.
  return makeRequest(payload, accessToken)
    .then(response => next(constructActionWith({
      type: type + SUCCESS,
      payload: response.data,
      meta: {
        ...meta,
        requestStatus: SUCCESS,
        request: payload,
        headers: response.headers,
      },
    })),
    error => next(constructActionWith({
      type: type + FAILURE,
      payload: error,
      meta: {
        ...meta,
        requestStatus: FAILURE,
        request: payload,
      },
    })),
    );
};
