// @flow
import type { FSA } from 'types/redux';

// eslint-disable-next-line import/prefer-default-export
export function initAction(): FSA {
  return {
    type: 'INIT',
    payload: null,
  };
}
