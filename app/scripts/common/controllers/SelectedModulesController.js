define([
    'underscore',
    'app',
    'backbone.marionette',
    'localforage',
    '../collections/TimetableModuleCollection',
    '../collections/LessonCollection'
  ],
  function (_, App, Marionette, localforage, TimetableModuleCollection, LessonCollection) {
    'use strict';

    return Marionette.Controller.extend({
      initialize: function () {
        this.timetable = new LessonCollection();
        this.selectedModules = new TimetableModuleCollection([], {
          timetable: this.timetable
        });
        this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
        this.listenTo(this.timetable, 'change', this.modulesChanged);
      },

      modulesChanged: function () {
        var selectedModules = this.selectedModules.toJSON();
        localforage.setItem('selectedModules', selectedModules);
      }
    });
  });
