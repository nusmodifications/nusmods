import { strict as assert } from 'assert';
import { has, last, map, mapValues, values } from 'lodash';
import NUSModerator, { Semester as SemesterName } from 'nusmoderator';
import { compareAsc, differenceInDays, format, parseISO } from 'date-fns';

import getCovidZones, { getVenueCovidZone } from '../services/getCovidZones';
import getVenueLocations from '../services/getVenueLocations';

import { RawLesson, Semester, WeekRange, Weeks } from '../types/modules';
import { Task } from '../types/tasks';
import { TimetableLesson } from '../types/api';
import { Cache } from '../types/persist';

import { Logger } from '../services/logger';
import BaseTask from './BaseTask';
import config from '../config';
import { getTermCode, retry } from '../utils/api';
import { validateLesson, validateSemester } from '../services/validation';
import { activityLessonType, dayTextMap, unrecognizedLessonTypes } from '../utils/data';
import { allEqual, deltas } from '../utils/arrays';
import { ISO8601_DATE_FORMAT } from '../utils/time';

/* eslint-disable camelcase */

const SEMESTER_NAMES: Record<number, SemesterName> = {
  1: 'Semester 1',
  2: 'Semester 2',
  3: 'Special Sem 1',
  4: 'Special Sem 2',
};

// Intermediate shape with Weeks typed as string[]
type TempRawLesson = Omit<RawLesson, 'weeks' | 'covidZone'> & {
  weeks: string[];
};

/**
 * For deduplicating timetable lessons - we need a unique string identifier
 * for each lesson, so we leave out props that changes every lesson like eventdate.
 *
 * Session is not viable for differentiating lessons because things like having
 * different lecturers may also cause lessons to be marked as having different
 * sessions.
 */
const getLessonKey = (lesson: TimetableLesson) =>
  [
    lesson.activity,
    lesson.modgrp,
    lesson.day,
    lesson.start_time,
    lesson.end_time,
    lesson.room,
    // '|' is used as a delimiter because it is unlikely to appear
    // organically in the data
  ].join('|');

/**
 * Map date of lessons to either an array of numbers or an object representing
 * the range of date and the intervals between lessons
 */
export function mapLessonWeeks(dates: string[], semester: number, logger: Logger): Weeks {
  // Sanity check for lessons occurring on duplicate days
  if (dates.length !== new Set(dates).size) {
    logger.error('Lesson has duplicate dates');
  }

  const semesterName = SEMESTER_NAMES[semester];
  const lessonDates = dates.map((date) => parseISO(date)).sort(compareAsc);
  const weekInfo = lessonDates.map(NUSModerator.academicCalendar.getAcadWeekInfo);

  // Normal instructional week - return an array of weeks
  if (weekInfo.every((week) => week.type === 'Instructional' && week.sem === semesterName)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return weekInfo.map((week) => week.num!);
  }

  const firstDay = lessonDates[0];
  const weeks = lessonDates.map((date) => differenceInDays(date, firstDay) / 7 + 1);
  const intervals = deltas(weeks);

  // WeekRange always includes the start and end dates
  const weekRange: WeekRange = {
    start: format(lessonDates[0], ISO8601_DATE_FORMAT),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    end: format(last(lessonDates)!, ISO8601_DATE_FORMAT),
  };

  // Include interval only if there are more than one lessons
  // (otherwise weekInterval is Infinity), and the interval it is not 1
  const weekInterval = Math.min(...intervals);
  if (intervals.length > 0 && weekInterval !== 1) weekRange.weekInterval = weekInterval;

  // Include all week numbers if the interval is uneven
  if (!allEqual(intervals)) weekRange.weeks = weeks;

  // Sanity check for lessons which do not occur on the same day each week
  if (intervals.some((interval) => interval % 1 !== 0)) {
    logger.error({ intervals, lessonDates }, 'Uneven week intervals');
  }

  return weekRange;
}

/**
 * Mod group contains the activity at the start - this function removes that
 * because it is redundant.
 */
export function transformModgrpToClassNo(modgrp: string, activity: string): string {
  const trimmedModgrp = modgrp.trim();
  if (trimmedModgrp.startsWith(activity) && trimmedModgrp !== activity) {
    return trimmedModgrp.substring(activity.length);
  }
  return trimmedModgrp;
}

