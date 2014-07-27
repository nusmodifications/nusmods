'use strict';

var LessonCollection = require('../collections/LessonCollection');
var Marionette = require('backbone.marionette');
var TimetableModuleCollection = require('../collections/TimetableModuleCollection');
var config = require('../config');
var localforage = require('localforage');

module.exports = Marionette.Controller.extend({
  initialize: function (options) {
    this.semester = options.semester;
    this.timetable = new LessonCollection();
    this.selectedModules = new TimetableModuleCollection([], {
      timetable: this.timetable
    });
    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);
  },

  modulesChanged: function () {
    if (!this.selectedModules.shared) {
      localforage.setItem(config.semTimetableFragment(this.semester) +
        ':queryString', this.selectedModules.toQueryString());
    }
  }
});
