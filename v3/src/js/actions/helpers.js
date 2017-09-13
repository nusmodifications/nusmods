// @flow
import { castArray } from 'lodash';

import type { FSA } from 'types/redux';

export const RESET_REQUEST_STATE = 'RESET_REQUEST_STATE';
export function resetRequestState(domain: string | string[]): FSA {
  return {
    type: RESET_REQUEST_STATE,
    payload: castArray(domain),
  };
}

export const RESET_ERROR_STATE = 'RESET_ERROR_STATE';
export function resetErrorState(domain: string | string[]): FSA {
  return {
    type: RESET_ERROR_STATE,
    payload: castArray(domain),
  };
}

export const RESET_ALL_STATE = 'RESET_ALL_STATE';
export function resetAllState(): FSA {
  return {
    type: RESET_ALL_STATE,
    payload: null,
  };
}
