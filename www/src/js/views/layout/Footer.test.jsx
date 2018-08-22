// @flow

import React from 'react';
import { shallow } from 'enzyme';

import { FooterComponent } from 'views/layout/Footer';

test('is a footer element', () => {
  const actual = shallow(
    <FooterComponent
      lastUpdatedDate={null}
      toggleFeedback={jest.fn()}
      toggleLoginDialog={jest.fn()}
    />,
  );
  expect(actual.type()).toBe('footer');
});
