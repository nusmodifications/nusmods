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
  ClassNo,
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
  PinnedSlots,
  TimeRange,
  TimeRangeConflict,
} from 'types/optimiser';
import { ColorMapping } from 'types/reducers';
import { SemTimetableConfig } from 'types/timetables';
import { LessonSlot, OptimiseResponse } from 'apis/optimiser';
import { getModuleLessonMap, getModuleTimetable } from './modules';
import { getClosestClassNo, isClassNo } from './timetables';
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

// For each physical lesson option, check if that lessonType will have conflicts.
// A pinned lesson is fixed to the single class chosen in the timetable, so only that
// class's days are considered for it.
export function getFreeDayConflicts(
  modules: Module[],
  semester: Semester,
  physicalLessonOptions: LessonOption[],
  pinnedClassNos: PinnedSlots,
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
        const { lessonType, lessonKey, displayText } = lessonOption;
        const pinnedClassNo = pinnedClassNos[lessonKey];
        const filteredLessons = lessons.filter(
          (lesson) =>
            lesson.lessonType === lessonType &&
            (!pinnedClassNo || lesson.classNo === pinnedClassNo),
        );
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

// Resolves each lesson to the classNo currently selected in the timetable tab, keyed by
// lessonKey. Handles both lesson config formats: V1 stores the classNo directly, V2 stores
// serialised lesson ids (resolved to their classNo). Lessons whose selection cannot be
// resolved (e.g. lesson removed from the module) are skipped, so they cannot be pinned.
export function getTimetableClassNos(
  timetable: SemTimetableConfig,
  modules: Module[],
  semester: Semester,
): Record<LessonKey, ClassNo> {
  const timetableClassNos: Record<LessonKey, ClassNo> = {};
  modules.forEach((module) => {
    const { moduleCode } = module;
    const lessonMap = getModuleLessonMap(module, semester);
    Object.entries(timetable[moduleCode] ?? {}).forEach(([lessonType, lessonConfig]) => {
      const lessonTypeLessons = lessonMap[lessonType] ?? {};
      let classNo: ClassNo | null = null;
      if (isClassNo(lessonConfig)) {
        // V1 config: the value is the classNo itself; keep it only if it still exists
        const [candidate] = lessonConfig;
        if (values(lessonTypeLessons).some((lesson) => lesson.classNo === candidate)) {
          classNo = candidate;
        }
      } else {
        // V2 config: serialised lesson ids, resolve to the majority classNo
        classNo = getClosestClassNo(lessonTypeLessons, lessonConfig);
      }
      if (classNo) timetableClassNos[getLessonKey(moduleCode, lessonType)] = classNo;
    });
  });
  return timetableClassNos;
}

// For each live pinned lesson, report a conflict when its pinned class falls outside the
// selected lesson time range. Recorded lessons need no physical attendance, so they are
// exempt (only physical lesson options are checked).
export function getTimeRangeConflicts(
  modules: Module[],
  semester: Semester,
  physicalLessonOptions: LessonOption[],
  pinnedClassNos: PinnedSlots,
  lessonTimeRange: TimeRange,
): TimeRangeConflict[] {
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
        const { lessonType, lessonKey, displayText } = lessonOption;
        const classNo = pinnedClassNos[lessonKey];
        if (!classNo) return null;

        const classLessons = lessons.filter(
          (lesson) => lesson.lessonType === lessonType && lesson.classNo === classNo,
        );
        // "HHMM" strings compare correctly lexicographically
        const isOutsideTimeRange = classLessons.some(
          (lesson) =>
            lesson.startTime < lessonTimeRange.earliest || lesson.endTime > lessonTimeRange.latest,
        );
        return isOutsideTimeRange ? { moduleCode, lessonType, displayText, classNo } : null;
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
