// @flow
import React from 'react';
import { mount, shallow } from 'enzyme';

import type { Venue, VenueDetailList } from 'types/venues';

import venueInfo from '__mocks__/venueInformation.json';
import createHistory from 'test-utils/createHistory';
import mockDom from 'test-utils/mockDom';
import { sortVenues } from 'utils/venues';
import { VenuesContainerComponent, mapStateToProps } from './VenuesContainer';

function createComponent(urlVenue: ?Venue) {
  return mount(
    <VenuesContainerComponent
      urlVenue={urlVenue}
      activeSemester={1}
      {...createHistory()}
      matchBreakpoint
    />,
  );
}

const venues = sortVenues(venueInfo);

describe('VenuesContainer', () => {
  beforeEach(() => {
    mockDom();
  });

  test('#onVenueSelect() should change the URL when a venue is clicked', () => {
    const wrapper = createComponent();
    const instance = wrapper.instance();
    instance.onVenueSelect('LT17');

    expect(instance.state.selectedVenue).toEqual('LT17');
    expect(instance.props.history.location.pathname).toEqual('/venues/LT17');
  });

  describe('URL handling', () => {
    test('it should select venue in URL if present and appropriate', () => {
      const component = createComponent('Interwebs');
      const instance = component.instance();

      // Select URL venue on init
      expect(instance.state.selectedVenue).toEqual('Interwebs');

      // Select URL venue when changed
      component.setProps({ urlVenue: 'covFEFE' });
      expect(instance.state.selectedVenue).toEqual('covFEFE');
    });

    test('it should neither select nor filter if no venue is present in URL', () => {
      const component = createComponent();
      const instance = component.instance();

      // No URL on init
      expect(instance.state.searchTerm).toEqual('');
      expect(instance.state.selectedVenue).toEqual(undefined);

      // No URL on props set
      component.setProps({
        history: { action: 'POP' },
        urlVenue: undefined, // No react-router match
      });
      expect(instance.state.searchTerm).toEqual('');
      expect(instance.state.selectedVenue).toEqual(undefined);
    });
  });

  describe('#updateURL()', () => {
    test('it should update URL query', () => {
      const wrapper = createComponent();
      const instance = wrapper.instance();

      instance.setState({ searchTerm: 'covfefe' });

      // Should set query string
      expect(instance.props.history.location.search).toBe('?q=covfefe');

      // Should decode special chars
      instance.setState({ searchTerm: 'Cdat/overThar1!' });
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.search).toBe('?q=Cdat%2FoverThar1%21');

      // Should clear query string
      instance.setState({ searchTerm: '' });
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.search).toBe('');
    });
  });

  describe('#renderSelectedVenue', () => {
    const getVenueDetail = (selectedVenue: ?Venue, matched: VenueDetailList = venues) => {
      const instance = createComponent().instance();
      instance.setState({ venues, selectedVenue });
      return shallow(instance.renderSelectedVenue(matched));
    };

    test('not render when there is no selected venue', () => {
      const instance = createComponent().instance();
      instance.setState({ venues });

      expect(instance.renderSelectedVenue(venues)).toBeNull();
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
      const wrapper = createComponent();
      const instance = wrapper.instance();

      instance.setState({ venues, selectedVenue: 'LT17' });
      const venueDetail = shallow(instance.renderSelectedVenue([]));

      expect(venueDetail.props()).toMatchObject({
        venue: 'LT17',
        availability: venueInfo.LT17,
      });
    });
  });

  test('#mapStateToProps() should set semester and decode URL venue', () => {
    const state = { app: { activeSemester: 1 } };
    const ownProps: any = { match: { params: { venue: 'Cdat%2FoverThar1%21' } } };
    const mappedProps = mapStateToProps(state, ownProps);
    expect(mappedProps).toMatchObject(ownProps);
    // Should set activeSemester
    expect(mappedProps).toHaveProperty('activeSemester', 1);
    // Should decode urlVenue
    expect(mappedProps).toHaveProperty('urlVenue', 'Cdat/overThar1!');
  });
});
