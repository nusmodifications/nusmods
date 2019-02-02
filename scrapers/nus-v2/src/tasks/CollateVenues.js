// @flow

import { entries, groupBy, mapValues, merge } from 'lodash';

import type { Task } from '../types/tasks';
import type { ModuleCode, RawLesson, Semester } from '../types/modules';
import type { SemesterModuleData } from '../types/mapper';
import type { VenueInfo, VenueLesson } from '../types/venues';

import BaseTask from './BaseTask';
import config from '../config';
import { getTimeRange } from '../utils/time';
import { OCCUPIED } from '../types/venues';

/**
 * Convert module timetable into venue availability
 */
export function extractVenueAvailability(moduleCode: ModuleCode, timetable: RawLesson[]) {
  // 1. Only include lessons that actually have a venue
  const filteredLessons = timetable.filter((lesson) => lesson.Venue);

  // 2. Map lessons to the venue they're in
  const groupedLessons = groupBy(filteredLessons, (lesson) => lesson.Venue);

  return mapValues(groupedLessons, (lessons: RawLesson[]) =>
    // 3. Then map them again to the day of the lesson
    entries(groupBy(lessons, (lesson) => lesson.DayText)).map(
      ([Day, dayLessons]: [string, RawLesson[]]) => {
        // 4. Inject module code and remove Venue from the class
        const Classes = dayLessons.map<VenueLesson>(({ Venue, ...lesson }) => ({
          ...lesson,
          ModuleCode: moduleCode,
        }));

        // 5. Mark time between lesson start and end as occupied
        const Availability = {};
        dayLessons.forEach((lesson) => {
          getTimeRange(lesson.StartTime, lesson.EndTime).forEach((time) => {
            Availability[time] = OCCUPIED;
          });
        });

        return {
          Day,
          Classes,
          Availability,
        };
      },
    ),
  );
}

type Input = SemesterModuleData[];
type Output = VenueInfo;

/**
 * Map timetable lessons to venues to create a map of when each venue is being
 * used
 *
 * Output:
 * - <semester>/venues.json
 * - <semester>/venueInformation.json
 */
export default class CollateVenues extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  get name() {
    return `Collating venues for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super(academicYear);

    this.semester = semester;
    this.academicYear = academicYear;

    this.logger = this.rootLogger.child({
      semester,
      task: CollateVenues.name,
      year: academicYear,
    });
  }

  async run(input: Input) {
    this.logger.info(`Collating venues for ${this.academicYear} semester ${this.semester}`);

    let venues = {};
    input.forEach((module) => {
      // Extract availability for each module and merge the result back into venues
      const availability = extractVenueAvailability(
        module.ModuleCode,
        module.SemesterData.Timetable,
      );

      // Deep merging is used here because we want each module's venue occupancy
      // status to be added
      venues = merge(venues, availability);
    });

    // Save the results
    const venueList = Object.keys(venues);
    await Promise.all([
      this.io.venueInformation(this.semester, venues),
      this.io.venueList(this.semester, venueList),
    ]);

    return venues;
  }
}
