import React from 'react';
import { mount } from 'enzyme';
import { SearchkitManager } from 'searchkit';

import CheckboxItemFilter from './CheckboxItemFilter';

describe(CheckboxItemFilter, () => {
  let mockSearchkit: SearchkitManager;

  beforeEach(() => {
    mockSearchkit = SearchkitManager.mock();
  });

  it('renders', () => {
    const wrapper = mount(
      <CheckboxItemFilter
        searchkit={mockSearchkit}
        label="Test Checkbox"
        filter={{
          // eslint-disable-next-line camelcase
          match_all: {},
        }}
        id="test-id"
        disabled={false}
        showCount
      />,
    );

    const checkboxInputs = wrapper.find('input[type="checkbox"]');
    expect(checkboxInputs).toHaveLength(1);
    expect(checkboxInputs.at(0).prop('checked')).toBeFalsy();
    expect(wrapper.text()).toMatch('Test Checkbox');
  });
});
