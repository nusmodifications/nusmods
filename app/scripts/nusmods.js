/*global define*/
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals
    root.NUSMods = factory();
  }
}(this, function () {
  'use strict';

  var baseUrl = '/api/2013-2014/2/';
  var moduleInformationPromise, moduleListPromise;

  return {
    getCorrectAsAt: function (callback) {
      moduleListPromise = moduleListPromise || $.getJSON(baseUrl + 'moduleList.json');
      return moduleListPromise.then(function () {
        var lastModified = moduleListPromise.getResponseHeader('Last-Modified');
        if (callback) {
          callback(lastModified);
        }
        return moduleListPromise.getResponseHeader('Last-Modified');
      });
    },
    getMod: function (code, callback) {
      callback(timetableData.mods[code]);
    },
    getMods: function (callback) {
      moduleInformationPromise = moduleInformationPromise || $.getJSON(baseUrl + 'moduleInformation.json');
      return moduleInformationPromise.then(callback);
    },
    getCodesAndTitles: function (callback) {
      moduleListPromise = moduleListPromise || $.getJSON(baseUrl + 'moduleList.json');
      return moduleListPromise.then(callback);
    },
    setBaseUrl: function (url) {
      baseUrl = url;
    }
  };
}));
