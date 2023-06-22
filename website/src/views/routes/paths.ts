import { each, kebabCase } from 'lodash';
import { ModuleTitle, Semester, ModuleCode } from 'types/modules';
import { Venue } from 'types/venues';
import { SemTimetableConfig } from 'types/timetables';
import { serializeTimetable } from 'utils/timetables';
import config from 'config';

// IMPORTANT: Remember to update any route changes on the sitemap

// Cache semester -> path and path -> semester mappings
export const fromSemester: { [semester: string]: string } = {};
const toSemester: { [key: string]: Semester } = {};
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
export function semesterForTimetablePage(semStr: string | null | undefined): Semester | null {
  if (!semStr) return null;
  return toSemester[semStr] || null;
}

// Module Code, Module Title -> Module page path
export function modulePage(moduleCode: ModuleCode, moduleTitle?: ModuleTitle | null): string {
  return `/courses/${moduleCode}/${kebabCase(moduleTitle || '')}`;
}

export function moduleArchive(
  moduleCode: ModuleCode,
  year: string,
  moduleTitle: ModuleTitle = '',
): string {
  return `/archive/${moduleCode}/${year.replace('/', '-')}/${kebabCase(moduleTitle)}`;
}

// Venue -> Venue page path
export function venuePage(venue?: Venue | null | undefined): string {
  if (!venue) return '/venues';
  return `/venues/${encodeURIComponent(venue)}`;
}

// Creates an absolute URL from a relative path
export function absolutePath(path: string): string {
  return `${window.location.protocol}//${window.location.host}${path}`;
}
