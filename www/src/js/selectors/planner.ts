// @flow
import { flatMap, sortBy, values } from 'lodash';
import type { ModuleCode, Semester } from 'types/modules';
import { Semesters } from 'types/modules';
import type { Conflict, ExamClashes, PlannerModuleInfo, PlannerModulesWithInfo } from 'types/views';
import type { CustomModuleData, ModuleCodeMap, ModuleTime } from 'types/reducers';
import type { State } from 'reducers';
import config from 'config';
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
import { findExamClashes } from 'utils/timetables';

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
 * Conflict checkers - checks if a module has some issue that requires displaying
 * the yellow triangle in the UI.
 *
 * All conflict checks below are higher order functions returning
 * a (ModuleCode) => ?Conflict which can be passed into the last parameter
 * of mapModuleInfo
 */

/**
 * Checks if a module has unfulfilled prereqs
 */
const prereqConflict = (modulesMap: ModulesMap, modulesTaken: Set<ModuleCode>) => (
  moduleCode: ModuleCode,
): ?Conflict => {
  const moduleInfo = modulesMap[moduleCode];
  if (!moduleInfo) return null;

  const unfulfilledPrereqs = checkPrerequisite(modulesTaken, moduleInfo.ModmavenTree);
  if (!unfulfilledPrereqs || !unfulfilledPrereqs.length) return null;

  return { type: 'prereq', unfulfilledPrereqs };
};

/**
 * Checks if a module exists in our data
 */
const noInfoConflict = (moduleCodeMap: ModuleCodeMap, customData: CustomModuleData) => (
  moduleCode: ModuleCode,
): ?Conflict => (moduleCodeMap[moduleCode] || customData[moduleCode] ? null : { type: 'noInfo' });

/**
 * Checks if modules are added to semesters in which they are not available
 */
const semesterConflict = (moduleCodeMap: ModuleCodeMap, semester: Semester) => (
  moduleCode: ModuleCode,
): ?Conflict => {
  const moduleCondensed = moduleCodeMap[moduleCode];
  if (!moduleCondensed) return null;
  if (!moduleCondensed.Semesters.includes(semester)) {
    return { type: 'semester', semestersOffered: moduleCondensed.Semesters };
  }

  return null;
};

/**
 * Checks if there are exam clashes. The clashes come from the caller since the exam clash function
 * calculates clashes for all modules in one semester, so it would be wasteful to rerun the exam
 * clash function for every call to this function.
 */
const examConflict = (clashes: ExamClashes) => (moduleCode: ModuleCode): ?Conflict => {
  const clash = values(clashes).find((modules) =>
    modules.find((module) => module.ModuleCode === moduleCode),
  );

  if (clash) {
    return { type: 'exam', conflictModules: clash.map((module) => module.ModuleCode) };
  }

  return null;
};

function mapModuleToInfo(
  moduleCode: ModuleCode,
  modulesMap: ModulesMap,
  customModules: CustomModuleData,
  conflictChecks: Array<(moduleCode: ModuleCode) => ?Conflict>,
): PlannerModuleInfo {
  // Only continue checking until the first conflict is found
  let conflict = null;
  let index = 0;
  while (!conflict && index < conflictChecks.length) {
    conflict = conflictChecks[index](moduleCode);
    index += 1;
  }

  return {
    moduleCode,
    conflict,
    customInfo: customModules[moduleCode],
    moduleInfo: modulesMap[moduleCode],
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
): PlannerModuleInfo[] {
  const { planner, moduleBank } = state;
  const conflictChecks = [noInfoConflict(moduleBank.moduleCodes, planner.custom)];

  return filterModuleForSemester(planner.modules, year, semester).map((moduleCode) =>
    mapModuleToInfo(moduleCode, moduleBank.modules, planner.custom, conflictChecks),
  );
}

export const getIBLOCs = (state: State): PlannerModuleInfo[] => {
  if (!state.planner.iblocs) return [];
  const iblocsYear = subtractAcadYear(state.planner.minYear);
  return mapNonTimetableModules(state, iblocsYear, IBLOCS_SEMESTER);
};

export const getExemptions = (state: State): PlannerModuleInfo[] =>
  mapNonTimetableModules(state, EXEMPTION_YEAR, EXEMPTION_SEMESTER);

export const getPlanToTake = (state: State): PlannerModuleInfo[] =>
  mapNonTimetableModules(state, PLAN_TO_TAKE_YEAR, PLAN_TO_TAKE_SEMESTER);

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
    // iBLOCs modules, if there are any, since they are also not included in acad year modules
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

      // Only check for exam clashes for modules in the current year
      let clashes = {};
      if (year === config.academicYear) {
        const sememsterModules = moduleCodes
          .map((moduleCode) => moduleBank.modules[moduleCode])
          .filter(Boolean);
        clashes = findExamClashes(sememsterModules, semester);
      }

      const conflictChecks = [
        noInfoConflict(moduleBank.moduleCodes, planner.custom),
        prereqConflict(moduleBank.modules, modulesTaken),
        semesterConflict(moduleBank.moduleCodes, semester),
        examConflict(clashes),
      ];

      modules[year][semester] = moduleCodes.map((moduleCode) =>
        mapModuleToInfo(moduleCode, moduleBank.modules, planner.custom, conflictChecks),
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
