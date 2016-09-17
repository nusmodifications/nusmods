import test from 'ava';
import * as actions from 'actions/theme';

test('should dispatch a change of theme', (t) => {
  const theme = 'test';
  const expectedResult = {
    type: actions.CHANGE_THEME,
    payload: {
      theme,
    },
  };
  const resultOfAction = actions.changeTheme(theme);
  t.deepEqual(resultOfAction, expectedResult);
});
