import { map, mapValues, each, isEmpty, groupBy, kebabCase } from 'lodash';
import update, { Spec } from 'immutability-helper';
import qs from 'query-string';

import { FilterGroups, DepartmentFaculty } from 'types/views';
import { Faculty, Department, ModuleLevel, ModuleInformation } from 'types/modules';

import config from 'config';
import LevelFilter from 'utils/filters/LevelFilter';
import Filter from 'utils/filters/ModuleFilter';
import FilterGroup from 'utils/filters/FilterGroup';
import { createSearchFilter, SEARCH_QUERY_KEY } from './moduleSearch';

export const LEVELS = 'level';
export const LECTURE_TIMESLOTS = 'lecture';
export const TUTORIAL_TIMESLOTS = 'tutorial';
export const MODULE_CREDITS = 'mc';
export const SEMESTER = 'sem';
export const FACULTY = 'faculty';
export const DEPARTMENT = 'department';
export const EXAMS = 'exam';

const moduleLevels: ModuleLevel[] = [1, 2, 3, 4, 5, 6, 8];

/**
 * Invert the { [faculty: string]: Departments[] } mapping to { [department: string]: Faculty }
 */
export function invertFacultyDepartments(mapping: {
  [faculty: string]: Department[];
}): DepartmentFaculty {
  const departmentFaculty: Record<string, string> = {};
  each(mapping, (departments, faculty) => {
    departments.forEach((department) => {
      departmentFaculty[department] = faculty;
    });
  });
  return departmentFaculty;
}

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

function makeFacultyFilter(faculties: DepartmentFaculty) {
  const facultyDepartments: { [faculty: string]: Set<Department> } = mapValues(
    groupBy(Object.keys(faculties), (department) => faculties[department]),
    (departments) => new Set(departments),
  );

  const filters = map(
    facultyDepartments,
    (departments: Set<Department>, faculty: Faculty) =>
      new Filter(kebabCase(faculty), faculty, (module: ModuleInformation) =>
        departments.has(module.Department),
      ),
  );

  return new FilterGroup(FACULTY, 'Faculties', filters);
}

function makeDepartmentFilter(faculties: DepartmentFaculty) {
  return new FilterGroup(
    DEPARTMENT,
    'Departments',
    Object.keys(faculties).map(
      (department: Department) =>
        new Filter(
          kebabCase(department),
          department,
          (module: ModuleInformation) => module.Department === department,
        ),
    ),
  );
}

function makeExamFilter() {
  return new FilterGroup(EXAMS, 'Exams', [
    new Filter('no-exam', 'No Exams', (module: ModuleInformation) =>
      module.SemesterData.every((semesterData) => !semesterData.ExamDate),
    ),
  ]);
}

export function defaultGroups(faculties: DepartmentFaculty, query: string = ''): FilterGroups {
  const params = qs.parse(query);

  const groups: FilterGroups = {
    [SEMESTER]: new FilterGroup(
      SEMESTER,
      'Available In',
      map(config.semesterNames, (name, semesterStr) => {
        const semester = parseInt(semesterStr, 10);
        return new Filter(
          semesterStr,
          name,
          (module) => !!module.SemesterData.find((semData) => semData.Semester === semester),
        );
      }),
    ),

    [LEVELS]: new FilterGroup(
      LEVELS,
      'Levels',
      moduleLevels.map((level) => new LevelFilter(level)),
    ),

    [MODULE_CREDITS]: new FilterGroup(MODULE_CREDITS, 'Module Credit', [
      new Filter('0', '0-3 MC', (module) => parseFloat(module.ModuleCredit) <= 3),
      new Filter('4', '4 MC', (module) => module.ModuleCredit === '4'),
      new Filter('5', '5-8 MC', (module) => {
        const credits = parseFloat(module.ModuleCredit);
        return credits > 4 && credits <= 8;
      }),
      new Filter('8', 'More than 8 MC', (module) => parseInt(module.ModuleCredit, 10) > 8),
    ]),

    [DEPARTMENT]: makeDepartmentFilter(faculties),

    [FACULTY]: makeFacultyFilter(faculties),

    [EXAMS]: makeExamFilter(),
  };

  // Search query group
  if (params[SEARCH_QUERY_KEY]) {
    groups[SEARCH_QUERY_KEY] = createSearchFilter(params[SEARCH_QUERY_KEY]);
  }

  return updateGroups(groups, query);
}
