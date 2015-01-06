'use strict';

var $ = require('jquery');
var Promise = require('bluebird'); // jshint ignore:line

var ayBaseUrl;
var moduleInformationPromise, moduleListPromise;
var timetablePromise;
var moduleCodes = {};

module.exports = {
  getAllModules: function () {
    return moduleCodes;
  },
  generateModuleCodes: function () {
    moduleListPromise = moduleListPromise || Promise.resolve($.getJSON(ayBaseUrl + 'moduleList.json'));
    return moduleListPromise.then(function (data) {
      for (var i = 0; i < data.length; i++) {
        moduleCodes[data[i].ModuleCode] = data[i].ModuleTitle;
      }
    });
  },
  getLastModified: function (callback) {
    return Promise.resolve($.ajax(ayBaseUrl + 'modules.json', {
      type: 'HEAD'
    }).then(function (data, textStatus, jqXHR) {
      var lastModified = jqXHR.getResponseHeader('Last-Modified');
      if (callback) {
        callback(lastModified);
      }
      return lastModified;
    }));
  },
  getMod: function (code, callback) {
    return Promise.resolve($.getJSON(ayBaseUrl + 'modules/' + code + '.json', callback));
  },
  getModIndex: function (code, callback) {
    return Promise.resolve($.getJSON(ayBaseUrl + 'modules/' + code + '/index.json', callback));
  },
  getMods: function (callback) {
    moduleInformationPromise = moduleInformationPromise ||
      Promise.resolve($.getJSON(ayBaseUrl + 'moduleInformation.json'));
    return moduleInformationPromise.then(callback);
  },
  getAllTimetable: function (semester, callback) {
    timetablePromise = timetablePromise || Promise.resolve($.getJSON(ayBaseUrl + semester + '/timetable.json'));
    return timetablePromise.then(callback);
  },
  getTimetable: function (semester, code, callback) {
    return Promise.resolve($.getJSON(ayBaseUrl + semester + '/modules/' + code + '/timetable.json', callback));
  },
  getCodesAndTitles: function (callback) {
    moduleListPromise = moduleListPromise || Promise.resolve($.getJSON(ayBaseUrl + 'moduleList.json'));
    return moduleListPromise.then(callback);
  },
  setConfig: function (config) {
    ayBaseUrl = config.baseUrl + config.academicYear.replace('/', '-') + '/';
  }
};
