import _ from 'lodash';

import * as helperActions from 'actions/helpers';
import * as requestResultCases from 'middlewares/requests-middleware';
import type { FetchRequest } from 'types/reducers';

const requestState = 'Request';

export default function requests(state = {}, action = null): FetchRequest {
  const { type, requestStatus } = action;

  if (type === helperActions.RESET_ALL_STATE) {
    return {};
  }

  // Reset request state
  if (type === helperActions.RESET_REQUEST_STATE) {
    const newState = {};
    _.each(action.payload, (domain) => {
      newState[_.camelCase(domain) + requestState] = {
        isPending: false,
        isSuccessful: false,
        isFailure: false,
      };
    });

    return _.merge({}, state, newState);
  }

  // requestStatus is a field specially designed and owned by api request actions
  let domain = '';
  switch (requestStatus) {
    case requestResultCases.REQUEST:
      domain = _.camelCase(type.replace(requestResultCases.REQUEST, ''));
      return _.merge({}, state, {
        [domain + requestState]: {
          isPending: true,
          isSuccessful: false,
          isFailure: false,
        },
      });
    case requestResultCases.SUCCESS:
      domain = _.camelCase(type.replace(requestResultCases.SUCCESS, ''));
      return _.merge({}, state, {
        [domain + requestState]: {
          isPending: false,
          isSuccessful: true,
          isFailure: false,
        },
      });
    case requestResultCases.FAILURE:
      domain = _.camelCase(type.replace(requestResultCases.FAILURE, ''));
      return _.merge({}, state, {
        [domain + requestState]: {
          isPending: false,
          isSuccessful: false,
          isFailure: true,
        },
      });
    default:
      return state;
  }
}
