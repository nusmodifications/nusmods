// @flow

import React from 'react';
import { shallow } from 'enzyme';
import HeaderDate from './HeaderDate';

describe(HeaderDate, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render title as today if offset is zero', () => {
    const wrapper = shallow(<HeaderDate offset={0}>{today}</HeaderDate>);
    expect(wrapper.text()).toMatch('Today');
  });

  test('render title as tomorrow if offset is one', () => {
    const wrapper = shallow(<HeaderDate offset={1}>{today}</HeaderDate>);
    expect(wrapper.text()).toMatch('Tomorrow');
  });

  test('render date as day of week if offset more than one', () => {
    expect(shallow(<HeaderDate offset={2}>{today}</HeaderDate>)).toMatchSnapshot();
    expect(shallow(<HeaderDate offset={3}>{today}</HeaderDate>)).toMatchSnapshot();
  });
});
