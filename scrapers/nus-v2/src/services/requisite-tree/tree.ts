import { flatMap } from 'lodash';
import { PrereqTree } from '../../types/modules';

/* eslint-disable import/prefer-default-export */

export function flattenTree(tree: PrereqTree | PrereqTree[]): string[] {
  if (typeof tree === 'string') {
    return [tree];
  }

  return Array.isArray(tree)
    ? flatMap(tree, flattenTree)
    : flatMap(Object.values(tree), (t) => flattenTree(t as PrereqTree));
}
