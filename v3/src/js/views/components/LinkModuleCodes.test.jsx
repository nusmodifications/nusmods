// @flow
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { entries } from 'lodash';

import type { ModuleCodeMap } from 'types/reducers';

import { LinkModuleCodesComponent } from './LinkModuleCodes';

describe('LinkModuleCodesComponent', () => {
  const testModules = {
    CS3216: {
      ModuleCode: 'CS3216',
      ModuleTitle: 'Software Product Engineering for Digital Markets',
      Semesters: [1],
    },
    CS1010FC: {
      ModuleCode: 'CS1010FC',
      ModuleTitle: 'Programming Methodology',
      Semesters: [3, 2],
    },
    ACC1002: {
      ModuleCode: 'ACC1002',
      ModuleTitle: 'Financial Accounting',
      Semesters: [2, 1],
    },
    BMA5000A: {
      ModuleCode: 'BMA5000A',
      ModuleTitle: 'Managerial Economics',
      Semesters: [2, 1],
    },
    PS1101E: {
      ModuleCode: 'PS1101E',
      ModuleTitle: 'Introduction to Politics',
      Semesters: [2, 1],
    },
    CS1010S: {
      ModuleCode: 'CS1010S',
      ModuleTitle: 'Programming Methodology',
      Semesters: [2, 1],
    },
  };

  function create(content: string, modules: ModuleCodeMap = {}) {
    return mount(
      <MemoryRouter>
        <LinkModuleCodesComponent
          moduleCodes={modules}
        >{ content }</LinkModuleCodesComponent>
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

    const mixedModulesText = 'ACC1002This text has CS 1010S random module coPS1101Edes in it';
    const mixedModules = create(mixedModulesText, testModules);
    expect(mixedModules.text()).toEqual(mixedModulesText);
  });

  test('should check words only', () => {
    const component = create('CS1010FCThis teCS1010FCxt contains module codes in wordsACC1010FC', testModules);
    expect(component.find('Link')).toHaveLength(0);
  });

  test('should ignore modules that are not available', (() => {
    const component = create('CS1010FC, CS1020, ACC1002', {
      ACC1002: {
        ModuleCode: 'ACC1002',
        ModuleTitle: 'Financial Accounting',
        Semesters: [2, 1],
      },
    });

    expect(component.find('Link')).toHaveLength(1);
    const ACC1002 = component.find('Link').at(0);
    expect(ACC1002.text()).toEqual('ACC1002');
  }));
});
