'use strict';

var ayBaseUrl;
var moduleInformationPromise, moduleListPromise;
var moduleCodes;

module.exports = {
  getAllModules: function () {
    return moduleCodes;
  },
  generateModuleCodes: function () {
    moduleListPromise = moduleListPromise || $.getJSON(ayBaseUrl + 'moduleList.json');
    moduleListPromise.then(function () {
      moduleCodes = moduleListPromise.responseJSON;
    });
  },
  getLastModified: function (callback) {
    return $.ajax(ayBaseUrl + 'modules.json', {
      type: 'HEAD'
    }).then(function (data, textStatus, jqXHR) {
      var lastModified = jqXHR.getResponseHeader('Last-Modified');
      if (callback) {
        callback(lastModified);
      }
      return lastModified;
    });
  },
  getMod: function (code, callback) {
    return $.getJSON(ayBaseUrl + 'modules/' + code + '.json', callback);
  },
  getModIndex: function (code, callback) {
    return $.getJSON(ayBaseUrl + 'modules/' + code + '/index.json', callback);
  },
  getMods: function (callback) {
    moduleInformationPromise = moduleInformationPromise || $.getJSON(ayBaseUrl + 'moduleInformation.json');
    return moduleInformationPromise.then(callback);
  },
  getTimetable: function (semester, code, callback) {
    return $.getJSON(ayBaseUrl + semester + '/modules/' + code + '/timetable.json', callback);
  },
  getCodesAndTitles: function (callback) {
    moduleListPromise = moduleListPromise || $.getJSON(ayBaseUrl + 'moduleList.json');
    return moduleListPromise.then(callback);
  },
  setConfig: function (config) {
    ayBaseUrl = config.baseUrl + config.academicYear.replace('/', '-') + '/';
  }
};
