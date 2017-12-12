// @flow
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';
import config from 'config';

import {
  MODIFY_LESSON,
  CHANGE_LESSON,
  CANCEL_MODIFY_LESSON,
} from 'actions/timetables';
import {
  SELECT_MODULE_COLOR,
} from 'actions/theme';
import {
  SELECT_SEMESTER,
} from 'actions/settings';

const defaultAppState: AppState = {
  // Default to the current semester from config.
  activeSemester: config.semester,
  // The lesson being modified on the timetable.
  activeLesson: null,
};

// This reducer is for storing state pertaining to the UI.
function app(state: AppState = defaultAppState, action: FSA): AppState {
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
    case SELECT_MODULE_COLOR:
    default:
      return state;
  }
}

export default app;
