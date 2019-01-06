// @flow
import { flatten } from 'lodash';
import type { ModuleCode, Semester, TreeFragment } from 'types/modules';

/**
 * Check if a prereq tree is fulfilled given a set of modules that have already
 * been taken. If the requirements are met, null is returned, otherwise an
 * array of unfulfilled requirements is returned.
 */
export function checkPrerequisite(moduleSet: Set<ModuleCode>, tree: TreeFragment) {
  function walkTree(fragment: TreeFragment): ?Array<TreeFragment> {
    if (fragment.name === 'or') {
      return fragment.children.every(walkTree)
        ? // All return non-null = all unfulfilled
          [fragment]
        : null;
    } else if (fragment.name === 'and') {
      const notFulfilled = fragment.children.map(walkTree).filter(Boolean);
      return notFulfilled.length ? flatten(notFulfilled) : null;
    }

    return moduleSet.has(fragment.name) ? null : [fragment];
  }

  // The root node is always the module itself, so we always start one child down
  if (tree.children.length === 0) return null;

  return walkTree(tree.children[0]);
}

/**
 * Create an unique Droppable ID for each semester of each year
 */
export function getDroppableId(year: string, semester: Semester): string {
  return `${year}-${semester}`;
}

/**
 * Extract the acad year and semester from the Droppable ID. The reverse of
 * getDroppableId.
 */
export function fromDroppableId(id: string): [string, Semester] {
  const [acadYear, semesterString] = id.split('-');
  return [acadYear, +semesterString];
}
