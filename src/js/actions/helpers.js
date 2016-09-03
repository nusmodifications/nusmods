export const RESET_REQUEST_STATE = 'RESET_REQUEST_STATE';
export function resetRequestState(domain) {
  return {
    type: RESET_REQUEST_STATE,
    payload: _.isArray(domain) ? domain : [domain]
  };
}

export const RESET_ERROR_STATE = 'RESET_ERROR_STATE';
export function resetErrorState(domain) {
  return {
    type: RESET_ERROR_STATE,
    payload: _.isArray(domain) ? domain : [domain]
  };
}

export const RESET_ALL_STATE = 'RESET_ALL_STATE';
export function resetAllState() {
  return {
    type: RESET_ALL_STATE
  };
}
