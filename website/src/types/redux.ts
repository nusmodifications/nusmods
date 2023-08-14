import type { ThunkDispatch } from 'redux-thunk';
import type { RequestsDispatchExt } from 'actions/requests';
import type { State } from './state';
import type { AnyFunction, Values } from './utils';
import type { Actions } from './actions';

export type GetState = () => State;

export type Dispatch = ThunkDispatch<State, undefined, Actions> & RequestsDispatchExt;

/**
 * Helper for automatically extracting Redux action shapes from a map of action creators.
 */
export type ExtractActionShape<ActionCreators extends Record<string, unknown>> = Exclude<
  // Get return types for all exported functions
  ReturnType<Extract<Values<ActionCreators>, AnyFunction>>,
  // Exclude thunks from redux-thunk
  AnyFunction
>;
