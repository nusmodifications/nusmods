import * as React from 'react';
import { shallow } from 'enzyme';

import { NavtabsComponent } from './Navtabs';

describe(NavtabsComponent, () => {
  test('renders into nav element', () => {
    const navtabs = shallow(
      <NavtabsComponent activeSemester={1} beta={false} promptRefresh={false} />,
    );
    expect(navtabs).toMatchSnapshot();
  });
});
