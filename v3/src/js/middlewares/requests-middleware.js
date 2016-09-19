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
    .then(response => response.data);
}

export const API_REQUEST = 'API_REQUEST';
export const REQUEST = '_REQUEST';
export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

// swap the action content and structured api results
function constructActionWith(action, requestStatus, apiRequest, response) {
  const finalAction = _.assign({
    requestStatus,
    type: apiRequest.type + requestStatus,
    request: apiRequest.payload,
    meta: apiRequest.meta,
    response,
  }, action);
  delete finalAction[API_REQUEST];
  return finalAction;
}

// currying, essentially function(store, nextion, action)
export default store => next => (action) => {
  const apiRequest = action[API_REQUEST];
  if (!apiRequest) {
    // Non-api request action
    return next(action);
  }

  // payload  is the request body to be processed
  const { payload, meta } = apiRequest;

  // propagate the start of the request
  next(constructActionWith(action, REQUEST, apiRequest));

  // get the access token from store
  let accessToken = '';
  if (_.get(store.getState(), 'user.accessToken')) {
    accessToken = store.getState().user.accessToken;
  }

  // propagate the response of the request
  return makeRequest(payload, accessToken, meta)
    .then(response => next(constructActionWith(action, SUCCESS, apiRequest, response)))
    .catch(error => next(constructActionWith(action, FAILURE, apiRequest, error))
  );
};
