// @flow

import _ from 'lodash';

import type { FSA } from 'types/redux';

export const RESET_REQUEST_STATE: string = 'RESET_REQUEST_STATE';
export function resetRequestState(domain: string | Array<string>): FSA {
  return {
    type: RESET_REQUEST_STATE,
    payload: _.isArray(domain) ? domain : [domain],
  };
}

export const RESET_ERROR_STATE: string = 'RESET_ERROR_STATE';
export function resetErrorState(domain: string | Array<string>): FSA {
  return {
    type: RESET_ERROR_STATE,
    payload: _.isArray(domain) ? domain : [domain],
  };
}

export const RESET_ALL_STATE: string = 'RESET_ALL_STATE';
export function resetAllState(): FSA {
  return {
    type: RESET_ALL_STATE,
  };
}
