// @flow
import type { ModuleCode, Semester } from 'types/modules';

import config from 'config';

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

  // List of all modules for the entire acad year
  modulesUrl: (): string => {
    return `${ayBaseUrl}/moduleInformation.json`;
  },

  // List of all venue's info for one semester in the current acad year
  venuesUrl: (semester: Semester): string => {
    return `${ayBaseUrl}/${semester}/venueInformation.json`;
  },
};

export default NUSModsApi;
