// @flow

import departments from './fixtures/departments';
import faculties from './fixtures/faculties';
import {
  cleanModuleInfo,
  getDepartmentCodeMap,
  getFacultyCodeMap,
  parseWorkload,
} from './GetSemesterData';

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
      '00301ACAD1': 'Computer Science',
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

describe(cleanModuleInfo, () => {
  test('should remove empty string requisite fields', () => {
    expect(
      cleanModuleInfo({
        AcadYear: '2018/2019',
        Preclusion: ' ',
        ModuleDescription: 'Systems Architecture deals with principles...',
        Department: 'Industrial Systems Eng & Mgmt',
        Faculty: 'Engineering',
        ModuleTitle: 'SYSTEMS ARCHITECTURE',
        Workload: '3-0-0-5-2',
        ModuleCredit: '4',
        ModuleCode: 'SDM5001',
      }),
    ).not.toHaveProperty('Preclusion');

    expect(
      cleanModuleInfo({
        AcadYear: '2018/2019',
        ModuleDescription: 'This module will introduce the history...',
        Department: "FoL Dean's Office",
        Faculty: 'Law',
        ModuleTitle: 'Singapore Law in Context',
        Workload: '3-0-0-0-7',
        Prerequisite: 'Nil.',
        ModuleCredit: '4',
        ModuleCode: 'LC1015',
      }),
    ).not.toHaveProperty('Prerequisite');

    const cleanedYID3216 = cleanModuleInfo({
      AcadYear: '2018/2019',
      Preclusion: 'None.',
      ModuleDescription: 'Asia is known for its fast-paced economic growth...',
      Department: 'Yale-NUS College',
      Faculty: 'Yale-NUS College',
      ModuleTitle: 'Environment, Development and Mobilisation in Asia',
      Workload: '0-3-0-3-6.5',
      Prerequisite:
        'YID1201 Introduction to Environmental Studies or with the permission of the instructor.',
      Corequisite: 'None.',
      ModuleCredit: '5',
      ModuleCode: 'YID3216',
    });

    expect(cleanedYID3216).not.toHaveProperty('Preclusion');
    expect(cleanedYID3216).not.toHaveProperty('Corequisite');
  });

  test('should title case all caps titles', () => {
    expect(
      cleanModuleInfo({
        AcadYear: '2018/2019',
        Preclusion: ' ',
        ModuleDescription: 'The objective is to expose students to the...',
        Department: 'Mechanical Engineering',
        Faculty: 'Engineering',
        ModuleTitle: 'FRACTURE AND FATIGUE OF MATERIALS',
        ModuleCredit: '4',
        ModuleCode: 'ME5513',
      }),
    ).toHaveProperty('ModuleTitle', 'Fracture and Fatigue of Materials');

    expect(
      cleanModuleInfo({
        AcadYear: '2018/2019',
        ModuleTitle: 'GRADUATE SEMINAR MODULE IN BIOLOGICAL SCIENCES',
        Corequisite: 'NIL',
        ModuleCode: 'BL5198',
        ModuleDescription: 'This is a required module for all research Masters and PhD...',
        ModuleCredit: '4',
        Prerequisite: 'Basic knowledge in life sciences',
        Department: 'Life Sciences',
        Faculty: 'Science',
      }),
    ).toHaveProperty('ModuleTitle', 'Graduate Seminar Module in Biological Sciences');
  });

  test('should trim titles and other fields with whitespace characters', () => {
    expect(
      cleanModuleInfo({
        AcadYear: '2018/2019',
        ModuleDescription: 'The module covers the foundational knowledge of the sound...',
        ModuleTitle: ' Phonetics and Phonology',
        Department: 'English Language and Literature',
        Faculty: 'Arts and Social Science',
        Prerequisite:
          'Must be registered as a Graduate student in the university or with the approval of the Department.  ',
        ModuleCredit: '4',
        ModuleCode: 'EL5102',
      }),
    ).toEqual({
      AcadYear: '2018/2019',
      ModuleDescription: 'The module covers the foundational knowledge of the sound...',
      ModuleTitle: 'Phonetics and Phonology',
      Department: 'English Language and Literature',
      Faculty: 'Arts and Social Science',
      Prerequisite:
        'Must be registered as a Graduate student in the university or with the approval of the Department.',
      ModuleCredit: '4',
      ModuleCode: 'EL5102',
    });
  });
});

describe(parseWorkload, () => {
  test('should be able to handle well formed strings', () => {
    expect(parseWorkload('2-1-0-8-2')).toEqual([2, 1, 0, 8, 2]);
    expect(parseWorkload('2-1-1-3-3')).toEqual([2, 1, 1, 3, 3]);
  });

  test('should parse decimal workloads', () => {
    expect(parseWorkload('2.5-0.5-0-3-4')).toEqual([2.5, 0.5, 0, 3, 4]);

    expect(parseWorkload('0-1-0-0-0.25')).toEqual([0, 1, 0, 0, 0.25]);

    expect(parseWorkload('0.0-0.0-0.0-20.0-0.0')).toEqual([0, 0, 0, 20, 0]);
  });

  test('should handle unusual workload strings', () => {
    // Extract all workload strings using jq
    // cat moduleInformation.json | jq '.[] | [.ModuleCode, .Workload] | join(": ")'

    // HY5660 / HY6660
    expect(parseWorkload('NA-NA-NA-NA-10')).toEqual([0, 0, 0, 0, 10]);

    // MKT3402A/B
    expect(parseWorkload('3-0-0-5-3 (tentative)')).toEqual([3, 0, 0, 5, 3]);

    expect(parseWorkload('3(sectional)-0-0-4-3')).toEqual([3, 0, 0, 4, 3]);
  });

  test('parseWorkload should return input string as is if it cannot be parsed', () => {
    const invalidInputs = [
      '',
      '\n',
      '2-2-2-2-3-4', // CE1101 (six components)
      '2-4-5-4', // CE1102 (four components)
      'approximately 120 hours of independent study and research and consultation with a NUS lecturer.',
      'Varies depending on individual student with their supervisor',
      '16 weeks of industrial attachment',
      'See remarks',
      'Lectures: 450 hours, Clinics: 3150 hours, Seminars/Tutorial: 450 hours,Technique/Practical: 450 hou',
    ];

    invalidInputs.forEach((input) => {
      expect(parseWorkload(input)).toEqual(input);
    });
  });
});
