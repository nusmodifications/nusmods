// @flow
import { flatMap, sortBy } from 'lodash';
import type { ModuleCode, Semester } from 'types/modules';
import { Semesters } from 'types/modules';
import type { ModuleWithInfo, PlannerModulesWithInfo } from 'types/views';
import type { ModuleTime } from 'types/reducers';
import type { State } from 'reducers';
import { getYearsBetween, subtractAcadYear } from 'utils/modules';
import {
  checkPrerequisite,
  EXEMPTION_SEMESTER,
  EXEMPTION_YEAR,
  IBLOCS_SEMESTER,
  PLAN_TO_TAKE_SEMESTER,
  PLAN_TO_TAKE_YEAR,
} from 'utils/planner';
import type { ModulesMap } from 'reducers/moduleBank';

/* eslint-disable no-useless-computed-key */

/**
 * Get a list of modules planned for a specific semester in an acad year
 * in the order specified by the index
 */
export function filterModuleForSemester(
  modules: { +[ModuleCode]: ModuleTime },
  year: string,
  semester: Semester,
) {
  const filteredModules = Object.keys(modules).filter((moduleCode) => {
    const [moduleYear, moduleSemester] = modules[moduleCode];
    return moduleYear === year && moduleSemester === semester;
  });

  return sortBy<ModuleCode>(filteredModules, (moduleCode: ModuleCode) => modules[moduleCode][2]);
}

export function mapModuleToInfo(
  moduleCode: ModuleCode,
  modulesMap: ModulesMap,
  modulesTaken: Set<ModuleCode>,
): ModuleWithInfo {
  const moduleInfo = modulesMap[moduleCode];
  if (!moduleInfo) return { moduleCode };

  return {
    moduleCode,
    moduleInfo,
    conflicts: checkPrerequisite(modulesTaken, moduleInfo.ModmavenTree),
  };
}

export function getPrereqModuleCode(moduleCode: ModuleCode): ModuleCode[] {
  const moduleCodes = [moduleCode];

  // Also try to match the non-variant version (without the suffix alphabets)
  // of the module code
  const match = /([A-Z]+\d+)[A-Z]+$/gi.exec(moduleCode);
  if (match) moduleCodes.push(match[1]);

  return moduleCodes;
}

/**
 * Maps modules from sources outside the normal timetable,
 * such as exemptions, "plan to take" and iBLOCs modules
 */
export function mapNonTimetableModules(
  state: State,
  year: string,
  semester: Semester,
): ModuleWithInfo[] {
  const { planner, moduleBank } = state;
  const taken = new Set();

  return filterModuleForSemester(planner.modules, year, semester).map((moduleCode) =>
    mapModuleToInfo(moduleCode, moduleBank.modules, taken),
  );
}

export function getIBLOCs(state: State): ModuleWithInfo[] {
  if (!state.planner.iblocs) return [];
  const iblocsYear = subtractAcadYear(state.planner.minYear);
  return mapNonTimetableModules(state, iblocsYear, IBLOCS_SEMESTER);
}

export function getExemptions(state: State): ModuleWithInfo[] {
  return mapNonTimetableModules(state, EXEMPTION_YEAR, EXEMPTION_SEMESTER);
}

export function getPlanToTake(state: State): ModuleWithInfo[] {
  return mapNonTimetableModules(state, PLAN_TO_TAKE_YEAR, PLAN_TO_TAKE_SEMESTER);
}

/**
 * Convert PlannerState into PlannerModulesWithInfo form which is more easily
 * consumed by the UI
 */
export function getAcadYearModules(state: State): PlannerModulesWithInfo {
  const { planner, moduleBank } = state;
  const years = getYearsBetween(planner.minYear, planner.maxYear);
  const exemptions = [
    // Normal exemptions
    ...getExemptions(state),
    // iBLOCs modules, if there are any, are also not included in acad year modules
    ...getIBLOCs(state),
  ];
  const modulesTaken = new Set<ModuleCode>(
    flatMap(exemptions, (module) => getPrereqModuleCode(module.moduleCode)),
  );

  const modules = {};
  years.forEach((year) => {
    modules[year] = {};

    Semesters.forEach((semester) => {
      const moduleCodes = filterModuleForSemester(planner.modules, year, semester);
      modules[year][semester] = moduleCodes.map((moduleCode) =>
        mapModuleToInfo(moduleCode, moduleBank.modules, modulesTaken),
      );

      // Add taken modules to set of modules taken for prerequisite calculation
      moduleCodes.forEach((moduleCode) => {
        getPrereqModuleCode(moduleCode).forEach((prereq) => {
          modulesTaken.add(prereq);
        });
      });
    });
  });

  return modules;
}
