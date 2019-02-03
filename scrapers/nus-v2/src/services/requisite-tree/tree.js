// @flow

import * as R from 'ramda';

import type { TreeFragment } from '../../types/modules';
import type { ParseTree } from './types';

/**
 * Helper to convert { key: val } into { name: key, children: val }
 */
export const node = (key: string, val?: TreeFragment[]): TreeFragment => ({
  name: key,
  children: val,
});

export function generatePrereqTree(tree: ParseTree): TreeFragment {
  if (typeof tree === 'string') {
    return node(tree);
  }

  if (Array.isArray(tree)) {
    return tree.map(generatePrereqTree);
  }

  return Object.entries(tree).map(([key, val]) => {
    // recursively gen tree
    const children = generatePrereqTree(val);
    return node(key, children);
  });
}

export function flattenTree(tree: ParseTree) {
  if (typeof tree === 'string') {
    return [tree];
  }

  return Array.isArray(tree)
    ? R.unnest(tree.map(flattenTree))
    : R.unnest(Object.values(tree).map(flattenTree));
}
