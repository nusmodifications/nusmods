import { MODIFY_LESSON, CHANGE_LESSON, CANCEL_MODIFY_LESSON } from 'actions/timetables';

const defaultAppState = {
  // The lesson being modified on the timetable.
  activeLesson: null,
};

// This reducer is for storing state pertaining to the UI.
function app(state = defaultAppState, action) {
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
