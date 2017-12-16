// @flow

import type { VenueInfo, VenueSearchOptions, DayAvailability } from 'types/venues';
import { range, pick, pickBy, padStart } from 'lodash';
import { tokenize } from './moduleSearch';
import { OCCUPIED } from '../types/venues';
/* eslint-disable import/prefer-default-export */

// Array of [0, 30, 100, 130, 200, 230, ...], used to create time strings at half hour intervals
// eg. 900 + hourDifference[2] // (9am + 2 * 30 minutes = 10am)
const hourDifference = range(48).map(i => (Math.floor(i / 2) * 100) + ((i % 2) * 30));

export function filterVenue(venues: VenueInfo, search: string, options?: VenueSearchOptions): VenueInfo {
  let foundVenues = venues;

  // Search by name
  const tokens = tokenize(search.toLowerCase());
  tokens.forEach((token) => {
    const matches = Object.keys(foundVenues)
      .filter(name => name.toLowerCase().includes(token));
    foundVenues = pick(foundVenues, matches);
  });

  // Search by time
  if (options) {
    const { day, time, duration } = options;
    foundVenues = pickBy(foundVenues, (venue: DayAvailability[]) => {
      const start = Number(time);
      const dayAvailability = venue.find(availability => availability.Day === day);
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

  return foundVenues;
}
