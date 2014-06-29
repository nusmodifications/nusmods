define([
    'underscore',
    'app',
    'backbone.marionette',
    '../collections/TimetableModuleCollection',
    '../collections/ExamCollection',
    '../collections/LessonCollection'
  ],
  function (_, App, Marionette, TimetableModuleCollection, ExamCollection,
            LessonCollection) {
    'use strict';

    return Marionette.Controller.extend({
      initialize: function () {
        this.exams = new ExamCollection();
        this.timetable = new LessonCollection();
        this.selectedModules = new TimetableModuleCollection([], {
          timetable: this.timetable,
          exams: this.exams
        });
      }
    });
  });
