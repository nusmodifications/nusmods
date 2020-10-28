import { shallow } from 'enzyme';
import Warning from './Warning';

test('it displays warning message', () => {
  const wrapper = shallow(<Warning message="abcde/ghi123!@#$" />);
  expect(wrapper.find('[children="abcde/ghi123!@#$"]')).toHaveLength(1);
});
