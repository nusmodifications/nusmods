import { AcadWeekInfo } from 'nusmoderator';
import { flatMap, groupBy, isEqual, keys, pick, range, sample, values, reduce } from 'lodash-es';
import { addDays, min as minDate, parseISO, startOfDay } from 'date-fns';

import {
  consumeWeeks,
  LessonType,
  ModuleLessonMap,
  NumericWeeks,
  RawLesson,
  Semester,
  Module,
} from 'types/modules';

import {
  HoverLesson,
  InteractableLesson,
  Lesson,
  ModuleLessonConfig,
  SemTimetableConfigWithLessons,
} from 'types/timetables';

import { getTimeAsDate } from '../timify';
import { deltas } from '../array';
import { ModulesMap } from 'types/reducers';

export function isValidSemester(semester: Semester): boolean {
  return semester >= 1 && semester <= 4;
}

/**
 * Returns a random configuration of a module's timetable lessons.
 * Used when a module is first added.
 *
 * ModuleLessonConfig has the following shape:
 *
 * ```ts
 * {
 *   [lessonType: string]: ClassNo[],
 * }
 * ```
 *
 * If a lesson type has no class numbers to choose from, it is omitted.
 *
 * TODO: Suggest a configuration that does not clash with itself.
 */
export function randomModuleLessonConfig(
  lessonMap: ModuleLessonMap<RawLesson>,
): ModuleLessonConfig {
  return reduce(
    lessonMap,
    (randomLessonConfig, lessons, lessonType) => {
      const lessonsByClassNo = groupBy(lessons, 'classNo');
      const randomClassNo = sample(keys(lessonsByClassNo));

      if (!randomClassNo) return randomLessonConfig;

      return {
        ...randomLessonConfig,
        [lessonType]: [randomClassNo],
      };
    },
    {} as ModuleLessonConfig,
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

/**
 * Converts from timetable config format to flat array of lessons.
 *
 * SemTimetableConfigWithLessons has the following shape:
 *
 * ```ts
 * {
 *   [moduleCode: string]: {
 *     [lessonType: string]: [Lesson, Lesson, ...],
 *     [lessonType: string]: [Lesson, ...],
 *   }
 * }
 * ```
 */
export function timetableLessonsArray<T extends Lesson>(
  timetable: SemTimetableConfigWithLessons<T>,
): T[] {
  return flatMap(timetable, (moduleLessonConfig) => flatMap(moduleLessonConfig, values));
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
    lessonId: lesson.lessonId,
  };
}

// Get information for all modules present in a semester timetable config
export function getSemesterModules(
  timetable: { [moduleCode: string]: unknown },
  modules: ModulesMap,
): Module[] {
  return values(pick(modules, Object.keys(timetable)));
}

export { findExamClashes } from './exams';
export { isInteractable, getInteractableLessons } from './interactabilityHydration';
export { hydrateSemTimetableWithLessons } from './lessonHydration';
export {
  getClosestClassNo,
  getClosestLessonConfig,
  getRecoveryClassNo,
  isClassNo,
  getRecoverySerializedLessonDetails,
  makeModuleLessonMap,
  serializeLessonDetails,
} from './lessonId';
export { LESSON_ABBREV_TYPE, LESSON_TYPE_ABBREV, getLessonIdentifier } from './lessonId';
export { arrangeLessonsForWeek, doLessonsOverlap, groupLessonsByDay } from './lessonsArrangement';
export { migrateSemTimetableConfig } from './migration';
export {
  deserializeTimetable,
  parseTaModuleCodes,
  getImportedModuleCodes,
  serializeModuleList,
  serializeTimetable,
} from './shareLinks';
export { validateModuleLessons, validateTimetableModules } from './validation';
