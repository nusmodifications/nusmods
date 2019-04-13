import * as React from 'react';
import { render } from 'enzyme';

import ModuleTree from './ModuleTree';

jest.mock('views/components/LinkModuleCodes', () => 'mockedlink');

describe(ModuleTree, () => {
  test('should render requirements fulfilled tree of module', () => {
    const component = render(
      <ModuleTree
        moduleCode="ACC1002"
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
      <ModuleTree
        moduleCode="CS3244"
        fulfillRequirements={['CS5242', 'CS5339', 'CS6281']}
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
});
