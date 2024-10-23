import { render } from 'enzyme';

import { getModuleCondensed } from 'selectors/moduleBank';
import { ModuleCondensed } from 'types/modules';
import { ModuleTreeComponent } from './ModuleTree';

jest.mock('views/components/LinkModuleCodes', () => 'mockedlink');

describe(ModuleTreeComponent, () => {
  test('should render requirements fulfilled tree of module', () => {
    const component = render(
      <ModuleTreeComponent
        moduleCode="ACC1002"
        getModuleCondensed={getModuleCondensed({ moduleBank: { moduleCodes: {} } } as any)}
        prereqTreeOnLeft
        fulfillRequirements={[
          'ACC1006',
          'ACC2002',
          'ACC3601',
          'ACC3603',
          'ACC3605',
          'ACC3616',
          'FIN2004',
          'FIN2004X',
          'FIN3113',
          'FIN3130',
          'IS5116',
          'ACC3611',
          'FIN3132',
          'FIN4115',
        ]}
      />,
    );

    expect(component).toMatchSnapshot('ACC1002');
  });

  test('should render prereq tree of module', () => {
    const component = render(
      <ModuleTreeComponent
        moduleCode="CS3244"
        getModuleCondensed={getModuleCondensed({ moduleBank: { moduleCodes: {} } } as any)}
        fulfillRequirements={['CS5242', 'CS5339', 'CS6281']}
        prereqTreeOnLeft
        prereqTree={{
          and: [
            {
              or: ['CS2010', 'CS2020', 'CS2040', 'CS2040C'],
            },
            {
              or: ['ESP1107', 'ESP2107', 'ST1232', 'ST2131', 'ST2132', 'ST2334'],
            },
            {
              or: ['MA1101R', 'MA1311', 'MA1506'],
            },
            {
              or: ['MA1102R', 'MA1505', 'MA1521'],
            },
          ],
        }}
      />,
    );

    expect(component).toMatchSnapshot('CS3244');
  });

  test('should render prereq tree to the right when tree direction is set to right', () => {
    const component = render(
      <ModuleTreeComponent
        moduleCode="PC2193"
        getModuleCondensed={getModuleCondensed({ moduleBank: { moduleCodes: {} } } as any)}
        prereqTreeOnLeft={false}
        prereqTree="PC1101"
        fulfillRequirements={['PC3193']}
      />,
    );

    expect(component).toMatchSnapshot('PC2193');
  });

  // Test that modules which are in moduleBank have appropriate colours,
  // and modules that aren't are greyed out

  const testModules: { [moduleCode: string]: ModuleCondensed } = {
    CS2040: {
      moduleCode: 'CS2040',
      title: 'Data Structures and Algorithms',
      semesters: [1, 2],
    },
    CS2030: {
      moduleCode: 'CS2030',
      title: 'Programming Methodology II',
      semesters: [1, 2],
    },
    CS2113T: {
      moduleCode: 'CS2113T',
      title: 'Software Engineering & Object-Oriented Programming',
      semesters: [1, 2],
    },
    CS1020E: {
      moduleCode: 'CS1020E',
      title: 'Data Structures and Algorithms',
      semesters: [1, 2],
    },
    CS6240: {
      moduleCode: 'CS6240',
      title: 'Multimedia Analysis',
      semesters: [2],
    },
  };

  test('should grey out modules that are not in module bank', () => {
    const component = render(
      <ModuleTreeComponent
        moduleCode="CS4243"
        getModuleCondensed={getModuleCondensed({ moduleBank: { moduleCodes: testModules } } as any)}
        fulfillRequirements={['CS6240', 'CS3281', 'CS4243R']}
        prereqTreeOnLeft
        prereqTree={{
          and: [
            {
              or: [
                'CS1020',
                'CS1020E',
                'CS2020',
                {
                  and: [
                    {
                      or: ['CS2030', 'CS2113', 'CS2113T'],
                    },
                    {
                      or: ['CS2040', 'CS2040C'],
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(component).toMatchSnapshot('CS4243');
  });
});
