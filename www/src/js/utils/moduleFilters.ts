import { each, flatten, isEmpty, kebabCase, map, values } from 'lodash';
import update, { Spec } from 'immutability-helper';
import qs from 'query-string';

import { FacultyDepartments, FilterGroups } from 'types/views';
import {
  Department,
  Faculty,
  ModuleInformation,
  ModuleLevel,
  NUSModuleAttributes,
  attributeDescription,
} from 'types/modules';

import config from 'config';
import LevelFilter from 'utils/filters/LevelFilter';
import Filter from 'utils/filters/ModuleFilter';
import FilterGroup from 'utils/filters/FilterGroup';
import { createSearchFilter, SEARCH_QUERY_KEY } from './moduleSearch';

export const LEVELS = 'level';
export const MODULE_CREDITS = 'mc';
export const SEMESTER = 'sem';
export const FACULTY = 'faculty';
export const DEPARTMENT = 'department';
export const EXAMS = 'exam';
export const ATTRIBUTES = 'attr';

const moduleLevels: ModuleLevel[] = [1, 2, 3, 4, 5, 6, 8];

/**
 * Update the provided filter groups to the state in the query string immutably
 */
export function updateGroups(groups: FilterGroups, query: string): FilterGroups {
  const params = qs.parse(query);
  const updater: Spec<FilterGroups> = {};

  each(groups, (group) => {
    const currentQuery = group.toQueryString();
    if (currentQuery === params[group.id] || (!params[group.id] && !currentQuery)) return;
    updater[group.id] = { $set: group.fromQueryString(params[group.id]) };
  });

  if (isEmpty(updater)) return groups;
  return update(groups, updater);
}

/**
 * Serialize the provided FilterGroups into query string
 */
export function serializeGroups(groups: FilterGroups): string {
  const query: Record<string, string> = {};

  each(groups, (group) => {
    const value = group.toQueryString();
    if (!value) return;
    query[group.id] = value;
  });

  return qs.stringify(query, { encode: false });
}

const makeFacultyFilter = (faculty: Faculty) =>
  new Filter(
    kebabCase(faculty),
    faculty,
    (module: ModuleInformation) => module.faculty === faculty,
  );
function makeFacultyFilterGroup(faculties: Faculty[]) {
  return new FilterGroup(FACULTY, 'Faculties', faculties.map(makeFacultyFilter));
}

const makeDepartmentFilter = (department: Department) =>
  new Filter(
    kebabCase(department),
    department,
    (module: ModuleInformation) => module.department === department,
  );
function makeDepartmentFilterGroup(departments: Department[]) {
  return new FilterGroup(DEPARTMENT, 'Departments', departments.map(makeDepartmentFilter));
}

function makeExamFilter() {
  return new FilterGroup(EXAMS, 'Exams', [
    new Filter('no-exam', 'No Exams', (module: ModuleInformation) =>
      module.semesterData.every((semesterData) => !semesterData.examDate),
    ),
  ]);
}

function makeAttributeFilter(attribute: keyof NUSModuleAttributes): Filter {
  return new Filter(
    attribute,
    attributeDescription[attribute],
    (module: ModuleInformation) => !!module.attributes && !!module.attributes[attribute],
  );
}

export function defaultGroups(facultyMap: FacultyDepartments, query: string = ''): FilterGroups {
  const params = qs.parse(query);

  const faculties = Object.keys(facultyMap);
  const departments = flatten(values(facultyMap));

  const groups: FilterGroups = {
    [SEMESTER]: new FilterGroup(
      SEMESTER,
      'Available In',
      map(config.semesterNames, (name, semesterStr) => {
        const semester = parseInt(semesterStr, 10);
        return new Filter(
          semesterStr,
          name,
          (module) => !!module.semesterData.find((semData) => semData.semester === semester),
        );
      }),
    ),

    [LEVELS]: new FilterGroup(
      LEVELS,
      'Levels',
      moduleLevels.map((level) => new LevelFilter(level)),
    ),

    [MODULE_CREDITS]: new FilterGroup(MODULE_CREDITS, 'Module Credit', [
      new Filter('0', '0-3 MC', (module) => parseFloat(module.moduleCredit) <= 3),
      new Filter('4', '4 MC', (module) => module.moduleCredit === '4'),
      new Filter('5', '5-8 MC', (module) => {
        const credits = parseFloat(module.moduleCredit);
        return credits > 4 && credits <= 8;
      }),
      new Filter('8', 'More than 8 MC', (module) => parseInt(module.moduleCredit, 10) > 8),
    ]),

    [DEPARTMENT]: makeDepartmentFilterGroup(departments),

    [FACULTY]: makeFacultyFilterGroup(faculties),

    [EXAMS]: makeExamFilter(),

    [ATTRIBUTES]: new FilterGroup(ATTRIBUTES, 'Others', [
      makeAttributeFilter('su'),
      makeAttributeFilter('ssgf'),
      makeAttributeFilter('sfs'),
      makeAttributeFilter('lab'),
      makeAttributeFilter('ism'),
    ]),
  };

  // Search query group
  if (params[SEARCH_QUERY_KEY]) {
    groups[SEARCH_QUERY_KEY] = createSearchFilter(params[SEARCH_QUERY_KEY]);
  }

  return updateGroups(groups, query);
}
