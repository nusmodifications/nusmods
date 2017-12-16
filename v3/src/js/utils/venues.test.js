// @flow
import { pick } from 'lodash';
import venueInfo from '__mocks__/venueInformation.json';

import { filterVenue } from './venues';


describe('filterVenue()', () => {
  const venues = (...names) => pick(venueInfo, names);

  test('should return entire list if no search or options are given', () => {
    expect(filterVenue(venueInfo, '')).toEqual(venueInfo);
  });

  test('should find venues based on search', () => {
    // Exact match
    expect(filterVenue(venueInfo, 'LT17')).toEqual(venues('LT17'));

    // Case insensitivity
    expect(filterVenue(venueInfo, 'lt17')).toEqual(venues('LT17'));

    // Partial match
    expect(filterVenue(venueInfo, 'L'))
      .toEqual(venues('LT1', 'lt2', 'LT17'));

    expect(filterVenue(venueInfo, 'T1'))
      .toEqual(venues('LT1', 'LT17'));

    expect(filterVenue(venueInfo, '0'))
      .toEqual(venues('S11-0302', 'CQT/SR0622'));

    // Non-existent venue
    expect(filterVenue(venueInfo, 'cofeve'))
      .toEqual({});
  });

  test('should tokenize search queries', () => {
    expect(filterVenue(venueInfo, 'lt 17')).toEqual(venues('LT17'));
    expect(filterVenue(venueInfo, 'qt sr')).toEqual(venues('CQT/SR0622'));
  });

  test('should find venues based on search options', () => {
    expect(filterVenue(venueInfo, '', {
      day: 'Monday',
      time: '1000',
      duration: 1,
    })).toEqual(venues('LT1', 'CQT/SR0622'));

    expect(filterVenue(venueInfo, '', {
      day: 'Monday',
      time: '0900',
      duration: 1,
    })).toEqual(venues('LT1', 'LT17', 'lt2', 'CQT/SR0622'));

    // Two hours duration
    expect(filterVenue(venueInfo, '', {
      day: 'Monday',
      time: '0900',
      duration: 2,
    })).toEqual(venues('LT1', 'CQT/SR0622'));

    // Fourteen hour duration (whole day)
    expect(filterVenue(venueInfo, '', {
      day: 'Monday',
      time: '0900',
      duration: 14,
    })).toEqual(venues('CQT/SR0622'));

    // Combined with search term
    expect(filterVenue(venueInfo, 'lt', {
      day: 'Monday',
      time: '0900',
      duration: 1,
    })).toEqual(venues('LT1', 'LT17', 'lt2'));
  });
});
