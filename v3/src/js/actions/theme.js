// @flow

import type { FSA } from 'types/redux';

export const CHANGE_THEME: string = 'CHANGE_THEME';
export function changeTheme(theme: string): FSA {
  return {
    type: CHANGE_THEME,
    payload: {
      theme,
    },
  };
}
