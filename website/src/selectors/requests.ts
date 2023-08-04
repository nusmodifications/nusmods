import { SUCCESS, FAILURE, REQUEST } from 'types/reducers';
import { State } from 'types/state';

export function isOngoing(state: State, key: string) {
  return state.requests[key]?.status === REQUEST;
}

export function isSuccess(state: State, key: string) {
  return state.requests[key]?.status === SUCCESS;
}

export function isFailure(state: State, key: string) {
  return state.requests[key]?.status === FAILURE;
}
