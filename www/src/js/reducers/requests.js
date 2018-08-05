// @flow
import { camelCase } from 'lodash';

import type { FSA } from 'types/redux';
import type { Requests, RequestType, FetchRequest } from 'types/reducers';

import { REQUEST, SUCCESS, FAILURE } from 'middlewares/requests-middleware';

const NULL_FETCH_REQUEST: FetchRequest = {
  isPending: false,
  isSuccessful: false,
  isFailure: false,
};

const requestState = 'Request';

export function getRequestName(type: string): RequestType {
  const normalizedType = type
    .replace(REQUEST, '')
    .replace(SUCCESS, '')
    .replace(FAILURE, '');

  return camelCase(normalizedType) + requestState;
}

export default function requests(state: Requests = {}, action: FSA): Requests {
  const { type, meta } = action;

  // requestStatus is a field specially designed and owned by api request actions
  if (!meta || !meta.requestStatus) return state;
  switch (meta.requestStatus) {
    case REQUEST:
      return {
        ...state,
        [getRequestName(type)]: {
          ...NULL_FETCH_REQUEST,
          isPending: true,
        },
      };

    case SUCCESS:
      return {
        ...state,
        [getRequestName(type)]: {
          ...NULL_FETCH_REQUEST,
          isSuccessful: true,
        },
      };

    case FAILURE:
      return {
        ...state,
        [getRequestName(type)]: {
          ...NULL_FETCH_REQUEST,
          isFailure: true,
          error: action.payload,
        },
      };

    default:
      return state;
  }
}
