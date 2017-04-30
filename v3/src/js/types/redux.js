// @flow

// Flux Standard Action: https://github.com/acdlite/flux-standard-action
export type FSA = {
  type: string,
  payload: any,
  meta?: any,
  error?: boolean,
};
