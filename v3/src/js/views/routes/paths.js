// @flow
import { kebabCase, each } from 'lodash';
import type { ModuleCode, ModuleTitle, Semester } from 'types/modules';
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

// Timetable path -> Semester
export function semesterForTimetablePage(semStr: ?string): ?Semester {
  if (!semStr) return null;
  return toSemester[semStr];
}

// Module Code, Module Title -> Module page path
export function modulePage(moduleCode: ModuleCode, moduleTitle: ModuleTitle): string {
  return `/modules/${moduleCode}/${kebabCase(moduleTitle)}`;
}
