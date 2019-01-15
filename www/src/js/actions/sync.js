// @flow
import type { FSA } from 'types/redux';

export const SYNC_DATA_RECEIVED = 'SYNC_DATA_RECEIVED ';
export function syncDataReceived(newState: Object): FSA {
  return {
    type: SYNC_DATA_RECEIVED,
    payload: { newState },
  };
}
