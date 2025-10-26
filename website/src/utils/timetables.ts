import { AcadWeekInfo } from 'nusmoderator';
import {
  castArray,
  entries,
  filter,
  flatMapDeep,
  get,
  groupBy,
  intersection,
  invert,
  isArray,
  isEmpty,
  isEqual,
  keys,
  last,
  map,
  mapValues,
  maxBy,
  partition,
  pick,
  range,
  reduce,
  sample,
  some,
  values,
} from 'lodash';
import { addDays, min as minDate, parseISO, startOfDay } from 'date-fns';
import qs from 'query-string';

import {
  consumeWeeks,
  LessonsByLessonTypeByClassNo,
  LessonIndex,
  LessonType,
  RawLessonWithIndex,
  Module,
  ModuleCode,
  NumericWeeks,
  RawLesson,
  Semester,
  ClassNo,
} from 'types/modules';

import {
  ModuleLessonConfigV1,
  SemTimetableConfigV1,
  TaModulesConfigV1,
  TimetableConfigV1,
  ColoredLesson,
  HoverLesson,
  InteractableLesson,
  Lesson,
  LessonWithIndex,
  ModuleLessonConfig,
  ModuleLessonConfigWithLessons,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
  TaModulesConfig,
  TimetableConfig,
  TimetableDayArrangement,
  TimetableDayFormat,
  TimetableArrangement,
} from 'types/timetables';

import { TaModulesMapV1, ModuleCodeMap, ModulesMap, TaModulesMap } from 'types/reducers';
import { ExamClashes } from 'types/views';

import { getTimeAsDate } from './timify';
import { getModuleTimetable, getExamDate, getExamDuration } from './modules';
import { deltas } from './array';

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

// Used for module config serialization - these must be query string safe
// See: https://stackoverflow.com/a/31300627
export const LESSON_TYPE_SEP = ';';
export const LESSON_TYPE_KEY_VALUE_SEP = ':';
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

      return hydrateModuleConfigWithLessons(moduleLessonConfig, module, semester);
    },
  );
}

