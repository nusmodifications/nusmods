define([
    'app',
    'backbone.marionette',
    './controllers/TimetableController'
  ],
  function (App, Marionette, TimetableController) {
    'use strict';

    App.addInitializer(function () {
      new Marionette.AppRouter({
        controller: new TimetableController(),
        appRoutes: {
          'timetable(/:academicYear/sem:semester)': 'showTimetable'
        }
      });
    });
  });
