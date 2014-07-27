/*global define*/
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.NUSMods = factory();
  }
}(this, function () {
  'use strict';

  var ayBaseUrl;
  var moduleInformationPromise, moduleListPromise;
  var moduleCodes;

  return {
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
}));
