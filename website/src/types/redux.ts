import { State } from './state';

/**
 * Flux Standard Action: https://github.com/acdlite/flux-standard-action
 * @deprecated Use Actions from types/actions instead
 */
export type FSA = {
  type: string;
  payload: any;
  meta?: any;
  error?: boolean;
};

export type GetState = () => State;
