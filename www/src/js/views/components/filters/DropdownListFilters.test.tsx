// @flow

import React from 'react';
import { mount } from 'enzyme';

import FilterGroup from 'utils/filters/FilterGroup';
import { createGroup, createModule } from 'test-utils/filterHelpers';
import { DropdownListFiltersComponent } from './DropdownListFilters';

describe(DropdownListFiltersComponent, () => {
  const CHECKBOX = '☑';
  const modules = [createModule('CS1010S'), createModule('CS3216')];

  function make(
    filterGroup: FilterGroup<*>,
    groups: FilterGroup<any>[] = [filterGroup],
    matchBreakpoint: boolean = false,
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
    const { wrapper } = make(group, [group], true);

    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('option')).toHaveLength(3); // One placeholder and two options

    expect(wrapper.find('ul.list-unstyled input')).toHaveLength(0);
  });

  test('change value when <select> value changes', () => {
    const group = createGroup(modules);
    const { wrapper, onFilterChange } = make(group, [group], true);

    // Simulate selecting an <option> in the <select>
    wrapper.find('select').simulate('change', { target: { value: 'a' } });
    const [[nextGroup1]] = onFilterChange.mock.calls;
    expect(nextGroup1).toEqual(group.toggle('a'));

    wrapper.setProps({ group: nextGroup1 });

    // Should render the option inside the <select> with a checkmark
    expect(
      wrapper
        .find('option')
        .at(1)
        .text(),
    ).toMatch(CHECKBOX);

    // Should render the item in the checklist outside
    const checklist = wrapper.find('ul.list-unstyled input');
    expect(checklist).toHaveLength(1);
    expect(checklist.at(0).prop('checked')).toBe(true);
  });

  test('render a list of previously selected items outside the <select>', () => {
    const group = createGroup(modules).toggle('a');
    const { wrapper, onFilterChange } = make(group, [group], true);

    // Should render the item in the checklist outside
    const checklist1 = wrapper.find('ul.list-unstyled input');
    expect(checklist1).toHaveLength(1);
    expect(checklist1.at(0).prop('checked')).toBe(true);

    // Simulate unchecking the checkbox on the checklist outside
    checklist1.simulate('change', { target: { value: false } });
    const [[nextGroup1]] = onFilterChange.mock.calls;
    expect(nextGroup1).toEqual(group.toggle('a'));

    wrapper.setProps({ group: nextGroup1 });
    const checklist2 = wrapper.find('ul.list-unstyled input');
    expect(checklist2).toHaveLength(1);
    expect(checklist2.at(0).prop('checked')).toBe(false);
  });
});
