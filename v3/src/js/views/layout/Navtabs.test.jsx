import React from 'react';
import { shallow } from 'enzyme';

import Navtabs from './Navtabs';

test('renders into nav element', () => {
  const navtabs = shallow(<Navtabs />);
  expect(navtabs).toMatchSnapshot();
});
