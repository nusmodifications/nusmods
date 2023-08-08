import { mount, shallow } from 'enzyme';
import { mockWindowMatchMedia, mockDomReset } from 'test-utils/mockDom';
import Downshift from 'downshift';
import Modal from 'views/components/Modal';
import ModulesSelect from './ModulesSelect';

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
  disabled: false,
  onRemoveModule: jest.fn(),
};

describe(ModulesSelect, () => {
  beforeAll(() => {
    mockWindowMatchMedia({ matches: true });
  });

  afterAll(() => {
    mockDomReset();
  });

  it('should show results on input value change', () => {
    const wrapper = mount(<ModulesSelect {...commonProps} />);
    const input = wrapper.find('input');
    input.simulate('focus');
    expect(wrapper.find('li')).toHaveLength(0);
    input.simulate('change', { target: { value: 'T' } });
    expect(wrapper.find('li')).toHaveLength(2);
    input.simulate('change', { target: { value: 'T#' } });
    expect(wrapper.find('li')).toHaveLength(0);
  });

  it('should indicate module is added', () => {
    const wrapper = mount(<ModulesSelect {...commonProps} />);
    const input = wrapper.find('input');
    input.simulate('focus');
    input.simulate('change', { target: { value: 'T' } });
    const result = wrapper.find('li').at(1);
    expect(result.prop('disabled')).toBe(true);
    expect(result.find('.badge').exists()).toBe(true);
  });

  it('should call onChange when module is selected', () => {
    const wrapper = mount(<ModulesSelect {...commonProps} />);
    const input = wrapper.find('input');
    input.simulate('focus');
    input.simulate('change', { target: { value: 'T' } });
    wrapper.find('li').first().simulate('click');
    expect(commonProps.onChange).toHaveBeenCalledWith(modules[0].moduleCode);
    // remain open
    const downShift = wrapper.find(Downshift);
    expect(downShift.prop('isOpen')).toBe(true);
  });

  describe('when it does not matchBreakpoint', () => {
    beforeAll(() => {
      mockWindowMatchMedia({ matches: false });
    });

    it('should render modal', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} />);
      expect(wrapper.find(Modal).exists()).toBeTruthy();
    });

    it('should open modal and downshift when clicked', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} />);
      wrapper.find('button').simulate('click');
      const modal = wrapper.find(Modal);
      const downshift = wrapper.find(Downshift);
      expect(modal.prop('isOpen')).toBe(true);
      expect(downshift.prop('isOpen')).toBe(true);
    });

    it('should not open modal when button is disabled', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} disabled />);
      wrapper.find('button').simulate('click');
      const modal = wrapper.find(Modal).shallow();
      expect(modal.prop('isOpen')).toBe(false);
    });

    it('should show tip when it opens', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} />);
      wrapper.find('button').simulate('click');
      const downshift = wrapper.find(Downshift).shallow();
      expect(downshift.find('.tip')).toHaveLength(1);
    });

    it('should show tips when there are no results', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} />);
      wrapper.find('button').simulate('click');
      const input = wrapper.find(Downshift).shallow().find('input');
      input.simulate('focus');
      input.simulate('change', { target: { value: '%' } });
      const downshift = wrapper.find(Downshift).shallow();
      expect(downshift.find('.tip')).toHaveLength(2);
    });
  });

  describe('when it does matchBreakpoint', () => {
    beforeAll(() => {
      mockWindowMatchMedia({ matches: true });
    });

    it('should render not modal but downshift instead', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} />);
      expect(wrapper.find(Modal).exists()).toBeFalsy();
      expect(wrapper.find(Downshift).exists()).toBeTruthy();
    });

    it('should toggle menu depending on focus', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} />);
      const downshift = wrapper.find(Downshift).shallow();
      // TODO: Check if this is correct
      downshift.find('input').prop('onFocus')!({} as any);
      expect(wrapper.find(Downshift).prop('isOpen')).toBe(true);
      wrapper.prop('onOuterClick')();
      expect(wrapper.find(Downshift).prop('isOpen')).toBe(false);
    });
    it('should not toggle menu when disabled', () => {
      // shallow's simulate just calls onFocus
      const wrapper = mount(<ModulesSelect {...commonProps} disabled />);
      const downshift = wrapper.find(Downshift);
      downshift.find('input').simulate('focus');
      expect(downshift.prop('isOpen')).toBe(false);
    });

    it('should show tip when there are no results', () => {
      const wrapper = shallow(<ModulesSelect {...commonProps} />);
      const input = wrapper.find(Downshift).shallow().find('input');
      input.simulate('focus');
      input.simulate('change', { target: { value: '%' } });
      const downshift = wrapper.find(Downshift).shallow();
      expect(downshift.find('.tip')).toHaveLength(1);
    });
  });
});
