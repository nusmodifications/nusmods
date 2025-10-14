import { shallow } from 'enzyme';

import SemesterSwitcher from './SemesterSwitcher';

describe('<SemesterSwitcher />', () => {
  test('simulates click events', () => {
    const onButtonClick = jest.fn();
    const wrapper = shallow(<SemesterSwitcher semester={2} onSelectSemester={onButtonClick} />);
    const buttons = wrapper.find('button');
    buttons.at(0).simulate('click');
    expect(onButtonClick).toHaveBeenCalledWith(1);
    buttons.at(1).simulate('click');
    expect(onButtonClick).toHaveBeenCalledWith(3);
  });

  describe('semester switching buttons are disabled appropriately', () => {
    test('left button', () => {
      const onButtonClick = jest.fn();
      const wrapper = shallow(<SemesterSwitcher semester={1} onSelectSemester={onButtonClick} />);
      const buttons = wrapper.find('button');
      buttons.at(0).simulate('click');
      expect(onButtonClick).not.toHaveBeenCalled();
      buttons.at(1).simulate('click');
      expect(onButtonClick).toHaveBeenCalledWith(2);
    });

    test('right button', () => {
      const onButtonClick = jest.fn();
      const wrapper = shallow(<SemesterSwitcher semester={4} onSelectSemester={onButtonClick} />);
      const buttons = wrapper.find('button');
      buttons.at(1).simulate('click');
      expect(onButtonClick).not.toHaveBeenCalled();
      buttons.at(0).simulate('click');
      expect(onButtonClick).toHaveBeenCalledWith(3);
    });
  });
});
