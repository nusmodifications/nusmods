import { State } from './state';
import { Filter, Values } from './utils';

/**
 * Flux Standard Action: https://github.com/acdlite/flux-standard-action
 * @deprecated Use Actions from types/actions instead
 */
export type FSA = {
  type: string;
  payload: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  meta?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: boolean;
};

export type GetState = () => State;

/**
 * Helper for automatically extracting Redux action shapes from a map of action creators.
 */
export type ExtractActionShape<ActionCreators extends {}> = Exclude<
  // Get return types for all exported functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReturnType<Filter<Values<ActionCreators>, (...args: any) => any>>,
  // Exclude thunks from redux-thunk
  Function
>;
