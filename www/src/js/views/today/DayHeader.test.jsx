// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { daysAfter } from 'utils/timify';
import DayHeader from './DayHeader';
import HeaderDate from './HeaderDate';
import styles from './DayHeader.scss';

describe(DayHeader, () => {
  const today = new Date('2016-11-23T09:00+0800');

  test('render one date when one date is specified', () => {
    expect(shallow(<DayHeader date={today} offset={0} />).find(HeaderDate)).toHaveLength(1);
    expect(shallow(<DayHeader date={[today]} offset={0} />).find(HeaderDate)).toHaveLength(1);
  });

  test('render two date when more than one date is specified', () => {
    const wrapperOne = shallow(<DayHeader date={[today, daysAfter(today, 1)]} offset={0} />);

    const wrapperTwo = shallow(
      <DayHeader date={[today, daysAfter(today, 1), daysAfter(today, 2)]} offset={0} />,
    );

    expect(wrapperOne.find(HeaderDate)).toHaveLength(2);
    expect(wrapperTwo.find(HeaderDate)).toHaveLength(2);
  });

  test('render weather when it is specified', () => {
    const wrapper = shallow(<DayHeader date={today} offset={0} forecast="Cloudy" />);

    expect(wrapper.find(`.${styles.weather}`).exists()).toBe(true);
  });
});
