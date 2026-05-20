import type { AcadYear, Module, Semester, SemesterData } from 'types/modules';

import config from 'config';
import academicCalendar from 'data/academic-calendar';
import { getModuleSemesterData, subtractAcadYear } from 'utils/modules';

type DateTuple = [number, number, number];

function getSemesterStart(acadYear: AcadYear, semester: Semester): Date | null {
  const semesterConfig = academicCalendar[acadYear]?.[String(semester)];
  if (!semesterConfig) {
    return null;
  }

  const [year, month, day] = semesterConfig.start as DateTuple;
  return new Date(year, month - 1, day);
}

/**
 * Returns true when Special Term II of the previous academic year is still in
 * session, but config.academicYear has already switched to the new AY.
 */
export function isPreviousAySt2Active(
  academicYear: AcadYear = config.academicYear,
  date: Date = new Date(),
): boolean {
  const previousAcadYear = subtractAcadYear(academicYear);
  const st2Start = getSemesterStart(previousAcadYear, 4);
  const st2End = getSemesterStart(academicYear, 1);

  if (!st2Start || !st2End) {
    return false;
  }

  return date >= st2Start && date < st2End;
}

/**
 * Academic year to source Special Term II data from. Uses specialTermAcademicYear
 * when set, otherwise auto-detects the overlap window.
 */
export function getEffectiveSt2AcadYear(
  academicYear: AcadYear = config.academicYear,
  specialTermAcademicYear: AcadYear | null = config.specialTermAcademicYear,
  date: Date = new Date(),
): AcadYear {
  if (specialTermAcademicYear) {
    return specialTermAcademicYear;
  }

  if (isPreviousAySt2Active(academicYear, date)) {
    return subtractAcadYear(academicYear);
  }

  return academicYear;
}

export function isUsingPreviousAySt2Data(
  academicYear: AcadYear = config.academicYear,
  specialTermAcademicYear: AcadYear | null = config.specialTermAcademicYear,
  date: Date = new Date(),
): boolean {
  return getEffectiveSt2AcadYear(academicYear, specialTermAcademicYear, date) !== academicYear;
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
  return getAcadYearShortName(getEffectiveSt2AcadYear(academicYear, specialTermAcademicYear, date));
}

function upsertSemesterData(
  semesterData: readonly SemesterData[],
  incoming: SemesterData,
): SemesterData[] {
  return [...semesterData.filter((data) => data.semester !== incoming.semester), incoming].sort(
    (left, right) => left.semester - right.semester,
  );
}

/**
 * Merge Special Term II timetable and exam data from the previous AY into the
 * current module. Prefers archive ST II data when the current module lacks a
 * usable ST II timetable.
 */
export function mergePreviousAySt2Data(
  module: Module,
  archiveModule: Module | null | undefined,
): Module {
  if (!archiveModule) {
    return module;
  }

  const archiveSt2 = getModuleSemesterData(archiveModule, 4);
  if (!archiveSt2) {
    return module;
  }

  const currentSt2 = getModuleSemesterData(module, 4);
  const currentHasTimetable = Boolean(currentSt2?.timetable?.length);
  const archiveHasTimetable = Boolean(archiveSt2.timetable?.length);

  if (currentHasTimetable && !archiveHasTimetable) {
    return module;
  }

  if (
    currentHasTimetable &&
    archiveHasTimetable &&
    JSON.stringify(currentSt2) === JSON.stringify(archiveSt2)
  ) {
    return module;
  }

  return {
    ...module,
    semesterData: upsertSemesterData(module.semesterData, archiveSt2),
  };
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

  if (!isUsingPreviousAySt2Data(config.academicYear, config.specialTermAcademicYear, date)) {
    return false;
  }

  return !st2Data.examDate;
}
