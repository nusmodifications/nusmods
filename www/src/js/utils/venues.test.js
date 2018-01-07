// @flow
import venueInfo from '__mocks__/venueInformation.json';

import { searchVenue, filterAvailability, sortVenues } from './venues';

const venues = sortVenues(venueInfo);
const getVenues = (...names) => venues.filter(([name]) => names.includes(name));

describe('sortVenues', () => {
  test('handle empty venue object', () => {
    expect(sortVenues({})).toEqual([]);
  });

  test('sort venues case insensitively', () => {
    expect(
      sortVenues({
        a2: [],
        A1: [],
        b1: [],
        B2: [],
      }),
    ).toEqual([['A1', []], ['a2', []], ['b1', []], ['B2', []]]);
  });

  test('sort venues using natrual sorting', () => {
    expect(sortVenues(venueInfo).map(([venue]) => venue)).toEqual([
      'CQT/SR0622',
      'LT1',
      'lt2',
      'LT17',
      'S11-0302',
    ]);
  });
});

describe('searchVenue()', () => {
  test('should return entire list if no search or options are given', () => {
    expect(searchVenue(venues, '')).toEqual(venues);
  });

  test('should find getVenues based on search', () => {
    // Exact match
    expect(searchVenue(venues, 'LT17')).toEqual(getVenues('LT17'));

    // Case insensitivity
    expect(searchVenue(venues, 'lt17')).toEqual(getVenues('LT17'));

    // Partial match
    expect(searchVenue(venues, 'L')).toEqual(getVenues('LT1', 'lt2', 'LT17'));

    expect(searchVenue(venues, 'T1')).toEqual(getVenues('LT1', 'LT17'));

    expect(searchVenue(venues, '0')).toEqual(getVenues('S11-0302', 'CQT/SR0622'));

    // Non-existent venue
    expect(searchVenue(venues, 'cofeve')).toEqual([]);
  });

  test('should tokenize search queries', () => {
    expect(searchVenue(venues, 'lt 17')).toEqual(getVenues('LT17'));
    expect(searchVenue(venues, 'qt sr')).toEqual(getVenues('CQT/SR0622'));
  });
});

describe('filterAvailability()', () => {
  test('should find venues based on search options', () => {
    expect(
      filterAvailability(venues, {
        day: 0, // Monday
        time: 10, // 10am
        duration: 1, // 1 hour
      }),
    ).toEqual(getVenues('LT1', 'CQT/SR0622'));

    expect(
      filterAvailability(venues, {
        day: 0,
        time: 9,
        duration: 1,
      }),
    ).toEqual(getVenues('LT1', 'LT17', 'lt2', 'CQT/SR0622'));

    // Two hours duration
    expect(
      filterAvailability(venues, {
        day: 0,
        time: 9,
        duration: 2,
      }),
    ).toEqual(getVenues('LT1', 'CQT/SR0622'));

    // Fourteen hour duration (whole day)
    expect(
      filterAvailability(venues, {
        day: 0,
        time: 9,
        duration: 14,
      }),
    ).toEqual(getVenues('CQT/SR0622'));
  });
});
