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
        ModuleDescription:
          'Systems Architecture deals with principles of implementation and evaluation of complex systems. Developing architecture is the most abstract function in system/product development. The course examines various notions of systems architecting (including aspects of organizational and information architecture) and offers principles and tools for its development. A wide variety of real-world case studies (including examples of transportation, utility, electronic, mechanical, enterprise, traditional information and document management systems, etc.) will be drawn upon. The course addresses issues such as dealing with legacy and change, enterprise-wide interoperability as well as support for knowledge management.',
        Department: 'Industrial Systems Eng & Mgmt',
        ModuleTitle: 'SYSTEMS ARCHITECTURE',
        Workload: '3-0-0-5-2',
        ModuleCredit: '4',
        ModuleCode: 'SDM5001',
      }),
    ).not.toHaveProperty('Preclusion');

    expect(
      cleanModuleInfo({
        AcadYear: '2018/2019',
        ModuleDescription:
          'This module will introduce the history of the common law and Singapore legal institutions (including Islamic law), as well as briefly situate Singapore’s law and institutions in relation to other approaches, notably the civil law approach adopted in most Asian jurisdictions. The module may be complemented by\nfield trips to court, a prison, and/or parliament. It should also include an examination of ADR mechanisms in Singapore and an introduction to professional ethics.',
        Department: "FoL Dean's Office",
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
      ModuleDescription:
        'Asia is known for its fast-paced economic growth and dramatic scenes of environmental devastation. This course explores societal perception, anxiety, and action in response to environmental change and economic development in the region. How do some communities resist environmentally controversial development projects, and why do others embrace these projects? How do non-governmental organisations bridge “Western” ideas about environmental human rights with their own cultural traditions? And how have experts, artists, and businesses joined the action? We explore these questions through historical and contemporary case studies that illuminate the ongoing debate about economic development versus environmental sustainability in Asia.',
      Department: 'Yale-NUS College',
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

  test('should titlecase all caps titles', () => {
    expect(
      cleanModuleInfo({
        AcadYear: '2018/2019',
        Preclusion: ' ',
        ModuleDescription:
          'The objective is to expose students to the various methods to tackle practical problems related to fracture and fatigue of materials so that they can apply them to real situations. Particular emphasis is placed on fracture and fatigue properties of materials. Major topics include: linear elastic fracture mechanics, fracture mechanics in yielded regime, standard tests for fracture toughness; high and low cycle fatigue, factors affecting fatigue properties of materials, conventional and fracture mechanic fatigue design, fatigue crack propagation, fatigue life prediction and monitoring, fracture and fatigue mechanisms and control. This module is useful for students who see themselves in a career related to service failure analysis and/or materials applications.',
        Department: 'Mechanical Engineering',
        ModuleTitle: 'FRACTURE AND FATIGUE OF MATERIALS',
        ModuleCredit: '4',
        ModuleCode: 'ME5513',
      }),
    ).toHaveProperty('ModuleTitle', 'Fracture and Fatigue of Materials');
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
