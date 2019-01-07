// @flow
import { sortBy, each } from 'lodash';
import { Semesters } from 'types/modules';
import type { ModuleInfo } from 'types/views';
import type { AcadYearModules, ModuleTime, PlannerState } from 'types/reducers';
import type { ModuleCode, Semester } from 'types/modules';
import type { State } from 'reducers';
import { getYearsBetween } from 'utils/modules';
import {
  checkPrerequisite,
  EXEMPTION_SEMESTER,
  EXEMPTION_YEAR,
  PLAN_TO_TAKE_SEMESTER,
  PLAN_TO_TAKE_YEAR,
} from 'utils/planner';

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

/**
 * Convert PlannerState into AcadYearModules form which is more easily
 * consumed by the UI
 */
export function getAcadYearModules(state: PlannerState): AcadYearModules {
  const years = getYearsBetween(state.minYear, state.maxYear);
  const modules = {};

  years.forEach((year) => {
    modules[year] = {};

    Semesters.forEach((semester) => {
      const moduleCodes = filterModuleForSemester(state.modules, year, semester);

      if (moduleCodes.length === 0) {
        if (semester === 1 || semester === 2) {
          modules[year][semester] = [];
        }
        return;
      }

      modules[year][semester] = moduleCodes;
    });
  });

  return modules;
}

export function getExemptions(state: PlannerState) {
  // Exemptions are stored in a special year which is not a valid AY
  return filterModuleForSemester(state.modules, EXEMPTION_YEAR, EXEMPTION_SEMESTER);
}

export function getPlanToTake(state: PlannerState) {
  // 'Plan to take' are stored in a special year which is not a valid AY
  return filterModuleForSemester(state.modules, PLAN_TO_TAKE_YEAR, PLAN_TO_TAKE_SEMESTER);
}

/**
 * Higher order function returning a function that returns module info from the module
 * bank and checks if prereqs are met from modules taken in previous semesters
 */
export function getModuleInfo(state: State) {
  // Memoize module sets for each year / semester
  const moduleSets = {};

  return (moduleCode: ModuleCode, year: string, semester: Semester): ?ModuleInfo => {
    // Get detailed module info from the module bank
    const module = state.moduleBank.modules[moduleCode];
    if (!module) return null;

    // Build a set of modules that have been taken before this semester
    const key = `${year}-${semester}`;
    let moduleSet = moduleSets[key];
    if (!moduleSet) {
      // If the set has never been built before
      moduleSet = new Set();
      each(state.planner.modules, (timing, plannerModuleCode) => {
        const [moduleYear, moduleSemester] = timing;
        if (moduleYear < year || (moduleYear === year && moduleSemester < semester)) {
          moduleSet.add(plannerModuleCode);
        }
      });
      moduleSets[key] = moduleSet;
    }

    return {
      module,
      conflicts: checkPrerequisite(moduleSet, module.ModmavenTree),
    };
  };
}
