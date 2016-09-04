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

  return axios(req)
    .then((response) => response.data);
}

export const API_REQUEST = Symbol('API_REQUEST');
export const REQUEST = '_REQUEST';
export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

export default (store) => (next) => (action) => {
  const apiRequest = action[API_REQUEST];
  if (!apiRequest) {
    // Non-api request action
    return next(action);
  }

  // type     is the base action type that will trigger
  // payload  is the request body to be processed
  const { type, payload, meta } = apiRequest;

  // swap the action content and structured api results
  function constructActionWith(data) {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[API_REQUEST];
    return finalAction;
  }

  // propagate the start of the request
  next(constructActionWith({
    requestStatus: REQUEST,
    type: type + REQUEST,
    request: payload,
    meta,
  }));

  // get the access token from store
  let accessToken = '';
  if (_.get(store.getState(), 'user.accessToken')) {
    accessToken = store.getState().user.accessToken;
  }

  // propagate the response of the request
  return makeRequest(payload, accessToken, meta)
    .then(
      (response) => next(constructActionWith({
        requestStatus: SUCCESS,
        type: type + SUCCESS,
        request: payload,
        meta,
        response,
      })
      ),
      (error) => next(constructActionWith({
        requestStatus: FAILURE,
        type: type + FAILURE,
        request: payload,
        meta,
        response: error,
      })
      )
    );
};
