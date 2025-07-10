import {
  compact,
  difference,
  differenceBy,
  flatten,
  get,
  groupBy,
  isEmpty,
  padStart,
  range,
  uniq,
  values,
} from 'lodash';
import {
  AcadYear,
  Day,
  DayText,
  LessonTime,
  LessonType,
  Module,
  ModuleCode,
  RawLesson,
  Semester,
  WorkingDays,
} from 'types/modules';
import { DisplayText, FreeDayConflict, LessonOption, LessonKey, TimeRange } from 'types/optimiser';
import { ColorMapping } from 'types/reducers';
import { LessonSlot, OptimiseResponse } from 'apis/optimiser';
import { getModuleTimetable } from './modules';
import {
  convertIndexToTime,
  convertTimeToIndex,
  getLessonTimeHours,
  getLessonTimeMinutes,
  NUM_INTERVALS_PER_HOUR,
} from './timify';

export function getLessonKey(moduleCode: ModuleCode, lessonType: LessonType): LessonKey {
  return `${moduleCode}|${lessonType}`;
}

export function getDisplayText(moduleCode: ModuleCode, lessonType: LessonType): DisplayText {
  return `${moduleCode} ${lessonType}`;
}

export function getOptimiserAcadYear(acadYear: AcadYear): string {
  const [from, to] = acadYear.split('/');
  return `${from}-${to}`;
}

export function getOptimiserTime(time: LessonTime): string {
  const hh = padStart(`${getLessonTimeHours(time)}`, 2, '0');
  const mm = padStart(`${getLessonTimeMinutes(time)}`, 2, '0');
  return `${hh}:${mm}`;
}

export function getLessonTypes(lessons: readonly RawLesson[]): LessonType[] {
  return uniq(lessons.map((lesson) => lesson.lessonType));
}

export function getDaysForLessonType(
  lessons: readonly RawLesson[],
  lessonType: LessonType,
): DayText[] {
  return uniq(
    lessons.filter((lesson) => lesson.lessonType === lessonType).map((lesson) => lesson.day),
  );
}

// Creates a LessonOption for each lessonType
export function getLessonOptions(
  modules: Module[],
  semester: Semester,
  colors: ColorMapping,
): LessonOption[] {
  return modules.flatMap((module) => {
    const { moduleCode } = module;
    const colorIndex = colors[moduleCode];
    const lessons = getModuleTimetable(module, semester);
    const lessonTypes = getLessonTypes(lessons);
    return lessonTypes.map((lessonType) => ({
      moduleCode,
      lessonType,
      colorIndex,
      lessonKey: getLessonKey(moduleCode, lessonType),
      displayText: getDisplayText(moduleCode, lessonType),
      days: getDaysForLessonType(lessons, lessonType),
    }));
  });
}

// Filters out physical lesson options to obtain recorded lesson options
export function getRecordedLessonOptions(
  lessonOptions: LessonOption[],
  physicalLessonOptions: LessonOption[],
): LessonOption[] {
  return differenceBy(
    lessonOptions,
    physicalLessonOptions,
    (lessonOption) => lessonOption.lessonKey,
  );
}

export function sortDays(days: DayText[]) {
  return days.sort((a, b) => WorkingDays.indexOf(a as Day) - WorkingDays.indexOf(b as Day));
}

// For each classNo, check if it's possible to fit the lessons within the free days constraint
export function getConflictingDays(
  lessons: readonly RawLesson[],
  selectedFreeDays: Set<DayText>,
): DayText[] {
  const groupedLessons = groupBy(lessons, (lesson) => lesson.classNo);
  const conflictingDays = values(groupedLessons).map((classLessons) => {
    const days = uniq(classLessons.flatMap((lesson) => lesson.day));
    return days.filter((day) => selectedFreeDays.has(day));
  });
  const isConflictFree = conflictingDays.some((conflicts) => isEmpty(conflicts));
  return isConflictFree ? [] : sortDays(uniq(flatten(conflictingDays)));
}

// For each physical lesson option, check if that lessonType will have conflicts
export function getFreeDayConflicts(
  modules: Module[],
  semester: Semester,
  physicalLessonOptions: LessonOption[],
  selectedFreeDays: Set<DayText>,
): FreeDayConflict[] {
  const groupedPhysicalLessonOptions = groupBy(
    physicalLessonOptions,
    (lessonOption) => lessonOption.moduleCode,
  );

  return modules.flatMap((module) => {
    const { moduleCode } = module;
    const lessons = getModuleTimetable(module, semester);
    const lessonOptions = get(groupedPhysicalLessonOptions, moduleCode, []);
    return compact(
      lessonOptions.map((lessonOption) => {
        const { lessonType, displayText } = lessonOption;
        const filteredLessons = lessons.filter((lesson) => lesson.lessonType === lessonType);
        const conflictingDays = getConflictingDays(filteredLessons, selectedFreeDays);
        return isEmpty(conflictingDays)
          ? null
          : {
              moduleCode,
              lessonType,
              displayText,
              days: conflictingDays,
            };
      }),
    );
  });
}

export function getUnassignedLessonOptions(
  lessonOptions: LessonOption[],
  optimiserResponse: OptimiseResponse,
): LessonOption[] {
  const daySlots = optimiserResponse.DaySlots ?? [];
  const assignedLessonKeys = uniq(
    compact(flatten(daySlots).flatMap((slot: LessonSlot | null) => slot?.LessonKey)),
  );

  const allLessonKeys = lessonOptions.map((lessonOption) => lessonOption.lessonKey);
  const unassignedLessonKeys = new Set(difference(allLessonKeys, assignedLessonKeys));
  return lessonOptions.filter((lessonOption) => unassignedLessonKeys.has(lessonOption.lessonKey));
}

export function isSaturdayInOptions(lessonOptions: LessonOption[]): boolean {
  return lessonOptions
    .flatMap((lessonOption) => lessonOption.days)
    .some((day) => day === 'Saturday');
}

// TOOD: check styles

// TODO: add unit tests
export function getTimeValues(timeRange: TimeRange) {
  const earliestIndex = convertTimeToIndex(timeRange.earliest);
  const latestIndex = convertTimeToIndex(timeRange.latest) + 1;
  const stride = NUM_INTERVALS_PER_HOUR / 2;
  return range(earliestIndex, latestIndex, stride).map((index) => convertIndexToTime(index));
}
