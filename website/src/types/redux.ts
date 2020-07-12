import { State } from './state';
import { Values } from './utils';

export type GetState = () => State;

/**
 * Helper for automatically extracting Redux action shapes from a map of action creators.
 */
export type ExtractActionShape<ActionCreators extends {}> = Exclude<
  // Get return types for all exported functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReturnType<Extract<Values<ActionCreators>, (...args: any) => any>>,
  // Exclude thunks from redux-thunk
  Function
>;
