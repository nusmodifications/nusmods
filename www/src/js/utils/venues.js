// @flow

import type { VenueInfo, VenueSearchOptions, DayAvailability } from 'types/venues';
import { range, pick, pickBy, padStart } from 'lodash';
import { OCCUPIED } from 'types/venues';

import { tokenize } from './moduleSearch';
import { SCHOOLDAYS } from './timify';

/* eslint-disable import/prefer-default-export */

// Array of [0, 30, 100, 130, 200, 230, ...], used to create time strings at half hour intervals
// eg. 900 + hourDifference[2] // (9am + 2 * 30 minutes = 10am)
const hourDifference = range(48).map((i) => Math.floor(i / 2) * 100 + (i % 2) * 30);

export function searchVenue(venues: VenueInfo, search: string): VenueInfo {
  let foundVenues = venues;

  // Search by name
  const tokens = tokenize(search.toLowerCase());
  tokens.forEach((token) => {
    const matches = Object.keys(foundVenues).filter((name) => name.toLowerCase().includes(token));
    foundVenues = pick(foundVenues, matches);
  });

  return foundVenues;
}

export function filterAvailability(venues: VenueInfo, options: VenueSearchOptions): VenueInfo {
  const { day, time, duration } = options;

  return pickBy(venues, (venue: DayAvailability[]) => {
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
