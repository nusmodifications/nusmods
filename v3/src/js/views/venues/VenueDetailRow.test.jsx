// @flow
import React from 'react';
import { shallow } from 'enzyme';
import venueInfo from '__mocks__/venueInformation.json';
import VenueDetailRow from './VenueDetailRow';

const minProps = {
  name: 'CQT/SR0622',
  availability: venueInfo['CQT/SR0622'],
};

describe('VenueDetailRow', () => {
  test('it displays an anchor tag when not expanded', () => {
    const wrapper = shallow(<VenueDetailRow {...minProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('it displays an anchor tag and a timetable when expanded', () => {
    const wrapper = shallow(<VenueDetailRow {...minProps} expanded />);
    expect(wrapper).toMatchSnapshot();
  });
});
