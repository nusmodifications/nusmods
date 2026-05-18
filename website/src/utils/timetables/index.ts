import { AcadWeekInfo } from 'nusmoderator';
import { flatMapDeep, groupBy, isEqual, map, mapValues, range, sample, values } from 'lodash-es';
import { addDays, min as minDate, parseISO, startOfDay } from 'date-fns';

import {
  consumeWeeks,
  LessonIndex,
  LessonType,
  RawLessonWithIndex,
  NumericWeeks,
  RawLesson,
  Semester,
  ClassNo,
} from 'types/modules';

import {
  HoverLesson,
  InteractableLesson,
  Lesson,
  LessonWithIndex,
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
} from 'types/timetables';

import { getTimeAsDate } from '../timify';
import { deltas } from '../array';

export function isValidSemester(semester: Semester): boolean {
  return semester >= 1 && semester <= 4;
}

//  Returns a random configuration of a module's timetable lessons.
//  Used when a module is first added.
//  TODO: Suggest a configuration that does not clash with itself.
//  {
//    [lessonType: string]: ClassNo,
//  }
export function randomModuleLessonConfig(lessons: readonly RawLesson[]): ModuleLessonConfig {
  const lessonsWithIndices = map(lessons, (lesson, lessonIndex) => ({ ...lesson, lessonIndex }));

  const lessonByGroups: { [lessonType: string]: readonly RawLessonWithIndex[] } = groupBy(
    lessonsWithIndices,
    (lesson) => lesson.lessonType,
  );

  const lessonByGroupsByClassNo: {
    [lessonType: string]: { [classNo: string]: readonly RawLessonWithIndex[] };
  } = mapValues(lessonByGroups, (lessonsOfSamelessonType: readonly RawLessonWithIndex[]) =>
    groupBy(lessonsOfSamelessonType, (lesson) => lesson.classNo),
  );

  return mapValues(
    lessonByGroupsByClassNo,
    (group: { [classNo: string]: readonly RawLessonWithIndex[] }) => {
      const randomlySelectedLessons = sample(group);
      return map(randomlySelectedLessons, 'lessonIndex');
    },
  );
}

//  Filters a flat array of lessons and returns the lessons corresponding to lessonType.
export function lessonsForLessonType<T extends RawLesson>(
  lessons: readonly T[],
  lessonType: LessonType,
): readonly T[] {
  return lessons.filter((lesson) => lesson.lessonType === lessonType);
}

//  Converts from timetable config format to flat array of lessons.
//  {
//    [moduleCode: string]: {
//      [lessonType: string]: [Lesson, Lesson, ...],
//      [lessonType: string]: [Lesson, ...],
//    }
//  }
export function timetableLessonsArray(timetable: SemTimetableConfigWithLessons): LessonWithIndex[] {
  return flatMapDeep(timetable, values);
}

export function isLessonAvailable(
  lesson: Lesson,
  date: Date,
  weekInfo: Readonly<AcadWeekInfo>,
): boolean {
  return consumeWeeks(
    lesson.weeks,
    (weeks) => weeks.includes(weekInfo.num as number),
    (weekRange) => {
      const end = minDate([parseISO(weekRange.end), date]);
      for (let current = parseISO(weekRange.start); current <= end; current = addDays(current, 7)) {
        if (isEqual(current, startOfDay(date))) return true;
      }

      return false;
    },
  );
}

export function isLessonOngoing(lesson: Lesson, currentTime: number): boolean {
  return (
    parseInt(lesson.startTime, 10) <= currentTime && currentTime < parseInt(lesson.endTime, 10)
  );
}

export function getStartTimeAsDate(lesson: Lesson, date: Date = new Date()): Date {
  return getTimeAsDate(lesson.startTime, date);
}

export function getEndTimeAsDate(lesson: Lesson, date: Date = new Date()): Date {
  return getTimeAsDate(lesson.endTime, date);
}

