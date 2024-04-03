import { Faculty, Semester } from 'types/modules';

import * as actions from 'actions/settings';

import { LIGHT_COLOR_SCHEME_PREFERENCE } from 'types/settings';

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
    expect(actions.selectColorScheme(LIGHT_COLOR_SCHEME_PREFERENCE)).toMatchSnapshot();
  });

  test('should dispatch a select of a faculty value', () => {
    const faculty: Faculty = 'Some faculty';
    expect(actions.selectFaculty(faculty)).toMatchSnapshot();
  });
});
