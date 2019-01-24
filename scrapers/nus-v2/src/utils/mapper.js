// @flow
import { fromPairs, pick } from 'lodash';
import type { AcademicGroup, AcademicOrg, ModuleInfo, TimetableLesson } from '../types/api';
import type { RawLesson, Module } from '../types/modules';
import type { DepartmentCodeMap, FacultyCodeMap, ModuleInfoMapped } from '../types/mapper';

/**
 * Create a mapping of faculty code to faculty name from a list of faculties
 */
export function getFacultyCodeMap(faculties: AcademicGroup[]): FacultyCodeMap {
  return fromPairs(faculties.map((faculty) => [faculty.AcademicGroup, faculty.Description]));
}

/**
 * Create a mapping of department code to department name from a list of faculties
 */
export function getDepartmentCodeMap(departments: AcademicOrg[]): DepartmentCodeMap {
  return fromPairs(
    departments.map((department) => [department.AcademicOrganisation, department.Description]),
  );
}

export function mapFacultyDepartmentCodes(
  moduleInfo: ModuleInfo,
  faculties: FacultyCodeMap,
  departments: DepartmentCodeMap,
): ModuleInfoMapped {
  // $FlowFixMe Flow won't recognize this spread is overwriting the original's properties
  return {
    ...moduleInfo,
    AcademicOrganisation: departments[moduleInfo.AcademicOrganisation.Code],
    AcademicGroup: faculties[moduleInfo.AcademicGroup.Code],
  };
}

export function mapModuleInfo(moduleInfo: ModuleInfoMapped): Module {
  const {
    AcademicOrganisation,
    CourseTitle,
    WorkLoadHours,
    Preclusion,
    PreRequisite,
    CoRequisite,
    ModularCredit,
    Description,
    Subject,
    CatalogNumber,
  } = moduleInfo;

  return {
    Description,
    Preclusion,
    Department: AcademicOrganisation,
    ModuleTitle: CourseTitle,
    Workload: WorkLoadHours,
    Prerequisite: PreRequisite,
    Corequisite: CoRequisite,
    ModuleCredit: ModularCredit,
    ModuleCode: Subject + CatalogNumber,
  };
}

export function mapTimetableLessons(lessons: TimetableLesson[]): RawLesson[] {
  return [];
}
