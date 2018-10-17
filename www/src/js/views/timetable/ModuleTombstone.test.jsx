import React from 'react';
import { shallow, mount } from 'enzyme';
import { DisconnectedModuleTombstone } from './ModuleTombstone';

describe('<DisconnectedModuleTombstone />', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      tombstone: {
        moduleCode: 'CS2113T',
        semester: 1,
      },
      horizontalOrientation: false,
      resetTombstone: jest.fn(),
    };
  });

  it('renders', () => {
    const wrapper = shallow(<DisconnectedModuleTombstone {...mockProps} />);
    expect(wrapper.exists()).toEqual(true);
  });

  it('should receive passed down props', () => {
    const wrapper = mount(<DisconnectedModuleTombstone {...mockProps} />);
    expect(wrapper.props()).toEqual(mockProps);
  });

  it('should display the module code', () => {
    const wrapper = shallow(<DisconnectedModuleTombstone {...mockProps} />);
    const tombstoneText = wrapper.find('span');
    expect(tombstoneText.text()).toEqual(`Removed ${mockProps.tombstone.moduleCode}`);
  });

  it('should call resetTombstone when Dismiss is clicked', () => {
    const wrapper = mount(<DisconnectedModuleTombstone {...mockProps} />);
    const dismissBtn = wrapper.find('button[title="Dismiss"]');
    dismissBtn.simulate('click');
    expect(mockProps.resetTombstone.mock.calls.length).toEqual(1);
  });
});
