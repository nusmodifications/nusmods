// @flow
import type { FSA } from 'types/redux';
import type { AuthState } from 'types/reducers';

import { AUTH_LOGIN, AUTH_LOGOUT } from 'actions/auth';

const defaultAuthState = (): AuthState => ({
  loggedIn: false,
  user: null,
  rawUser: null,
});

function authReducer(state: AuthState = defaultAuthState(), action: FSA): AuthState {
  switch (action.type) {
    case AUTH_LOGIN: {
      return {
        ...state,
        loggedIn: true,
        user: action.payload.user,
        rawUser: action.payload.rawUser,
      };
    }
    case AUTH_LOGOUT: {
      return {
        ...state,
        loggedIn: false,
        user: null,
        rawUser: null,
      };
    }
    default:
      return state;
  }
}

export default authReducer;
