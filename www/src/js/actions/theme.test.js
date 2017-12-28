// @flow
import * as actions from 'actions/theme';

describe('theme', () => {
  test('should dispatch a select of theme', () => {
    const theme: string = 'test';
    expect(actions.selectTheme(theme)).toMatchSnapshot();
  });

  test('should dispatch a cycle of theme', () => {
    expect(actions.cycleTheme(1)).toMatchSnapshot();
    expect(actions.cycleTheme(-1)).toMatchSnapshot();
  });

  test('should dispatch a cycle of select of module color', () => {
    expect(actions.selectModuleColor('CS1010S', 0)).toMatchSnapshot();
    expect(actions.selectModuleColor('CS3216', 1)).toMatchSnapshot();
  });

  test('should dispatch a toggle of timetable orientation', () => {
    expect(actions.toggleTimetableOrientation()).toMatchSnapshot();
  });
});
