// @flow

import React from 'react';
import { mount } from 'enzyme';

import FilterGroup from 'utils/filters/FilterGroup';
import { createGroup, createModule } from 'test-utils/filterHelpers';
import { DropdownListFiltersComponent } from './DropdownListFilters';

describe('<DropdownListFilters>', () => {
  const CHECKBOX = '☑';
  const modules = [
    createModule('CS1010S'),
    createModule('CS3216'),
  ];

  function make(
    filterGroup: FilterGroup<*>,
    groups: FilterGroup<any>[] = [filterGroup],
    matchBreakpoint: boolean = true,
  ) {
    const onFilterChange = jest.fn();

    return {
      onFilterChange,

      wrapper: mount(
        <DropdownListFiltersComponent
          onFilterChange={onFilterChange}
          group={filterGroup}
          groups={groups}
          matchBreakpoint={matchBreakpoint}
        />,
      ),
    };
  }

  // TODO: Write some sort of adaptor that reads off both <select> and <Downshift>
  //       to ensure values in both match
  test('use native <select> element on mobile', () => {
    const group = createGroup(modules);
    const { wrapper } = make(group, [group], false);

    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('option')).toHaveLength(3); // One placeholder and two options
  });

  test('change value when <select> value changes', () => {
    const group = createGroup(modules);
    const { wrapper, onFilterChange } = make(group, [group], false);

    wrapper.find('select').simulate('change', { target: { value: 'a' } });
    const [[nextGroup]] = onFilterChange.mock.calls;
    expect(nextGroup).toEqual(group.toggle('a'));

    wrapper.setProps({ group: nextGroup });
    expect(wrapper.find('option').at(1).text()).toMatch(CHECKBOX);
  });
});
