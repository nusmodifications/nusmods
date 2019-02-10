// @flow
import type { State } from 'reducers';
import { SUCCESS, FAILURE, REQUEST } from 'types/reducers';

export function isOngoing(state: State, key: string) {
  return state.requests[key] && state.requests[key].status === REQUEST;
}

export function isSuccess(state: State, key: string) {
  return state.requests[key] && state.requests[key].status === SUCCESS;
}

export function isFailure(state: State, key: string) {
  return state.requests[key] && state.requests[key].status === FAILURE;
}
