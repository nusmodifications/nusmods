// @flow
import React from 'react';
import { mount } from 'enzyme';
import venueInfo from '__mocks__/venueInformation.json';
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

    // Does not expand when there is no expandedVenue
    wrapper = mount(<VenueList {...minProps} />);
    expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('expanded'))).toHaveLength(0);

    // Does not expand when no venue names match
    wrapper = mount(<VenueList {...minProps} expandedVenue="covfefe" />);
    expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('expanded'))).toHaveLength(0);

    // Expands a valid venue
    wrapper = mount(<VenueList {...minProps} expandedVenue="LT1" />);
    expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('expanded'))).toHaveLength(1);
    expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('name') === 'LT1').first().prop('expanded')).toBe(true);

    // Does not expand partial match
    expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('name') === 'LT17').first().prop('expanded')).toBe(false);

    // Venue name case insensitivity
    wrapper = mount(<VenueList {...minProps} expandedVenue="cqt/SR0622" />);
    expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('expanded'))).toHaveLength(1);
    expect(wrapper.find('VenueDetailRow').filterWhere(r => r.prop('name') === 'CQT/SR0622').first().prop('expanded')).toBe(true);
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
