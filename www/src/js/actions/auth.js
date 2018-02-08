// @flow
import type { User as FirebaseUser } from '@firebase/app';
import type { FSA } from 'types/redux';
import type { User } from 'types/reducers';

export const AUTH_LOGIN = 'AUTH_LOGIN';
export function login(user: User, rawUser: FirebaseUser): FSA {
  return {
    type: AUTH_LOGIN,
    payload: { user, rawUser },
  };
}

export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export function logout(): FSA {
  return { type: AUTH_LOGOUT };
}
