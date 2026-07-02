import { flatMap } from 'lodash';
import { PrereqTree } from '../../types/modules';

export function flattenTree(tree: PrereqTree | Array<PrereqTree>): Array<string> {
  if (typeof tree === 'string') {
    return [tree];
  }

  if (Array.isArray(tree)) {
    return flatMap(tree, flattenTree);
  }

  // The Object.values() walk below recurses into the nOf tuple, so the count
  // (a number) gets passed back in. The `in` operator below only works on
  // objects, so bail on any non-object (numbers contribute no module codes).
  if (typeof tree !== 'object') {
    return [];
  }

  // Only the gated requirement holds module codes; the cohort condition itself
  // (rule + year tokens) must not be walked as if it were a subtree. A bare
  // cohort constraint has no `then`, so it contributes no module codes.
  if ('cohort' in tree) {
    return tree.then === undefined ? [] : flattenTree(tree.then);
  }

  // Like cohort: only the gated requirement holds module codes; the program-type
  // condition itself (rule + type names) must not be walked as a subtree.
  if ('programType' in tree) {
    return flattenTree(tree.then);
  }

  return flatMap(Object.values(tree), (t) => flattenTree(t as PrereqTree));
}
