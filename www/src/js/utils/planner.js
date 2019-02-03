// @flow
import { castArray, flatten, sum } from 'lodash';
import type { ModuleCode, Semester, TreeFragment } from 'types/modules';
import type { PlannerModuleInfo } from 'types/views';
import config from 'config';

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
  } else if (semester === PLAN_TO_TAKE_SEMESTER) {
    return 'Plan to Take';
  }

  return config.semesterNames[semester];
}

/**
 * Check if a prereq tree is fulfilled given a set of modules that have already
 * been taken. If the requirements are met, null is returned, otherwise an
 * array of unfulfilled requirements is returned.
 */
export function checkPrerequisite(moduleSet: Set<ModuleCode>, tree: TreeFragment) {
  function walkTree(fragment: TreeFragment): ?Array<TreeFragment> {
    // TreeFragment appears to be incorrectly typed. Sometimes for no apparent
    // reason the fragment is double wrapped in an array
    // eslint-disable-next-line no-param-reassign
    if (Array.isArray(fragment)) fragment = fragment[0];

    if (fragment.name === 'or') {
      return fragment.children.every(walkTree)
        ? // All return non-null = all unfulfilled
          [fragment]
        : null;
    } else if (fragment.name === 'and') {
      const notFulfilled = fragment.children.map(walkTree).filter(Boolean);
      return notFulfilled.length === 0 ? null : flatten(notFulfilled);
    }

    return moduleSet.has(fragment.name) ? null : [fragment];
  }

  // The root node is always the module itself, so we always start one child down
  const children = castArray(tree.children);
  if (children.length === 0) return null;
  return walkTree(children[0]);
}

/**
 * Converts conflicts into human readable text form
 */
export function conflictToText(conflict: TreeFragment) {
  // TreeFragment appears to be incorrectly typed. Sometimes for no apparent
  // reason the fragment is double wrapped in an array
  // eslint-disable-next-line no-param-reassign
  if (Array.isArray(conflict)) conflict = conflict[0];

  if (conflict.name === 'or') {
    return conflict.children.map(conflictToText).join(' or ');
  } else if (conflict.name === 'and') {
    return conflict.children.map(conflictToText).join(' and ');
  }

  return conflict.name;
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
export function getModuleTitle(module: PlannerModuleInfo): ?string {
  const { moduleInfo, customInfo } = module;
  // customInfo.title is nullable, and there's no point in displaying an
  // empty string, so we can use || here
  return customInfo?.title || moduleInfo?.ModuleTitle || null;
}

/**
 * Get a planner module's credits, preferring customInfo over moduleInfo.
 * This allows the user to override our data in case there are mistakes.
 */
export function getModuleCredit(module: PlannerModuleInfo): ?number {
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
