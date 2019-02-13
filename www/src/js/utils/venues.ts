import { ModuleCode } from 'types/modules';
import {
  VenueInfo,
  VenueSearchOptions,
  VenueDetailList,
  VenueLesson,
  OCCUPIED,
} from 'types/venues';
import { range, entries, padStart, groupBy, values } from 'lodash';
import { ZWSP } from 'utils/react';

import { tokenize } from './moduleSearch';
import { SCHOOLDAYS } from './timify';

// Array of [0, 30, 100, 130, 200, 230, ...], used to create time strings at half hour intervals
// eg. 900 + hourDifference[2] // (9am + 2 * 30 minutes = 10am)
const hourDifference = range(48).map((i) => Math.floor(i / 2) * 100 + (i % 2) * 30);

const stringCompare =
  // Feature detect Intl API
  Intl && typeof Intl === 'object'
    ? new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare
    : (a: string, b: string) => a.localeCompare(b);

export function sortVenues(venues: VenueInfo): VenueDetailList {
  return entries(venues).sort(([a], [b]) => stringCompare(a, b));
}

export function searchVenue(venues: VenueDetailList, search: string): VenueDetailList {
  // Search by name
  const tokens = tokenize(search.toLowerCase());

  return venues.filter(([name]) => {
    const lowercaseName = name.toLowerCase();
    return tokens.every((token) => lowercaseName.includes(token));
  });
}

export function filterAvailability(
  venues: VenueDetailList,
  options: VenueSearchOptions,
): VenueDetailList {
  const { day, time, duration } = options;

  return venues.filter(([, venue]) => {
    const start = time * 100;
    const dayAvailability = venue.find((availability) => availability.Day === SCHOOLDAYS[day]);
    if (!dayAvailability) return false;

    // Check that all half-hour slots within the time requested are vacant
    for (let i = 0; i < duration * 2; i++) {
      const timeString = padStart(String(start + hourDifference[i]), 4, '0');
      if (dayAvailability.Availability[timeString] === OCCUPIED) {
        return false;
      }
    }

    return true;
  });
}

export function floorName(floor: number | string): string {
  if (typeof floor === 'string') {
    return `${floor.toLowerCase()} floor`;
  }

  const floorNumber = floor < 0 ? `B${-floor}` : floor;
  return `floor ${floorNumber}`;
}
