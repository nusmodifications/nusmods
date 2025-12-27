import type { DayText, EndTime, StartTime, ModuleCode, RawLesson } from './modules';

export type Venue = string;
export type VenueList = Venue[];
// Components within a venue availability class:
export type VenueOccupiedState = 'vacant' | 'occupied';
export const VACANT: VenueOccupiedState = 'vacant';
export const OCCUPIED: VenueOccupiedState = 'occupied';

export type Availability = { [lessonTime: string]: VenueOccupiedState | undefined }; // E.g. { "1000": "vacant", "1030": "occupied", ... }

// Raw lessons obtained from venue info API includes ModuleCode and without venue and without lessonIndex
export type VenueLesson = Omit<RawLesson, 'venue' | 'lessonIndex'> & {
  moduleCode: ModuleCode;
};

// A venue's availability info for one day
// E.g. { "Day": "Monday", "Classes": [...], "Availability": {...} }
export type DayAvailability = {
  readonly day: DayText;
  readonly classes: VenueLesson[];
  readonly availability: Availability;
};

// Describes venueInformation.json
// E.g. { "LT16": [DayAvailability1, DayAvailability2, ...], "LT17": [...], ... }
export type VenueInfo = { [venue: string]: DayAvailability[] };

// Used to specify availability search options
// All properties are number to make (de)serialization into query string simpler to handle
export type VenueSearchOptions = {
  readonly day: number; // Day of week (ie. 0 = Monday, 1 = Tuesday etc.)
  readonly time: number; // in hours (ie. 9 = 9am, 13 = 1pm etc.)
  readonly duration: number; // in hours
};

export type VenueDetailList = [Venue, DayAvailability[]][];

export type VenueLocation = {
  readonly roomName: string;
  readonly floor?: number | string | null;
  readonly location?: { x: number; y: number };
};

export type LatLngTuple = [number, number];

export type Shuttle = {
  name: string;
  routeId: number;
};

export type BusStop = {
  readonly latitude: number;
  readonly longitude: number;
  // Human readable name for the stop
  readonly caption: string;
  // Used for accessing the next bus API. This is called 'name' in the API.
  readonly name: string;
  readonly longName: string;
  readonly shortName: string;
  // Bus routes that stops at the bus stop
  readonly shuttles: Shuttle[];
  readonly opposite: string | null;
  // Whether to show the routes on the left instead of right
  // to avoid overlapping some other bus stop
  readonly leftLabel?: boolean;
};

export type NextBusTime = number | '-' | 'Arr';

export type NextBus = {
  readonly arrivalTime: NextBusTime;
  readonly nextArrivalTime: NextBusTime;
};

export type NextBusTimings = { [route: string]: NextBus };

// data/venues.json is of this type
export type VenueLocationMap = { readonly [key: string]: VenueLocation };

export type BusTiming = {
  // Loading uses a boolean instead of making timings null so that
  // the old timing can be seen while it is refreshed
  isLoading: boolean;
  timings?: NextBusTimings | null;
  error?: Error | null;
};

/**
 * Represents a time period in the timetable.
 */
export type TimePeriod = {
  day: number; // Day of week (ie. 0 = Monday, 1 = Tuesday etc.)
  startTime: StartTime;
  endTime: EndTime;
};
