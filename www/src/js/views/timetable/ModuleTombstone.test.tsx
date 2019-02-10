import React from 'react';
import { shallow, mount } from 'enzyme';

/* @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';

import { DisconnectedModuleTombstone } from './ModuleTombstone';

describe(DisconnectedModuleTombstone, () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      module: CS1010S,
      horizontalOrientation: false,
      resetTombstone: jest.fn(),
    };
  });

  it('renders', () => {
    const wrapper = shallow(<DisconnectedModuleTombstone {...mockProps} />);
    expect(wrapper.exists()).toEqual(true);
  });

  it('should display the module code', () => {
    const wrapper = shallow(<DisconnectedModuleTombstone {...mockProps} />);
    const tombstoneText = wrapper.find('span');
    expect(tombstoneText.text()).toEqual(`CS1010S removed`);
  });

  it('should call resetTombstone when Dismiss is clicked', () => {
    const wrapper = mount(<DisconnectedModuleTombstone {...mockProps} />);
    const dismissBtn = wrapper.find('button').filterWhere((e) => e.text().match(/dismiss/i));
    dismissBtn.simulate('click');
    expect(mockProps.resetTombstone.mock.calls.length).toEqual(1);
  });
});
