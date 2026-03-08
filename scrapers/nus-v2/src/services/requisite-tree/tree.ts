import { flatMap } from 'lodash';
import { PrereqTree } from '../../types/modules';

export function flattenTree(tree: PrereqTree | PrereqTree[]): Array<string> {
  if (typeof tree === 'string') {
    return [tree];
  }

  return Array.isArray(tree)
    ? flatMap(tree, flattenTree)
    : flatMap(Object.values(tree), (t) => flattenTree(t as PrereqTree));
}
