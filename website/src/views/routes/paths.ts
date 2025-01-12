import { each, isEmpty, kebabCase } from 'lodash';
import { ModuleTitle, Semester, ModuleCode } from 'types/modules';
import { Venue } from 'types/venues';
import { SemTimetableConfig, TaModulesConfig } from 'types/timetables';
import { serializeHidden, serializeTa, serializeTimetable } from 'utils/timetables';
import config from 'config';
import { CustomModuleLessonData } from 'types/reducers';
import { serializeCustomModuleList } from 'utils/customModule';

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
export function timetableShare(
  semester: Semester,
  timetable: SemTimetableConfig,
  customModules: CustomModuleLessonData,
  hiddenModules: ModuleCode[],
  taModules: TaModulesConfig,
): string {
  const customModulesList = Object.values(customModules);
  const serializedCustom =
    customModulesList.length === 0
      ? ''
      : `&custom=${encodeURIComponent(serializeCustomModuleList(customModulesList))}`;

  // Convert the list of hidden modules to a comma-separated string, if there are any
  const serializedHidden = hiddenModules.length === 0 ? '' : serializeHidden(hiddenModules);
  const serializedTa = isEmpty(taModules) ? '' : serializeTa(taModules);

  return (
    `${timetablePage(semester)}/${TIMETABLE_SHARE}` +
    `?${serializeTimetable(timetable)}` +
    `${serializedCustom}` +
    `${serializedHidden}` +
    `${serializedTa}`
  );
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
