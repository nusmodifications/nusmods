import { insertRequisiteTree, PrereqTreeMap } from './index';
import { Module, ModuleCode } from '../../types/modules';

describe(insertRequisiteTree, () => {
  const makeModules = (...moduleCodes: ModuleCode[]): Module[] =>
    moduleCodes.map(
      (moduleCode) =>
        ({
          moduleCode,
        } as any),
    );

  test('should insert prereq tree and fulfilled requirements', () => {
    const prereqs: PrereqTreeMap = {
      CS3216: 'CS2103',
      CS2103: 'CS1010',
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
