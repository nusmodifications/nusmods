// @flow
import type {
  Day,
  Lesson,
  Module,
  RawLesson,
  Semester,
  SemesterData,
  Time,
  WorkloadComponent,
} from 'types/modules';

import _ from 'lodash';
import config from 'config';
import { NBSP } from 'utils/react';

// Look for strings that look like module codes - eg.
// ACC1010  - 3 chars, 4 digits, no suffix
// CS1010FC - 2 chars, 4 digits, 2 chars
// CS2014R  - 2 chars, 4 digits, 1 char
// BMA 5001 - 3 chars, space, 4 digits
export const MODULE_CODE_REGEX = /\b(\w{2,3}\s*\d{4}\w{0,3})\b/g;

// Returns semester specific details such as exam date and timetable.
export function getModuleSemesterData(module: Module, semester: Semester): ?SemesterData {
  return module.History.find((semData: SemesterData) => semData.Semester === semester);
}

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module: Module, semester: Semester): Array<RawLesson> {
  return _.get(getModuleSemesterData(module, semester), 'Timetable', []);
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1: Lesson, lesson2: Lesson): boolean {
  return (
    lesson1.ModuleCode === lesson2.ModuleCode &&
    lesson1.ClassNo === lesson2.ClassNo &&
    lesson1.LessonType === lesson2.LessonType
  );
}

/**
 * Convert examDate to JS Date object. Unfortunately just doing
 * new Date(examDate) won't work on Safari, since the timestamp is almost but not
 * quite ISO8601 standard
 *
 * The API returns examDate with hhmm as the TZ specifier, but we want
 * this to work on machines in all timezones, so instead we lop it off and
 * pretend it is in UTC time
 */
export function examDateToDate(examDate: string): Date {
  return new Date(`${examDate.slice(0, 16)}Z`);
}

/**
 * Convert exam in ISO format to 12-hour date/time format. We slice off the
 * SGT time zone and interpret as UTC time, then use the getUTC* methods so
 * that they will correspond to Singapore time regardless of the local time
 * zone.
 */
export function formatExamDate(examDate: ?string): string {
  if (!examDate) return 'No Exam';

  const date = examDateToDate(examDate);
  const hours: number = date.getUTCHours();

  const day: string = _.padStart(`${date.getUTCDate().toString()}`, 2, '0');
  const month: string = _.padStart(`${date.getUTCMonth() + 1}`, 2, '0');
  const year: number = date.getUTCFullYear();
  const hour: number = hours % 12 || 12;
  const minute: string = _.padStart(`${date.getUTCMinutes()}`, 2, '0');
  const amPm: string = hours < 12 ? 'AM' : 'PM';
  return `${day}-${month}-${year} ${hour}:${minute} ${amPm}`;
}

export function getModuleExamDate(module: Module, semester: Semester): string {
  return _.get(getModuleSemesterData(module, semester), 'ExamDate');
}

export function getFormattedModuleExamDate(module: Module, semester: Semester): string {
  const examDate = getModuleExamDate(module, semester);
  return formatExamDate(examDate);
}

// Returns the current semester if it is found in semesters, or the first semester
// where it is available
export function getFirstAvailableSemester(
  semesters: SemesterData[],
  current: Semester = config.semester, // For testing only
): Semester {
  const availableSemesters = semesters.map((semesterData) => semesterData.Semester);
  return availableSemesters.includes(current) ? current : _.min(availableSemesters);
}

export function getSemestersOffered(module: Module): Semester[] {
  return module.History.map((semesterData) => semesterData.Semester).sort();
}

// Workload components as defined by CORS, in their correct positions (see below).
export const WORKLOAD_COMPONENTS: WorkloadComponent[] = [
  'Lecture',
  'Tutorial',
  'Laboratory',
  'Project',
  'Preparation',
];
export type Workload = { [WorkloadComponent]: number } | string;

// Parse the workload string into a mapping of individual components to their hours.
// If the string is unparsable, it is returned without any modification.
export function parseWorkload(workloadString: string): Workload {
  const cleanedWorkloadString = workloadString
    .replace(/\(.*?\)/g, '') // Remove stuff in parenthesis
    .replace(/NA/g, '0') // Replace 'NA' with 0
    .replace(/\s+/g, ''); // Remove whitespace

  if (!/^((^|-)([\d.]+)){5}$/.test(cleanedWorkloadString)) return workloadString;
  // Workload string is formatted as A-B-C-D-E where
  // A: no. of lecture hours per week
  // B: no. of tutorial hours per week
  // C: no. of laboratory hours per week
  // D: no. of hours for projects, assignments, fieldwork etc per week
  // E: no. of hours for preparatory work by a student per week
  // Taken from CORS:
  // https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=2017/2018&sem_c=1&mod_c=CS2105
  const hours = workloadString.split('-');

  const workload = {};
  _.zip(WORKLOAD_COMPONENTS, hours).forEach(([component, hourString]) => {
    const hour = parseFloat(hourString);
    if (!hour) return;
    workload[component] = hour;
  });

  return workload;
}

export function getTimeslot(day: Day, time: Time): string {
  return `${day} ${time}`;
}

export function renderMCs(moduleCredits: number | string) {
  const credit = parseInt(moduleCredits, 10);
  return `${credit}${NBSP}${credit === 1 ? 'MC' : 'MCs'}`;
}

export function subtractAcadYear(acadYear: string): string {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) - 1));
}

export function addAcadYear(acadYear: string): string {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) + 1));
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
