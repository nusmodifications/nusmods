// @flow
import axios from 'axios';
import type { $AxiosXHR } from 'axios';
import type { ModuleCode } from 'types/modules';
import api from 'apis/nusmods';
import config from 'config';
import { SUCCESS } from 'middlewares/requests-middleware';
import { FETCH_MODULE_LIST } from 'actions/moduleBank';

const axiosResponseToAction = (type: string) => (response: $AxiosXHR<*, *>) => ({
  type: type + SUCCESS,
  payload: response.data,
  meta: {
    requestStatus: SUCCESS,
    responseHeaders: response.headers,
  },
});

// TODO: Add in filesystem provider for non-dev env
export function getModuleList() {
  return axios.get(api.moduleListUrl()).then(axiosResponseToAction(FETCH_MODULE_LIST));
}

export function getVenueList() {
  return axios.get(api.venueListUrl(config.semester));
}

export function getModule(moduleCode: ModuleCode) {
  return axios.get(api.moduleDetailsUrl(moduleCode));
}
