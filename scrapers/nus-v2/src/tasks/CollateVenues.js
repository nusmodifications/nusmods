// @flow

import { map, entries, flatMap, groupBy, mapValues, values } from 'lodash';

import type { Task } from '../types/tasks';
import type { ModuleCode, RawLesson, Semester } from '../types/modules';
import type { LessonWithModuleCode, ModuleAliases, SemesterModuleData } from '../types/mapper';
import type { DayAvailability, VenueInfo, VenueLesson } from '../types/venues';
import type { Cache } from '../services/io';

import BaseTask from './BaseTask';
import config from '../config';
import { getTimeRange } from '../utils/time';
import { OCCUPIED } from '../types/venues';
import { mergeDualCodedModules } from '../utils/data';
import { union } from '../utils/set';

/**
 * Convert module timetable into venue availability and insert it into venues
 */
export function extractVenueAvailability(timetable: LessonWithModuleCode[]) {
  // 1. Only include lessons that actually have a venue
  const filteredLessons = timetable.filter((lesson) => lesson.Venue);

  // 2. Map lessons to the venue they're in
  const groupByVenue = groupBy(filteredLessons, (lesson) => lesson.Venue);

  return mapValues(groupByVenue, (venueLessons: LessonWithModuleCode[]) => {
    // 3. Remove the Venue key and map them again to the day of the lesson
    const lessonWithoutVenue: VenueLesson[] = venueLessons.map(({ Venue, ...lesson }) => lesson);
    const groupByDay = groupBy(lessonWithoutVenue, (lesson) => lesson.DayText);

    return map(groupByDay, (Classes: VenueLesson[], Day: string) => {
      // 4. Mark time between lesson start and end as occupied
      const Availability = {};
      for (const lesson of Classes) {
        getTimeRange(lesson.StartTime, lesson.EndTime).forEach((time) => {
          Availability[time] = OCCUPIED;
        });
      }

      return {
        Day,
        Classes,
        Availability,
      };
    });
  });
}

type Input = SemesterModuleData[];
type Output = {| venues: VenueInfo, aliases: ModuleAliases |};

// Use a longer expiry since we don't expect aliases to change often
const cacheExpiry = 7 * 24 * 60;

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
  aliasCache: Cache<ModuleAliases>;

  get name() {
    return `Collating venues for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super(academicYear);

    this.semester = semester;
    this.academicYear = academicYear;

    this.aliasCache = this.getCache(`semester-${semester}-aliases`, cacheExpiry);

    this.logger = this.rootLogger.child({
      semester,
      task: CollateVenues.name,
      year: academicYear,
    });
  }

  async run(input: Input) {
    this.logger.info(`Collating venues for ${this.academicYear} semester ${this.semester}`);

    // Insert module code and flatten lessons
    const venueLessons: LessonWithModuleCode[] = flatMap(input, (module) =>
      module.SemesterData.Timetable.map(
        (lesson: RawLesson): LessonWithModuleCode => ({
          ...lesson,
          ModuleCode: module.ModuleCode,
        }),
      ),
    );

    const venues = extractVenueAvailability(venueLessons);

    // Merge dual-coded modules and extract the aliases generated for use later
    const allAliases = {};
    for (const venue: DayAvailability[] of values(venues)) {
      for (const availability of venue) {
        const { lessons, aliases } = mergeDualCodedModules(availability.Classes);
        availability.Classes = lessons;

        // Merge the alias mappings
        for (const [moduleCode, alias]: [ModuleCode, Set<ModuleCode>] of entries(aliases)) {
          allAliases[moduleCode] = union(allAliases[moduleCode] || new Set(), alias);
        }
      }
    }

    // Save the results
    const outputAliases = mapValues(allAliases, (moduleCodes) => Array.from(moduleCodes));
    const venueList = Object.keys(venues);

    await Promise.all([
      this.io.venueInformation(this.semester, venues),
      this.io.venueList(this.semester, venueList),
      this.aliasCache.write(outputAliases),
    ]);

    return { venues, aliases: allAliases };
  }
}
