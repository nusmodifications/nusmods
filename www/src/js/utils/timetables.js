// @flow
import type { AcadWeekInfo } from 'nusmoderator';
import _ from 'lodash';
import qs from 'query-string';

import type {
  ClassNo,
  ColoredLesson,
  Lesson,
  LessonType,
  Module,
  ModuleCode,
  RawLesson,
  Semester,
  WeekText,
} from 'types/modules';
import type {
  HoverLesson,
  ModuleLessonConfig,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TimetableArrangement,
  TimetableDayArrangement,
  TimetableDayFormat,
} from 'types/timetables';
import type { ModulesMap } from 'reducers/moduleBank';
import type { ModuleCodeMap } from 'types/reducers';

import { getModuleSemesterData, getModuleTimetable } from 'utils/modules';
import { getTimeAsDate } from 'utils/timify';
import type { ExamClashes } from 'types/views';

type LessonTypeAbbrev = { [LessonType]: string };
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
export const LESSON_ABBREV_TYPE: { [string]: LessonType } = _.invert(LESSON_TYPE_ABBREV);

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
//    [LessonType]: ClassNo,
//  }
export function randomModuleLessonConfig(lessons: Array<RawLesson>): ModuleLessonConfig {
  const lessonByGroups: { [LessonType]: Array<RawLesson> } = _.groupBy(
    lessons,
    (lesson) => lesson.LessonType,
  );

  const lessonByGroupsByClassNo: { [LessonType]: { [ClassNo]: Array<RawLesson> } } = _.mapValues(
    lessonByGroups,
    (lessonsOfSameLessonType: Array<RawLesson>) =>
      _.groupBy(lessonsOfSameLessonType, (lesson) => lesson.ClassNo),
  );

  return _.mapValues(
    lessonByGroupsByClassNo,
    (group: { [ClassNo]: Array<RawLesson> }) => _.sample(group)[0].ClassNo,
  );
}

