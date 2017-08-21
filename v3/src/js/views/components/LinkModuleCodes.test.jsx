// @flow

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import type { ModuleCode } from 'types/modules';
import { LinkModuleCodesComponent } from './LinkModuleCodes';

describe('LinkModuleCodesComponent', () => {
  function create(content: string, modules: ModuleCode[] = []) {
    return mount(
      <MemoryRouter>
        <LinkModuleCodesComponent moduleCodes={new Set(modules)}>{ content }</LinkModuleCodesComponent>
      </MemoryRouter>,
    );
  }

  test('should convert module codes to links', () => {
    const modules = ['CS1010FC', 'CS1020', 'ACC1000', 'BMA5000A'];
    const component = create('CS1010FC, CS1020, ACC1000, BMA 5000A', modules);
    const links = component.find('Link');
    expect(links).toHaveLength(4);

    links.forEach((a, index) => {
      expect(a.text().replace(' ', '')).toEqual(modules[index]);
      expect(a.prop('to')).toContain(modules[index]);
    });
  });

  test('should keep text unchanged', () => {
    const noModulesText = 'This text does not contain module codes';
    const noModules = create(noModulesText);
    expect(noModules.text()).toEqual(noModulesText);

    const mixedModulesText = 'LSM1000This text has CS 1010S random module coPS1101Edes in it';
    const mixedModules = create(mixedModulesText,
      ['LSM1000', 'CS1010S', 'PS1101E']);
    expect(mixedModules.text()).toEqual(mixedModulesText);
  });

  test('should check words only', () => {
    const component = create('ACC1010FCThis teACC1010FCxt contains module codes in wordsACC1010FC',
      ['ACC1010FC']);
    expect(component.find('Link')).toHaveLength(0);
  });

  test('should ignore modules that are not available', (() => {
    const component = create('CS1010FC, CS1020, ACC1000', ['ACC1000']);
    expect(component.find('Link')).toHaveLength(1);
    const acc1000 = component.find('Link').at(0);
    expect(acc1000.text()).toEqual('ACC1000');
  }));
});
