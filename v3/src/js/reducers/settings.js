// @flow

import { SELECT_NEW_STUDENT, SELECT_FACULTY } from 'actions/settings';
import type { FSA } from 'redux';
import type {
  SettingsState,
} from 'types/reducers';

const defaultSettingsState: SettingsState = {
  newStudent: false,
  faculty: '',
};

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
    default:
      return state;
  }
}

export default settings;
