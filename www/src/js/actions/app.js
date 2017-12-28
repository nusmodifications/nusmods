// @flow

import type { FSA } from 'types/redux';

export const SET_ONLINE_STATUS = 'SET_ONLINE_STATUS';
export function setOnlineStatus(isOnline: boolean): FSA {
  return {
    type: SET_ONLINE_STATUS,
    payload: { isOnline },
  };
}

export const TOGGLE_FEEDBACK_MODAL = 'TOGGLE_FEEDBACK_MODAL';
export function toggleFeedback(): FSA {
  return {
    type: TOGGLE_FEEDBACK_MODAL,
    payload: null,
  };
}
