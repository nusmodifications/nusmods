// @flow
import { flatten, castArray } from 'lodash';
import type { ModuleCode, Semester, TreeFragment } from 'types/modules';
import config from 'config';

// Exemptions and plan to take are special columns used to hold modules
// outside the
export const EXEMPTION_YEAR = '-1';
export const EXEMPTION_SEMESTER: Semester = -1;

export const PLAN_TO_TAKE_YEAR = '3000';
export const PLAN_TO_TAKE_SEMESTER = -2;

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
