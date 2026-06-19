import {
  first,
  fromPairs,
  get,
  groupBy,
  invert,
  isNaN,
  isUndefined,
  keys,
  map,
  mapValues,
  maxBy,
  omitBy,
  pick,
  pickBy,
  size,
  some,
  split,
  toPairs,
} from 'lodash-es';

import {
  isWeekRange,
  LessonId,
  LessonType,
  ModuleLessonMap,
  RawLesson,
  WeekRange,
  Weeks,
} from 'types/modules';

import { Lesson } from 'types/timetables';

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
export const LESSON_ABBREV_TYPE: { [key: string]: LessonType } = invert(LESSON_TYPE_ABBREV);

/**
 * Used for {@link Weeks|Weeks} serialization - these must be query string safe
 * See: https://stackoverflow.com/a/31300627
 */
const LESSON_DETAILS_SEP = '|';
const WEEKS_SEP = '_';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';
export const DAY_OF_WEEK_ABBREV: { [x in DayOfWeek]: string } = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
  Sunday: 'SUN',
};
const DAY_OF_WEEK_FULL = invert(DAY_OF_WEEK_ABBREV);

/**
 * Obtain a semi-unique key for a lesson
 */
export function getLessonIdentifier(lesson: Lesson): string {
  return `${lesson.moduleCode}-${LESSON_TYPE_ABBREV[lesson.lessonType]}-${lesson.classNo}`;
}

export const serializeWeekNumbers = (weeks: readonly number[]): string => {
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
export const serializeWeekRange = ({ start, end, weekInterval, weeks }: WeekRange) => {
  const serializedStartEndInterval = [start, end, weekInterval ?? 0].join(WEEKS_SEP);
  if (isUndefined(weeks)) return serializedStartEndInterval;
  return `${serializedStartEndInterval}${WEEKS_SEP}${serializeWeekNumbers(weeks)}`;
};

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
  const { classNo, day, startTime, endTime, venue, weeks } = lesson;

  const abbreviatedDayOfWeek = DAY_OF_WEEK_ABBREV[day as DayOfWeek];
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
 * @returns a {@link ModuleLessonMap|ModuleLessonMap} from the `RawLesson`s provided
 */
export const makeModuleLessonMap = (lessons: readonly RawLesson[]): ModuleLessonMap<RawLesson> => {
  const lessonsByLessonType = groupBy(lessons, 'lessonType');
  return mapValues(lessonsByLessonType, (lessonsWithLessonType) =>
    fromPairs(map(lessonsWithLessonType, (lesson) => [serializeLessonDetails(lesson), lesson])),
  );
};

const deserializeWeekNumbers = async (serializedWeekNumbers: string): Promise<number[]> => {
  const weeks = map(split(serializedWeekNumbers, WEEKS_SEP), (week) => parseInt(week, 10));

  if (some(weeks, isNaN)) {
    throw new Error('Serialized weeks is malformed');
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
export const parseWeeks = async (serializedWeeks: string): Promise<Weeks> => {
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

  const weekInterval = parseInt(weekIntervalString, 10);
  const weeks = get(regexGroup, 'weeks', undefined);

  return omitBy(
    {
      start,
      end,
      weekInterval: weekInterval === 0 ? undefined : weekInterval,
      weeks: weeks ? await deserializeWeekNumbers(weeks) : undefined,
    },
    isUndefined,
  ) as WeekRange;
};

/**
 * Refer to {@link serializeLessonDetails|serializeLessonDetails}
 */
export const deserializeLessonDetails = async (
  lessonId: string,
): Promise<Omit<RawLesson, 'lessonType'>> => {
  const parsedRegex =
    /(?<classNo>.*)\|(?<abbreviatedDayOfWeek>.*)\|(?<startTime>.*)\|(?<endTime>.*)\|(?<venue>.*)\|(?<serializedWeeks>.*)/.exec(
      lessonId,
    );

  const regexGroup = parsedRegex?.groups;
  if (!regexGroup) {
    return Promise.reject('Lesson ID is malformed');
  }

  const classNo = get(regexGroup, 'classNo');
  const abbreviatedDayOfWeek = get(regexGroup, 'abbreviatedDayOfWeek');
  const startTime = get(regexGroup, 'startTime');
  const endTime = get(regexGroup, 'endTime');
  const venue = get(regexGroup, 'venue');
  const serializedWeeks = get(regexGroup, 'serializedWeeks');

  const day = get(DAY_OF_WEEK_FULL, abbreviatedDayOfWeek);
  const weeks = await parseWeeks(serializedWeeks);

  return {
    classNo,
    day,
    startTime,
    endTime,
    venue,
    weeks,
  };
};

/**
 * Used to recover from the config of a lesson type of a non-TA module with invalid lessons
 * @param lessonsWithLessonType lessons with the same lesson type to generate a valid lesson config from
 * @returns a `ClassNo`. The current implementation generates a config containing the first `ClassNo`
 */
export function getRecoveryClassNo(lessonsWithLessonType: Record<LessonId, RawLesson>): LessonId[] {
  const firstClass = first(map(lessonsWithLessonType));
  if (!firstClass) {
    return [];
  }
  return [firstClass.classNo];
}

/**
 * Used to recover from the config of a lesson type of a TA module with invalid lessons
 * @param lessonsWithLessonType lessons with the same lesson type to generate a valid lesson config from
 * @returns a `LessonId`. The current implementation generates a config containing the first `LessonId`
 */
export function getRecoverySerializedLessonDetails(
  lessonsWithLessonType: Record<LessonId, RawLesson>,
  configLessonTypeLessonIds: LessonId[],
): LessonId[] {
  const configLessonTypeLessonIdsSet = new Set(configLessonTypeLessonIds);
  const recoveryLessons = pickBy(lessonsWithLessonType, (lesson) =>
    configLessonTypeLessonIdsSet.has(lesson.classNo),
  );
  if (size(recoveryLessons) > 0) return keys(recoveryLessons);

  const firstLessonId = first(keys(lessonsWithLessonType));
  if (!firstLessonId) {
    return [];
  }
  return [firstLessonId];
}

/**
 * Find the `ClassNo` that is shared by the most TA lessons
 * Used for converting a TA module config to a non-TA module lesson config
 * @param lessonTypeLessons all lessons of the `LessonType`
 * @param configLessonTypeLessonIds `LessonId`s of a lesson type in a TA module lesson config
 * @returns
 */
export function getClosestClassNo(
  lessonTypeLessons: Record<LessonId, RawLesson>,
  configLessonTypeLessonIds: LessonId[],
) {
  const configLessonsByClassNo = groupBy(
    pick(lessonTypeLessons, configLessonTypeLessonIds),
    'classNo',
  );
  const closestLessons = maxBy(
    toPairs(configLessonsByClassNo),
    ([, lessonsWithClassNo]) => lessonsWithClassNo.length,
  );

  if (!closestLessons) return null;
  return closestLessons[0];
}
