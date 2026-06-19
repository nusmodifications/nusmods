import {
  fromPairs,
  get,
  groupBy,
  invert,
  isNaN,
  isUndefined,
  map,
  mapValues,
  omitBy,
  some,
  split,
} from 'lodash';
import { DayText, Lesson, ModuleLessonMap, RawLesson, WeekRange, Weeks } from './types';

type lessonTypeAbbrev = { [lessonType: string]: string };
export const LESSON_TYPE_ABBREV: lessonTypeAbbrev = {
  'Design Lecture': 'DLEC',
  Laboratory: 'LAB',
  Lecture: 'LEC',
  'Packaged Laboratory': 'PLAB',
  'Packaged Lecture': 'PLEC',
  'Packaged Tutorial': 'PTUT',
  Recitation: 'REC',
  'Sectional Teaching': 'SEC',
  'Seminar-Style Module Class': 'SEM',
  Tutorial: 'TUT',
  'Tutorial Type 2': 'TUT2',
  'Tutorial Type 3': 'TUT3',
  Workshop: 'WS',
};

// Reverse lookup map of LESSON_TYPE_ABBREV
export const LESSON_ABBREV_TYPE = invert(LESSON_TYPE_ABBREV);

/**
 * Used for {@link Weeks|Weeks} serialization - these must be query string safe
 * See: https://stackoverflow.com/a/31300627
 */
const LESSON_DETAILS_SEP = '|';
const WEEKS_SEP = '_';

// Ignore the sort-objects rule because sorting by order of days of week is more logical than sorting by alphabetical order
/* eslint-disable @perfectionist/sort-objects */
export const DAY_OF_WEEK_ABBREV: Record<DayText, string> = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
  Sunday: 'SUN',
};
/* eslint-enable @perfectionist/sort-objects */

/**
 * Obtain a semi-unique key for a lesson
 */
export function getLessonIdentifier(lesson: Lesson): string {
  return `${lesson.moduleCode}-${LESSON_TYPE_ABBREV[lesson.lessonType]}-${lesson.classNo}`;
}

export const serializeWeekNumbers = (weeks: Readonly<Array<number>>): string => {
  return weeks.join(WEEKS_SEP);
};

/**
 * Given a {@link WeekRange|WeekRange}
 * ```ts
 * {
 *   start: "2025-01-13",
 *   end: "2025-02-14",
 *   weekInterval: 1,
 *   weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
 * }
 * ```
 * will be serialized to `2025-01-13_2025-02-14_1_1_2_3_4_5_6_7_8_9_10_11_12_13`\
 *
 * If `weekInterval` is undefined, it is serialized as `0`, _despite the fact that a 1 week interval is assumed in the logic_\
 * If weeks is an empty array, the serialized string would be `2025-01-13_2025-02-14_`\
 * If weeks is undefined, the serialized string would be `2025-01-13_2025-02-14`, without the dangling `_`\
 * to ensure that the string is a complete and unique representation of the WeekRange\
 */
export const serializeWeekRange = ({ end, start, weekInterval, weeks }: WeekRange) => {
  const serializedStartEndInterval = [start, end, weekInterval ?? 0].join(WEEKS_SEP);
  if (isUndefined(weeks)) {
    return serializedStartEndInterval;
  }

  return `${serializedStartEndInterval}${WEEKS_SEP}${serializeWeekNumbers(weeks)}`;
};

/**
 * Typesafe helper functions for consuming Weeks
 */
export const isWeekRange = (week: Weeks): week is WeekRange => !Array.isArray(week);

/**
 * Given a {@link RawLesson|RawLesson}
 * ```ts
 * {
 *   classNo: 1,
 *   day: "Wednesday",
 *   startTime: "1000",
 *   endTime: "1200",
 *   lessonType: "Lecture",
 *   venue: "LT26",
 *   weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
 * }
 * ```
 * will be serialized to `1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13`\
 *
 * Notably, _`lessonType` is excluded_ because timetable serialization groups lessons together
 */
export const serializeLessonDetails = <T extends RawLesson>(lesson: T): string => {
  const { classNo, day, endTime, startTime, venue, weeks } = lesson;

  const abbreviatedDayOfWeek = DAY_OF_WEEK_ABBREV[day as DayText];
  const serializedWeeks = isWeekRange(weeks)
    ? serializeWeekRange(weeks)
    : serializeWeekNumbers(weeks);

  return [classNo, abbreviatedDayOfWeek, startTime, endTime, venue, serializedWeeks].join(
    LESSON_DETAILS_SEP,
  );
};

/**
 * Group lessons by lesson types
 * @param lessons lessons to group
 * @returns map of `LessonId`s, not lessons
 */
export const makeModuleLessonMap = (lessons: Readonly<Array<RawLesson>>): ModuleLessonMap => {
  const lessonsByLessonType = groupBy(lessons, 'lessonType');
  return mapValues(lessonsByLessonType, (lessonsWithLessonType) =>
    fromPairs(map(lessonsWithLessonType, (lesson) => [serializeLessonDetails(lesson), lesson])),
  );
};

const deserializeWeekNumbers = (serializedWeekNumbers: string): Array<number> => {
  const weeks = map(split(serializedWeekNumbers, WEEKS_SEP), (week) => Number.parseInt(week, 10));

  if (some(weeks, isNaN)) {
    throw 'Serialized weeks is malformed';
  }

  return weeks;
};

/**
 * Parses serialized weeks by first attempting to deserialize it as a week range\
 * if that fails, attempt to deserialize it as week numbers\
 * if that also fails, the string is malformed
 * @param serializedWeeks
 * @returns
 */
export const parseWeeks = (serializedWeeks: string): Weeks => {
  const parsedRegex =
    /(?<start>[0-9]{4}-[0-9]{2}-[0-9]{2})_(?<end>[0-9]{4}-[0-9]{2}-[0-9]{2})_(?<weekInterval>[0-9])_?(?<weeks>(?:_*[0-9])*)/.exec(
      serializedWeeks,
    );
  const regexGroup = parsedRegex?.groups;
  if (!regexGroup) {
    return deserializeWeekNumbers(serializedWeeks);
  }

  const start = get(regexGroup, 'start');
  const end = get(regexGroup, 'end');
  const weekIntervalString = get(regexGroup, 'weekInterval');

  const weekInterval = Number.parseInt(weekIntervalString, 10);
  const weeks = get(regexGroup, 'weeks', undefined);

  return omitBy(
    {
      end,
      start,
      weekInterval: weekInterval === 0 ? undefined : weekInterval,
      weeks: weeks ? deserializeWeekNumbers(weeks) : undefined,
    },
    isUndefined,
  ) as WeekRange;
};
