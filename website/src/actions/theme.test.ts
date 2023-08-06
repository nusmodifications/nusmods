import * as actions from 'actions/theme';
import { Theme } from 'types/settings';

describe('theme', () => {
  test('should dispatch a select of theme', () => {
    const theme: Theme = {
      id: 'test',
      name: 'Test',
      numOfColors: 8,
    };
    expect(actions.selectTheme(theme)).toMatchSnapshot();
  });

  test('should dispatch a cycle of theme', () => {
    expect(actions.cycleTheme(1)).toMatchSnapshot();
    expect(actions.cycleTheme(-1)).toMatchSnapshot();
  });

  test('should dispatch a toggle of timetable orientation', () => {
    expect(actions.toggleTimetableOrientation()).toMatchSnapshot();
  });
});
