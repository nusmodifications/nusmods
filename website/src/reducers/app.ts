import { AppState } from 'types/reducers';
import { Actions } from 'types/actions';
import config from 'config';

import { forceRefreshPrompt } from 'utils/debug';
import { MODIFY_LESSON, CHANGE_LESSON, CANCEL_MODIFY_LESSON, CUSTOMISE_MODULE } from 'actions/timetables';
import { SELECT_SEMESTER } from 'actions/settings';
import {
  OPEN_NOTIFICATION,
  POP_NOTIFICATION,
  PROMPT_REFRESH,
  SET_ONLINE_STATUS,
  TOGGLE_FEEDBACK_MODAL,
} from 'actions/app';

const defaultAppState = (): AppState => ({
  // Default to the current semester from config.
  activeSemester: config.semester,
  // The lesson being modified on the timetable.
  activeLesson: null,
  customiseModule: "",
  isOnline: navigator.onLine,
  isFeedbackModalOpen: false,
  promptRefresh: forceRefreshPrompt(),
  notifications: [],
});

// This reducer is for storing state pertaining to the UI.
function app(state: AppState = defaultAppState(), action: Actions): AppState {
  switch (action.type) {
    case SELECT_SEMESTER:
      return {
        ...state,
        activeSemester: action.payload,
      };
    case MODIFY_LESSON:
      return {
        ...state,
        activeLesson: action.payload.activeLesson,
      };
    case CUSTOMISE_MODULE:
      return {
        ...state,
        customiseModule: action.payload.moduleCode,
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

    case PROMPT_REFRESH:
      return {
        ...state,
        promptRefresh: true,
      };
    case OPEN_NOTIFICATION: {
      if (state.notifications.length) {
        // If the ONLY notification in the queue can be discarded, we replace
        // it with the current one
        if (state.notifications.length === 1 && state.notifications[0].overwritable) {
          return {
            ...state,
            notifications: [action.payload],
          };
        }

        // Since the displayed item cannot give way, we
        // discard the new item if possible
        if (action.payload.overwritable) {
          return state;
        }

        // Since both can't be discarded, priority notification
        // gets displayed immediately
        if (action.payload.priority) {
          return {
            ...state,
            notifications: [action.payload, ...state.notifications],
          };
        }
      }

      // Fallback to queuing the next item up
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    }
    case POP_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.slice(1),
      };
    default:
      return state;
  }
}

export default app;
