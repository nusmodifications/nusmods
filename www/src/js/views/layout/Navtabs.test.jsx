// @flow

import React from 'react';
import { shallow } from 'enzyme';

import { NavtabsComponent } from './Navtabs';

test('renders into nav element', () => {
  const navtabs = shallow(<NavtabsComponent activeSemester={1} />);
  expect(navtabs).toMatchSnapshot();
});
