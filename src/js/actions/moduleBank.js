import { API_REQUEST } from 'middlewares/requests-middleware';
import NUSModsApi from 'utils/nusmods-api';

export const FETCH_MODULE_LIST = 'FETCH_MODULE_LIST';
export function fetchModuleList() {
  return (dispatch) => dispatch({
    [API_REQUEST]: {
      type: FETCH_MODULE_LIST,
      payload: {
        method: 'GET',
        url: NUSModsApi.moduleListUrl(),
      },
    },
  });
}

export const FETCH_MODULE = 'FETCH_MODULE';
export function fetchModule(moduleCode) {
  return (dispatch, getState) => {
    // Module has been fetched before and cached. Don't have to fetch again.
    if (getState().entities.moduleBank.modules[moduleCode]) {
      return null;
    }

    return dispatch({
      [API_REQUEST]: {
        type: FETCH_MODULE,
        payload: {
          method: 'GET',
          url: NUSModsApi.moduleDetailsUrl(moduleCode),
        },
      },
    });
  };
}
