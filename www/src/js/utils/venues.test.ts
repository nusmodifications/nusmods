// @flow
import venueInfo from '__mocks__/venueInformation.json';

import type { WeekText, ModuleCode, StartTime } from 'types/modules';
import { ZWSP } from 'utils/react';
import {
  searchVenue,
  filterAvailability,
  sortVenues,
  getDuplicateModules,
  mergeDualCodedModules,
  floorName,
} from './venues';

const venues = sortVenues(venueInfo);
const getVenues = (...names) => venues.filter(([name]) => names.includes(name));

const makeVenueLesson = (
  moduleCode: ModuleCode,
  props: { WeekText?: WeekText, StartTime?: StartTime } = {},
) => ({
  ClassNo: '1',
  DayText: 'Monday',
  LessonType: 'Lecture',
  EndTime: '1000',
  StartTime: '0900',
  Venue: 'LT1',
  WeekText: 'Every Week',
  ModuleCode: moduleCode,
  ...props,
});

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

describe(getDuplicateModules, () => {
  it('should return an array of duplicated module codes', () => {
    expect(getDuplicateModules([makeVenueLesson('GEK1901'), makeVenueLesson('GET1001')])).toEqual([
      'GEK1901',
      'GET1001',
    ]);

    expect(
      getDuplicateModules([
        makeVenueLesson('GEK1901', { WeekText: 'Odd Week' }),
        makeVenueLesson('GET1001', { WeekText: 'Odd Week' }),
        makeVenueLesson('GET1002', { WeekText: 'Even Week' }),
      ]),
    ).toEqual(['GEK1901', 'GET1001']);
  });

  it('should not consider modules happening on different weeks as duplicates', () => {
    expect(
      getDuplicateModules([
        makeVenueLesson('GEK1901', { WeekText: 'Odd Week' }),
        makeVenueLesson('GET1001', { WeekText: 'Even Week' }),
      ]),
    ).toEqual([]);
  });
});

describe(mergeDualCodedModules, () => {
  it('should merge modules with the same starting time', () => {
    expect(mergeDualCodedModules([makeVenueLesson('GEK1901'), makeVenueLesson('GET1001')])).toEqual(
      [makeVenueLesson(`GEK1901/${ZWSP}GET1001`)],
    );
  });

  it('should merge module sets of modules with the same starting time', () => {
    expect(
      mergeDualCodedModules([
        makeVenueLesson('GEK1901', { StartTime: '1000' }),
        makeVenueLesson('GEK1901', { StartTime: '1400' }),
        makeVenueLesson('GET1001', { StartTime: '1000' }),
        makeVenueLesson('GET1001', { StartTime: '1400' }),
        makeVenueLesson('GEK1902', { StartTime: '1200' }),
        makeVenueLesson('GES1001', { StartTime: '1200' }),
      ]),
    ).toEqual([
      makeVenueLesson(`GEK1901/${ZWSP}GET1001`, { StartTime: '1000' }),
      makeVenueLesson(`GEK1901/${ZWSP}GET1001`, { StartTime: '1400' }),
      makeVenueLesson(`GEK1902/${ZWSP}GES1001`, { StartTime: '1200' }),
    ]);
  });

  it('should not merge modules on different weeks', () => {
    expect(
      mergeDualCodedModules([
        makeVenueLesson('GEK1901', { WeekText: 'Odd Week' }),
        makeVenueLesson('GET1001', { WeekText: 'Even Week' }),
      ]),
    ).toEqual([
      makeVenueLesson('GEK1901', { WeekText: 'Odd Week' }),
      makeVenueLesson('GET1001', { WeekText: 'Even Week' }),
    ]);
  });
});

describe(floorName, () => {
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
