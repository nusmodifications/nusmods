// @flow
import { sortBy } from 'lodash';
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

export function getExemptions(state: State): ModuleWithInfo[] {
  const { planner, moduleBank } = state;
  const taken = new Set();

  // "Exemption" modules are stored in a special year which is not a valid AY
  return filterModuleForSemester(planner.modules, EXEMPTION_YEAR, EXEMPTION_SEMESTER).map(
    (moduleCode) => mapModuleToInfo(moduleCode, moduleBank.modules, taken),
  );
}

export function getPlanToTake(state: State): ModuleWithInfo[] {
  const { planner, moduleBank } = state;
  const taken = new Set();

  // "Plan to take" modules are stored in a special year which is not a valid AY
  return filterModuleForSemester(planner.modules, PLAN_TO_TAKE_YEAR, PLAN_TO_TAKE_SEMESTER).map(
    (moduleCode) => mapModuleToInfo(moduleCode, moduleBank.modules, taken),
  );
}

/**
 * Convert PlannerState into PlannerModulesWithInfo form which is more easily
 * consumed by the UI
 */
export function getAcadYearModules(state: State): PlannerModulesWithInfo {
  const { planner, moduleBank } = state;
  // iBLOCs happens in the year before matriculation
  const minYear = planner.iblocs ? subtractAcadYear(planner.minYear) : planner.minYear;
  const years = getYearsBetween(minYear, planner.maxYear);
  const modules = {};
  const modulesTaken = new Set<ModuleCode>(getExemptions(state).map((module) => module.moduleCode));

  years.forEach((year) => {
    modules[year] = {};

    Semesters.forEach((semester) => {
      const moduleCodes = filterModuleForSemester(planner.modules, year, semester);
      modules[year][semester] = moduleCodes.map((moduleCode) =>
        mapModuleToInfo(moduleCode, moduleBank.modules, modulesTaken),
      );

      // Add taken modules to set of modules taken for prerequisite calculation
      moduleCodes.forEach((moduleCode) => {
        modulesTaken.add(moduleCode);

        // Also try to match the non-variant version (without the suffix alphabets)
        // of the module code
        const match = /([A-Z]+\d+)[A-Z]+$/gi.exec(moduleCode);
        if (match) modulesTaken.add(match[1]);
      });
    });
  });

  // Don't show semesters 1 and 2 in the iBLOCs year
  if (planner.iblocs) {
    delete modules[minYear][1];
    delete modules[minYear][2];
  }

  return modules;
}
