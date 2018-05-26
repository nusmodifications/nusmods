// @flow
import type { $AxiosXHR } from 'axios';
import axios from 'axios';
import fs from 'mz/fs';
import path from 'path';

import type { ModuleCode } from 'types/modules';
import api from 'apis/nusmods';
import config from 'config';
import { SUCCESS } from 'middlewares/requests-middleware';
import { FETCH_MODULE, FETCH_MODULE_LIST } from 'actions/moduleBank';

const isProduction = process.env.NODE_ENV === 'production';
const apiPath = (file) => path.resolve(config.ssr.api, config.academicYear.replace('/', '-'), file);

const axiosResponseToAction = (type: string) => (response: $AxiosXHR<*, *>) => ({
  type: type + SUCCESS,
  payload: response.data,
  meta: {
    requestStatus: SUCCESS,
    responseHeaders: response.headers,
  },
});

const fsToAction = async (type: string, filePath: string) => {
  const [content, stat] = await Promise.all([fs.readFile(filePath), fs.stat(filePath)]);

  return {
    type: type + SUCCESS,
    payload: content,
    meta: {
      requestStatus: SUCCESS,
      responseHeaders: {
        lastModified: stat.mtime,
      },
    },
  };
};

export function getModuleList() {
  const action = FETCH_MODULE_LIST;
  return isProduction
    ? fsToAction(action, apiPath('moduleList.json'))
    : axios.get(api.moduleListUrl()).then(axiosResponseToAction(action));
}

export function getVenueList() {
  // TODO: Move VenueList into Redux store
  return axios.get(api.venueListUrl(config.semester));
}

export function getModule(moduleCode: ModuleCode) {
  const action = FETCH_MODULE;
  return isProduction
    ? fsToAction(action, apiPath(`modules/${moduleCode}.json`))
    : axios.get(api.moduleDetailsUrl(moduleCode)).then(axiosResponseToAction(action));
}
