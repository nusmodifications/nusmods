import * as React from 'react';
import { render } from 'enzyme';

import ModuleTree, { incrementLayer } from './ModuleTree';

jest.mock('views/components/LinkModuleCodes', () => 'mockedlink');

describe('<ModuleTree>', () => {
  test('should render prereq tree of module', () => {
    const mod = {
      ModmavenTree: { name: 'ACC1002', children: [] },
      LockedModules: [
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
      ],
    };
    // @ts-ignore TODO: Fix this when we move to scraper v2
    const component = render(<ModuleTree module={mod} />);
    expect(component).toMatchSnapshot('ACC1002');
  });

  test('should render prereq tree of module', () => {
    const mod = {
      ModmavenTree: {
        name: 'CS3244',
        children: [
          {
            name: 'and',
            children: [
              [
                {
                  name: 'or',
                  children: [
                    { name: 'CS2010', children: [] },
                    { name: 'CS2020', children: [] },
                    { name: 'CS2040', children: [] },
                    { name: 'CS2040C', children: [] },
                  ],
                },
              ],
              [
                {
                  name: 'or',
                  children: [
                    { name: 'ESP1107', children: [] },
                    { name: 'ESP2107', children: [] },
                    { name: 'ST1232', children: [] },
                    { name: 'ST2131', children: [] },
                    { name: 'ST2132', children: [] },
                    { name: 'ST2334', children: [] },
                  ],
                },
              ],
              [
                {
                  name: 'or',
                  children: [
                    { name: 'MA1101R', children: [] },
                    { name: 'MA1311', children: [] },
                    { name: 'MA1506', children: [] },
                  ],
                },
              ],
              [
                {
                  name: 'or',
                  children: [
                    { name: 'MA1102R', children: [] },
                    { name: 'MA1505', children: [] },
                    { name: 'MA1521', children: [] },
                  ],
                },
              ],
            ],
          },
        ],
      },
      LockedModules: ['CS5242', 'CS5339', 'CS6281'],
    };
    // @ts-ignore TODO: Fix this when we move to scraper v2
    const component = render(<ModuleTree module={mod} />);
    expect(component).toMatchSnapshot('CS3244');
  });
});

describe('incrementLayer to mod when exceed number mods', () => {
  expect(incrementLayer(7, 'MOD')).toBe(0);
});
