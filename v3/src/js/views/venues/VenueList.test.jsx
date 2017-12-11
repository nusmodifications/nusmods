// @flow
import React from 'react';
import { mount } from 'enzyme';
import venueInfo from '__mocks__/venueInformation.json';

import type { Venue } from 'types/modules';

import VenueList from './VenueList';

const minProps = {
  venues: venueInfo,
  expandedVenue: '',
  onSelect: () => {},
};

describe('VenueList', () => {
  test('it renders all venues as VenueDetailRows', () => {
    const wrapper = mount(<VenueList {...minProps} />);
    const rows = wrapper.find('VenueDetailRow');
    expect(rows).toHaveLength(Object.keys(venueInfo).length);

    // Case insensitive, natural sort
    const orderedNames = rows.map(r => r.prop('name'));
    expect(orderedNames).toContain('LT1'); // else orderedNames.indexOf('LT1') = -1, which may break test
    expect(orderedNames.indexOf('LT1')).toBeLessThan(orderedNames.indexOf('lt2'));
    expect(orderedNames.indexOf('lt2')).toBeLessThan(orderedNames.indexOf('LT17'));
  });

  test('it expands venues appropriately', () => {
    let wrapper;

    function expectNumberExpandedRows(num: number) {
      return expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('expanded'))).toHaveLength(num);
    }

    function expectExpandedVenue(venue: Venue, isExpanded: boolean = true) {
      expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('name') === venue).first().prop('expanded')).toBe(isExpanded);
    }

    // Does not expand when there is no expandedVenue
    wrapper = mount(<VenueList {...minProps} />);
    expectNumberExpandedRows(0);

    // Does not expand when no venue names match
    wrapper = mount(<VenueList {...minProps} expandedVenue="covfefe" />);
    expectNumberExpandedRows(0);

    // Expands a valid venue
    wrapper = mount(<VenueList {...minProps} expandedVenue="LT1" />);
    expectNumberExpandedRows(1);
    expectExpandedVenue('LT1');

    // Does not expand partial match
    expectExpandedVenue('LT17', false);

    // Venue name case insensitivity
    wrapper = mount(<VenueList {...minProps} expandedVenue="cqt/SR0622" />);
    expectNumberExpandedRows(1);
    expectExpandedVenue('CQT/SR0622');
  });

  test('it calls onSelect when a row is clicked', () => {
    const mockOnSelect = jest.fn();
    const wrapper = mount(<VenueList {...minProps} onSelect={mockOnSelect} />);
    const lt17Row = wrapper.find('VenueDetailRow').filterWhere(r => r.prop('name') === 'LT17').first();
    lt17Row.find('a').simulate('click');
    expect(mockOnSelect.mock.calls).toHaveLength(1);
    expect(mockOnSelect.mock.calls[0]).toMatchSnapshot();
  });
});
