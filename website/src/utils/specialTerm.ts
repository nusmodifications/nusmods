import type { AcadYear, Module, SemesterData } from 'types/modules';

import config from 'config';
import {
  getEffectiveSpecialTermAcadYear as getEffectiveSpecialTermAcadYearFromCalendar,
  isPreviousAySpecialTermActive as isPreviousAySpecialTermActiveFromCalendar,
  isUsingPreviousAySpecialTermData as isUsingPreviousAySpecialTermDataFromCalendar,
  SPECIAL_TERM_SEMESTERS,
} from 'nusmods-academic-calendar';
import { getModuleSemesterData } from 'utils/modules';

/**
 * Returns true when previous AY Special Term I or II is still in session after
 * config has switched to the new AY.
 */
export function isPreviousAySpecialTermActive(
  academicYear: AcadYear = config.academicYear,
  date: Date = new Date(),
): boolean {
  return isPreviousAySpecialTermActiveFromCalendar(academicYear, date);
}

/**
 * Academic year to source Special Term I and II data from. Uses
 * specialTermAcademicYear when set, otherwise auto-detects the overlap window.
 */
export function getEffectiveSpecialTermAcadYear(
  academicYear: AcadYear = config.academicYear,
  specialTermAcademicYear: AcadYear | null = config.specialTermAcademicYear,
  date: Date = new Date(),
): AcadYear {
  return getEffectiveSpecialTermAcadYearFromCalendar(academicYear, specialTermAcademicYear, date);
}

export function isUsingPreviousAySpecialTermData(
  academicYear: AcadYear = config.academicYear,
  specialTermAcademicYear: AcadYear | null = config.specialTermAcademicYear,
  date: Date = new Date(),
): boolean {
  return isUsingPreviousAySpecialTermDataFromCalendar(academicYear, specialTermAcademicYear, date);
}

export function getAcadYearShortName(acadYear: AcadYear): string {
  return acadYear
    .split('/')
    .map((year) => year.substring(2, 4))
    .join('/');
}

export function getPreviousAyShortName(
  academicYear: AcadYear = config.academicYear,
  specialTermAcademicYear: AcadYear | null = config.specialTermAcademicYear,
  date: Date = new Date(),
): string {
  return getAcadYearShortName(
    getEffectiveSpecialTermAcadYear(academicYear, specialTermAcademicYear, date),
  );
}

function upsertSemesterData(
  semesterData: readonly SemesterData[],
  incoming: SemesterData,
): SemesterData[] {
  return [...semesterData.filter((data) => data.semester !== incoming.semester), incoming].sort(
    (left, right) => left.semester - right.semester,
  );
}

function shouldPreferArchiveSemesterData(
  currentSemester: SemesterData | undefined,
  archiveSemester: SemesterData,
): boolean {
  const currentHasTimetable = Boolean(currentSemester?.timetable?.length);
  const archiveHasTimetable = Boolean(archiveSemester.timetable?.length);

  if (currentHasTimetable && !archiveHasTimetable) {
    return false;
  }

  if (
    currentHasTimetable &&
    archiveHasTimetable &&
    JSON.stringify(currentSemester) === JSON.stringify(archiveSemester)
  ) {
    return false;
  }

  return true;
}

/**
 * Merge Special Term I and II timetable and exam data from the previous AY
 * into the current module during the overlap window.
 *
 * Prefers archive data when the current module lacks a usable timetable, when
 * archive and current timetables differ (ModReg R0 on the new AY is not yet
 * authoritative), or when only archive has data. Keeps current data when it
 * has a timetable and archive does not, or when both are identical.
 */
export function mergePreviousAySpecialTermData(
  module: Module,
  archiveModule: Module | null | undefined,
): Module {
  if (!archiveModule) {
    return module;
  }

  let mergedModule = module;

  for (const semester of SPECIAL_TERM_SEMESTERS) {
    const archiveSemester = getModuleSemesterData(archiveModule, semester);
    if (!archiveSemester) {
      continue;
    }

    const currentSemester = getModuleSemesterData(mergedModule, semester);
    if (!shouldPreferArchiveSemesterData(currentSemester, archiveSemester)) {
      continue;
    }

    mergedModule = {
      ...mergedModule,
      semesterData: upsertSemesterData(mergedModule.semesterData, archiveSemester),
    };
  }

  return mergedModule;
}

/**
 * ST II exam dates from ModReg R0 on the new AY are unreliable during the
 * overlap period. Show the external NUS link only when we lack exam data.
 */
export function shouldShowSt2ExamExternalLink(
  module: {
    semesterData: readonly Pick<SemesterData, 'semester' | 'examDate'>[];
  },
  date: Date = new Date(),
): boolean {
  if (!config.showSt2ExamTimetable) {
    return false;
  }

  const st2Data = module.semesterData.find((semester) => semester.semester === 4);
  if (!st2Data) {
    return false;
  }

  if (
    !isUsingPreviousAySpecialTermData(config.academicYear, config.specialTermAcademicYear, date)
  ) {
    return false;
  }

  return !st2Data.examDate;
}
