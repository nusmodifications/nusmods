// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { daysAfter } from 'utils/timify';
import EmptyLessonGroup from './EmptyLessonGroup';
import HeaderDate from './HeaderDate';

describe(EmptyLessonGroup, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render one date when one date is specified', () => {
    const wrapper = shallow(<EmptyLessonGroup type="holiday" dates={[today]} offset={0} />);

    expect(wrapper.find(HeaderDate)).toHaveLength(1);
  });

  test('render two dates when more than one date is specified', () => {
    const wrapperOne = shallow(
      <EmptyLessonGroup type="holiday" dates={[today, daysAfter(today, 1)]} offset={0} />,
    );

    const wrapperTwo = shallow(
      <EmptyLessonGroup
        type="holiday"
        dates={[today, daysAfter(today, 1), daysAfter(today, 2)]}
        offset={0}
      />,
    );

    expect(wrapperOne.find(HeaderDate)).toHaveLength(2);
    expect(wrapperTwo.find(HeaderDate)).toHaveLength(2);
  });
});
