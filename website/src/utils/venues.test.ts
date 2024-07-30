import venueInfo from '__mocks__/venueInformation.json';
import venueLocationInfo from '__mocks__/venueLocations.json';
import { VenueInfo, VenueLocationMap } from 'types/venues';
import {
  searchVenue,
  filterAvailability,
  sortVenues,
  floorName,
  clampClassDuration,
} from './venues';

const venues = sortVenues(venueInfo as VenueInfo);
const venueLocations = venueLocationInfo as VenueLocationMap;

const getVenues = (...names: string[]) => venues.filter(([name]) => names.includes(name));

describe(sortVenues, () => {
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
    ).toEqual([
      ['A1', []],
      ['a2', []],
      ['b1', []],
      ['B2', []],
    ]);
  });

  test('sort venues using natual sorting', () => {
    expect(venues.map(([venue]) => venue)).toEqual([
      'AS6-0333',
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

    expect(searchVenue(venues, 'GAMELAN Instrument Room (Studio)', venueLocations)).toEqual(
      getVenues('AS2-0201'),
    );

    // Case insensitivity
    expect(searchVenue(venues, 'lt17')).toEqual(getVenues('LT17'));

    expect(searchVenue(venues, 'gamelan instrument room (studio)')).toEqual(getVenues('AS2-0201'));

    // Partial match
    expect(searchVenue(venues, 'L')).toEqual(getVenues('LT1', 'lt2', 'LT17'));

    expect(searchVenue(venues, 'T1')).toEqual(getVenues('LT1', 'LT17'));

    expect(searchVenue(venues, '0')).toEqual(getVenues('AS6-0333', 'S11-0302', 'CQT/SR0622'));

    expect(searchVenue(venues, 'honours', venueLocations)).toEqual(
      getVenues('AS1-0211', 'AS2-0302', 'AS5-0335'),
    );

    // Non-existent venue
    expect(searchVenue(venues, 'cofeve')).toEqual([]);
  });

  test('should tokenize search queries', () => {
    expect(searchVenue(venues, 'lt 17')).toEqual(getVenues('LT17'));
    expect(searchVenue(venues, 'qt sr')).toEqual(getVenues('CQT/SR0622'));
  });
});

describe(filterAvailability, () => {
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

  test('should return venue which are empty the whole day', () => {
    const availableVenues = filterAvailability(
      [['LT1', []]], // Venue has no lessons at all
      {
        day: 0,
        time: 9,
        duration: 1,
      },
    );

    expect(availableVenues).toHaveLength(1);
    expect(availableVenues[0][0]).toEqual('LT1');
  });

  test("should not return venues that are excluded from 'find free rooms' feature", () => {
    const availableVenues = filterAvailability(venues, {
      day: 0,
      time: 9,
      duration: 1,
    });

    expect(availableVenues.some((allVenues) => allVenues[0] === 'AS6-0333')).toBe(false);
  });
});

describe(floorName, () => {
  it('should show 0 as the ground floor', () => {
    expect(floorName(0)).toEqual('the ground floor');
  });

  it('should add B to basement floors', () => {
    expect(floorName(-1)).toEqual('floor B1');
    expect(floorName(-2)).toEqual('floor B2');
    expect(floorName(-5)).toEqual('floor B5');
  });

  it('should not add B to above ground floors', () => {
    expect(floorName(1)).toEqual('floor 1');
    expect(floorName(2)).toEqual('floor 2');
    expect(floorName(5)).toEqual('floor 5');
  });

  it('should handle named floors', () => {
    expect(floorName('Ground')).toEqual('ground floor');
    expect(floorName('Mezzanine')).toEqual('mezzanine floor');
  });
});

describe(clampClassDuration, () => {
  it('should not change duration within school hours', () => {
    expect(
      clampClassDuration({
        day: 1,
        duration: 1,
        time: 8,
      }).duration,
    ).toEqual(1);

    expect(
      clampClassDuration({
        day: 1,
        duration: 16,
        time: 8,
      }).duration,
    ).toEqual(16);

    expect(
      clampClassDuration({
        day: 1,
        duration: 12,
        time: 12,
      }).duration,
    ).toEqual(12);

    expect(
      clampClassDuration({
        day: 1,
        duration: 4,
        time: 20,
      }).duration,
    ).toEqual(4);
  });

  it('should clamp durations to within school hours', () => {
    expect(
      clampClassDuration({
        day: 1,
        duration: 20,
        time: 8,
      }).duration,
    ).toEqual(16);

    expect(
      clampClassDuration({
        day: 1,
        duration: 10,
        time: 20,
      }).duration,
    ).toEqual(4);
  });
});
