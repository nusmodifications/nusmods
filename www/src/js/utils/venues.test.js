// @flow
import { pick } from 'lodash';
import venueInfo from '__mocks__/venueInformation.json';

import { searchVenue, filterAvailability } from './venues';

const venues = (...names) => pick(venueInfo, names);

describe('searchVenue()', () => {
  test('should return entire list if no search or options are given', () => {
    expect(searchVenue(venueInfo, '')).toEqual(venueInfo);
  });

  test('should find venues based on search', () => {
    // Exact match
    expect(searchVenue(venueInfo, 'LT17')).toEqual(venues('LT17'));

    // Case insensitivity
    expect(searchVenue(venueInfo, 'lt17')).toEqual(venues('LT17'));

    // Partial match
    expect(searchVenue(venueInfo, 'L')).toEqual(venues('LT1', 'lt2', 'LT17'));

    expect(searchVenue(venueInfo, 'T1')).toEqual(venues('LT1', 'LT17'));

    expect(searchVenue(venueInfo, '0')).toEqual(venues('S11-0302', 'CQT/SR0622'));

    // Non-existent venue
    expect(searchVenue(venueInfo, 'cofeve')).toEqual({});
  });

  test('should tokenize search queries', () => {
    expect(searchVenue(venueInfo, 'lt 17')).toEqual(venues('LT17'));
    expect(searchVenue(venueInfo, 'qt sr')).toEqual(venues('CQT/SR0622'));
  });
});

describe('filterAvailability()', () => {
  test('should find venues based on search options', () => {
    expect(
      filterAvailability(venueInfo, {
        day: 0, // Monday
        time: 10, // 10am
        duration: 1, // 1 hour
      }),
    ).toEqual(venues('LT1', 'CQT/SR0622'));

    expect(
      filterAvailability(venueInfo, {
        day: 0,
        time: 9,
        duration: 1,
      }),
    ).toEqual(venues('LT1', 'LT17', 'lt2', 'CQT/SR0622'));

    // Two hours duration
    expect(
      filterAvailability(venueInfo, {
        day: 0,
        time: 9,
        duration: 2,
      }),
    ).toEqual(venues('LT1', 'CQT/SR0622'));

    // Fourteen hour duration (whole day)
    expect(
      filterAvailability(venueInfo, {
        day: 0,
        time: 9,
        duration: 14,
      }),
    ).toEqual(venues('CQT/SR0622'));
  });
});
