import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { entries } from 'lodash';

import { ModuleCodeMap } from 'types/reducers';
import { getModuleCondensed } from 'selectors/moduleBank';

import { ModuleCondensed } from 'types/modules';
import { LinkModuleCodesComponent } from './LinkModuleCodes';

describe(LinkModuleCodesComponent, () => {
  const testModules: { [moduleCode: string]: ModuleCondensed } = {
    CS3216: {
      moduleCode: 'CS3216',
      title: 'Software Product Engineering for Digital Markets',
      semesters: [1],
    },
    CS1010FC: {
      moduleCode: 'CS1010FC',
      title: 'Programming Methodology',
      semesters: [3, 2],
    },
    ACC1002: {
      moduleCode: 'ACC1002',
      title: 'Financial Accounting',
      semesters: [2, 1],
    },
    BMA5000A: {
      moduleCode: 'BMA5000A',
      title: 'Managerial Economics',
      semesters: [2, 1],
    },
    PS1101E: {
      moduleCode: 'PS1101E',
      title: 'Introduction to Politics',
      semesters: [2, 1],
    },
    CS1010S: {
      moduleCode: 'CS1010S',
      title: 'Programming Methodology',
      semesters: [2, 1],
    },
  };

  function create(content: string, moduleCodes: ModuleCodeMap = {}) {
    const getModule = getModuleCondensed({
      moduleCodes,
    } as any);

    return mount(
      <MemoryRouter>
        <LinkModuleCodesComponent getModuleCondensed={getModule}>
          {content}
        </LinkModuleCodesComponent>
      </MemoryRouter>,
    );
  }

  test('should convert module codes to links', () => {
    const component = create('CS3216, CS1010FC, ACC1002, BMA 5000A', testModules);
    const links = component.find('Link');
    expect(links).toHaveLength(4);

    const moduleEntries = entries(testModules);
    links.forEach((a, index) => {
      const [code] = moduleEntries[index];
      expect(a.text().replace(' ', '')).toEqual(code);
      expect(a.prop('to')).toContain(code);
    });
  });

  test('should keep text unchanged', () => {
    const noModulesText = 'This text does not contain module codes';
    const noModules = create(noModulesText, testModules);
    expect(noModules.text()).toEqual(noModulesText);

    const mixedModulesText = 'ACC1002This text has CS-1010S random module coPS1101Edes in it';
    const mixedModules = create(mixedModulesText, testModules);
    expect(mixedModules.text()).toEqual(mixedModulesText);
  });

  test('should check words only', () => {
    const component = create(
      'CS1010FCThis teCS1010FCxt contains module codes in wordsACC1010FC',
      testModules,
    );
    expect(component.find('Link')).toHaveLength(0);
  });

  test('should ignore modules that are not available', () => {
    const component = create('CS1010FC, CS1020, ACC1002', {
      ACC1002: {
        moduleCode: 'ACC1002',
        title: 'Financial Accounting',
        semesters: [2, 1],
      },
    });

    expect(component.find('Link')).toHaveLength(1);
    const ACC1002 = component.find('Link').at(0);
    expect(ACC1002.text()).toEqual('ACC1002');
  });
});
