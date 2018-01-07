// @flow
import React from 'react';
import { shallow } from 'enzyme';

import type { Venue } from 'types/venues';

import createHistory from 'test-utils/createHistory';
import { VenuesContainerComponent, mapStateToProps } from './VenuesContainer';

function createComponent(urlVenue: ?Venue) {
  return shallow(
    <VenuesContainerComponent urlVenue={urlVenue} activeSemester={1} {...createHistory()} />,
  );
}

describe('VenuesContainer', () => {
  test('#onVenueSelect() should change the URL when a venue is clicked', () => {
    const component = createComponent().instance();
    component.onVenueSelect('LT17', '/venues/LT17');
    expect(component.state.selectedVenue).toEqual('LT17');
    expect(component.props.history.location.pathname).toEqual('/venues/LT17');
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
  });

  test('#mapStateToProps() should set semester and decode URL venue', () => {
    const state = { app: { activeSemester: 1 } };
    const ownProps = { match: { params: { venue: 'Cdat%2FoverThar1%21' } } };
    // $FlowFixMe ignore missing router props
    const mappedProps = mapStateToProps(state, ownProps);
    expect(mappedProps).toMatchObject(ownProps);
    // Should set activeSemester
    expect(mappedProps).toHaveProperty('activeSemester', 1);
    // Should decode urlVenue
    expect(mappedProps).toHaveProperty('urlVenue', 'Cdat/overThar1!');
  });
});
