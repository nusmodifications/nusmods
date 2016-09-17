// @flow

import config from 'config';

import type { ModuleCode } from 'types/modules';

const ayBaseUrl: string = `${config.apiBaseUrl}/${config.academicYear.replace('/', '-')}`;

const NUSModsApi = {
  ayBaseUrl: (): string => ayBaseUrl,
  // List of modules for the entire acad year.
  moduleListUrl: (): string => {
    return `${ayBaseUrl}/moduleList.json`;
  },
  // Module for that acad year. Not tied to any semester.
  moduleDetailsUrl: (moduleCode: ModuleCode): string => {
    return `${ayBaseUrl}/modules/${moduleCode}.json`;
  },
};

export default NUSModsApi;
