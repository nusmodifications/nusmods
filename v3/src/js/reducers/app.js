// @flow
import type { FSA } from 'redux';
import type {
  Lesson,
} from 'types/modules';

import { MODIFY_LESSON, CHANGE_LESSON, CANCEL_MODIFY_LESSON } from 'actions/timetables';

export type AppState = {
  activeLesson: ?Lesson,
};

const defaultAppState: AppState = {
  // The lesson being modified on the timetable.
  activeLesson: null,
};

// This reducer is for storing state pertaining to the UI.
function app(state: AppState = defaultAppState, action: FSA): AppState {
  switch (action.type) {
    case MODIFY_LESSON:
      return {
        ...state,
        activeLesson: action.payload.activeLesson,
      };
    case CANCEL_MODIFY_LESSON:
    case CHANGE_LESSON:
      return {
        ...state,
        activeLesson: null,
      };
    default:
      return state;
  }
}

export default app;
