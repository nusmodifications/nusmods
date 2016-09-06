import { API_REQUEST } from 'middlewares/requests-middleware';
import NUSModsApi from 'utils/nusmods-api';

export const GET_MODULE_LIST = 'GET_MODULE_LIST';
export function getModuleList() {
  return (dispatch) => dispatch({
    [API_REQUEST]: {
      type: GET_MODULE_LIST,
      payload: {
        method: 'GET',
        url: NUSModsApi.moduleListUrl(),
      },
    },
  });
}

export const GET_MODULE = 'GET_MODULE';
export function getModule(moduleCode) {
  return (dispatch, getState) => {
    // Module has been fetched before and cached. Don't have to fetch again.
    if (getState().entities.moduleBank.modules[moduleCode]) {
      return null;
    }

    return dispatch({
      [API_REQUEST]: {
        type: GET_MODULE,
        payload: {
          method: 'GET',
          url: NUSModsApi.moduleDetailsUrl(moduleCode),
        },
      },
    });
  };
}
