// @flow

import type { DayText, LessonTime, ModuleCode, RawLesson } from './modules';

export type Venue = string;
export type VenueList = Venue[];

// Components within a venue availability class:
export type VenueOccupiedState = 'vacant' | 'occupied';
export const VACANT: VenueOccupiedState = 'vacant';
export const OCCUPIED: VenueOccupiedState = 'occupied';

export type Availability = { [LessonTime]: VenueOccupiedState }; // E.g. { "1000": "vacant", "1030": "occupied", ... }

// Raw Lesson with Module Code and without Venue
export type VenueLesson = {
  ...$Diff<RawLesson, { Venue: Venue }>,
  ModuleCode: ModuleCode,
};

// A venue's availability info for one day
// E.g. { "Day": "Monday", "Classes": [...], "Availability": {...} }
export type DayAvailability = {|
  Day: DayText,
  Classes: VenueLesson[],
  Availability: Availability,
|};

// Describes venueInformation.json
// E.g. { "LT16": [DayAvailability1, DayAvailability2, ...], "LT17": [...], ... }
export type VenueInfo = { [Venue]: DayAvailability[] };
