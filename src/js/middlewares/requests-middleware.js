import _ from 'lodash';
import axios from 'axios';

function callApi(request, accessToken, options = {}) {
  request.headers = {
    'Content-Type': 'application/json',
    Authorization: accessToken
  };

  return axios(request)
    .then((response) => {
      return response.data;
    });
}

export const API_CALL = Symbol('Call API');
export const REQUEST = '_REQUEST';
export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

export default (store) => (next) => (action) => {
  // get the callAPI options
  const callAPI = action[API_CALL];
  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  // type     is the base action type that will trigger
  // payload  is the request body to be processed
  const { type, payload, meta } = callAPI;

  // swap the action content and structured api results
  function constructActionWith(data) {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[API_CALL];
    return finalAction;
  }

  // propagate the start of the request
  next(constructActionWith({
    requestStatus: REQUEST,
    type: type + REQUEST,
    request: payload,
    meta: meta
  }));

  // get the access token from store
  let accessToken = '';

  // propagate the response of the request
  return callApi(payload, accessToken, meta)
    .then(
      (response) => next(constructActionWith({
          requestStatus: SUCCESS,
          type: type + SUCCESS,
          request: payload,
          meta: meta,
          response: response
        })
      ),
      (error) => next(constructActionWith({
          requestStatus: FAILURE,
          type: type + FAILURE,
          request: payload,
          meta: meta,
          response: error
        })
      )
    );
};
