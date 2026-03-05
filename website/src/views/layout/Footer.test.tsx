import { shallow } from 'enzyme';

import { FooterComponent } from 'views/layout/Footer';

test('is a footer element', () => {
  const actual = shallow(<FooterComponent toggleFeedback={vi.fn()} lastUpdatedDate={null} />);
  expect(actual.type()).toBe('footer');
});
