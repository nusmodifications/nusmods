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
} from 'lodash-es';
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
import {
  DisplayText,
  FreeDayConflict,
  LessonOption,
  LessonKey,
  PinnedSlotConflict,
  PinnedSlotOption,
  PinnedSlots,
  TimeRange,
} from 'types/optimiser';
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
  const hh = padStart(String(getLessonTimeHours(time)), 2, '0');
  const mm = padStart(String(getLessonTimeMinutes(time)), 2, '0');
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

// Creates a dropdown option for each classNo of the given lessonType
export function getPinnedSlotOptions(
  lessons: readonly RawLesson[],
  lessonType: LessonType,
): PinnedSlotOption[] {
  const groupedClasses = groupBy(
    lessons.filter((lesson) => lesson.lessonType === lessonType),
    (lesson) => lesson.classNo,
  );
  return Object.entries(groupedClasses)
    .map(([classNo, classLessons]) => {
      const sortedLessons = [...classLessons].sort(
        (a, b) =>
          WorkingDays.indexOf(a.day as Day) - WorkingDays.indexOf(b.day as Day) ||
          a.startTime.localeCompare(b.startTime),
      );
      const schedules = uniq(
        sortedLessons.map(
          (lesson) =>
            `${lesson.day.slice(0, 3)} ${getOptimiserTime(lesson.startTime)}-${getOptimiserTime(
              lesson.endTime,
            )}`,
        ),
      );
      return { classNo, label: `${classNo} — ${schedules.join(', ')}` };
    })
    .sort((a, b) => a.classNo.localeCompare(b.classNo, undefined, { numeric: true }));
}

// Creates the pinned slot dropdown options for every lesson, keyed by lessonKey
export function getAllPinnedSlotOptions(
  modules: Module[],
  semester: Semester,
): Record<LessonKey, PinnedSlotOption[]> {
  const options: Record<LessonKey, PinnedSlotOption[]> = {};
  modules.forEach((module) => {
    const lessons = getModuleTimetable(module, semester);
    getLessonTypes(lessons).forEach((lessonType) => {
      options[getLessonKey(module.moduleCode, lessonType)] = getPinnedSlotOptions(
        lessons,
        lessonType,
      );
    });
  });
  return options;
}

// For each pinned class attended live, report clashes with the free day and lesson time
// preferences. Pinned classes are kept by the optimiser regardless, so these are warnings
// rather than errors. Recorded lessons are exempt from both constraints and are skipped.
export function getPinnedSlotConflicts(
  modules: Module[],
  semester: Semester,
  pinnedSlots: PinnedSlots,
  liveLessonKeys: Set<LessonKey>,
  selectedFreeDays: Set<DayText>,
  lessonTimeRange: TimeRange,
): PinnedSlotConflict[] {
  return modules.flatMap((module) => {
    const { moduleCode } = module;
    const lessons = getModuleTimetable(module, semester);
    return compact(
      getLessonTypes(lessons).map((lessonType) => {
        const lessonKey = getLessonKey(moduleCode, lessonType);
        const classNo = pinnedSlots[lessonKey];
        if (!classNo || !liveLessonKeys.has(lessonKey)) {
          return null;
        }

        const classLessons = lessons.filter(
          (lesson) => lesson.lessonType === lessonType && lesson.classNo === classNo,
        );
        const freeDayClashes = sortDays(
          uniq(classLessons.map((lesson) => lesson.day).filter((day) => selectedFreeDays.has(day))),
        );
        // "HHMM" strings compare correctly lexicographically
        const isOutsideTimeRange = classLessons.some(
          (lesson) =>
            lesson.startTime < lessonTimeRange.earliest || lesson.endTime > lessonTimeRange.latest,
        );

        const reasons: string[] = [];
        if (!isEmpty(freeDayClashes)) {
          reasons.push(`falls on your free day(s): ${freeDayClashes.join(', ')}`);
        }
        if (isOutsideTimeRange) {
          reasons.push(
            `is outside your selected lesson times (${getOptimiserTime(
              lessonTimeRange.earliest,
            )} - ${getOptimiserTime(lessonTimeRange.latest)})`,
          );
        }
        return isEmpty(reasons)
          ? null
          : {
              moduleCode,
              lessonType,
              displayText: getDisplayText(moduleCode, lessonType),
              classNo,
              reasons,
            };
      }),
    );
  });
}

// Serialises pinned slots into the API wire format, e.g. ["CS2040S|Tutorial|08"]
export function getPinnedSlotsPayload(pinnedSlots: PinnedSlots): string[] {
  return Object.entries(pinnedSlots).map(([lessonKey, classNo]) => `${lessonKey}|${classNo}`);
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

export function getTimeValues(timeRange: TimeRange) {
  const earliestIndex = convertTimeToIndex(timeRange.earliest);
  const latestIndex = convertTimeToIndex(timeRange.latest) + 1;
  const stride = NUM_INTERVALS_PER_HOUR / 2;
  return range(earliestIndex, latestIndex, stride).map((index) => convertIndexToTime(index));
}
