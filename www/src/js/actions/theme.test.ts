import * as actions from 'actions/theme';

describe('theme', () => {
  test('should dispatch a select of theme', () => {
    const theme = 'test';
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
