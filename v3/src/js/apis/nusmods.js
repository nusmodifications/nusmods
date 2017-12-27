// @flow
// This file uses comment type because we want to import it in Webpack configs
/* eslint-disable spaced-comment */

/*:: import type { ModuleCode, Semester } from 'types/modules'; */

const config = require('../config/app-config.json');

const ayBaseUrl = `${config.apiBaseUrl}/${config.academicYear.replace('/', '-')}`;

class NUSModsApi {
  static ayBaseUrl() /*: string */ {
    return ayBaseUrl;
  }

  // List of modules for the entire acad year.
  static moduleListUrl() /*: string */ {
    return `${ayBaseUrl}/moduleList.json`;
  }

  // Module for that acad year. Not tied to any semester.
  static moduleDetailsUrl(moduleCode /*: ModuleCode */) /*: string */ {
    return `${ayBaseUrl}/modules/${moduleCode}.json`;
  }

  // List of all modules for the entire acad year
  static modulesUrl() /*: string */ {
    return `${ayBaseUrl}/moduleInformation.json`;
  }

  // List of all venues for one semester in the current acad year
  // TODO: implement api for all venues available
  static venueListUrl(semester /*: Semester */) /*: string */ {
    return `${ayBaseUrl}/${semester}/venues.json`;
  }

  // List of all venue's info for one semester in the current acad year
  static venuesUrl(semester /*: Semester */) /*: string */ {
    return `${ayBaseUrl}/${semester}/venueInformation.json`;
  }

  // List of departments mapped to faculties
  static facultyDepartmentsUrl(semester /*: Semester */) /*: string */ {
    return `${ayBaseUrl}/${semester}/facultyDepartments.json`;
  }
}

module.exports = NUSModsApi;
