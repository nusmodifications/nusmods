// @flow
import { kebabCase, each } from 'lodash';
import type { ModuleCode, ModuleTitle, Semester } from 'types/modules';
import type { Venue } from 'types/venues';
import type { SemTimetableConfig } from 'types/timetables';
import { serializeTimetable } from 'utils/timetables';
import config from 'config';

// Cache semester -> path and path -> semester mappings
export const fromSemester: { [Semester]: string } = {};
const toSemester: { [string]: Semester } = {};
each(config.shortSemesterNames, (name, semester) => {
  const path = kebabCase(name);
  fromSemester[semester] = path;
  toSemester[path] = Number(semester);
});

// Semester -> Timetable path
export function timetablePage(semester: Semester): string {
  return `/timetable/${fromSemester[semester]}`;
}

export const TIMETABLE_SHARE = 'share';
export function timetableShare(semester: Semester, timetable: SemTimetableConfig): string {
  return `${timetablePage(semester)}/${TIMETABLE_SHARE}?${serializeTimetable(timetable)}`;
}

// Timetable path -> Semester
export function semesterForTimetablePage(semStr: ?string): ?Semester {
  if (!semStr) return null;
  return toSemester[semStr];
}

// Checks if the URL matches v2 timetable URL
export function isV2TimetablePageUrl(params: { [string]: ?string }): boolean {
  const { semester, action } = params;
  return !!semester && !!action && /^\d{4}-\d{4}$/.test(semester) && /^sem[1234]$/.test(action);
}

// Module Code, Module Title -> Module page path
export function modulePage(moduleCode: ModuleCode, moduleTitle: ModuleTitle): string {
  return `/modules/${moduleCode}/${kebabCase(moduleTitle)}`;
}

// Venue -> Venue page path
export function venuePage(venue?: ?Venue): string {
  if (!venue) return '/venues';
  return `/venues/${encodeURIComponent(venue)}`;
}

// Creates an absolute URL from a relative path
export function absolutePath(path: string): string {
  return `${location.protocol}//${location.host}${path}`;
}
