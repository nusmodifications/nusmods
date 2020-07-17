import * as React from 'react';
import { shallow } from 'enzyme';
import qs from 'query-string';
// eslint-disable-next-line import/no-extraneous-dependencies
import { History } from 'history';

import { Venue, VenueDetailList, VenueInfo } from 'types/venues';
import venueInfo from '__mocks__/venueInformation.json';
import createHistory from 'test-utils/createHistory';
import { sortVenues } from 'utils/venues';
import { venuePage } from 'views/routes/paths';
import VenueDetails from 'views/venues/VenueDetails';
import { Params, VenuesContainerComponent } from './VenuesContainer';

const venues = sortVenues(venueInfo as VenueInfo);

function createComponent(selectedVenue: Venue | null = null, search = '') {
  const location = venuePage(selectedVenue) + search;
  const match = { params: { venue: selectedVenue } };
  const router = createHistory<Params>(location, match);

  return {
    history: router.history,
    wrapper: shallow(<VenuesContainerComponent venues={venues} {...router} matchBreakpoint />),
  };
}

describe(VenuesContainerComponent, () => {
  describe('URL handling', () => {
    test('should not select or filter if no venue is present in URL', () => {
      const { wrapper } = createComponent();

      // Check that search and availability search is not enabled
      expect(wrapper.state('searchTerm')).toEqual('');
      expect(wrapper.state('isAvailabilityEnabled')).toBe(false);

      wrapper.setProps({
        history: { action: 'POP' },
        selectedVenue: undefined, // No react-router match
      });

      // Check that search and availability search is not enabled after navigation
      expect(wrapper.state('searchTerm')).toEqual('');
      expect(wrapper.state('isAvailabilityEnabled')).toBe(false);
    });

    test('initialize search based on params', () => {
      const { wrapper } = createComponent(null, '?q=hello+world');
      expect(wrapper.state('searchTerm')).toEqual('hello world');
      expect(wrapper.state('isAvailabilityEnabled')).toBe(false);
    });

    test('initialize filters based on params', () => {
      const { wrapper } = createComponent(null, '?day=1&time=9&duration=1');
      expect(wrapper.state()).toMatchObject({
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
    const getQueryParams = (history: History) => qs.parse(history.location.search);

    test('it should update search query', () => {
      const { wrapper, history } = createComponent();

      // Should set query string
      wrapper.setState({ searchTerm: 'covfefe' });
      expect(getQueryParams(history)).toEqual({ q: 'covfefe' });

      // Should decode special chars
      wrapper.setState({ searchTerm: 'Cdat/overThar1!' });
      expect(history.location.search).toEqual('?q=Cdat%2FoverThar1%21');

      // Should clear query string
      wrapper.setState({ searchTerm: '' });
      expect(getQueryParams(history)).toEqual({});
    });

    test('it should update search options', () => {
      const { wrapper, history } = createComponent();

      wrapper.setState({
        searchOptions: {
          day: 1,
          time: 9,
          duration: 1,
        },
        isAvailabilityEnabled: true,
      });

      expect(getQueryParams(history)).toEqual({
        day: '1',
        time: '9',
        duration: '1',
      });

      // Switching availability search off should clear params
      wrapper.setState({
        isAvailabilityEnabled: false,
      });
      expect(getQueryParams(history)).toEqual({});
    });
  });

  describe('#renderSelectedVenue', () => {
    const getVenueDetail = (selectedVenue: Venue | null, matched: VenueDetailList = venues) => {
      const instance = createComponent(
        selectedVenue,
      ).wrapper.instance() as VenuesContainerComponent;

      return shallow(<div>{instance.renderSelectedVenue(matched)}</div>).find(VenueDetails);
    };

    test('not render when there is no selected venue', () => {
      expect(getVenueDetail(null).exists()).toBe(false);
    });

    test('render when a venue is selected', () => {
      expect(getVenueDetail('LT17').props()).toMatchObject({
        venue: 'LT17',
        availability: venueInfo.LT17,
        previous: 'lt2',
        next: 'S11-0302',
      });

      const LTs = venues.filter(([venue]) => venue.includes('LT'));
      expect(getVenueDetail('LT17', LTs).props()).toMatchObject({
        venue: 'LT17',
        availability: venueInfo.LT17,
        previous: 'LT1',
        next: undefined,
      });
    });

    test('render when a venue is selected, and it is not in the list of matched venues', () => {
      expect(getVenueDetail('LT17', []).props()).toMatchObject({
        venue: 'LT17',
        availability: venueInfo.LT17,
      });
    });
  });
});
