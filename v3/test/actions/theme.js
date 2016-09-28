// @flow
import type { FSA } from 'types/redux';

import test from 'ava';
import * as actions from 'actions/theme';

test('should dispatch a select of theme', (t) => {
  const theme: string = 'test';
  const expectedResult: FSA = {
    type: actions.SELECT_THEME,
    payload: theme,
  };
  const resultOfAction: FSA = actions.selectTheme(theme);
  t.deepEqual(resultOfAction, expectedResult);
});
