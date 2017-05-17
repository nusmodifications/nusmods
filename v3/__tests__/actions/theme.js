// @flow
import type { FSA } from 'types/redux';

import * as actions from 'actions/theme';

test('should dispatch a select of theme', () => {
  const theme: string = 'test';
  const expectedResult: FSA = {
    type: actions.SELECT_THEME,
    payload: theme,
  };
  const resultOfAction: FSA = actions.selectTheme(theme);
  expect(resultOfAction).toEqual(expectedResult);
});
