import { RawLesson } from '../types/modules';
import { ModuleAttributeEntry } from '../types/api';
import { Logger } from '../services/logger';
import departments from './fixtures/departments.json';
import faculties from './fixtures/faculties.json';
import {
  cleanModuleInfo,
  getDepartmentCodeMap,
  getFacultyCodeMap,
  mapAttributes,
  parseWorkload,
  getLessonCovidZones,
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

describe(getLessonCovidZones, () => {
  test('should collect covid zones from lessons', () => {
    const lessons = [
      { covidZone: 'A' },
      { covidZone: 'A' },
      { covidZone: 'B' },
      { covidZone: 'Unknown' },
    ] as Array<RawLesson>;

    expect(new Set(getLessonCovidZones(lessons))).toEqual(new Set(['A', 'B', 'Unknown']));
  });
});

describe(cleanModuleInfo, () => {
  test('should remove empty string requisite fields', () => {
    expect(
      cleanModuleInfo({
        acadYear: '2018/2019',
        department: 'Industrial Systems Eng & Mgmt',
        description: 'Systems Architecture deals with principles...',
        faculty: 'Engineering',
        moduleCode: 'SDM5001',
        moduleCredit: '4',
        preclusion: ' ',
        title: 'SYSTEMS ARCHITECTURE',
        workload: '3-0-0-5-2',
      }),
    ).not.toHaveProperty('Preclusion');

    expect(
      cleanModuleInfo({
        acadYear: '2018/2019',
        department: "FoL Dean's Office",
        description: 'This module will introduce the history...',
        faculty: 'Law',
        moduleCode: 'LC1015',
        moduleCredit: '4',
        prerequisite: 'Nil.',
        title: 'Singapore Law in Context',
        workload: '3-0-0-0-7',
      }),
    ).not.toHaveProperty('Prerequisite');

    const cleanedYID3216 = cleanModuleInfo({
      acadYear: '2018/2019',
      corequisite: 'None.',
      department: 'Yale-NUS College',
      description: 'Asia is known for its fast-paced economic growth...',
      faculty: 'Yale-NUS College',
      moduleCode: 'YID3216',
      moduleCredit: '5',
      preclusion: 'None.',
      prerequisite:
        'YID1201 Introduction to Environmental Studies or with the permission of the instructor.',
      title: 'Environment, Development and Mobilisation in Asia',
      workload: '0-3-0-3-6.5',
    });

    expect(cleanedYID3216).not.toHaveProperty('Preclusion');
    expect(cleanedYID3216).not.toHaveProperty('Corequisite');
  });

  test('should title case all caps titles', () => {
    expect(
      cleanModuleInfo({
        acadYear: '2018/2019',
        department: 'Mechanical Engineering',
        description: 'The objective is to expose students to the...',
        faculty: 'Engineering',
        moduleCode: 'ME5513',
        moduleCredit: '4',
        preclusion: ' ',
        title: 'FRACTURE AND FATIGUE OF MATERIALS',
      }),
    ).toHaveProperty('title', 'Fracture and Fatigue of Materials');

    expect(
      cleanModuleInfo({
        acadYear: '2018/2019',
        corequisite: 'NIL',
        department: 'Life Sciences',
        description: 'This is a required module for all research Masters and PhD...',
        faculty: 'Science',
        moduleCode: 'BL5198',
        moduleCredit: '4',
        prerequisite: 'Basic knowledge in life sciences',
        title: 'GRADUATE SEMINAR MODULE IN BIOLOGICAL SCIENCES',
      }),
    ).toHaveProperty('title', 'Graduate Seminar Module in Biological Sciences');
  });

  test('should trim titles and other fields with whitespace characters', () => {
    expect(
      cleanModuleInfo({
        acadYear: '2018/2019',
        department: 'English Language and Literature',
        description: 'The module covers the foundational knowledge of the sound...',
        faculty: 'Arts and Social Science',
        moduleCode: 'EL5102',
        moduleCredit: '4',
        prerequisite:
          'Must be registered as a Graduate student in the university or with the approval of the Department.  ',
        title: ' Phonetics and Phonology',
      }),
    ).toEqual({
      acadYear: '2018/2019',
      department: 'English Language and Literature',
      description: 'The module covers the foundational knowledge of the sound...',
      faculty: 'Arts and Social Science',
      moduleCode: 'EL5102',
      moduleCredit: '4',
      prerequisite:
        'Must be registered as a Graduate student in the university or with the approval of the Department.',
      title: 'Phonetics and Phonology',
    });
  });

  test('should preserve already-decoded descriptions', () => {
    expect(
      cleanModuleInfo({
        acadYear: '2020/2021',
        department: 'Philosophy',
        description: 'These concepts pertain to the structure of "ultimate reality"...',
        faculty: 'Arts and Social Science',
        moduleCode: 'PH2213',
        moduleCredit: '4',
        title: 'Metaphysics',
      }),
    ).toHaveProperty(
      'description',
      'These concepts pertain to the structure of "ultimate reality"...',
    );
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

    // EC3343 - uses Unicode hyphen instead of dash
    expect(parseWorkload('2‐1‐0‐2‐5')).toEqual([2, 1, 0, 2, 5]);
  });

  test('parseWorkload should return undefined for empty/null/undefined input', () => {
    expect(parseWorkload('')).toBeUndefined();
    expect(parseWorkload(null)).toBeUndefined();
    expect(parseWorkload(undefined)).toBeUndefined();
  });

  test('parseWorkload should return input string as is if it cannot be parsed', () => {
    const invalidInputs = [
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

describe(mapAttributes, () => {
  const mockLogger: Logger = {
    child: () => mockLogger,
    debug: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    info: vi.fn(),
    trace: vi.fn(),
    warn: vi.fn(),
  };

  function attr(key: string, value: string): ModuleAttributeEntry {
    return { CourseAttribute: key, CourseAttributeValue: value };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return undefined for empty attributes', () => {
    expect(mapAttributes([], mockLogger)).toBeUndefined();
  });

  test('should handle new-format truthy/falsy values', () => {
    expect(mapAttributes([attr('PRQY', 'Yes')], mockLogger)).toEqual({ su: true });
    expect(mapAttributes([attr('PRQY', 'No')], mockLogger)).toBeUndefined();
  });

  test('should handle old-format uppercase truthy/falsy values', () => {
    expect(mapAttributes([attr('PRQY', 'YES')], mockLogger)).toEqual({ su: true });
    expect(mapAttributes([attr('PRQY', 'NO')], mockLogger)).toBeUndefined();
  });

  test('should handle new-format HFYP value', () => {
    expect(mapAttributes([attr('HFYP', 'HT - Honours Thesis/Rsh Project')], mockLogger)).toEqual({
      fyp: true,
    });
  });

  test('should handle old-format HFYP short code', () => {
    expect(mapAttributes([attr('HFYP', 'HT')], mockLogger)).toEqual({ fyp: true });
  });

  test('should handle new-format MPE values', () => {
    expect(mapAttributes([attr('MPE', 'S1 - Sem 1')], mockLogger)).toEqual({ mpes1: true });
    expect(mapAttributes([attr('MPE', 'S2 - Sem 2')], mockLogger)).toEqual({ mpes2: true });
    expect(mapAttributes([attr('MPE', 'S1&S2 - Sem 1 & 2')], mockLogger)).toEqual({
      mpes1: true,
      mpes2: true,
    });
  });

  test('should handle old-format MPE short codes', () => {
    expect(mapAttributes([attr('MPE', 'S1')], mockLogger)).toEqual({ mpes1: true });
    expect(mapAttributes([attr('MPE', 'S2')], mockLogger)).toEqual({ mpes2: true });
    expect(mapAttributes([attr('MPE', 'S1&S2')], mockLogger)).toEqual({
      mpes1: true,
      mpes2: true,
    });
  });

  test('should handle SFS subcategory values', () => {
    expect(mapAttributes([attr('SFS', 'DA - Data Analytics')], mockLogger)).toEqual({ sfs: true });
    expect(mapAttributes([attr('SFS', 'DA')], mockLogger)).toEqual({ sfs: true });
  });

  test('should handle old-format SFS YES value', () => {
    expect(mapAttributes([attr('SFS', 'YES')], mockLogger)).toEqual({ sfs: true });
  });

  test('should handle SFS falsy values', () => {
    expect(mapAttributes([attr('SFS', 'No')], mockLogger)).toBeUndefined();
    expect(mapAttributes([attr('SFS', 'NO')], mockLogger)).toBeUndefined();
  });

  test('should warn on unrecognized attribute values', () => {
    mapAttributes([attr('PRQY', 'UNKNOWN')], mockLogger);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      { key: 'PRQY', value: 'UNKNOWN' },
      'Non-standard course attribute value',
    );
  });

  test('should combine multiple attributes', () => {
    expect(
      mapAttributes([attr('PRQY', 'YES'), attr('YEAR', 'Yes'), attr('MPE', 'S1')], mockLogger),
    ).toEqual({ mpes1: true, su: true, year: true });
  });
});
