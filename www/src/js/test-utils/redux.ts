import { REHYDRATE } from 'redux-persist';
import { FSA } from 'types/redux';

// eslint-disable-next-line import/prefer-default-export
export function initAction(): FSA {
  return {
    type: 'INIT',
    payload: null,
  };
}

export function rehydrateAction(): FSA {
  return {
    type: REHYDRATE,
    payload: null,
  };
}
