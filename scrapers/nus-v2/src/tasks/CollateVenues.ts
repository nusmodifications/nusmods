import { map, entries, flatMap, groupBy, mapValues, values } from 'lodash';

import { Task } from '../types/tasks';
import { Aliases, ModuleTitle, RawLesson, Semester } from '../types/modules';
import { LessonWithModuleCode, ModuleAliases, SemesterModuleData } from '../types/mapper';
import { Availability, VenueInfo, VenueLesson, OCCUPIED } from '../types/venues';
import { Cache } from '../services/io';

import BaseTask from './BaseTask';
import config from '../config';
import { getTimeRange } from '../utils/time';
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
      const availability: Availability = {};
      for (const lesson of Classes) {
        getTimeRange(lesson.StartTime, lesson.EndTime).forEach((time) => {
          availability[time] = OCCUPIED;
        });
      }

      return {
        Day,
        Classes,
        Availability: availability,
      };
    });
  });
}

type Input = SemesterModuleData[];
interface Output {
  venues: VenueInfo;
  aliases: ModuleAliases;
}

// Use a longer expiry since we don't expect aliases to change often
const cacheExpiry = 7 * 24 * 60;

/**
 * Map timetable lessons to venues to create a map of when each venue is being
 * used, as well as help identify dual-coded modules
 *
 * Output:
 * - <semester>/venues.json
 * - <semester>/venueInformation.json
 */
export default class CollateVenues extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;
  aliasCache: Cache<Aliases>;

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

    // Get a mapping of module code to module title to help with module aliasing
    const moduleCodeToTitle: { [moduleCode: string]: ModuleTitle } = {};
    input.forEach((module) => {
      moduleCodeToTitle[module.ModuleCode] = module.Module.ModuleTitle;
    });

    // Merge dual-coded modules and extract the aliases generated for use later
    const allAliases: ModuleAliases = {};
    for (const venue of values(venues)) {
      for (const availability of venue) {
        const { lessons, aliases } = mergeDualCodedModules(availability.Classes);
        availability.Classes = lessons;

        // Merge the alias mappings
        for (const [moduleCode, alias] of entries(aliases)) {
          // Only add the modules as alias if they have the same title
          const title = moduleCodeToTitle[moduleCode];
          const filteredAliases = Array.from(alias).filter(
            (module) => title === moduleCodeToTitle[module],
          );

          if (filteredAliases.length) {
            allAliases[moduleCode] = union(
              allAliases[moduleCode] || new Set(),
              new Set(filteredAliases),
            );
          }
        }
      }
    }

    // Save the results
    const outputAliases = mapValues(allAliases, (moduleCodes) => Array.from(moduleCodes));
    const venueList = Object.keys(venues);

    await Promise.all([
      this.io.venueInformation(this.semester, venues),
      this.io.venueList(this.semester, venueList),
      this.aliasCache.write(mapValues(outputAliases, (set): string[] => Array.from(set))),
    ]);

    return { venues, aliases: allAliases };
  }
}
