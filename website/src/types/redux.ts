import { State } from './state';

// Flux Standard Action: https://github.com/acdlite/flux-standard-action
export type FSA = {
  type: string;
  payload: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  meta?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: boolean;
};

export type GetState = () => State;
