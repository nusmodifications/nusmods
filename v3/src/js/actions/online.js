// @flow

import type { FSA } from 'types/redux';

export const SET_ONLINE_STATUS = 'SET_ONLINE_STATUS';
export function setOnlineStatus(isOnline: boolean): FSA {
  return {
    type: SET_ONLINE_STATUS,
    payload: { isOnline },
  };
}
