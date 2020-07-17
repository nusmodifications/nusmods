/** moduleBank constants * */

import { ModuleCode } from '../types/modules';

export const FETCH_MODULE = 'FETCH_MODULE' as const; // Action to fetch modules
export const FETCH_MODULE_LIST = 'FETCH_MODULE_LIST' as const;
export const UPDATE_MODULE_TIMESTAMP = 'UPDATE_MODULE_TIMESTAMP' as const;
export const REMOVE_LRU_MODULE = 'REMOVE_LRU_MODULE' as const;
export const FETCH_ARCHIVE_MODULE = 'FETCH_ARCHIVE_MODULE' as const; // Action to fetch module from previous years

export type RequestType =
  | typeof FETCH_MODULE
  | typeof FETCH_MODULE_LIST
  | typeof UPDATE_MODULE_TIMESTAMP
  | typeof REMOVE_LRU_MODULE
  | typeof FETCH_ARCHIVE_MODULE;

export function fetchModuleRequest(moduleCode: ModuleCode) {
  return `${FETCH_MODULE}/${moduleCode}`;
}

export function getRequestModuleCode(key: string): ModuleCode | null {
  const parts = key.split('/');
  if (parts.length === 2 && parts[0] === FETCH_MODULE) return parts[1];
  return null;
}

export function fetchArchiveRequest(moduleCode: ModuleCode, year: string) {
  return `${FETCH_ARCHIVE_MODULE}_${moduleCode}_${year}`;
}

/** undoHistory constants * */

export const UNDO = 'UNDO' as const;
export const REDO = 'REDO' as const;

/** export constant(s) * */

export const SET_EXPORTED_DATA = 'SET_EXPORTED_DATA' as const;
