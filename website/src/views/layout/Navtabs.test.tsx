import { shallow } from 'enzyme';

import createHistory from 'test-utils/createHistory';
import { NavtabsComponent } from './Navtabs';

describe(NavtabsComponent, () => {
  test('renders into nav element', () => {
    const navtabs = shallow(
      <NavtabsComponent activeSemester={1} beta={false} {...createHistory()} />,
    );
    expect(navtabs).toMatchSnapshot();
  });
});
