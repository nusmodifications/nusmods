import { REDO, UNDO } from './constants';

export function undo() {
  return { type: UNDO, payload: null };
}

export function redo() {
  return { type: REDO, payload: null };
}
