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
