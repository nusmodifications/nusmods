// @flow

import { flatMap } from 'lodash';
import type { PrereqTree } from '../../types/modules';

/* eslint-disable import/prefer-default-export */

export function flattenTree(tree: PrereqTree): string[] {
  if (typeof tree === 'string') {
    return [tree];
  }

  return Array.isArray(tree)
    ? flatMap(tree, flattenTree)
    : flatMap(Object.values(tree), flattenTree);
}
