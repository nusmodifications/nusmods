import { shallow } from 'enzyme';

import { FooterComponent } from 'views/layout/Footer';

test('is a footer element', () => {
  const actual = shallow(<FooterComponent toggleFeedback={jest.fn()} lastUpdatedDate={null} />);
  expect(actual.type()).toBe('footer');
});
