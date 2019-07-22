import { VenueInfo, VenueSearchOptions, VenueDetailList, OCCUPIED } from 'types/venues';
import { range, entries, padStart, clamp } from 'lodash';
import produce from 'immer';

import { tokenize } from './moduleSearch';
import { SCHOOLDAYS } from './timify';

// The first and last starting time of lessons
export const FIRST_CLASS_HOUR = 8;
export const LAST_CLASS_HOUR = 22;
export const SCHOOL_CLOSE_HOUR = 24;

// Array of [0, 30, 100, 130, 200, 230, ...], used to create time strings at half hour intervals
// eg. 900 + hourDifference[2] // (9am + 2 * 30 minutes = 10am)
const hourDifference = range(48).map((i) => Math.floor(i / 2) * 100 + (i % 2) * 30);

const stringCompare =
  // Feature detect Intl API
  window.Intl && typeof window.Intl === 'object'
    ? new window.Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare
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
    const dayAvailability = venue.find((availability) => availability.day === SCHOOLDAYS[day]);
    if (!dayAvailability) return true;

    // Check that all half-hour slots within the time requested are vacant
    for (let i = 0; i < duration * 2; i++) {
      const timeString = padStart(String(start + hourDifference[i]), 4, '0');
      if (dayAvailability.availability[timeString] === OCCUPIED) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Clamp the duration of the search option to within school hours
 */
export function clampClassDuration(searchOptions: VenueSearchOptions): VenueSearchOptions {
  return produce(searchOptions, (draft) => {
    const newEndTime = clamp(draft.time + draft.duration, FIRST_CLASS_HOUR, SCHOOL_CLOSE_HOUR);
    draft.duration = newEndTime - draft.time;
  });
}

export function floorName(floor: number | string): string {
  if (typeof floor === 'string') {
    return `${floor.toLowerCase()} floor`;
  }

  if (floor === 0) {
    return 'the ground floor';
  }

  const floorNumber = floor < 0 ? `B${-floor}` : floor;
  return `floor ${floorNumber}`;
}