export function mapTimetableLesson(lesson: TimetableLesson, logger: Logger): TempRawLesson {
  const { room, start_time, end_time, day, module, modgrp, activity, eventdate, csize } = lesson;

  if (has(unrecognizedLessonTypes, activity)) {
    logger.warn(
      { moduleCode: module, activity },
      'Lesson type not recognized by the frontend used',
    );
  }

  return {
    classNo: transformModgrpToClassNo(modgrp, activity),
    // Start and end time don't have the ':' delimiter
    startTime: start_time.replace(':', ''),
    endTime: end_time.replace(':', ''),
    // For a single event, Weeks will always be one element
    weeks: [eventdate],
    // Room can be null
    venue: room || '',
    day: dayTextMap[day],
    lessonType: activityLessonType[activity],
    size: csize,
  };
}

type Input = void;

interface Output {
  [moduleCode: string]: RawLesson[];
}

/**
 * Download the timetable for a specific semester. Since the JSON returned by the
 * school is very large, we stream the entire timetable in one request and
 * reduce its size before saving it to disk to reduce memory usage.
 *
 * Output:
 *  - <semester>/<module code>/timetable.json
 */
export default class GetSemesterTimetable extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;
  private readonly timetableCache: Cache<TimetableLesson[]>;
  private readonly covidZones = getCovidZones();
  private readonly venueLocations = getVenueLocations();

  get name() {
    return `Get timetable for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super(academicYear);

    assert(validateSemester(semester), `${semester} is not a valid semester`);

    this.semester = semester;
    this.academicYear = academicYear;

    this.logger = this.rootLogger.child({
      semester,
      task: GetSemesterTimetable.name,
      year: academicYear,
    });

    this.timetableCache = this.getCache(`semester-${semester}-cache`);
  }

  getTimetable = async () => {
    const term = getTermCode(this.semester, this.academicYear);
    const timetables: { [moduleCode: string]: { [key: string]: TempRawLesson } } = {};

    let valid = 0;
    let invalid = 0;

    await this.api.getSemesterTimetables(term, (lesson) => {
      // 1. Even if the lesson is invalid, as long as any lesson appears in the
      //    system we know the module is offered this semester, so we have to
      //    add it to timetables
      if (!validateLesson(lesson, this.logger)) {
        if (lesson.module && !timetables[lesson.module]) {
          timetables[lesson.module] = {};
        }

        // Report serious error to Sentry
        if (!lesson.start_time || !lesson.end_time || lesson.start_time === lesson.end_time) {
          const { start_time, end_time, module } = lesson;
          this.logger.error(
            { moduleCode: module, end_time, start_time },
            'Lesson has no start and/or end time',
          );
        }

        invalid += 1;
        return;
      }

      valid += 1;

      // 2. Turn the lesson into a string key so we can index it in the timetable
      const key = getLessonKey(lesson);

      // 3. Make sure timetable is always an object
      if (!timetables[lesson.module]) timetables[lesson.module] = {};
      const timetable = timetables[lesson.module];

      // 4. If the lesson already exists, then we simply need to add one more date
      //    Otherwise, insert the lesson as a new item in the timetable
      const rawLesson = timetable[key];
      if (rawLesson) {
        rawLesson.weeks.push(lesson.eventdate);
      } else {
        timetable[key] = mapTimetableLesson(lesson, this.logger);
      }
    });

    this.logger.info({ valid, invalid }, 'Processed and removed invalid lessons');

    return mapValues(timetables, (timetableObject, moduleCode) =>
      // 5. Remove the lesson key inserted in (2) and remap the weeks to their correct shape
      values(timetableObject).map((lesson) => ({
        ...lesson,
        weeks: mapLessonWeeks(
          lesson.weeks,
          this.semester,
          this.logger.child({ moduleCode, lesson }),
        ),
      })),
    );
  };

  async run() {
    const timetablesWithoutCovidZones = await retry(this.getTimetable, 3);

    // Insert covid zoning to raw lessons. This is done separate from getTimetable so it can be
    // removed easily in the future
    const [covidZones, venues] = await Promise.all([this.covidZones, this.venueLocations]);
    const timetables = mapValues(timetablesWithoutCovidZones, (lessons) =>
      lessons.map((lesson) => ({
        ...lesson,
        covidZone: getVenueCovidZone(venues, covidZones, lesson.venue),
      })),
    );

    // Save all the timetables to disk
    await Promise.all(
      map(timetables, (timetable, moduleCode) =>
        this.io.timetable(this.semester, moduleCode, timetable),
      ),
    );

    return timetables;
  }
}
