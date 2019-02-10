// @flow
import type { FSA } from 'types/redux';

export const UNDO = 'UNDO';
export function undo(): FSA {
  return { type: UNDO, payload: null };
}

export const REDO = 'REDO';
export function redo(): FSA {
  return { type: REDO, payload: null };
}
