import { shallow, mount } from 'enzyme';

/* @var {Module} */
import CS1010S from '__mocks__/modules/CS1010S.json';

import { Module } from 'types/modules';
import { DisconnectedModuleTombstone, Props } from './ModuleTombstone';

describe(DisconnectedModuleTombstone, () => {
  let mockProps: jest.Mocked<Props>;

  beforeEach(() => {
    mockProps = {
      module: CS1010S as unknown as Module,
      resetTombstone: jest.fn(),
      undo: jest.fn(),
    } as any;
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
    const dismissBtn = wrapper
      .find('button')
      .filterWhere((e) => Boolean(e.text().match(/dismiss/i)));
    dismissBtn.simulate('click');
    expect(mockProps.resetTombstone.mock.calls.length).toEqual(1);
  });
});
