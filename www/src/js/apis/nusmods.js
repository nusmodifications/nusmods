// @flow
// This file uses comment type because we want to import it in Webpack configs
/* eslint-disable spaced-comment */

/*:: import type { ModuleCode, Semester } from 'types/modules'; */

const config = require('../config/app-config.json');

class NUSModsApi {
  static ayBaseUrl(academicYear /*: string */ = config.academicYear) /*: string */ {
    return `${config.apiBaseUrl}/${academicYear.replace('/', '-')}`;
  }

  // List of modules for the entire acad year.
  static moduleListUrl(academicYear /*: string */ = config.academicYear) /*: string */ {
    return `${NUSModsApi.ayBaseUrl(academicYear)}/moduleList.json`;
  }

  // Module for that acad year. Not tied to any semester.
  static moduleDetailsUrl(
    moduleCode /*: ModuleCode */,
    academicYear /*: string */ = config.academicYear,
  ) /*: string */ {
    return `${NUSModsApi.ayBaseUrl(academicYear)}/modules/${moduleCode}.json`;
  }

  // List of all modules for the entire acad year
  static modulesUrl(academicYear /*: string */ = config.academicYear) /*: string */ {
    return `${NUSModsApi.ayBaseUrl(academicYear)}/moduleInformation.json`;
  }

  // List of all venues for one semester in the current acad year
  // TODO: implement api for all venues available
  static venueListUrl(
    semester /*: Semester */,
    academicYear /*: string */ = config.academicYear,
  ) /*: string */ {
    return `${NUSModsApi.ayBaseUrl(academicYear)}/${semester}/venues.json`;
  }

  // List of all venue's info for one semester in the current acad year
  static venuesUrl(
    semester /*: Semester */,
    academicYear /*: string */ = config.academicYear,
  ) /*: string */ {
    return `${NUSModsApi.ayBaseUrl(academicYear)}/${semester}/venueInformation.json`;
  }

  // List of departments mapped to faculties
  static facultyDepartmentsUrl(
    semester /*: Semester */,
    academicYear /*: string */ = config.academicYear,
  ) /*: string */ {
    return `${NUSModsApi.ayBaseUrl(academicYear)}/${semester}/facultyDepartments.json`;
  }
}

module.exports = NUSModsApi;
