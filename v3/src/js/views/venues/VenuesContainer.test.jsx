// @flow
import React from 'react';
import { shallow } from 'enzyme';
import createHistory from 'history/createMemoryHistory'; // eslint-disable-line import/no-extraneous-dependencies

import type { Venue } from 'types/modules';

import venueInfo from '__mocks__/venueInformation.json';
import { VenuesContainerComponent } from './VenuesContainer';

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
    component.setState({ searchTerm: 'QT/' });
    expect(Object.keys(component.filteredVenues())).toEqual(['CQT/SR0315', 'CQT/SR0622']);

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
    test('it should filter venues by venue in URL if present', () => {
      const component = createComponent('Interwebs');
      const instance = component.instance();

      // Filter by URL venue on init
      expect(instance.state.searchTerm).toEqual('Interwebs');

      // Filter by URL venue if it was not pushed
      component.setProps({
        history: { action: 'POP' },
        urlVenue: 'Misunderestimated',
      });
      expect(instance.state.searchTerm).toEqual('Misunderestimated');

      // Don't filter by URL venue if it was pushed
      component.setProps({
        history: { action: 'PUSH' },
        urlVenue: 'covFEFE',
      });
      expect(instance.state.searchTerm).toEqual('Misunderestimated');
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
});
