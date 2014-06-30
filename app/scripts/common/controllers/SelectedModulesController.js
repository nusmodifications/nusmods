define([
    'underscore',
    'app',
    'backbone.marionette',
    '../collections/TimetableModuleCollection',
    '../collections/LessonCollection'
  ],
  function (_, App, Marionette, TimetableModuleCollection, LessonCollection) {
    'use strict';

    return Marionette.Controller.extend({
      initialize: function () {
        this.timetable = new LessonCollection();
        this.selectedModules = new TimetableModuleCollection([], {
          timetable: this.timetable
        });
      }
    });
  });
