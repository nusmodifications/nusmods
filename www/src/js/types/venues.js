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
export type DayAvailability = {|
  +Day: DayText,
  +Classes: VenueLesson[],
  +Availability: Availability,
|};

// Describes venueInformation.json
// E.g. { "LT16": [DayAvailability1, DayAvailability2, ...], "LT17": [...], ... }
export type VenueInfo = { [Venue]: DayAvailability[] };

// Used to specify availability search options
// All properties are number to make (de)serialization into query string simpler to handle
export type VenueSearchOptions = {|
  +day: number, // Day of week (ie. 0 = Monday, 1 = Tuesday etc.)
  +time: number, // in hours (ie. 9 = 9am, 13 = 1pm etc.)
  +duration: number, // in hours
|};

export type VenueDetailList = [Venue, DayAvailability[]][];

export type VenueLocation = {|
  +roomName: string,
  +floor: ?(number | string),
  +location?: { x: number, y: number },
|};

export type LatLngTuple = [number, number];

export type BusStop = {
  location: LatLngTuple,
  // Human readable name for the stop
  +name: string,
  // Used for accessing the next bus API. This is called 'name' in the API.
  +code: string,
  // Bus routes that stops at the bus stop
  +routes: string[],
  // Whether to show the routes on the left instead of right
  // to avoid overlapping some other bus stop
  +displayRoutesLeft?: boolean,
};

export type NextBusTime = number | '-' | 'Arr';

export type NextBus = {|
  +arrivalTime: NextBusTime,
  +nextArrivalTime: NextBusTime,
|};

export type NextBusTimings = { [route: string]: NextBus };

// data/venues.json is of this type
export type VenueLocationMap = {| +[string]: VenueLocation |};
