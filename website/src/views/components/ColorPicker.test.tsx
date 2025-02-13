import { mount, ReactWrapper } from 'enzyme';
import ColorPicker from 'views/components/ColorPicker';
import { ColorIndex } from 'types/timetables';
import { expectColor } from 'test-utils/theme';

import styles from './ColorPicker.scss';

function makeColorPicker(color: ColorIndex = 0) {
  const onChooseColor = jest.fn();
  return {
    onChooseColor,
    wrapper: mount(
      <ColorPicker
        label=""
        color={color}
        onChooseColor={onChooseColor}
        isHidden={false}
        isTa={false}
      />,
    ),
  };
}

function findPopup(wrapper: ReactWrapper) {
  return wrapper.find(`.${styles.palette}`);
}

function isPopupClosed(wrapper: ReactWrapper) {
  return findPopup(wrapper).hasClass('isClosed');
}

test('should show current color in button', () => {
  const { wrapper } = makeColorPicker(2);

  expectColor(wrapper.find('button').first(), 2);
  wrapper.setProps({ color: 0 });
  expectColor(wrapper.find('button').first(), 0);
});

test('should have popup element in DOM even when closed', () => {
  const { wrapper } = makeColorPicker();
  // Popup element should exist even if button is not clicked.
  expect(findPopup(wrapper).exists()).toBe(true);

  // Popup element should exist when open.
  wrapper.find('button').first().simulate('click');
  expect(findPopup(wrapper).exists()).toBe(true);

  // Popup element should exist after being closed.
  wrapper.find('button').first().simulate('click');
  expect(findPopup(wrapper).exists()).toBe(true);
});

test('should open ColorPicker when the colored box is selected', () => {
  const { wrapper } = makeColorPicker();

  // Sanity check; ensure that picker is closed before click
  expect(isPopupClosed(wrapper)).toBe(true);

  wrapper.find('button').first().simulate('click');
  expect(isPopupClosed(wrapper)).toBe(false);
});

test('should return the color index of the selected color', () => {
  const { wrapper, onChooseColor } = makeColorPicker();

  // Expect 1 call to onChooseColor
  findPopup(wrapper).find('button').at(1).simulate('click');
  expect(onChooseColor).toHaveBeenCalled();
  expect(onChooseColor).toHaveBeenCalledWith(1);

  onChooseColor.mockClear();

  // Choosing the already selected color should not trigger another call to
  // onChooseColor.
  findPopup(wrapper).find('button').at(1).simulate('click');
  expect(onChooseColor).not.toHaveBeenCalled();
});

test('should allow a falsy color index to be selected', () => {
  const { wrapper, onChooseColor } = makeColorPicker(1);
  findPopup(wrapper).find('button').first().simulate('click');
  expect(onChooseColor).toHaveBeenCalledWith(0);
});


test('should set color to transparent when clicking already selected color', () => {
  const { wrapper, onChooseColor } = makeColorPicker(1);
  findPopup(wrapper).find('button').at(1).simulate('click');
  expect(onChooseColor).toHaveBeenCalledWith(-1);
});
