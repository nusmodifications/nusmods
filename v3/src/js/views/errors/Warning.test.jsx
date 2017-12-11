// @flow
import React from 'react';
import { shallow } from 'enzyme';
import Warning from './Warning';

test('it displays warning triangle and message', () => {
  const wrapper = shallow(<Warning message="message" />);
  expect(wrapper.find('AlertTriangle')).toHaveLength(1);
  expect(wrapper.find('h4')).toHaveLength(1);
  expect(wrapper.find('h4').first().text()).toBe('message');
});
