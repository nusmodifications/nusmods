import generatePrereqTree, { insertRequisiteTree, PrereqTreeMap } from './index';
import { Module, ModuleCode } from '../../types/modules';

describe(insertRequisiteTree, () => {
  const makeModules = (...moduleCodes: Array<ModuleCode>): Array<Module> =>
    moduleCodes.map(
      (moduleCode) =>
        ({
          moduleCode,
        }) as any,
    );

  test('should insert prereq tree and fulfilled requirements', () => {
    const prereqs: PrereqTreeMap = {
      CS2103: 'CS1010',
      CS3216: 'CS2103',
    };

    const modules = makeModules('CS1010', 'CS2103', 'CS3216');

    const [CS1010, CS2103, CS3216] = insertRequisiteTree(modules, prereqs);
    expect(CS1010).toHaveProperty('fulfillRequirements', ['CS2103']);
    expect(CS1010).not.toHaveProperty('PrereqTree');

    expect(CS2103).toHaveProperty('fulfillRequirements', ['CS3216']);
    expect(CS2103).toHaveProperty('prereqTree', 'CS1010');

    expect(CS3216).not.toHaveProperty('fulfillRequirements');
    expect(CS3216).toHaveProperty('prereqTree', 'CS2103');
  });

  test('should fulfill prereqs for modules with complex trees', () => {
    const prereqs: PrereqTreeMap = {
      CS3235: {
        and: [
          'CS2105',
          'CS2107',
          {
            or: ['CG2271', 'CS2106'],
          },
        ],
      },
    };

    const modules = makeModules('CS2105', 'CS2107', 'CG2271', 'CS2106');

    for (const module of insertRequisiteTree(modules, prereqs)) {
      expect(module).toHaveProperty('fulfillRequirements', ['CS3235']);
    }
  });
});

describe(generatePrereqTree, () => {
  it('generates the prereq tree of modules with GCE A level prerequisites correctly', async () => {
    const cs3240 = {
      acadYear: '2021/2022',
      department: 'Computer Science',
      description: 'This module aims to expose students to the human-centered principles...',
      faculty: 'Computing',
      moduleCode: 'CS4240',
      moduleCredit: '4',
      prereqTree: {
        and: ['CS3240', 'MA1301'],
      },
      prerequisite: 'CS3240 and (MA1301 or A-level / H2 Mathematics)',
      semesterData: [],
      title: 'Interaction Design for Virtual and Augmented Reality',
      workload: [2, 0, 2, 4, 2],
    };

    const ma2001 = {
      acadYear: '2021/2022',
      department: 'Mathematics',
      description: 'This module is a first course in linear algebra.  Fundamental...',
      faculty: 'Science',
      moduleCode: 'MA2001',
      moduleCredit: '4',
      prereqTree: {
        or: ['MA1301', 'MA1301FC', 'MA1301X'],
      },
      prerequisite:
        'GCE ‘A’ Level or H2 Mathematics or H2 Further Mathematics or MA1301 or MA1301FC or MA1301X',
      semesterData: [],
      title: 'Linear Algebra I',
      workload: [3, 1, 1, 0, 6],
    };

    const modules = [cs3240, ma2001];
    const modulesWithPrereqTree = [
      {
        ...cs3240,
        prereqTree: {
          and: ['CS3240', 'MA1301'],
        },
      },
      {
        ...ma2001,
        prereqTree: {
          or: ['MA1301', 'MA1301FC', 'MA1301X'],
        },
      },
    ];
    expect(await generatePrereqTree(modules)).toStrictEqual(modulesWithPrereqTree);
  });
});
