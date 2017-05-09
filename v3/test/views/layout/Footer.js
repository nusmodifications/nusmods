import test from 'ava';
import React from 'react';
import { shallow } from 'enzyme';
import Footer from 'views/layout/Footer';

test('is a footer element', (t) => {
  const actual = shallow(<Footer />);
  t.is(actual.type(), 'footer');
});

// check for noopener noreferrer if target_blank was used
// see: https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
test('contains guards against target_blank', (t) => {
  const footer = shallow(<Footer />);
  const links = footer.find('a');
  let result = true;
  links.forEach((a) => {
    if (result && a.prop('target') === '_blank') {
      result = a.prop('rel') === 'noopener noreferrer';
    }
  });
  t.true(result);
});
