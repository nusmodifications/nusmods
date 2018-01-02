// @flow
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';
import config from 'config';

import { MODIFY_LESSON, CHANGE_LESSON, CANCEL_MODIFY_LESSON } from 'actions/timetables';
import { SELECT_MODULE_COLOR } from 'actions/theme';
import { SELECT_SEMESTER } from 'actions/settings';
import { OPEN_NOTIFICATION, SET_ONLINE_STATUS, TOGGLE_FEEDBACK_MODAL } from 'actions/app';

const defaultAppState = (): AppState => ({
  // Default to the current semester from config.
  activeSemester: config.semester,
  // The lesson being modified on the timetable.
  activeLesson: null,
  isOnline: navigator.onLine,
  isFeedbackModalOpen: false,
  notification: null,
});

// This reducer is for storing state pertaining to the UI.
function app(state: AppState = defaultAppState(), action: FSA): AppState {
  switch (action.type) {
    case SELECT_SEMESTER:
      return {
        ...state,
        activeSemester: action.payload && action.payload,
      };
    case MODIFY_LESSON:
      return {
        ...state,
        activeLesson: action.payload && action.payload.activeLesson,
      };
    case CANCEL_MODIFY_LESSON:
    case CHANGE_LESSON:
      return {
        ...state,
        activeLesson: null,
      };
    case SET_ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.payload.isOnline,
      };
    case TOGGLE_FEEDBACK_MODAL:
      return {
        ...state,
        isFeedbackModalOpen: !state.isFeedbackModalOpen,
      };
    case OPEN_NOTIFICATION:
      return {
        ...state,
        notification: action.payload,
      };
    case SELECT_MODULE_COLOR:
    default:
      return state;
  }
}

export default app;
