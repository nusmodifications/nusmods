import { flatMap } from 'lodash';
import { PrereqTree } from '../../types/modules';

export function flattenTree(tree: PrereqTree | Array<PrereqTree>): Array<string> {
  if (typeof tree === 'string') {
    return [tree];
  }

  if (Array.isArray(tree)) {
    return flatMap(tree, flattenTree);
  }

  // Only the gated requirement holds module codes; the cohort condition itself
  // (rule + year tokens) must not be walked as if it were a subtree.
  if ('cohort' in tree) {
    return flattenTree(tree.then);
  }

  return flatMap(Object.values(tree), (t) => flattenTree(t as PrereqTree));
}
