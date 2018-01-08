// @flow
import React from 'react';
import { mount, shallow } from 'enzyme';
import qs from 'query-string';

import type { Venue, VenueDetailList } from 'types/venues';

import venueInfo from '__mocks__/venueInformation.json';
import createHistory from 'test-utils/createHistory';
import mockDom from 'test-utils/mockDom';
import { sortVenues } from 'utils/venues';
import { venuePage } from 'views/routes/paths';
import { VenuesContainerComponent } from './VenuesContainer';

function createComponent(selectedVenue: ?Venue, search?: string) {
  const location = {
    search,
    pathname: venuePage(selectedVenue),
  };
  const match = { params: { venue: selectedVenue } };

  return mount(<VenuesContainerComponent {...createHistory(location, match)} matchBreakpoint />);
}

const venues = sortVenues(venueInfo);

describe('VenuesContainer', () => {
  beforeEach(() => {
    mockDom();
  });

  describe('URL handling', () => {
    test('should not select or filter if no venue is present in URL', () => {
      const component = createComponent();

      // Check that search and availability search is not enabled
      expect(component.state('searchTerm')).toEqual('');
      expect(component.state('isAvailabilityEnabled')).toBe(false);

      component.setProps({
        history: { action: 'POP' },
        selectedVenue: undefined, // No react-router match
      });

      // Check that search and availability search is not enabled after navigation
      expect(component.state('searchTerm')).toEqual('');
      expect(component.state('isAvailabilityEnabled')).toBe(false);
    });

    test('initialize search based on params', () => {
      const component = createComponent(null, '?q=hello+world');
      expect(component.state('searchTerm')).toEqual('hello world');
      expect(component.state('isAvailabilityEnabled')).toBe(false);
    });

    test('initialize filters based on params', () => {
      const component = createComponent(null, '?day=1&time=9&duration=1');
      expect(component.state()).toMatchObject({
        searchOptions: {
          day: 1,
          time: 9,
          duration: 1,
        },
        isAvailabilityEnabled: true,
      });
    });
  });

  describe('#updateURL()', () => {
    const getQueryParams = (wrapper) => qs.parse(wrapper.props().history.location.search);

    test('it should update search query', () => {
      const wrapper = createComponent();

      // Should set query string
      wrapper.setState({ searchTerm: 'covfefe' });
      expect(getQueryParams(wrapper)).toEqual({ q: 'covfefe' });

      // Should decode special chars
      wrapper.setState({ searchTerm: 'Cdat/overThar1!' });
      expect(wrapper.props()).toHaveProperty('history.location.search', '?q=Cdat%2FoverThar1%21');

      // Should clear query string
      wrapper.setState({ searchTerm: '' });
      expect(getQueryParams(wrapper)).toEqual({});
    });

    test('it should update search options', () => {
      const wrapper = createComponent();

      wrapper.setState({
        searchOptions: {
          day: 1,
          time: 9,
          duration: 1,
        },
        isAvailabilityEnabled: true,
      });

      expect(getQueryParams(wrapper)).toEqual({
        day: '1',
        time: '9',
        duration: '1',
      });

      // Switching availability search off should clear params
      wrapper.setState({
        isAvailabilityEnabled: false,
      });
      expect(getQueryParams(wrapper)).toEqual({});
    });
  });

  describe('#renderSelectedVenue', () => {
    const getVenueDetail = (selectedVenue: ?Venue, matched: VenueDetailList = venues) => {
      const instance = createComponent(selectedVenue).instance();
      instance.setState({ venues });
      return instance.renderSelectedVenue(matched);
    };

    test('not render when there is no selected venue', () => {
      expect(getVenueDetail(null)).toBeNull();
    });

    test('render when a venue is selected', () => {
      expect(shallow(getVenueDetail('LT17')).props()).toMatchObject({
        venue: 'LT17',
        availability: venueInfo.LT17,
        previous: 'lt2',
        next: 'S11-0302',
      });

      const LTs = venues.filter(([venue]) => venue.includes('LT'));
      expect(shallow(getVenueDetail('LT17', LTs)).props()).toMatchObject({
        venue: 'LT17',
        availability: venueInfo.LT17,
        previous: 'LT1',
        next: undefined,
      });
    });

    test('render when a venue is selected, and it is not in the list of matched venues', () => {
      const venueDetail = shallow(getVenueDetail('LT17', []));

      expect(venueDetail.props()).toMatchObject({
        venue: 'LT17',
        availability: venueInfo.LT17,
      });
    });
  });
});
