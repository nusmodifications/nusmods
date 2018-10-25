// @flow

import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter, Link } from 'react-router-dom';

import type { Module, ModuleCode } from 'types/modules';

import cs1010s from '__mocks__/modules/CS1010S.json';
import cs3216 from '__mocks__/modules/CS3216.json';
import { ModuleExamClashComponent } from './ModuleExamClash';

describe(ModuleExamClashComponent, () => {
  const MODULES = [cs1010s, cs3216];

  function make(moduleCode: ModuleCode, examDate: ?string, modules: Module[] = MODULES) {
    return mount(
      <MemoryRouter>
        <ModuleExamClashComponent
          moduleCode={moduleCode}
          modules={modules}
          examDate={examDate}
          semester={1}
        />
      </MemoryRouter>,
    );
  }

  test('should return nothing if there are no existing modules', () => {
    const component = make('CS1010S', '2016-11-23T09:00+0800', []);
    expect(component.html()).toBeNull();
  });

  test('should return nothing if the current module has no exams', () => {
    const component = make('CS3217', null);
    expect(component.html()).toBeNull();
  });

  test('should return nothing if there are no clashes', () => {
    const component = make('CS2107', '2016-11-23T13:00+0800');
    expect(component.html()).toBeNull();
  });

  test('should ignore modules that are already on the timetable', () => {
    const component = make('CS1010S', '2016-11-23T09:00+0800');
    expect(component.html()).toBeNull();
  });

  test('should return all conflicting modules', () => {
    const component = make('CS1010E', '2017-11-29T17:00+0800');
    const link = component.find(Link);
    expect(link).toHaveLength(1);
    expect(link.text()).toMatch('CS1010S');
    expect(link.prop('to')).toMatch('CS1010S');
  });
});