/**
 * Formats numeric week number array into something human readable
 *
 * - 1           => Week 1
 * - 1,2         => Weeks 1,2
 * - 1,2,3       => Weeks 1-3
 * - 1,2,3,5,6,7 => Weeks 1-3, 5-7
 */
export function formatNumericWeeks(unprocessedWeeks: NumericWeeks): string | null {
  // Ensure list of weeks are unique
  const weeks = unprocessedWeeks.filter(
    (value, index) => unprocessedWeeks.indexOf(value) === index,
  );

  if (weeks.length === 13) return null;
  if (weeks.length === 1) return `Week ${weeks[0]}`;

  // Check for odd / even weeks. There are more odd weeks then even weeks, so we have to split
  // the length check.
  if (deltas(weeks).every((d) => d === 2)) {
    if (weeks[0] % 2 === 0 && weeks.length >= 6) return 'Even Weeks';
    if (weeks[0] % 2 === 1 && weeks.length >= 7) return 'Odd Weeks';
  }

  // Merge consecutive
  const processed: (number | string)[] = [];
  let start = weeks[0];
  let end = start;

  const mergeConsecutive = () => {
    if (end - start > 2) {
      processed.push(`${start}-${end}`);
    } else {
      processed.push(...range(start, end + 1));
    }
  };

  weeks.slice(1).forEach((next) => {
    if (next - end <= 1) {
      // Consecutive week number - keep going
      end = next;
    } else {
      // Break = push the current chunk into processed
      mergeConsecutive();
      start = next;
      end = start;
    }
  });

  mergeConsecutive();

  return `Weeks ${processed.join(', ')}`;
}

/**
 * A helper function to convert the lesson indices array in a semester timetable config to sets
 */
function convertSemTimetableConfigLessonIndicesFromArrayToSets(
  semTimetableConfig: SemTimetableConfig,
): {
  [lessonType: LessonType]: {
    [classNo: ClassNo]: Set<LessonIndex>;
  };
} {
  return mapValues(semTimetableConfig, (moduleLessonConfig) =>
    mapValues(moduleLessonConfig, (lessonsInLessonType) => new Set(lessonsInLessonType)),
  );
}

export function isSameTimetableConfig(t1: SemTimetableConfig, t2: SemTimetableConfig): boolean {
  return isEqual(
    convertSemTimetableConfigLessonIndicesFromArrayToSets(t1),
    convertSemTimetableConfigLessonIndicesFromArrayToSets(t2),
  );
}

export function isSameLesson(l1: Lesson, l2: Lesson) {
  return (
    l1.lessonType === l2.lessonType &&
    l1.classNo === l2.classNo &&
    l1.moduleCode === l2.moduleCode &&
    l1.startTime === l2.startTime &&
    l1.endTime === l2.endTime &&
    l1.day === l2.day &&
    isEqual(l1.weeks, l2.weeks)
  );
}

export function getHoverLesson(lesson: InteractableLesson): HoverLesson {
  return {
    classNo: lesson.classNo,
    moduleCode: lesson.moduleCode,
    lessonType: lesson.lessonType,
    lessonIndex: lesson.lessonIndex,
  };
}

export { findExamClashes } from './exams';
export { isInteractable, getInteractableLessons } from './interactabilityHydration';
export { hydrateSemTimetableWithLessons } from './lessonHydration';
export {
  getClosestLessonConfig,
  getLessonIndices,
  getRecoveryLessonIndices,
  getSemesterModules,
  makeLessonIndicesMap,
} from './lessonIndices';
export { LESSON_ABBREV_TYPE, LESSON_TYPE_ABBREV, getLessonIdentifier } from './lessonId';
export { arrangeLessonsForWeek, groupLessonsByDay } from './lessonsArrangement';
export { migrateSemTimetableConfig } from './migration';
export {
  deserializeTimetable,
  parseTaModuleCodes,
  serializeModuleList,
  serializeTimetable,
} from './shareLinks';
export { validateModuleLessons, validateTimetableModules } from './validation';
