// @flow
import type { FSA } from 'types/redux';

import test from 'ava';
import * as actions from 'actions/theme';

test('should dispatch a change of theme', (t) => {
  const theme: string = 'test';
  const expectedResult: FSA = {
    type: actions.CHANGE_THEME,
    payload: {
      theme,
    },
  };
  const resultOfAction: FSA = actions.changeTheme(theme);
  t.deepEqual(resultOfAction, expectedResult);
});
