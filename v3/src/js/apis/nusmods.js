// @flow
// This file uses comment type because we want to import it in Webpack configs
/* eslint-disable spaced-comment, arrow-parens */

/*:: import type { ModuleCode, Semester } from 'types/modules'; */

const config = require('../config/app-config.json');

const ayBaseUrl /*: string */ = `${config.apiBaseUrl}/${config.academicYear.replace('/', '-')}`;

const NUSModsApi = {
  ayBaseUrl: ()/*: string */ => ayBaseUrl,

  // List of modules for the entire acad year.
  moduleListUrl: ()/*: string */ =>
    `${ayBaseUrl}/moduleList.json`,

  // Module for that acad year. Not tied to any semester.
  moduleDetailsUrl: (moduleCode /*: ModuleCode */)/*: string */ =>
    `${ayBaseUrl}/modules/${moduleCode}.json`,

  // List of all modules for the entire acad year
  modulesUrl: ()/*: string */ =>
    `${ayBaseUrl}/moduleInformation.json`,

  // List of all venue's info for one semester in the current acad year
  venuesUrl: (semester/*: Semester */)/*: string */ =>
    `${ayBaseUrl}/${semester}/venueInformation.json`,

  // List of departments mapped to faculties
  facultyDepartmentsUrl: (semester/*: Semester */)/*: string */ =>
    `${ayBaseUrl}/${semester}/facultyDepartments.json`,
};

module.exports = NUSModsApi;
