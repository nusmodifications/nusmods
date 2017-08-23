import React from 'react';
import { shallow } from 'enzyme';

import Footer from 'views/layout/Footer';

test('is a footer element', () => {
  const actual = shallow(<Footer />);
  expect(actual.type()).toBe('footer');
});

// check for noopener noreferrer if target_blank was used
// see: https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
test('contains guards against target_blank', () => {
  const footer = shallow(<Footer />);
  const links = footer.find('a');
  links.forEach((a) => {
    if (a.prop('target') === '_blank') {
      expect(a.prop('rel')).toEqual('noopener noreferrer');
    }
  });
});
