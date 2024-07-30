import { Faculty, Semester } from 'types/modules';
import { LIGHT_COLOR_SCHEME_PREFERENCE } from 'types/settings';

import * as actions from 'actions/settings';

describe('settings', () => {
  test('should dispatch a select of a semester value', () => {
    const semester: Semester = 1;
    expect(actions.selectSemester(semester)).toMatchSnapshot();
  });

  test('should dispatch a select of a newStudent value', () => {
    const newStudent = false;
    expect(actions.selectNewStudent(newStudent)).toMatchSnapshot();
  });

  test('should dispatch a selection of a color scheme preference', () => {
    const colorSchemePreference = LIGHT_COLOR_SCHEME_PREFERENCE;
    expect(actions.selectColorScheme(colorSchemePreference)).toMatchSnapshot();
  });

  test('should dispatch a select of a faculty value', () => {
    const faculty: Faculty = 'Some faculty';
    expect(actions.selectFaculty(faculty)).toMatchSnapshot();
  });
});
