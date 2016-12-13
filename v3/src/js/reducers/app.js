// @flow
import type { FSA } from 'types/redux';
import type { AppState } from 'types/reducers';

import {
  MODIFY_LESSON,
  CHANGE_LESSON,
  CANCEL_MODIFY_LESSON,
} from 'actions/timetables';
import {
  MODIFY_MODULE_COLOR,
  CANCEL_MODIFY_MODULE_COLOR,
  SELECT_MODULE_COLOR,
} from 'actions/theme';

const defaultAppState: AppState = {
  // The lesson being modified on the timetable.
  activeLesson: null,
  // The module being color-picked in the module table.
  activeModule: null,
};

// This reducer is for storing state pertaining to the UI.
function app(state: AppState = defaultAppState, action: FSA): AppState {
  switch (action.type) {
    case MODIFY_LESSON:
      return {
        ...state,
        activeLesson: action.payload && action.payload.activeLesson,
      };
    case MODIFY_MODULE_COLOR:
      return {
        ...state,
        activeModule: action.payload && action.payload.activeModule,
      };
    case CANCEL_MODIFY_LESSON:
    case CHANGE_LESSON:
      return {
        ...state,
        activeLesson: null,
      };
    case CANCEL_MODIFY_MODULE_COLOR:
    case SELECT_MODULE_COLOR:
      return {
        ...state,
        activeModule: null,
      };
    default:
      return state;
  }
}

export default app;
