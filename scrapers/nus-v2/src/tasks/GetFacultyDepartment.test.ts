import { cleanNames, mapFacultyDepartments } from './GetFacultyDepartment';
import faculties from './fixtures/faculties.json';
import departments from './fixtures/departments.json';

describe(cleanNames, () => {
  test('should remove redundant parts', () => {
    expect(cleanNames('School of Computing')).toEqual('Computing');
    expect(cleanNames('Faculty of Law')).toEqual('Law');
    expect(cleanNames('LKY School of Public Policy')).toEqual('LKY School of Public Policy');
  });

  test('should expand abbreviations', () => {
    expect(cleanNames('Sci Eng Mgmt')).toEqual('Science Engineering Management');
    expect(cleanNames('Arts & Social Sciences')).toEqual('Arts and Social Sciences');
    expect(cleanNames('Coll. of Humanities & Sciences')).toEqual(
      'College of Humanities and Sciences',
    );
  });

  test('should not double expand', () => {
    expect(cleanNames('Science Engineering Management')).toEqual('Science Engineering Management');
    expect(cleanNames('Science-Engineering-Management')).toEqual('Science-Engineering-Management');
  });
});

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
