// @flow

import { mapFacultyDepartments } from './GetFacultyDepartment';
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
      'School of Computing': ['Computer Science'],
      'Faculty of Dentistry': [],
    });
  });

  test('should not produce duplicates', () => {
    expect(
      mapFacultyDepartments(
        [
          {
            EffectiveStatus: 'A',
            AcademicGroup: '001',
            DescriptionShort: 'FASS',
            Description: 'Faculty of Arts & Social Sci',
            EffectiveDate: '1905-01-01',
          },
        ],
        [
          {
            EffectiveStatus: 'A',
            DescriptionShort: 'CNM',
            Description: 'Communications & New Media',
            EffectiveDate: '1905-01-01',
            AcademicOrganisation: '00102ACAD1',
          },
          {
            EffectiveStatus: 'A',
            DescriptionShort: 'CNM',
            Description: 'Communications & New Media',
            EffectiveDate: '1905-01-01',
            AcademicOrganisation: '00102ACAD1',
          },
        ],
      ),
    ).toEqual({
      'Faculty of Arts & Social Sci': ['Communications & New Media'],
    });
  });
});
