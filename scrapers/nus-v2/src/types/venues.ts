import { DayText, ModuleCode, RawLesson } from './modules';

export type Venue = string;
export type VenueList = Venue[];

// Components within a venue availability class:
export type VenueOccupiedState = 'vacant' | 'occupied';
export const VACANT: VenueOccupiedState = 'vacant';
export const OCCUPIED: VenueOccupiedState = 'occupied';

export type Availability = {
  // E.g. { "1000": "vacant", "1030": "occupied", ... }
  [key: string]: VenueOccupiedState;
};

// Raw Lesson with Module Code and without venue and covidZone
export type VenueLesson = Omit<RawLesson, 'venue' | 'covidZone'> & {
  moduleCode: ModuleCode;
};

// A venue's availability info for one day
// E.g. { "Day": "Monday", "Classes": [...], "Availability": {...} }
export type DayAvailability = Readonly<{
  day: DayText;
  classes: VenueLesson[];
  availability: Availability;
}>;

// Describes venueInformation.json
// E.g. { "LT16": [DayAvailability1, DayAvailability2, ...], "LT17": [...], ... }
export type VenueInfo = Readonly<{
  [venue: string]: DayAvailability[];
}>;

// Shape of data in data/venues.json
export type VenueLocation = {
  readonly roomName: string;
  readonly floor?: number | string | null;
  readonly location?: { x: number; y: number };
};

export type VenueLocationMap = { readonly [key: string]: VenueLocation };