// Replaces ClassNo in SemTimetableConfig with Array<Lesson>
export function hydrateSemTimetableWithLessons(
  semTimetableConfig: SemTimetableConfig,
  modules: ModulesMap,
  semester: Semester,
): SemTimetableConfigWithLessons {
  return _.mapValues(
    semTimetableConfig,
    (moduleLessonConfig: ModuleLessonConfig, moduleCode: ModuleCode) => {
      const module: Module = modules[moduleCode];
      if (!module) return EMPTY_OBJECT;

      // TODO: Split this part into a smaller function: hydrateModuleConfigWithLessons.
      return _.mapValues(moduleLessonConfig, (classNo: ClassNo, lessonType: LessonType) => {
        const lessons: Array<RawLesson> = getModuleTimetable(module, semester);
        const newLessons: Array<RawLesson> = lessons.filter(
          (lesson: RawLesson): boolean =>
            lesson.LessonType === lessonType && lesson.ClassNo === classNo,
        );
        const timetableLessons: Array<Lesson> = newLessons.map(
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
export function lessonsForLessonType(
  lessons: Array<RawLesson | Lesson>,
  lessonType: LessonType,
): Array<RawLesson | Lesson> {
  return _.filter(lessons, (lesson) => lesson.LessonType === lessonType);
}

//  Converts from timetable config format to flat array of lessons.
//  {
//    [ModuleCode]: {
//      [LessonType]: [Lesson, Lesson, ...],
//      [LessonType]: [Lesson, ...],
//    }
//  }
export function timetableLessonsArray(timetable: SemTimetableConfigWithLessons): Array<Lesson> {
  return _.flatMapDeep(timetable, _.values);
}

//  Groups flat array of lessons by day.
//  {
//    Monday: [Lesson, Lesson, ...],
//    Tuesday: [Lesson, ...],
//  }
export function groupLessonsByDay(lessons: ColoredLesson[]): TimetableDayFormat {
  return _.groupBy(lessons, (lesson) => lesson.DayText);
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
  if (_.isEmpty(lessons)) {
    return rows;
  }
  const sortedLessons = lessons.sort((a, b) => {
    const timeDiff = a.StartTime.localeCompare(b.StartTime);
    return timeDiff !== 0 ? timeDiff : a.ClassNo.localeCompare(b.ClassNo);
  });
  sortedLessons.forEach((lesson: ColoredLesson) => {
    for (let i = 0; i < rows.length; i++) {
      const rowLessons: ColoredLesson[] = rows[i];
      const previousLesson = _.last(rowLessons);
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
// $FlowFixMe - Flow refuses to accept 'extra' properties on Lesson object
export function arrangeLessonsForWeek(lessons: ColoredLesson[]): TimetableArrangement {
  const dayLessons = groupLessonsByDay(lessons);
  return _.mapValues(dayLessons, (dayLesson: ColoredLesson[]) =>
    arrangeLessonsWithinDay(dayLesson),
  );
}

//  Determines if a Lesson on the timetable can be modifiable / dragged around.
//  Condition: There are multiple ClassNo for all the Array<Lesson> in a LessonType.
export function areOtherClassesAvailable(
  lessons: Array<RawLesson>,
  lessonType: LessonType,
): boolean {
  const lessonTypeGroups: Object = _.groupBy(lessons, (lesson) => lesson.LessonType);
  if (!lessonTypeGroups[lessonType]) {
    // No such LessonType.
    return false;
  }
  return (
    Object.keys(_.groupBy(lessonTypeGroups[lessonType], (lesson) => lesson.ClassNo)).length > 1
  );
}

// Find all exam clashes between modules in semester
// Returns object associating exam dates with the modules clashing on those dates
export function findExamClashes(modules: Array<Module>, semester: Semester): ExamClashes {
  const groupedModules = _.groupBy(modules, (module) =>
    _.get(getModuleSemesterData(module, semester), 'ExamDate'),
  );
  delete groupedModules.undefined; // Remove modules without exams
  return _.omitBy(groupedModules, (mods) => mods.length === 1); // Remove non-clashing mods
}

export function isLessonAvailable(lesson: Lesson, weekInfo: $ReadOnly<AcadWeekInfo>): boolean {
  if (!weekInfo.num) {
    return false;
  }

  if (lesson.LessonType === 'Tutorial' && weekInfo.num < 3) {
    return false;
  }

  if (lesson.WeekText !== 'Every Week') {
    if (lesson.WeekText === 'Even Week' && weekInfo.num % 2 === 1) {
      return false;
    }

    if (lesson.WeekText === 'Odd Week' && weekInfo.num % 2 === 0) {
      return false;
    }

    const weekNumbers = lesson.WeekText.split(',').map((n) => parseInt(n, 10));
    if (weekNumbers.every((n) => !Number.isNaN(n)) && !weekNumbers.includes(weekInfo.num)) {
      return false;
    }
  }

  return true;
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
  const [valid, invalid] = _.partition(
    _.keys(timetable),
    (moduleCode: ModuleCode) => moduleCodes[moduleCode],
  );
  return [_.pick(timetable, valid), invalid];
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
  const validatedLessonConfig = {};
  const updatedLessonTypes = [];

  const validLessons = getModuleTimetable(module, semester);
  const lessonsByType = _.groupBy(validLessons, (lesson) => lesson.LessonType);

  _.each(lessonsByType, (lessons: RawLesson[], lessonType: LessonType) => {
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
  updatedLessonTypes.push(..._.difference(Object.keys(lessonConfig), Object.keys(lessonsByType)));
  return [validatedLessonConfig, updatedLessonTypes];
}

// Get information for all modules present in a semester timetable config
export function getSemesterModules(
  timetable: { [ModuleCode]: any },
  modules: ModulesMap,
): Module[] {
  return _.values(_.pick(modules, Object.keys(timetable)));
}

function serializeModuleConfig(config: ModuleLessonConfig): string {
  // eg. { Lecture: 1, Laboratory: 2 } => LEC=1,LAB=2
  return _.map(config, (classNo, lessonType) =>
    [LESSON_TYPE_ABBREV[lessonType], encodeURIComponent(classNo)].join(LESSON_TYPE_SEP),
  ).join(LESSON_SEP);
}

function parseModuleConfig(serialized: ?string): ModuleLessonConfig {
  const config = {};
  if (!serialized) return config;

  _.castArray(serialized).forEach((serializedModule) => {
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
 * Formats numeric week number string into something human readable
 *
 * - 1           => Week 1
 * - 1,2         => Weeks 1,2
 * - 1,2,3       => Weeks 1-3
 * - 1,2,3,5,6,7 => Weeks 1-3, 5-7
 */
export function formatWeekNumber(weekText: WeekText) {
  // Check if this is a numeric week number list and bail if it's not
  const weeks = weekText.split(',').map((week) => parseInt(week.trim(), 10));
  if (weeks.some(Number.isNaN)) {
    return weekText;
  }

  if (weeks.length === 1) {
    return `Week ${weeks[0]}`;
  }

  // Find consecutive week numbers
  const processed = [];
  let start = weeks.shift();
  let last = start;

  const mergeConsecutive = () => {
    if (last - start > 2) {
      processed.push(`${start}-${last}`);
    } else {
      processed.push(..._.range(start, last + 1));
    }
  };

  while (weeks.length) {
    const next = weeks.shift();
    if (next - last === 1) {
      // Consecutive week number - keep going
      last = next;
    } else {
      // Break = push the current chunk into processed
      mergeConsecutive();
      start = next;
      last = start;
    }
  }

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
  return qs.stringify(_.mapValues(timetable, serializeModuleConfig), { encode: false });
}

export function deserializeTimetable(serialized: string): SemTimetableConfig {
  return _.mapValues(qs.parse(serialized), parseModuleConfig);
}

export function isSameTimetableConfig(t1: SemTimetableConfig, t2: SemTimetableConfig): boolean {
  return _.isEqual(t1, t2);
}

export function isSameLesson(l1: Lesson, l2: Lesson) {
  return (
    l1.LessonType === l2.LessonType &&
    l1.ClassNo === l2.ClassNo &&
    l1.ModuleCode === l2.ModuleCode &&
    l1.StartTime === l2.StartTime &&
    l1.EndTime === l2.EndTime &&
    l1.DayText === l2.DayText &&
    l1.WeekText === l2.WeekText
  );
}

export function getHoverLesson(lesson: Lesson): HoverLesson {
  return {
    classNo: lesson.ClassNo,
    moduleCode: lesson.ModuleCode,
    lessonType: lesson.LessonType,
  };
}
