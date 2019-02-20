import { AcadWeekInfo } from 'nusmoderator';
import {
  mapValues,
  flatMapDeep,
  groupBy,
  pick,
  map,
  isEmpty,
  last,
  omitBy,
  invert,
  values,
  partition,
  each,
  difference,
  range,
  isEqual,
  castArray,
  get,
  sample,
} from 'lodash';
import { addDays, min as minDate, parseISO } from 'date-fns';
import qs from 'query-string';

import {
  ClassNo,
  ColoredLesson,
  consumeWeeks,
  Lesson,
  LessonType,
  Module,
  ModuleCode,
  RawLesson,
  Semester,
} from 'types/modules';

import {
  HoverLesson,
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
  TimetableDayArrangement,
  TimetableDayFormat,
} from 'types/timetables';

import { ModulesMap } from 'reducers/moduleBank';
import { ModuleCodeMap } from 'types/reducers';
import { ExamClashes } from 'types/views';

import { getTimeAsDate } from './timify';
import { getModuleSemesterData, getModuleTimetable } from './modules';
import { deltas } from './array';

type LessonTypeAbbrev = { [lessonType: string]: string };
export const LESSON_TYPE_ABBREV: LessonTypeAbbrev = {
  'Design Lecture': 'DLEC',
  Laboratory: 'LAB',
  Lecture: 'LEC',
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

// Used for module config serialization - these must be query string safe
// See: https://stackoverflow.com/a/31300627
export const LESSON_TYPE_SEP = ':';
export const LESSON_SEP = ',';

const EMPTY_OBJECT = {};

export function isValidSemester(semester: Semester): boolean {
  return semester >= 1 && semester <= 4;
}

//  Returns a random configuration of a module's timetable lessons.
//  Used when a module is first added.
//  TODO: Suggest a configuration that does not clash with itself.
//  {
//    [lessonType: string]: ClassNo,
//  }
export function randomModuleLessonConfig(lessons: ReadonlyArray<RawLesson>): ModuleLessonConfig {
  const lessonByGroups: { [lessonType: string]: ReadonlyArray<RawLesson> } = groupBy(
    lessons,
    (lesson) => lesson.LessonType,
  );

  const lessonByGroupsByClassNo: {
    [lessonType: string]: { [classNo: string]: ReadonlyArray<RawLesson> };
  } = mapValues(lessonByGroups, (lessonsOfSameLessonType: ReadonlyArray<RawLesson>) =>
    groupBy(lessonsOfSameLessonType, (lesson) => lesson.ClassNo),
  );

  return mapValues(
    lessonByGroupsByClassNo,
    (group: { [classNo: string]: ReadonlyArray<RawLesson> }) => sample(group)![0].ClassNo,
  );
}

// Replaces ClassNo in SemTimetableConfig with Array<Lesson>
export function hydrateSemTimetableWithLessons(
  semTimetableConfig: SemTimetableConfig,
  modules: ModulesMap,
  semester: Semester,
): SemTimetableConfigWithLessons {
  return mapValues(
    semTimetableConfig,
    (moduleLessonConfig: ModuleLessonConfig, moduleCode: ModuleCode) => {
      const module: Module = modules[moduleCode];
      if (!module) return EMPTY_OBJECT;

      // TODO: Split this part into a smaller function: hydrateModuleConfigWithLessons.
      return mapValues(moduleLessonConfig, (classNo: ClassNo, lessonType: LessonType) => {
        const lessons = getModuleTimetable(module, semester);
        const newLessons = lessons.filter(
          (lesson: RawLesson): boolean =>
            lesson.LessonType === lessonType && lesson.ClassNo === classNo,
        );

        const timetableLessons: Lesson[] = newLessons.map(
          (lesson: RawLesson): Lesson => ({
            ...lesson,
            ModuleCode: moduleCode,
            ModuleTitle: module.ModuleTitle,
          }),
        );
        return timetableLessons;
      });
    },
  );
}

//  Filters a flat array of lessons and returns the lessons corresponding to lessonType.
export function lessonsForLessonType<T extends RawLesson>(
  lessons: ReadonlyArray<T>,
  lessonType: LessonType,
): ReadonlyArray<T> {
  return lessons.filter((lesson) => lesson.LessonType === lessonType);
}

//  Converts from timetable config format to flat array of lessons.
//  {
//    [moduleCode: string]: {
//      [lessonType: string]: [Lesson, Lesson, ...],
//      [lessonType: string]: [Lesson, ...],
//    }
//  }
export function timetableLessonsArray(timetable: SemTimetableConfigWithLessons): Lesson[] {
  return flatMapDeep(timetable, values);
}

//  Groups flat array of lessons by day.
//  {
//    Monday: [Lesson, Lesson, ...],
//    Tuesday: [Lesson, ...],
//  }
export function groupLessonsByDay(lessons: ColoredLesson[]): TimetableDayFormat {
  return groupBy(lessons, (lesson) => lesson.DayText);
}

//  Determines if two lessons overlap:
export function doLessonsOverlap(lesson1: Lesson, lesson2: Lesson): boolean {
  return (
    lesson1.DayText === lesson2.DayText &&
    lesson1.StartTime < lesson2.EndTime &&
    lesson2.StartTime < lesson1.EndTime
  );
}

//  Converts a flat array of lessons *for ONE day* into rows of lessons within that day row.
//  Result invariants:
//  - Each lesson will not overlap with each other.
//  [
//    [Lesson, Lesson, ...],
//    [Lesson, ...],
//  ]
export function arrangeLessonsWithinDay(lessons: ColoredLesson[]): TimetableDayArrangement {
  const rows: TimetableDayArrangement = [[]];
  if (isEmpty(lessons)) {
    return rows;
  }
  const sortedLessons = lessons.sort((a, b) => {
    const timeDiff = a.StartTime.localeCompare(b.StartTime);
    return timeDiff !== 0 ? timeDiff : a.ClassNo.localeCompare(b.ClassNo);
  });
  sortedLessons.forEach((lesson: ColoredLesson) => {
    for (let i = 0; i < rows.length; i++) {
      const rowLessons: ColoredLesson[] = rows[i];
      const previousLesson = last(rowLessons);
      if (!previousLesson || !doLessonsOverlap(previousLesson, lesson)) {
        // Lesson does not overlap with any Lesson in the row. Add it to row.
        rowLessons.push(lesson);
        return;
      }
    }
    // No existing rows are available to fit this lesson in. Append a new row.
    rows.push([lesson]);
  });

  return rows;
}

//  Accepts a flat array of lessons and groups them by day and rows with each day
//  for rendering on the timetable.
//  Clashes in Array<Lesson> will go onto the next row within that day.
//  {
//    Monday: [
//      [Lesson, Lesson, ...],
//    ],
//    Tuesday: [
//      [Lesson, Lesson, Lesson, ...],
//      [Lesson, Lesson, ...],
//      [Lesson, ...],
//    ],
//    ...
//  }
export function arrangeLessonsForWeek(lessons: ColoredLesson[]): TimetableArrangement {
  const dayLessons = groupLessonsByDay(lessons);
  return mapValues(dayLessons, (dayLesson: ColoredLesson[]) => arrangeLessonsWithinDay(dayLesson));
}

// Determines if a Lesson on the timetable can be modifiable / dragged around.
// Condition: There are multiple ClassNo for all the Array<Lesson> in a LessonType.
export function areOtherClassesAvailable(
  lessons: ReadonlyArray<RawLesson>,
  lessonType: LessonType,
): boolean {
  const lessonTypeGroups = groupBy<RawLesson>(lessons, (lesson) => lesson.LessonType);
  if (!lessonTypeGroups[lessonType]) {
    // No such LessonType.
    return false;
  }
  return Object.keys(groupBy(lessonTypeGroups[lessonType], (lesson) => lesson.ClassNo)).length > 1;
}

// Find all exam clashes between modules in semester
// Returns object associating exam dates with the modules clashing on those dates
export function findExamClashes(modules: Module[], semester: Semester): ExamClashes {
  const groupedModules = groupBy(modules, (module) =>
    get(getModuleSemesterData(module, semester), 'ExamDate'),
  );
  delete groupedModules.undefined; // Remove modules without exams
  return omitBy(groupedModules, (mods) => mods.length === 1); // Remove non-clashing mods
}

export function isLessonAvailable(
  lesson: Lesson,
  date: Date,
  weekInfo: Readonly<AcadWeekInfo>,
): boolean {
  return consumeWeeks(
    lesson.Weeks,
    (weeks) => weeks.includes(weekInfo.num!),
    (weekRange) => {
      const end = minDate([parseISO(weekRange.range.end), date]);
      for (
        let current = parseISO(weekRange.range.start);
        current <= end;
        current = addDays(current, 7)
      ) {
        if (isEqual(current, date)) return true;
      }

      return false;
    },
  );
}

export function isLessonOngoing(lesson: Lesson, currentTime: number): boolean {
  return (
    parseInt(lesson.StartTime, 10) <= currentTime && currentTime < parseInt(lesson.EndTime, 10)
  );
}

export function getStartTimeAsDate(lesson: Lesson, date: Date = new Date()): Date {
  return getTimeAsDate(lesson.StartTime, date);
}

export function getEndTimeAsDate(lesson: Lesson, date: Date = new Date()): Date {
  return getTimeAsDate(lesson.EndTime, date);
}

/**
 * Validates the modules in a timetable. It removes all modules which do not exist in
 * the provided module code map from the timetable and returns that as the first item
 * in the tuple, and the module code of all removed modules as the second item.
 *
 * @param timetable
 * @param moduleCodes
 * @returns {[SemTimetableConfig, ModuleCode[]]}
 */
export function validateTimetableModules(
  timetable: SemTimetableConfig,
  moduleCodes: ModuleCodeMap,
): [SemTimetableConfig, ModuleCode[]] {
  const [valid, invalid] = partition(
    Object.keys(timetable),
    (moduleCode: ModuleCode) => moduleCodes[moduleCode],
  );
  return [pick(timetable, valid), invalid];
}

/**
 * Validates the lesson config for a specific module. It replaces all lessons
 * which invalid class number with the first available class numbers, and
 * removes lessons that are no longer valid
 * @param semester
 * @param lessonConfig
 * @param module
 */
export function validateModuleLessons(
  semester: Semester,
  lessonConfig: ModuleLessonConfig,
  module: Module,
): [ModuleLessonConfig, LessonType[]] {
  const validatedLessonConfig: ModuleLessonConfig = {};
  const updatedLessonTypes: string[] = [];

  const validLessons = getModuleTimetable(module, semester);
  const lessonsByType = groupBy(validLessons, (lesson) => lesson.LessonType);

  each(lessonsByType, (lessons: RawLesson[], lessonType: LessonType) => {
    const classNo = lessonConfig[lessonType];

    // Check that the lesson exists and is valid. If it is not, insert a random
    // valid lesson. This covers both
    //
    // - lesson type is not in the original timetable (ie. a new lesson type was introduced)
    //   in which case classNo is undefined and thus would not match
    // - classNo is not valid anymore (ie. the class was removed)
    //
    // If a lesson type is removed, then it simply won't be copied over
    if (!lessons.some((lesson) => lesson.ClassNo === classNo)) {
      validatedLessonConfig[lessonType] = lessons[0].ClassNo;
      updatedLessonTypes.push(lessonType);
    } else {
      validatedLessonConfig[lessonType] = classNo;
    }
  });

  // Add all of the removed lesson types to the array of updated lesson types
  updatedLessonTypes.push(...difference(Object.keys(lessonConfig), Object.keys(lessonsByType)));
  return [validatedLessonConfig, updatedLessonTypes];
}

// Get information for all modules present in a semester timetable config
export function getSemesterModules(
  timetable: { [moduleCode: string]: unknown },
  modules: ModulesMap,
): Module[] {
  return values(pick(modules, Object.keys(timetable)));
}

function serializeModuleConfig(config: ModuleLessonConfig): string {
  // eg. { Lecture: 1, Laboratory: 2 } => LEC=1,LAB=2
  return map(config, (classNo, lessonType) =>
    [LESSON_TYPE_ABBREV[lessonType], encodeURIComponent(classNo)].join(LESSON_TYPE_SEP),
  ).join(LESSON_SEP);
}

function parseModuleConfig(serialized: string | string[] | null): ModuleLessonConfig {
  const config: ModuleLessonConfig = {};
  if (!serialized) return config;

  castArray(serialized).forEach((serializedModule) => {
    serializedModule.split(LESSON_SEP).forEach((lesson) => {
      const [lessonTypeAbbr, classNo] = lesson.split(LESSON_TYPE_SEP);
      const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
      // Ignore unparsable/invalid keys
      if (!lessonType) return;
      config[lessonType] = classNo;
    });
  });

  return config;
}

/**
 * Formats numeric week number array into something human readable
 *
 * - 1           => Week 1
 * - 1,2         => Weeks 1,2
 * - 1,2,3       => Weeks 1-3
 * - 1,2,3,5,6,7 => Weeks 1-3, 5-7
 */
export function formatNumericWeeks(weeks: number[]): string | null {
  if (weeks.length === 13) return null;
  if (weeks.length === 1) return `Week ${weeks[0]}`;

  // Check for odd / even weeks
  if (weeks.length >= 6 && deltas(weeks).every((d) => d === 2)) {
    return weeks[0] === 1 ? 'Odd Weeks' : 'Even Weeks';
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
    if (next - end === 1) {
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

// Converts a timetable config to query string
// eg:
// {
//   CS2104: { Lecture: '1', Tutorial: '2' },
//   CS2107: { Lecture: '1', Tutorial: '8' },
// }
// => CS2104=LEC:1,Tut:2&CS2107=LEC:1,Tut:8
export function serializeTimetable(timetable: SemTimetableConfig): string {
  // We are using query string safe characters, so this encoding is unnecessary
  return qs.stringify(mapValues(timetable, serializeModuleConfig), { encode: false });
}

export function deserializeTimetable(serialized: string): SemTimetableConfig {
  const params: Record<string, string> = qs.parse(serialized);
  return mapValues(params, parseModuleConfig);
}

export function isSameTimetableConfig(t1: SemTimetableConfig, t2: SemTimetableConfig): boolean {
  return isEqual(t1, t2);
}

export function isSameLesson(l1: Lesson, l2: Lesson) {
  return (
    l1.LessonType === l2.LessonType &&
    l1.ClassNo === l2.ClassNo &&
    l1.ModuleCode === l2.ModuleCode &&
    l1.StartTime === l2.StartTime &&
    l1.EndTime === l2.EndTime &&
    l1.DayText === l2.DayText &&
    isEqual(l1.Weeks, l2.Weeks)
  );
}

export function getHoverLesson(lesson: Lesson): HoverLesson {
  return {
    classNo: lesson.ClassNo,
    moduleCode: lesson.ModuleCode,
    lessonType: lesson.LessonType,
  };
}
