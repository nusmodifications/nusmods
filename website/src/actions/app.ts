import { NotificationOptions } from 'types/reducers';

export const SET_ONLINE_STATUS = 'SET_ONLINE_STATUS' as const;
export function setOnlineStatus(isOnline: boolean) {
  return {
    type: SET_ONLINE_STATUS,
    payload: { isOnline },
  };
}

export const TOGGLE_FEEDBACK_MODAL = 'TOGGLE_FEEDBACK_MODAL' as const;
export function toggleFeedback() {
  return {
    type: TOGGLE_FEEDBACK_MODAL,
    payload: null,
  };
}

export const OPEN_NOTIFICATION = 'OPEN_NOTIFICATION' as const;
export function openNotification(message: string, options: NotificationOptions = {}) {
  return {
    type: OPEN_NOTIFICATION,
    payload: {
      message,
      ...options,
    },
  };
}

export const POP_NOTIFICATION = 'POP_NOTIFICATION' as const;
export function popNotification() {
  return {
    type: POP_NOTIFICATION,
    payload: null,
  };
}

export const PROMPT_REFRESH = 'PROMPT_REFRESH' as const;
export function promptRefresh() {
  return {
    type: PROMPT_REFRESH,
    payload: null,
  };
}
