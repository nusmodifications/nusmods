// @flow
import React from 'react';
import { shallow } from 'enzyme';
import createHistory from 'history/createMemoryHistory'; // eslint-disable-line import/no-extraneous-dependencies

import type { Venue } from 'types/modules';

import venueInfo from '__mocks__/venueInformation.json';
import { VenuesContainerComponent, mapStateToProps } from './VenuesContainer';

function createComponent(urlVenue: ?Venue) {
  const history = createHistory();
  const mockMatch = {
    path: '/',
    url: '/',
    isExact: true,
    params: {},
  };

  return shallow(
    <VenuesContainerComponent
      history={history}
      location={history.location}
      match={mockMatch}
      urlVenue={urlVenue}
      activeSemester={1}
    />,
  );
}

describe('VenuesContainer', () => {
  test('#filteredVenues() should filter venues correctly', () => {
    const component = createComponent().instance();
    component.setState({ venues: venueInfo });

    // No filter
    component.setState({ searchTerm: '' });
    expect(Object.keys(component.filteredVenues())).toMatchSnapshot();

    // Unique venue
    component.setState({ searchTerm: 'S11-0302' });
    expect(Object.keys(component.filteredVenues())).toEqual(['S11-0302']);

    // Unique venue with wrong case
    component.setState({ searchTerm: 's11-0302' });
    expect(Object.keys(component.filteredVenues())).toEqual(['S11-0302']);

    // Substring
    component.setState({ searchTerm: 'T1' });
    expect(Object.keys(component.filteredVenues())).toEqual(['LT17', 'LT1']);

    // Venue which does not exist
    component.setState({ searchTerm: 'covfefe' });
    expect(Object.keys(component.filteredVenues())).toEqual([]);
  });

  test('#onVenueSelect() should change the URL when a venue is clicked', () => {
    const component = createComponent().instance();
    component.onVenueSelect('LT17', '/venues/LT17');
    expect(component.state.selectedVenue).toEqual('LT17');
    expect(component.props.history.location.pathname).toEqual('/venues/LT17');
  });

  describe('URL handling', () => {
    test('it should only filter venues by venue in URL on init if present and no query string', () => {
      // Filter by URL venue on init and no query string
      const wrapper = createComponent('Interwebs');
      const instance = wrapper.instance();
      expect(instance.state.searchTerm).toEqual('Interwebs');

      // Don't filter by URL venue when venue clicked
      wrapper.setProps({
        urlVenue: 'covfefe',
      });
      expect(instance.state.searchTerm).toEqual('Interwebs');
    });

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
      expect(instance.state.selectedVenue).toEqual('');

      // No URL on props set
      component.setProps({
        history: { action: 'POP' },
        urlVenue: undefined, // No react-router match
      });
      expect(instance.state.searchTerm).toEqual('');
      expect(instance.state.selectedVenue).toEqual('');
    });
  });

  describe('#updateURL()', () => {
    test('it should update URL query', () => {
      const wrapper = createComponent();
      const instance = wrapper.instance();

      instance.setState({ searchTerm: 'covfefe' });
      expect(instance.props.history.location.search).toBe('');

      // Should set query string
      instance.updateURL();
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.search).toBe('?q=covfefe');

      // Should decode special chars
      instance.setState({ searchTerm: 'Cdat/overThar1!' });
      instance.updateURL();
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.search).toBe('?q=Cdat%2FoverThar1%21');

      // Should clear query string
      instance.setState({ searchTerm: '' });
      instance.updateURL();
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.search).toBe('');
    });

    test('it should update URL path if present', () => {
      const wrapper = createComponent();
      const instance = wrapper.instance();

      // Clear current value
      instance.updateURL('/');
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.pathname).toBe('/');

      // Update value
      instance.updateURL('/venues/covfefe');
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.pathname).toBe('/venues/covfefe');

      // Should not change path if none is provided
      instance.updateURL();
      wrapper.setProps({ location: instance.props.history.location });
      expect(instance.props.history.location.pathname).toBe('/venues/covfefe');
    });
  });

  test('#mapStateToProps() should set semester and decode URL venue', () => {
    const state = { app: { activeSemester: 1 } };
    const ownProps = { match: { params: { venue: 'Cdat%2FoverThar1%21' } } };
    const mappedProps = mapStateToProps(state, ownProps);
    expect(mappedProps).toMatchObject(ownProps);
    // Should set activeSemester
    expect(mappedProps).toHaveProperty('activeSemester', 1);
    // Should decode urlVenue
    expect(mappedProps).toHaveProperty('urlVenue', 'Cdat/overThar1!');
  });
});
