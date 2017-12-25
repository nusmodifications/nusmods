// @flow
import type { FSA } from 'types/redux';
import type {
  SettingsState,
} from 'types/reducers';

import {
  SELECT_NEW_STUDENT,
  SELECT_FACULTY,
  SELECT_MODE,
  HIDE_LESSON_IN_TIMETABLE,
  SHOW_LESSON_IN_TIMETABLE,
} from 'actions/settings';
import { LIGHT_MODE } from 'types/settings';

const defaultSettingsState: SettingsState = {
  newStudent: false,
  faculty: '',
  mode: LIGHT_MODE,
  hiddenInTimetable: [],
};

function hidden(state = [], action: FSA) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case HIDE_LESSON_IN_TIMETABLE:
      return [action.payload, ...state];
    case SHOW_LESSON_IN_TIMETABLE:
      return state.filter(c => c !== action.payload);
    default:
      return state;
  }
}

function settings(state: SettingsState = defaultSettingsState, action: FSA): SettingsState {
  switch (action.type) {
    case SELECT_NEW_STUDENT:
      return {
        ...state,
        newStudent: action.payload,
      };
    case SELECT_FACULTY:
      return {
        ...state,
        faculty: action.payload,
      };
    case SELECT_MODE:
      return {
        ...state,
        mode: action.payload,
      };
    case HIDE_LESSON_IN_TIMETABLE:
    case SHOW_LESSON_IN_TIMETABLE:
      return {
        ...state,
        hiddenInTimetable: hidden(state.hiddenInTimetable, action),
      };
    default:
      return state;
  }
}

export default settings;
