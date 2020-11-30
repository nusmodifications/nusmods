import { REHYDRATE } from 'redux-persist';

export function initAction() {
  return {
    type: 'INIT' as const,
    payload: null,
  };
}

export function rehydrateAction() {
  return {
    type: REHYDRATE,
    payload: null,
  };
}
