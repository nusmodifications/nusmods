// @flow

import React from 'react';
import { mount } from 'enzyme';
import ColorPicker from 'views/components/ColorPicker';
import type { ColorIndex } from 'types/reducers';
import { expectColor } from 'test-utils/theme';

import styles from './ColorPicker.scss';

function makeColorPicker(color: ColorIndex = 0) {
  const onChooseColor = jest.fn();
  return {
    onChooseColor,
    wrapper: mount(<ColorPicker label="" color={color} onChooseColor={onChooseColor} />),
  };
}

function findPopup(wrapper) {
  return wrapper.find(`.${styles.palette}`);
}

test('should show current color in button', () => {
  const { wrapper } = makeColorPicker(2);

  expectColor(wrapper.find('button'), 2);
  wrapper.setProps({ color: 0 });
  expectColor(wrapper.find('button'), 0);
});

test('should open ColorPicker when the colored box is selected', () => {
  const { wrapper } = makeColorPicker();
  wrapper.find('button').simulate('click');

  expect(findPopup(wrapper).exists()).toBe(true);
});

test('should return the color index of the selected color', () => {
  const { wrapper, onChooseColor } = makeColorPicker();
  wrapper.find('button').simulate('click');
  findPopup(wrapper)
    .find('button')
    .first()
    .simulate('click');

  expect(onChooseColor).toBeCalledWith(0);
});
