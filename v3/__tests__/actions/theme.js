// @flow
import * as actions from 'actions/theme';

test('should dispatch a select of theme', () => {
  const theme: string = 'test';
  expect(actions.selectTheme(theme)).toMatchSnapshot();
});
