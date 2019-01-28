// @flow

import {
  getDepartmentCodeMap,
  getFacultyCodeMap,
  mapFacultyDepartments,
} from './GetFacultyDepartment';
import faculties from './fixtures/faculties';
import departments from './fixtures/departments';

describe(mapFacultyDepartments, () => {
  test('should produce a mapping of department to their faculties', () => {
    expect(mapFacultyDepartments(faculties, departments)).toEqual({
      'Faculty of Arts & Social Sci': [
        'Arts & Social Sciences',
        'FASS DO/Office of Programmes',
        'Chinese Studies',
        'Communications & New Media',
        'Economics',
      ],
      'NUS Business School': ['Accounting', 'Strategy and Policy'],
      'School of Computing': [],
      'Faculty of Dentistry': [],
    });
  });
});

describe(getFacultyCodeMap, () => {
  test('should map faculty codes to their description', () => {
    expect(getFacultyCodeMap(faculties)).toEqual({
      '001': 'Faculty of Arts & Social Sci',
      '002': 'NUS Business School',
      '003': 'School of Computing',
      '004': 'Faculty of Dentistry',
    });
  });
});

describe(getDepartmentCodeMap, () => {
  test('should map department codes to their description', () => {
    expect(getDepartmentCodeMap(departments)).toEqual({
      '001': 'Arts & Social Sciences',
      '00100ACAD1': 'FASS DO/Office of Programmes',
      '00101ACAD1': 'Chinese Studies',
      '00102ACAD1': 'Communications & New Media',
      '00103ACAD1': 'Economics',
      '00201ACAD1': 'Accounting',
      '00202ACAD1': 'Strategy and Policy',
    });
  });
});
