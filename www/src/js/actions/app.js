// @flow

import type { FSA } from 'types/redux';
import type { NotificationOptions } from 'types/reducers';

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

export const OPEN_NOTIFICATION = 'OPEN_NOTIFICATION';
export function openNotification(message: string, options: NotificationOptions = {}): FSA {
  return {
    type: OPEN_NOTIFICATION,
    payload: {
      message,
      ...options,
    },
  };
}

export const POP_NOTIFICATION = 'POP_NOTIFICATION';
export function popNotification(): FSA {
  return {
    type: POP_NOTIFICATION,
    payload: null,
  };
}

export const PROMPT_REFRESH = 'PROMPT_REFRESH';
export function promptRefresh(): FSA {
  return {
    type: PROMPT_REFRESH,
    payload: null,
  };
}
