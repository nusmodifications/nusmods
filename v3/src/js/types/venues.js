// @flow
import type { Venue, RawLesson, ModuleCode, DayText, LessonTime } from 'types/modules';

// Components within a venue availability class:
export type VenueOccupiedState = 'vacant' | 'occupied';
export const VACANT: VenueOccupiedState = 'vacant';
export const OCCUPIED: VenueOccupiedState = 'occupied';

export type Availability = { [LessonTime]: VenueOccupiedState } // E.g. { "1000": "vacant", "1030": "occupied", ... }

// Raw lessons obtained from venue info API includes ModuleCode by default
export type VenueLesson = RawLesson & {
  ModuleCode: ModuleCode,
};

// A venue's availability info for one day
// E.g. { "Day": "Monday", "Classes": [...], "Availability": {...} }
export type DayAvailability = {
  Day: DayText,
  Classes: VenueLesson[],
  Availability: Availability,
}

// Describes venueInformation.json
// E.g. { "LT16": [DayAvailability1, DayAvailability2, ...], "LT17": [...], ... }
export type VenueInfo = { [Venue]: DayAvailability[] };

export type VenueSearchOptions = {
  day: number, // Day of week (ie. 0 = Monday, 1 = Tuesday etc.)
  time: number, // in hours (ie. 9 = 9am, 13 = 1pm etc.)
  duration: number, // in hours
};
