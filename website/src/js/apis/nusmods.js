const config = require('../config/app-config.json');

class NUSModsApi {
  /**
   * @param {string} academicYear
   * @returns {string}
   */
  static baseUrl(academicYear = config.academicYear) {
    return `${config.apiBaseUrl}/v2/${academicYear.replace('/', '-')}`;
  }

  /**
   * List of modules for the entire acad year.
   * @param {string} academicYear
   * @returns {string}
   */
  static moduleListUrl(academicYear = config.academicYear) {
    return `${NUSModsApi.baseUrl(academicYear)}/moduleList.json`;
  }

  /**
   * List of all modules for the entire acad year
   * @param {string} academicYear
   * @returns {string}
   */
  static modulesUrl(academicYear = config.academicYear) {
    return `${NUSModsApi.baseUrl(academicYear)}/moduleInformation.json`;
  }

  /**
   * Module for that acad year. Not tied to any semester.
   * @param {string} moduleCode
   * @param {string} academicYear
   * @returns {string}
   */
  static moduleDetailsUrl(moduleCode, academicYear = config.academicYear) {
    return `${NUSModsApi.baseUrl(academicYear)}/modules/${moduleCode}.json`;
  }

  /**
   * List of all venues for one semester
   * @param {number} semester
   * @param {string} academicYear
   * @returns {string}
   */
  static venueListUrl(semester, academicYear = config.academicYear) {
    return `${NUSModsApi.baseUrl(academicYear)}/semesters/${semester}/venues.json`;
  }

  /**
   * List of all venue's info for one semester in the current acad year
   * @param {number} semester
   * @param {string} academicYear
   * @returns {string}
   */
  static venuesUrl(semester, academicYear = config.academicYear) {
    return `${NUSModsApi.baseUrl(academicYear)}/semesters/${semester}/venueInformation.json`;
  }

  /**
   * List of departments mapped to faculties
   * @param {string} academicYear
   * @returns {string}
   */
  static facultyDepartmentsUrl(academicYear = config.academicYear) {
    return `${NUSModsApi.baseUrl(academicYear)}/facultyDepartments.json`;
  }
}

module.exports = NUSModsApi;
