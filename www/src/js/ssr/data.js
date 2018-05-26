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
  const [content, stat] = await Promise.all([fs.readFile(filePath, 'utf-8'), fs.stat(filePath)]);

  return {
    type: type + SUCCESS,
    payload: JSON.parse(content),
    meta: {
      requestStatus: SUCCESS,
      responseHeaders: {
        lastModified: stat.mtime.toUTCString(),
      },
    },
  };
};

/* eslint-disable class-methods-use-this */
export class Data {
  cachedModuleList: ?{
    action: Object,
    lastModified: number,
  };

  async getModuleList() {
    const type = FETCH_MODULE_LIST;

    if (isProduction) {
      const filename = apiPath('moduleList.json');

      const cachedModuleList = this.cachedModuleList;
      const lastModified = (await fs.stat(filename)).mtimeMs;
      if (cachedModuleList && lastModified > cachedModuleList.lastModified) {
        return cachedModuleList.action;
      }

      const action = fsToAction(type, apiPath('moduleList.json'));
      this.cachedModuleList = { action, lastModified };
      return action;
    }

    return axios.get(api.moduleListUrl()).then(axiosResponseToAction(type));
  }

  getVenueList() {
    // TODO: Move VenueList into Redux store
    return axios.get(api.venueListUrl(config.semester));
  }

  getModule(moduleCode: ModuleCode) {
    const type = FETCH_MODULE;
    return isProduction
      ? fsToAction(type, apiPath(`modules/${moduleCode}.json`))
      : axios.get(api.moduleDetailsUrl(moduleCode)).then(axiosResponseToAction(type));
  }
}

export default new Data();
