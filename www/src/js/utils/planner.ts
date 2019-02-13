import { flatten, sum } from 'lodash';
import { ModuleCode, Semester, PrereqTree } from 'types/modules';
import { PlannerModuleInfo } from 'types/views';
import config from 'config';
import { notNull } from '../types/utils';

// "Exemption" and "plan to take" modules are special columns used to hold modules
// outside the normal planner. "Exemption" modules are coded as -1 year so
// they can always be used to fulfill prereqs, while "plan to take" modules use
// 3000 so they can never fulfill prereqs
export const EXEMPTION_YEAR = '-1';
export const EXEMPTION_SEMESTER: Semester = -1;

export const PLAN_TO_TAKE_YEAR = '3000';
export const PLAN_TO_TAKE_SEMESTER = -2;

// We assume iBLOCs takes place in special term 1
export const IBLOCS_SEMESTER = 3;

export function getSemesterName(semester: Semester) {
  if (semester === EXEMPTION_SEMESTER) {
    return 'Exemptions';
  }
  if (semester === PLAN_TO_TAKE_SEMESTER) {
    return 'Plan to Take';
  }

  return config.semesterNames[semester];
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

    if (fragment.or) {
      return fragment.or.every((child) => !!walkTree(child))
        ? // All return non-null = all unfulfilled
          [fragment]
        : null;
    }

    if (fragment.and) {
      const notFulfilled = fragment.and.map(walkTree).filter(notNull);
      return notFulfilled.length === 0 ? null : flatten(notFulfilled);
    }

    // Shouldn't reach here
    throw new Error('Invalid prereq tree');
  }

  return walkTree(tree);
}

/**
 * Converts conflicts into human readable text form
 */
export function conflictToText(conflict: PrereqTree): string {
  if (typeof conflict === 'string') return conflict;

  if (conflict.or) {
    return conflict.or.map(conflictToText).join(' or ');
  }
  if (conflict.and) {
    return conflict.and.map(conflictToText).join(' and ');
  }

  throw new Error('Invalid prereq tree');
}

/**
 * Create an unique Droppable ID for each semester of each year
 */
export function getDroppableId(year: string, semester: Semester): string {
  return `${year}|${semester}`;
}

/**
 * Extract the acad year and semester from the Droppable ID. The reverse of
 * getDroppableId.
 */
export function fromDroppableId(id: string): [string, Semester] {
  const [acadYear, semesterString] = id.split('|');
  return [acadYear, +semesterString];
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
export function getModuleTitle(module: PlannerModuleInfo): string | null {
  const { moduleInfo, customInfo } = module;
  // customInfo.title is nullable, and there's no point in displaying an
  // empty string, so we can use || here
  return (customInfo && customInfo.title) || (moduleInfo && moduleInfo.ModuleTitle) || null;
}

/**
 * Get a planner module's credits, preferring customInfo over moduleInfo.
 * This allows the user to override our data in case there are mistakes.
 */
export function getModuleCredit(module: PlannerModuleInfo): number | null {
  const { moduleInfo, customInfo } = module;

  // Or operator (||) is not used because moduleCredit can be 0, which is
  // a falsey value
  if (customInfo) return customInfo.moduleCredit;
  if (moduleInfo) return +moduleInfo.ModuleCredit;
  return null;
}

/**
 * Get total module credits for the given array of planner modules
 */
export function getTotalMC(modules: PlannerModuleInfo[]): number {
  // Remove nulls using .filter(Boolean)
  return sum(modules.map(getModuleCredit).filter(Boolean));
}
