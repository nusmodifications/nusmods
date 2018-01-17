// @flow
import type { DayText, LessonTime, ModuleCode, RawLesson } from 'types/modules';

export type Venue = string;
export type VenueList = Venue[];
// Components within a venue availability class:
export type VenueOccupiedState = 'vacant' | 'occupied';
export const VACANT: VenueOccupiedState = 'vacant';
export const OCCUPIED: VenueOccupiedState = 'occupied';

export type Availability = { [LessonTime]: VenueOccupiedState }; // E.g. { "1000": "vacant", "1030": "occupied", ... }

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
};

// Describes venueInformation.json
// E.g. { "LT16": [DayAvailability1, DayAvailability2, ...], "LT17": [...], ... }
export type VenueInfo = { [Venue]: DayAvailability[] };

// Used to specify availability search options
// All properties are number to make (de)serialization into query string simpler to handle
export type VenueSearchOptions = {
  day: number, // Day of week (ie. 0 = Monday, 1 = Tuesday etc.)
  time: number, // in hours (ie. 9 = 9am, 13 = 1pm etc.)
  duration: number, // in hours
};

export type VenueDetailList = [Venue, DayAvailability[]][];
