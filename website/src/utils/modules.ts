import _ from 'lodash';
import { format } from 'date-fns';
import type {
  Module,
  ModuleCode,
  RawLesson,
  Semester,
  SemesterData,
  SemesterDataCondensed,
} from 'types/modules';

import config from 'config';
import { NBSP, noBreak } from 'utils/react';
import { Lesson } from 'types/timetables';
import { ModulesMap } from 'types/reducers';
import { toSingaporeTime } from './timify';

// Look for strings that look like module codes - eg.
// ACC1010  - 3 chars, 4 digits, no suffix
// CS1010FC - 2 chars, 4 digits, 2 chars
// CS2014R  - 2 chars, 4 digits, 1 char
// BMA 5001 - 3 chars, space, 4 digits
export const MODULE_CODE_REGEX = /\b(\w{2,4}\s*\d{4}\w{0,3})\b/g;

// Returns semester specific details such as exam date and timetable.
export function getModuleSemesterData(
  module: Module,
  semester: Semester,
): SemesterData | undefined {
  if (module.isCustom) {
    return undefined;
  }
  return module.semesterData.find((semData: SemesterData) => semData.semester === semester);
}

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module: Module, semester: Semester): readonly RawLesson[] {
  return _.get(getModuleSemesterData(module, semester), 'timetable', []);
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1: Lesson, lesson2: Lesson): boolean {
  return (
    lesson1.moduleCode === lesson2.moduleCode &&
    lesson1.classNo === lesson2.classNo &&
    lesson1.lessonType === lesson2.lessonType
  );
}

// Are the two lessons exact duplicates of one another
export function areLessonsDuplicate(lesson1: Lesson, lesson2: Lesson): boolean {
  return (
    lesson1.moduleCode === lesson2.moduleCode &&
    lesson1.classNo === lesson2.classNo &&
    lesson1.lessonType === lesson2.lessonType &&
    lesson1.day === lesson2.day &&
    lesson1.startTime === lesson2.startTime
  );
}

/**
 * Convert exam in ISO format to 12-hour date/time format.
 */
export function formatExamDate(examDate: string | null | undefined): string {
  if (!examDate) return 'No Exam';

  const localDate = toSingaporeTime(examDate);
  const localDateString = format(localDate, 'dd-MMM-yyyy');
  // Use non-breaking space to prevent AM/PM from clipping to the next line
  const localTimeString = format(localDate, 'p').replace(' ', '\u00a0');
  return `${localDateString} ${localTimeString}`;
}

export function getExamDate(module: Module, semester: Semester): string | null {
  return _.get(getModuleSemesterData(module, semester), 'examDate') || null;
}

export function getExamDuration(module: Module, semester: Semester): number | null {
  return _.get(getModuleSemesterData(module, semester), 'examDuration') || null;
}

export function getFormattedExamDate(module: Module, semester: Semester): string {
  const examDate = getExamDate(module, semester);
  return formatExamDate(examDate);
}

// Returns the current semester if it is found in semesters, or the first semester
// where it is available
export function getFirstAvailableSemester(
  semesters: readonly SemesterDataCondensed[],
  current: Semester = config.semester, // For testing only
): Semester {
  const availableSemesters = semesters.map((semesterData) => semesterData.semester);
  // Assume there is at least 1 semester
  return availableSemesters.includes(current) ? current : Math.min(...availableSemesters);
}

export function getSemestersOffered(module: Module): Semester[] {
  return module.semesterData.map((semesterData) => semesterData.semester).sort();
}

export function renderMCs(moduleCredits: number | string) {
  const credit = typeof moduleCredits === 'string' ? parseFloat(moduleCredits) : moduleCredits;
  return `${credit}${NBSP}${credit === 1 ? 'Unit' : 'Units'}`;
}

export function renderExamDuration(examDuration: number) {
  if (examDuration < 60 || examDuration % 30 !== 0) {
    return noBreak(`${examDuration} mins`);
  }
  const hours = examDuration / 60;
  return noBreak(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
}

export function subtractAcadYear(acadYear: string): string {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) - 1));
}

export function addAcadYear(acadYear: string): string {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) + 1));
}

export function isOffered(module: {
  semesterData?: readonly (SemesterData | SemesterDataCondensed)[];
}): boolean {
  if (module.semesterData) return module.semesterData.length > 0;
  return false;
}

export function offsetAcadYear(year: string, offset: number) {
  let i = offset;
  let currentYear = year;

  while (i !== 0) {
    if (offset < 0) {
      currentYear = subtractAcadYear(currentYear);
      i += 1;
    } else {
      currentYear = addAcadYear(currentYear);
      i -= 1;
    }
  }

  return currentYear;
}

export function getYearsBetween(minYear: string, maxYear: string): string[] {
  if (minYear > maxYear) throw new Error('minYear should be less than or equal to maxYear');

  const years = [];
  let nextYear = minYear;
  while (nextYear !== maxYear) {
    years.push(nextYear);
    nextYear = addAcadYear(nextYear);
  }
  years.push(maxYear);
  return years;
}

export function isGraduateModule(module: { moduleCode: ModuleCode }): boolean {
  return Boolean(/[A-Z]+(5|6)\d{3}/i.test(module.moduleCode));
}

// A module is TA-able if it has at least 1 non-lecture lesson
export function canTa(modules: ModulesMap, moduleCode: ModuleCode, semester: Semester): boolean {
  const module = modules[moduleCode];
  if (!module) return false;
  const moduleTimetable = getModuleTimetable(module, semester);
  return moduleTimetable.some((lesson) => lesson.lessonType !== 'Lecture');
}
