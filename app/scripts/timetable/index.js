'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');
var TimetableController = require('./controllers/TimetableController');

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: new TimetableController(),
    appRoutes: {
      'timetable(/:academicYear/sem:semester)': 'showTimetable'
    }
  });
});
