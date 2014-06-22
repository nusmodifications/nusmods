define([
    'app',
    'backbone.marionette',
    './controllers/TimetableBuilderController'
  ],
  function (App, Marionette, TimetableBuilderController) {
    'use strict';

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: new TimetableBuilderController(),
        appRoutes: {
          'timetable-builder': 'showTimetableBuilder',
          'timetable-builder/:options': 'showTimetableBuilder'
        }
      });
    });
  });
