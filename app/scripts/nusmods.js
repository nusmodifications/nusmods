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

  return {
    getCorrectAsAt: function (callback) {
      callback(timetableData.correctAsAt);
    },
    getMod: function (code, callback) {
      callback(timetableData.mods[code]);
    },
    getMods: function (callback) {
      callback(timetableData.mods);
    }
  };
}));
