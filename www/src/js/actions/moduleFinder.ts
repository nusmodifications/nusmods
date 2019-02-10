// @flow

import type { FSA } from 'types/redux';

export const SEARCH_MODULES = 'SEARCH_MODULES';
export function searchModules(searchTerm: string): FSA {
  return {
    type: SEARCH_MODULES,
    payload: { searchTerm },
  };
}

export const RESET_MODULE_FINDER = 'RESET_MODULE_FINDER';
export function resetModuleFinder(): FSA {
  return {
    type: RESET_MODULE_FINDER,
    payload: null,
  };
}
