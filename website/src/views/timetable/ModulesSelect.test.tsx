import { mount, shallow } from 'enzyme';
import Downshift from 'downshift';
import Modal from 'views/components/Modal';
import { ModulesSelectComponent } from './ModulesSelect';

const modules = [
  {
    moduleCode: 'Test1',
    title: 'ModuleTitle',
    isAdded: false,
    isAdding: false,
  },
  {
    moduleCode: 'Test2',
    title: 'ModuleTitle',
    isAdded: true,
    isAdding: false,
  },
];

const commonProps = {
  getFilteredModules: jest.fn((inputValue) => {
    if (!inputValue) return [];
    return modules.filter((m) => m.moduleCode.includes(inputValue));
  }),
  onChange: jest.fn(),
  moduleCount: 3,
  placeholder: 'test placeholder',
  matchBreakpoint: false,
  disabled: false,
  onRemoveModule: jest.fn(),
};

describe(ModulesSelectComponent, () => {
  it('should show results on input value change', () => {
    const wrapper = mount(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
    wrapper.setState({ isOpen: true });
    const input = wrapper.find('input');
    expect(wrapper.find('li')).toHaveLength(0);
    input.simulate('change', { target: { value: 'T' } });
    expect(wrapper.find('li')).toHaveLength(2);
    input.simulate('change', { target: { value: 'T#' } });
    expect(wrapper.find('li')).toHaveLength(0);
  });

  it('should indicate module is added', () => {
    const wrapper = mount(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
    wrapper.setState({ isOpen: true, inputValue: 'T' });
    const result = wrapper.find('li').at(1);
    expect(result.prop('disabled')).toBe(true);
    expect(result.find('.badge').exists()).toBe(true);
  });

  it('should call onChange when module is selected', () => {
    const wrapper = mount(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
    wrapper.setState({ isOpen: true, inputValue: 'T' });
    wrapper.find('li').first().simulate('click');
    expect(commonProps.onChange).toHaveBeenCalledWith(modules[0].moduleCode);
    // remain open
    expect(wrapper.state('isOpen')).toBe(true);
  });

  describe('when it does not matchBreakpoint', () => {
    it('should render modal', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} />);
      expect(wrapper.find(Modal).exists()).toBeTruthy();
    });

    it('should open modal and downshift when clicked', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} />);
      wrapper.find('button').simulate('click');
      const modal = wrapper.find(Modal);
      const downshift = wrapper.find(Downshift);
      expect(modal.prop('isOpen')).toBe(true);
      expect(downshift.prop('isOpen')).toBe(true);
    });

    it('should not open modal when button is disabled', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} disabled />);
      wrapper.find('button').simulate('click');
      const modal = wrapper.find(Modal).shallow();
      expect(modal.prop('isOpen')).toBe(false);
    });

    it('should show tip when it opens', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} />);
      wrapper.setState({ isOpen: true });
      const downshift = wrapper.find(Downshift).shallow();
      expect(downshift.find('.tip')).toHaveLength(1);
    });

    it('should show tips when there are no results', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} />);
      wrapper.setState({ isOpen: true, inputValue: '%' });
      const downshift = wrapper.find(Downshift).shallow();
      expect(downshift.find('.tip')).toHaveLength(2);
    });
  });

  describe('when it does matchBreakpoint', () => {
    it('should render not modal but downshift instead', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
      expect(wrapper.find(Modal).exists()).toBeFalsy();
      expect(wrapper.find(Downshift).exists()).toBeTruthy();
    });

    it('should toggle menu depending on focus', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
      const downshift = wrapper.find(Downshift).shallow();
      // TODO: Check if this is correct
      downshift.find('input').prop('onFocus')!({} as any);
      expect(wrapper.state('isOpen')).toBe(true);
      wrapper.prop('onOuterClick')();
      expect(wrapper.state('isOpen')).toBe(false);
    });

    it('should not toggle menu when disabled', () => {
      // shallow's simulate just calls onFocus
      const wrapper = mount(<ModulesSelectComponent {...commonProps} matchBreakpoint disabled />);
      const downshift = wrapper.find(Downshift);
      downshift.find('input').simulate('focus');
      expect(downshift.prop('isOpen')).toBe(false);
    });

    it('should show tip when there are no results', () => {
      const wrapper = shallow(<ModulesSelectComponent {...commonProps} matchBreakpoint />);
      wrapper.setState({ isOpen: true, inputValue: '%' });
      const downshift = wrapper.find(Downshift).shallow();
      expect(downshift.find('.tip')).toHaveLength(1);
    });
  });
});
