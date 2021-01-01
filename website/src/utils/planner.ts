import { flatten, sum } from 'lodash';
import { ModuleCode, ModuleType, PrereqTree } from 'types/modules';
import { PlannerModuleInfo, PlannerModuleSemester, PlannerSemesterModuleType } from 'types/planner';
import config from 'config';
import { assertNever, notNull } from 'types/utils';

// "Exemption" and "plan to take" modules are special columns used to hold modules
// outside the normal planner. "Exemption" modules are coded as -1 year so
// they can always be used to fulfill prereqs, while "plan to take" modules use
// 3000 so they can never fulfill prereqs
export const EXEMPTION_YEAR = '-1';
export const PLAN_TO_TAKE_YEAR = '3000';

// We assume iBLOCs takes place in special term 1
export const IBLOCS_SEMESTER = 3;

export function getSemesterName(semester: PlannerModuleSemester) {
  if (semester === 'exemption') {
    return 'Exemptions';
  }
  if (semester === 'planToTake') {
    return 'Plan to Take';
  }
  if (semester === 'yearLong') {
    return 'Whole Year';
  }

  return config.semesterNames[semester];
}

export function getPlannerSemesterModuleType(semester: PlannerModuleSemester): PlannerSemesterModuleType {
  if (semester === 'yearLong') {
    return 'YEAR_LONG';
  } else if (semester === 'planToTake' || semester === 'exemption') {
    return 'ALL';
  } else {
    return 'SEMESTER_LONG';
  }
}

/**
 * Check if a prereq tree is fulfilled given a set of modules that have already
 * been taken. If the requirements are met, null is returned, otherwise an
 * array of unfulfilled requirements is returned.
 */
export function checkPrerequisite(moduleSet: Set<ModuleCode>, tree: PrereqTree) {
  function walkTree(fragment: PrereqTree): PrereqTree[] | null {
    if (typeof fragment === 'string') {
      return moduleSet.has(fragment) ? null : [fragment];
    }

    if ('or' in fragment) {
      return fragment.or.every((child) => !!walkTree(child))
        ? // All return non-null = all unfulfilled
          [fragment]
        : null;
    }

    if ('and' in fragment) {
      const notFulfilled = fragment.and.map(walkTree).filter(notNull);
      return notFulfilled.length === 0 ? null : flatten(notFulfilled);
    }

    return assertNever(fragment);
  }

  return walkTree(tree);
}

/**
 * Converts conflicts into human readable text form
 */
export function conflictToText(conflict: PrereqTree): string {
  if (typeof conflict === 'string') return conflict;

  if ('or' in conflict) {
    return conflict.or.map(conflictToText).join(' or ');
  }

  if ('and' in conflict) {
    return conflict.and.map(conflictToText).join(' and ');
  }

  return assertNever(conflict);
}

/**
 * Create an unique Droppable ID for each semester of each year
 */
export function getDroppableId(year: string, semester: PlannerModuleSemester): string {
  return `${year}|${semester}`;
}

/**
 * Extract the acad year and semester from the Droppable ID. The reverse of
 * getDroppableId.
 */
export function fromDroppableId(id: string): {acadYear: string, semester: PlannerModuleSemester} {
  const [acadYear, semesterString] = id.split('|');
  return {
    acadYear: acadYear,
    semester: (isNaN(Number(semesterString)) ? semesterString : Number(semesterString)) as PlannerModuleSemester,
  };
}

/**
 * Create an unique Draggable ID for each module code and type
 */
export function getDraggableId(moduleCode: ModuleCode, moduleType: ModuleType): string {
  return `${moduleCode}|${moduleType}`;
}

/**
 * Extract the module code and type from the Draggable ID. The reverse of
 * getDraggableId.
 */
export function fromDraggableId(id: string): { moduleCode: ModuleCode, moduleType: ModuleType } {
  const [moduleCode, moduleType] = id.split('|');
  return { moduleCode: moduleCode, moduleType: moduleType as ModuleType };
}

// Create shortened AY labels - eg. 2019/2020 -> 19/20
export function acadYearLabel(year: string) {
  // Remove the 20 prefix from AY
  return year.replace(/\d{4}/g, (match) => match.slice(2));
}

/**
 * Get a planner module's title, preferring customInfo over moduleInfo.
 * This allows the user to override our data in case there are mistakes.
 */
export function getModuleTitle(
  module: Pick<PlannerModuleInfo, 'moduleInfo' | 'customInfo'>,
): string | null {
  const { moduleInfo, customInfo } = module;
  // customInfo.title is nullable, and there's no point in displaying an
  // empty string, so we can use || here
  return (customInfo && customInfo.title) || (moduleInfo && moduleInfo.title) || null;
}

/**
 * Get a planner module's credits, preferring customInfo over moduleInfo.
 * This allows the user to override our data in case there are mistakes.
 */
export function getModuleCredit(
  module: Pick<PlannerModuleInfo, 'moduleInfo' | 'customInfo'>,
): number | null {
  const { moduleInfo, customInfo } = module;

  // Or operator (||) is not used because moduleCredit can be 0, which is
  // a falsey value
  if (customInfo) return customInfo.moduleCredit;
  if (moduleInfo) return +moduleInfo.moduleCredit;
  return null;
}

/**
 * Get total module credits for the given array of planner modules
 */
export function getTotalMC(
  modules: Pick<PlannerModuleInfo, 'moduleInfo' | 'customInfo'>[],
): number {
  // Remove nulls using .filter(Boolean)
  return sum(modules.map(getModuleCredit).filter(Boolean));
}

/**
 * Returns if a planner module is year-long
 */
export function isYearLong(module: Pick<PlannerModuleInfo, 'moduleInfo' | 'customInfo'>): boolean {
  return module.moduleInfo ? Boolean(module.moduleInfo.attributes?.year) : false;
}

export function isSemester(plannerSemester: PlannerModuleSemester | string) { 
  // If plannerSemester is a number, it is a Semester
  return !isNaN(Number(plannerSemester));
}