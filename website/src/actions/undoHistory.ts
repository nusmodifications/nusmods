import { FSA } from 'types/redux';
import { REDO, UNDO } from './constants';

export function undo(): FSA {
  return { type: UNDO, payload: null };
}

export function redo(): FSA {
  return { type: REDO, payload: null };
}