// Replaces ClassNo in ModuleLessonConfig with Array<Lesson>
function hydrateModuleConfigWithLessons(
  moduleLessonConfig: ModuleLessonConfig,
  module: Module,
  semester: Semester,
): ModuleLessonConfigWithLessons {
  return mapValues(moduleLessonConfig, (lessonIndices: LessonIndex[]) => {
    const lessons = getModuleTimetable(module, semester);
    const lessonsWithIndices = map(lessons, (lesson, lessonIndex) => ({ ...lesson, lessonIndex }));
    const newLessons = lessonsWithIndices.filter((lesson: RawLessonWithIndex) =>
      lessonIndices.includes(lesson.lessonIndex),
    );
    return newLessons.map((lesson: RawLessonWithIndex) => ({
      ...lesson,
      moduleCode: module.moduleCode,
      title: module.title,
    }));
  });
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

//  Groups flat array of lessons by day.
//  {
//    Monday: [Lesson, Lesson, ...],
//    Tuesday: [Lesson, ...],
//  }
export function groupLessonsByDay<T extends RawLesson>(lessons: T[]): TimetableDayFormat<T> {
  return groupBy(lessons, (lesson) => lesson.day);
}

//  Determines if two lessons overlap:
export function doLessonsOverlap(lesson1: RawLesson, lesson2: RawLesson): boolean {
  return (
    lesson1.day === lesson2.day &&
    lesson1.startTime < lesson2.endTime &&
    lesson2.startTime < lesson1.endTime
  );
}

//  Converts a flat array of lessons *for ONE day* into rows of lessons within that day row.
//  Result invariants:
//  - Each lesson will not overlap with each other.
//  [
//    [Lesson, Lesson, ...],
//    [Lesson, ...],
//  ]
export function arrangeLessonsWithinDay<T extends RawLesson>(
  lessons: T[],
): TimetableDayArrangement<T> {
  const rows: T[][] = [[]];
  if (isEmpty(lessons)) {
    return rows;
  }
  const sortedLessons = lessons.sort((a, b) => {
    const timeDiff = a.startTime.localeCompare(b.startTime);
    return timeDiff !== 0 ? timeDiff : a.classNo.localeCompare(b.classNo);
  });
  sortedLessons.forEach((lesson: T) => {
    for (let i = 0; i < rows.length; i++) {
      const rowLessons: T[] = rows[i];
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
export function arrangeLessonsForWeek<T extends RawLesson>(lessons: T[]): TimetableArrangement<T> {
  const dayLessons = groupLessonsByDay(lessons);
  return mapValues(dayLessons, (dayLesson: T[]) => arrangeLessonsWithinDay(dayLesson));
}

// Determines if a Lesson on the timetable can be modifiable / dragged around.
// Condition: There are multiple ClassNo for all the Array<Lesson> in a lessonType.
export function areOtherClassesAvailable(
  lessons: readonly RawLesson[],
  lessonType: LessonType,
): boolean {
  const lessonTypeGroups = groupBy<RawLesson>(lessons, (lesson) => lesson.lessonType);
  if (!lessonTypeGroups[lessonType]) {
    // No such lessonType.
    return false;
  }
  return Object.keys(groupBy(lessonTypeGroups[lessonType], (lesson) => lesson.classNo)).length > 1;
}

// Creates a key using only the exam date string (without time)
export function getExamDateOnly(module: Module, semester: Semester): string | undefined {
  const examDateTime = getExamDate(module, semester);
  return examDateTime?.slice(0, 10);
}

// Returns the start time of the exam as an epoch time (number). Throws an error if the module
// does not have an exam date.
export function getValidExamStartTimeAsEpoch(module: Module, semester: Semester): number {
  const startTimeString = getExamDate(module, semester);
  if (startTimeString === null) {
    throw new Error('Courses tested for clashes must have exam dates and durations!');
  }
  return new Date(startTimeString).getTime();
}

// Returns the end time of the exam as an epoch time (number). Throws an error if the module
// does not have an exam date or duration.
export function getValidExamEndTimeAsEpoch(module: Module, semester: Semester): number {
  const duration = getExamDuration(module, semester);
  if (duration === null) {
    throw new Error('Courses tested for clashes must have exam dates and durations!');
  }
  const startEpoch = getValidExamStartTimeAsEpoch(module, semester);
  return startEpoch + duration * 60 * 1000;
}

// Find all exam clashes between modules in semester
// Returns object associating exam dates with the modules clashing on those dates
export function findExamClashes(modules: Module[], semester: Semester): ExamClashes {
  // Filter away modules without exam dates or exam durations
  const filteredModules = modules.filter(
    (module) =>
      getExamDate(module, semester) !== null && getExamDuration(module, semester) !== null,
  );

  const groupedModules = groupBy(filteredModules, (module) => getExamDateOnly(module, semester));

  const clashes: ExamClashes = {};

  Object.values(groupedModules).forEach((sameDayMods) => {
    // Sort sameDayMods by exam start time
    sameDayMods.sort((a, b) => {
      const aStartEpoch = getValidExamStartTimeAsEpoch(a, semester);
      const bStartEpoch = getValidExamStartTimeAsEpoch(b, semester);

      // Use end time as secondary key
      const aEndEpoch = getValidExamEndTimeAsEpoch(a, semester);
      const bEndEpoch = getValidExamEndTimeAsEpoch(b, semester);

      if (aStartEpoch === bStartEpoch) {
        return aEndEpoch - bEndEpoch;
      }

      return aStartEpoch - bStartEpoch;
    });

    // Initialize an empty list to hold the groups of overlapping intervals
    // Each group will itself be a list of intervals
    const overlappingGroups: Module[][] = [];

    let currentOverlapEnd = 0;
    let currentOverlappingMods: Module[] = [];

    sameDayMods.forEach((mod, modIndex) => {
      if (modIndex > 0 && getValidExamStartTimeAsEpoch(mod, semester) < currentOverlapEnd) {
        currentOverlappingMods.push(mod);
      } else {
        // The current course does not overlap with the current group, so we reset
        // the current group and start a new one
        if (currentOverlappingMods.length > 1) {
          // If the current group has more than one module, we add it to the list of clashes
          overlappingGroups.push(currentOverlappingMods);
        }
        currentOverlapEnd = getValidExamEndTimeAsEpoch(mod, semester);
        currentOverlappingMods = [mod];
      }
    });

    // Add the last group to the list of clashes if applicable
    if (currentOverlappingMods.length > 1) {
      overlappingGroups.push(currentOverlappingMods);
    }

    overlappingGroups.forEach((group) => {
      // Displayed clashing date and time, which is the start time of the last module in the group
      const clashingDateTime = getExamDate(group[group.length - 1], semester);

      if (clashingDateTime === null) {
        throw new Error('Courses tested for clashes must have exam dates and durations!');
      }

      // Populate the clashes object to be returned
      group.forEach((mod) => {
        if (!clashes[clashingDateTime]) {
          clashes[clashingDateTime] = [mod];
        } else {
          clashes[clashingDateTime].push(mod);
        }
      });
    });
  });

  return clashes;
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
 * Validates TA module's {@link ModuleLessonConfig|lesson configs} based on a list of lessons to provide the lesson type info of each lesson
 *
 * Valid TA modules configs must have lesson indices that belong to the correct lesson type
 * @param lessonConfig {@link ModuleLessonConfig|lesson configs} to validate
 * @param validLessons {@link RawLessonWithIndex|lesson}s to validate against
 * @returns
 * - validated TA modules' {@link ModuleLessonConfig|lesson config}
 * - whether the input is valid, to signal to skip dispatch
 */
export function validateTaModuleLessons(
  lessonConfig: ModuleLessonConfig,
  validLessons: readonly RawLessonWithIndex[],
): {
  validatedLessonConfig: ModuleLessonConfig;
  valid: boolean;
} {
  const lessonsByType = groupBy(validLessons, (lesson) => lesson.lessonType);
  const { config: validatedLessonConfig, valid } = reduce(
    lessonConfig,
    (accumulatedValidationResult, configLessonIndices, lessonType) => {
      const validLessonIndices = map(lessonsByType[lessonType], 'lessonIndex');
      if (!validLessonIndices.length) {
        return {
          config: accumulatedValidationResult.config,
          valid: false,
        };
      }
      const hasInvalidLesson = some(
        configLessonIndices,
        (lessonIndex) => !validLessonIndices.includes(lessonIndex),
      );
      return {
        config: {
          ...accumulatedValidationResult.config,
          [lessonType]: hasInvalidLesson
            ? getRecoveryLessonIndices(lessonsByType[lessonType])
            : configLessonIndices,
        },
        valid: accumulatedValidationResult.valid && !hasInvalidLesson,
      };
    },
    { config: {}, valid: true } as { config: ModuleLessonConfig; valid: boolean },
  );

  return {
    validatedLessonConfig,
    valid,
  };
}

/**
 * Used to recover from the config of a lesson type that contains invalid lesson indices
 * @param lessonsWithLessonType lessons with the same lesson type to generate a valid lesson config from
 * @returns lesson indices of the generated valid lesson config
 *
 * Note: the current implementation generates a config containing lessons belonging to the first classNo in the provided lessons
 */
export function getRecoveryLessonIndices(
  lessonsWithLessonType: RawLessonWithIndex[],
): LessonIndex[] {
  const { classNo } = lessonsWithLessonType[0];
  const validLessonIndices = map(
    filter(lessonsWithLessonType, (lesson) => lesson.classNo === classNo),
    'lessonIndex',
  );
  return validLessonIndices;
}

/**
 * Valid non-TA modules must have one and only one classNo for each lesson type
 * @param lessonConfig lesson configs to validate
 * @param validLessons lessons to validate against
 * @returns
 * - validated non-TA lesson config
 * - whether the input is valid, to signal to skip dispatch
 */
export function validateNonTaModuleLesson(
  lessonConfig: ModuleLessonConfig,
  validLessons: readonly RawLessonWithIndex[],
): {
  validatedLessonConfig: ModuleLessonConfig;
  valid: boolean;
} {
  const lessonsByType = groupBy(validLessons, (lesson) => lesson.lessonType);
  const lessonTypesInLessonConfig = keys(lessonConfig);
  const { config: validatedLessonConfig, valid: configValid } = reduce(
    lessonsByType,
    (accumulatedValidationResult, lessonsWithLessonType, lessonType) => {
      const lessonTypeInLessonConfig = lessonTypesInLessonConfig.includes(lessonType);
      const configLessonIndices = lessonConfig[lessonType];

      if (!lessonTypeInLessonConfig || !configLessonIndices.length) {
        // TODO: Open an issue to make recovery use random lessons instead
        const validLessonIndices = getRecoveryLessonIndices(lessonsWithLessonType);
        return {
          config: {
            ...accumulatedValidationResult.config,
            [lessonType]: validLessonIndices,
          },
          valid: false,
        };
      }

      const { classNo } = validLessons[configLessonIndices[0]];
      const classNoLessonIndices = map(
        filter(lessonsWithLessonType, (lesson) => lesson.classNo === classNo),
        'lessonIndex',
      );
      const configLessonIndicesValid = isEqual(
        new Set(configLessonIndices),
        new Set(classNoLessonIndices),
      );
      const validLessonIndices = configLessonIndicesValid
        ? classNoLessonIndices
        : getRecoveryLessonIndices(lessonsWithLessonType);

      return {
        config: {
          ...accumulatedValidationResult.config,
          [lessonType]: validLessonIndices,
        },
        valid: accumulatedValidationResult.valid && configLessonIndicesValid,
      };
    },
    { config: {}, valid: true } as { config: ModuleLessonConfig; valid: boolean },
  );

  const configLessonTypesValid = isEqual(
    new Set(keys(validatedLessonConfig)),
    new Set(lessonTypesInLessonConfig),
  );

  return {
    validatedLessonConfig,
    valid: configValid && configLessonTypesValid,
  };
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
  isTa: boolean,
): { validatedLessonConfig: ModuleLessonConfig; valid: boolean } {
  const validLessons = getModuleTimetable(module, semester);

  if (isTa) {
    return validateTaModuleLessons(lessonConfig, validLessons);
  }

  return validateNonTaModuleLesson(lessonConfig, validLessons);
}

/**
 * Group lessons by lesson types then classNo
 * @param lessonsWithIndex lessons to group
 * @returns lesson indices, not lessons
 */
export const groupLessonsByLessonTypeByClassNo = (
  lessonsWithIndex: readonly RawLessonWithIndex[],
): LessonsByLessonTypeByClassNo => {
  const lessonsByLessonType = groupBy(lessonsWithIndex, 'lessonType');
  return mapValues(lessonsByLessonType, (lessonsWithLessonType) => {
    const lessonsByClassNo = groupBy(lessonsWithLessonType, 'classNo');
    return mapValues(lessonsByClassNo, (lessonsWithClassNo) =>
      map(lessonsWithClassNo, 'lessonIndex'),
    );
  });
};

// Get information for all modules present in a semester timetable config
export function getSemesterModules(
  timetable: { [moduleCode: string]: unknown },
  modules: ModulesMap,
): Module[] {
  return values(pick(modules, Object.keys(timetable)));
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
 * Serializes a module's lesson config for sharing\
 * Given input `{ Lecture: [0], Tutorial: [1] }`\
 * Will output `LEC:(0),TUT:(1)`
 */
function serializeModuleConfig(config: ModuleLessonConfig): string {
  return map(
    config,
    (lessonIndex, lessonType) =>
      `${LESSON_TYPE_ABBREV[lessonType]}${LESSON_TYPE_KEY_VALUE_SEP}(${lessonIndex.join(
        LESSON_SEP,
      )})`,
  ).join(';');
}

/**
 * Converts a timetable config to query string\
 * Given input `
 * {
 *   CS2104: { Lecture: [0], Tutorial: [1] },
 *   CS2107: { Lecture: [0], Tutorial: [1] },
 * }`\
 * Will output `CS2104=LEC:(0),TUT:(1)&CS2107=LEC:(0),TUT:(1)`
 */
export function serializeTimetable(timetable: SemTimetableConfig): string {
  // We are using query string safe characters, so this encoding is unnecessary
  return qs.stringify(mapValues(timetable, serializeModuleConfig), { encode: false });
}

// TODO merge logic for TA modules and hidden modules
/**
 * Serializes TA modules for sharing\
 * Given input `["CS1010S", "CS3216"]`\
 * Will output `&ta=CS1010S,CS3216`
 */
export function serializeTa(taModules: TaModulesConfig): string {
  return `&ta=${taModules.join(LESSON_SEP)}`;
}

export function serializeHidden(hiddenModules: ModuleCode[]): string {
  return `&hidden=${hiddenModules.join(',')}`;
}

/**
 * Parses a classNo format serialized TA module lesson config string for module codes\
 * Prevents a crash if the TA module config includes a module code not inside the non-TA module config\
 * Given input `CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)`\
 * Will output `["CS2100","CS2107"]`
 * @param taSerialized a TA module lesson config string
 * @returns TA module codes if the module lesson config is classNo format serialized\
 * Otherwise, returns an empty array
 */
export function parseTaModuleCodes(taSerialized?: string | null): ModuleCode[] {
  if (!taSerialized || taSerialized[0] === '(') return [];
  const trimmedSerializedTaModulesConfig = taSerialized.slice(0, -1);
  return reduce(
    trimmedSerializedTaModulesConfig.split(`)${LESSON_SEP}`),
    (accumulatedTaModuleCodes, moduleConfig) => {
      const [moduleCode] = moduleConfig.split('(', 1);
      return [...accumulatedTaModuleCodes, moduleCode];
    },
    [] as ModuleCode[],
  );
}

/**
 * Deserializes a classNo format serialized TA module lesson config string to a module lesson config\
 * Sample input: `CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)`
 * @param taSerialized
 * @param getModuleSemesterTimetable
 * @returns migrated semester timetable config
 */
export function deserializeTaModulesConfigV1(
  taSerialized: string,
  getModuleSemesterTimetable: (moduleCode: ModuleCode) => readonly RawLessonWithIndex[],
): SemTimetableConfig {
  // CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8)
  const trimmedSerializedTaModulesConfig = taSerialized.slice(0, -1);
  // CS2100(TUT:2,TUT:3,LAB:1),CS2107(TUT:8
  return reduce(
    trimmedSerializedTaModulesConfig.split(`)${LESSON_SEP}`),
    (accumulatedTaTimetableConfig, moduleConfig) => {
      // CS2100(TUT:2,TUT:3,LAB:1
      // CS2107(TUT:8
      const [moduleCode, lessons] = moduleConfig.split('(');
      // ["CS2100", "TUT:2,TUT:3,LAB:1"]
      // ["CS2107", "TUT:8"]
      const timetable = getModuleSemesterTimetable(moduleCode);
      if (!timetable) return accumulatedTaTimetableConfig;

      const moduleLessonConfig = lessons
        .split(LESSON_SEP)
        .reduce((accumulatedModuleLessonConfig, lesson) => {
          // TUT:2
          const [lessonTypeAbbr, classNo] = lesson.split(LESSON_TYPE_KEY_VALUE_SEP);
          // ["TUT", "2"]
          const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
          if (!lessonType) return accumulatedModuleLessonConfig;
          const lessonsByLessonTypeByClassNo = groupLessonsByLessonTypeByClassNo(timetable);
          const lessonIndices = get(get(lessonsByLessonTypeByClassNo, lessonType), classNo);
          return {
            ...accumulatedModuleLessonConfig,
            [lessonType]: [
              ...(accumulatedModuleLessonConfig[lessonType] ?? []),
              ...(lessonIndices ?? []),
            ],
          } as ModuleLessonConfig;
        }, {} as ModuleLessonConfig);

      return {
        ...accumulatedTaTimetableConfig,
        [moduleCode]: moduleLessonConfig,
      } as SemTimetableConfig;
    },
    {} as SemTimetableConfig,
  );
}

/**
 * Deserializes a lessonGroup format serialized string to a module lesson config\
 * Accepts moduleLessonConfig from previously parsed params, if any\
 * Sample input: `LEC:(0,1);TUT:(3)`
 * @param moduleLessonConfig
 * @param serializedModuleLessonConfig
 * @param timetable Array of valid lessons
 * @returns Combined moduleLessonConfig
 */
export function deserializeModuleLessonConfig(
  moduleLessonConfig: ModuleLessonConfig,
  serializedModuleLessonConfig: string,
  timetable: readonly RawLessonWithIndex[],
): ModuleLessonConfig {
  const lessonsByLessonType = groupBy(timetable, 'lessonType');
  // LEC:(0,1);TUT:(3)
  return reduce(
    serializedModuleLessonConfig.split(LESSON_TYPE_SEP),
    (accumulatedModuleLessonConfig, lessonTypeSerialized) => {
      // LEC:(0,1)
      const [lessonTypeAbbr, lessonIndicesSerialized] =
        lessonTypeSerialized.split(LESSON_TYPE_KEY_VALUE_SEP);
      // ["LEC", "0,1"]
      const lessonIndices = map(
        lessonIndicesSerialized.slice(1, -1).split(LESSON_SEP),
        (lessonIndex) => parseInt(lessonIndex, 10),
      ); // [0, 1]
      const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
      const validLessonIndices = map(lessonsByLessonType[lessonType], 'lessonIndex');
      const validatedLessonIndices = filter(lessonIndices, (lessonIndex) =>
        validLessonIndices.includes(lessonIndex),
      );
      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: [
          ...(accumulatedModuleLessonConfig[lessonType] ?? []),
          ...validatedLessonIndices,
        ],
      };
    },
    moduleLessonConfig,
  );
}

/**
 * Deserializes a classNo format serialized string to a module lesson config
 * Accepts moduleLessonConfig from previously parsed params, if any
 * @param moduleLessonConfig
 * @param serializedModuleLessonConfig
 * @param timetable Array of valid lessons
 * @returns Combined moduleLessonConfig
 */
export function deserializeModuleLessonConfigV1(
  moduleLessonConfig: ModuleLessonConfig,
  serializedModuleLessonConfig: string,
  timetable: readonly RawLessonWithIndex[],
): ModuleLessonConfig {
  // LEC:1,TUT:1,REC:1
  return reduce(
    serializedModuleLessonConfig.split(LESSON_SEP),
    (accumulatedModuleLessonConfig, lessonTypeSerialized) => {
      // LEC:1
      const [lessonTypeAbbr, classNo] = lessonTypeSerialized.split(LESSON_TYPE_KEY_VALUE_SEP);
      // ["LEC", "1"]
      const lessonType = LESSON_ABBREV_TYPE[lessonTypeAbbr];
      const lessonsByLessonTypeByClassNo = groupLessonsByLessonTypeByClassNo(timetable);
      const lessonIndices = get(get(lessonsByLessonTypeByClassNo, lessonType), classNo);
      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: [
          ...(accumulatedModuleLessonConfig[lessonType] ?? []),
          ...(lessonIndices ?? []),
        ],
      };
    },
    moduleLessonConfig,
  );
}

/**
 * Deserializes hidden modules config and lesson group format TA modules config
 */
export function deserializeModuleCodes(serialized: string): ModuleCode[] {
  return serialized.split(LESSON_SEP);
}

/**
 * Entry point to deserialize a serialized timetable string
 * Checks serialization version and parses accordingly
 * @param serialized
 * @param getModuleSemesterTimetable
 * @returns
 */
export function deserializeTimetable(
  serialized: string,
  getModuleSemesterTimetable: (moduleCode: ModuleCode) => readonly RawLessonWithIndex[],
): {
  semTimetableConfig: SemTimetableConfig;
  ta: ModuleCode[];
  hidden: ModuleCode[];
} {
  const params = qs.parse(serialized);
  const taParams = isArray(params.ta) ? last(params.ta) : params.ta;
  // If TA modules were serialized using the old format
  // we deserialize it first so we can skip deserializing the module code down the line
  // because TA module lesson config overrides the non-TA module lesson config
  const taModulesConfig =
    taParams && last(taParams) === ')'
      ? deserializeTaModulesConfigV1(taParams, getModuleSemesterTimetable)
      : {};

  return reduce(
    params,
    (accumulatedDeserializedResult, paramsValue, paramsKey) => {
      switch (paramsKey) {
        case 'hidden':
        case 'ta': {
          if (!paramsValue) {
            return accumulatedDeserializedResult;
          }
          const moduleCodes = reduce(
            castArray(paramsValue),
            (accumulatedModules, paramValue) => {
              // Skip if the ta param is a serialized with the older classNo format
              if (paramsKey === 'ta' && last(paramValue) === ')') return accumulatedModules;

              return [...accumulatedModules, ...deserializeModuleCodes(paramValue)];
            },
            [] as ModuleCode[],
          );
          return {
            ...accumulatedDeserializedResult,
            [paramsKey]: [...accumulatedDeserializedResult[paramsKey], ...moduleCodes],
          };
        }

        default: {
          const moduleCode = paramsKey;
          if (!paramsValue) {
            return {
              ...accumulatedDeserializedResult,
              semTimetableConfig: {
                ...accumulatedDeserializedResult.semTimetableConfig,
                [moduleCode]: {},
              },
            };
          }
          const timetable = getModuleSemesterTimetable(moduleCode);
          const moduleLessonConfig = reduce(
            castArray(paramsValue),
            (accumulatedModuleLessonConfig, serializedModuleLessonConfig) => {
              // If using the lesson group serialization (v2)
              // paramsKey = CS2103T
              // paramsValue = LEC:(0,1);TUT:(3)
              if (
                serializedModuleLessonConfig &&
                serializedModuleLessonConfig[serializedModuleLessonConfig.length - 1] === ')'
              )
                return deserializeModuleLessonConfig(
                  accumulatedModuleLessonConfig,
                  serializedModuleLessonConfig,
                  timetable,
                );

              // TA module lesson config overrides the non-TA module lesson config
              if (moduleCode in taModulesConfig) return taModulesConfig[moduleCode];

              // If using the classNo format serialization (v1)
              // paramsKey = CS2103T
              // paramsValue = LEC:0,TUT:3
              return deserializeModuleLessonConfigV1(
                accumulatedModuleLessonConfig,
                serializedModuleLessonConfig,
                timetable,
              );
            },
            {} as ModuleLessonConfig,
          );
          return {
            ...accumulatedDeserializedResult,
            semTimetableConfig: {
              ...accumulatedDeserializedResult.semTimetableConfig,
              [moduleCode]: moduleLessonConfig,
            },
          };
        }
      }
    },
    {
      semTimetableConfig: {},
      ta: keys(taModulesConfig),
      hidden: [],
    },
  );
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

/**
 * Differentiates between ColoredLesson and InteractableLesson
 * @param lesson Must be a ColoredLesson or InteractableLesson
 */
export function isInteractable(
  lesson: ColoredLesson | InteractableLesson,
): lesson is InteractableLesson {
  return 'lessonIndex' in lesson;
}

/**
 * Obtain a semi-unique key for a lesson
 */
export function getLessonIdentifier(lesson: Lesson): string {
  return `${lesson.moduleCode}-${LESSON_TYPE_ABBREV[lesson.lessonType]}-${lesson.classNo}`;
}

/**
 * A helper function for migrateSemTimetableConfig\
 * Migrates a module's lesson config
 * @param moduleLessonConfig the module lesson config to migrate
 * @param taModulesConfig the TA lesson configs overrides the semester timetable config
 * @param moduleCode
 * @returns
 * - the migrated config
 * - whether it was previously migrated, to signal to skip dispatch
 */
export function migrateModuleLessonConfig(
  moduleLessonConfig: ModuleLessonConfig | ModuleLessonConfigV1,
  taModulesConfig: TaModulesConfig | TaModulesConfigV1,
  moduleCode: ModuleCode,
  timetable: readonly RawLessonWithIndex[],
): {
  migratedModuleLessonConfig: ModuleLessonConfig;
  alreadyMigrated: boolean;
} {
  return reduce(
    moduleLessonConfig,
    (accumulatedModuleLessonConfig, lessonsIdentifier, lessonType) => {
      if (isArray(lessonsIdentifier)) {
        return {
          ...accumulatedModuleLessonConfig,
          migratedModuleLessonConfig: {
            ...accumulatedModuleLessonConfig.migratedModuleLessonConfig,
            [lessonType]: lessonsIdentifier,
          },
        };
      }

      const taClassNos = isArray(taModulesConfig)
        ? []
        : filter(
            taModulesConfig[moduleCode],
            (lessonTypeConfig) => lessonTypeConfig[0] === lessonType,
          );
      const classNos = taClassNos.length ? map(taClassNos, '1') : [lessonsIdentifier];
      const lessonsByLessonTypeByClassNo = groupLessonsByLessonTypeByClassNo(timetable);

      const lessonIndices = reduce(
        classNos,
        (accumulatedLessonIndices, classNo) => {
          const lessonIndicesWithClassNo = get(
            get(lessonsByLessonTypeByClassNo, lessonType),
            classNo,
          );
          if (!lessonIndicesWithClassNo) return accumulatedLessonIndices;
          return [...accumulatedLessonIndices, ...lessonIndicesWithClassNo];
        },
        [] as LessonIndex[],
      );

      return {
        migratedModuleLessonConfig: {
          ...accumulatedModuleLessonConfig.migratedModuleLessonConfig,
          [lessonType]: lessonIndices,
        },
        alreadyMigrated: false,
      };
    },
    {
      migratedModuleLessonConfig: {},
      alreadyMigrated: true,
    } as {
      migratedModuleLessonConfig: ModuleLessonConfig;
      alreadyMigrated: boolean;
    },
  );
}

/**
 * A helper function for migrateTimetableConfigs\
 * Migrates a semester's timetable config
 * @param semTimetableConfig the semester timetable config to migrate
 * @param taModulesConfig the TA lesson configs overrides the semester timetable config
 * @param modules the modules in the moduleBank, used to find lesson indices of the classNo
 * @param semester the semester of the timetable to migrate, used to find lesson indices of the classNo
 * @returns
 * - the migrated semester timetable config
 * - the migrated semester ta config
 * - whether it was previously migrated, to signal to skip dispatch
 */
export function migrateSemTimetableConfig(
  semTimetableConfig: SemTimetableConfig | SemTimetableConfigV1,
  taModulesConfig: TaModulesConfig | TaModulesConfigV1,
  getModuleSemesterTimetable: (moduleCode: ModuleCode) => readonly RawLessonWithIndex[],
): {
  migratedSemTimetableConfig: SemTimetableConfig;
  migratedTaModulesConfig: TaModulesConfig;
  alreadyMigrated: boolean;
} {
  return reduce(
    semTimetableConfig,
    (accumulatedSemTimetableConfig, moduleLessonConfig, moduleCode) => {
      const isTa = isArray(taModulesConfig)
        ? taModulesConfig.includes(moduleCode)
        : moduleCode in taModulesConfig;

      const timetable = getModuleSemesterTimetable(moduleCode);
      const { migratedModuleLessonConfig, alreadyMigrated } = migrateModuleLessonConfig(
        moduleLessonConfig,
        taModulesConfig,
        moduleCode,
        timetable,
      );

      return {
        migratedSemTimetableConfig: {
          ...accumulatedSemTimetableConfig.migratedSemTimetableConfig,
          [moduleCode]: migratedModuleLessonConfig,
        },
        migratedTaModulesConfig: isTa
          ? [...accumulatedSemTimetableConfig.migratedTaModulesConfig, moduleCode]
          : accumulatedSemTimetableConfig.migratedTaModulesConfig,
        alreadyMigrated: accumulatedSemTimetableConfig.alreadyMigrated && alreadyMigrated,
      };
    },
    {
      migratedSemTimetableConfig: {},
      migratedTaModulesConfig: [],
      alreadyMigrated: true,
    } as {
      migratedSemTimetableConfig: SemTimetableConfig;
      migratedTaModulesConfig: TaModulesConfig;
      alreadyMigrated: boolean;
    },
  );
}

/**
 * Checks the current timetable config and migrate it to v2 format if it is not\
 * Migrates all semesters' timetable config in this academic year
 * @param lessons the academic year's timetables
 * @param ta the academic year's TA modules config
 * @param modules modules in the moduleBank state to use for migration
 * @returns
 * - the migrated timetable config
 * - the migrated TA modules config
 * - whether it was previously migrated, to signal to skip dispatch
 */
export function migrateTimetableConfigs(
  lessons: TimetableConfig | TimetableConfigV1,
  ta: TaModulesMap | TaModulesMapV1,
  modules: ModulesMap,
): {
  lessons: TimetableConfig;
  ta: TaModulesMap;
  alreadyMigrated: boolean;
} {
  const {
    config: migratedLessons,
    ta: migratedTa,
    alreadyMigrated,
  } = reduce(
    lessons,
    (accumulated, semTimetableConfig, semesterString) => {
      const semester = parseInt(semesterString, 10);
      const taModulesConfig = get(ta, semester, {});

      const getModuleSemesterTimetable = (moduleCode: ModuleCode) =>
        modules[moduleCode] ? getModuleTimetable(modules[moduleCode], semester) : [];

      const migrated = migrateSemTimetableConfig(
        semTimetableConfig,
        taModulesConfig,
        getModuleSemesterTimetable,
      );

      return {
        config: {
          ...accumulated.config,
          [semester]: migrated.migratedSemTimetableConfig,
        },
        ta: {
          ...accumulated.ta,
          [semester]: migrated.migratedTaModulesConfig,
        },
        alreadyMigrated: migrated.alreadyMigrated && accumulated.alreadyMigrated,
      };
    },
    {
      config: {},
      ta: {},
      alreadyMigrated: true,
    } as {
      config: TimetableConfig;
      ta: TaModulesMap;
      alreadyMigrated: boolean;
    },
  );

  return {
    lessons: migratedLessons,
    ta: migratedTa,
    alreadyMigrated,
  };
}

/**
 * Based on what lessons are currently in the lesson config, find the classNo that most of the lessons belong to
 * @param lessonsByLessonTypeByClassNo lessons indices grouped by lesson type, then classNo
 * @param timetableLessonIndices lessons currently in lesson config
 * @returns a lesson config consisting of lesson indices that best matches the TA lesson config
 */
export function getClosestLessonConfig(
  lessonsByLessonTypeByClassNo: LessonsByLessonTypeByClassNo,
  timetableLessonIndices: ModuleLessonConfig,
): ModuleLessonConfig {
  return reduce(
    lessonsByLessonTypeByClassNo,
    (accumulatedModuleLessonConfig, lessonsWithLessonType, lessonType) => {
      const timetableLessonsWithLessonType = timetableLessonIndices[lessonType];
      const lessonGroupOccurrences = entries(
        reduce(
          lessonsWithLessonType,
          (accumulated, lessonIndices, lessonGroup) => ({
            ...accumulated,
            [lessonGroup]: intersection(lessonIndices, timetableLessonsWithLessonType).length,
          }),
          {} as Record<ClassNo, number>,
        ),
      );

      const closestLessonGroups = maxBy(lessonGroupOccurrences, ([, occurrences]) => occurrences);
      if (!closestLessonGroups) return accumulatedModuleLessonConfig;
      const [closestLessonGroupKey] = closestLessonGroups;
      const closestLessonGroup = lessonsByLessonTypeByClassNo[lessonType][closestLessonGroupKey];

      return {
        ...accumulatedModuleLessonConfig,
        [lessonType]: closestLessonGroup,
      };
    },
    {} as ModuleLessonConfig,
  );
}
