// @flow
import type { ModuleCode, Semester } from 'types/modules';

import config from 'config';

const ayBaseUrl = `${config.apiBaseUrl}/${config.academicYear.replace('/', '-')}`;

const NUSModsApi = {
  ayBaseUrl: (): string => ayBaseUrl,

  // List of modules for the entire acad year.
  moduleListUrl: (): string => {
    return `${ayBaseUrl}/moduleList.json`;
  },

  // Module for that acad year. Not tied to any semester.
  moduleDetailsUrl: (moduleCode: ModuleCode): string =>
    `${ayBaseUrl}/modules/${moduleCode}.json`,

  // List of all modules for the entire acad year
  modulesUrl: (): string => `${ayBaseUrl}/moduleInformation.json`,

  // List of all venue's info for one semester in the current acad year
  venuesUrl: (semester: Semester): string =>
    `${ayBaseUrl}/${semester}/venueInformation.json`,

  // List of departments mapped to faculties
  facultyDepartmentsUrl: (semester: Semester): string =>
    `${ayBaseUrl}/${semester}/facultyDepartments.json`,
};

export default NUSModsApi;
