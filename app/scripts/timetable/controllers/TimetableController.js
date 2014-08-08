'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Promise = require('bluebird'); // jshint ignore:line
var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
var TimetableView = require('../views/TimetableView');
var _ = require('underscore');
var config = require('../../common/config');

var navigationItem = App.request('addNavigationItem', {
  name: 'Timetable',
  icon: 'table',
  url: '/timetable'
});

module.exports = Marionette.Controller.extend({
  showTimetable: function (academicYear, semester, queryString) {
    semester = parseInt(semester, 10);
    if (!(semester >= 1 && semester <= 4)) {
      return Backbone.history.navigate(
        config.semTimetableFragment(),
        {
          trigger: true,
          replace: true
        });
    }
    academicYear = academicYear.replace('-', '/');
    navigationItem.select();
    Promise.resolve().then(function () {
      if (queryString) {
        var selectedModules = App.request('selectedModules', semester);
        var timetable = selectedModules.timetable;
        timetable.reset();
        var selectedCodes = selectedModules.pluck('ModuleCode');
        var routeModules = TimetableModuleCollection.fromQueryStringToJSON(queryString);
        var routeCodes = _.pluck(routeModules, 'ModuleCode');
        _.each(_.difference(selectedCodes, routeCodes), function (code) {
          selectedModules.remove(selectedModules.get(code));
        });
        return Promise.all(_.map(routeModules, function (module) {
          var selectedModule = selectedModules.get(module.ModuleCode);
          if (selectedModule) {
            var selectedModuleLessons = selectedModule.get('lessons');
            if (selectedModuleLessons) {
              var lessonsByType = selectedModuleLessons.groupBy('LessonType');
              _.each(module.selectedLessons, function (lesson) {
                timetable.add(selectedModuleLessons.where({
                  LessonType: lesson.LessonType,
                  ClassNo: lesson.ClassNo
                }));
                delete lessonsByType[lesson.LessonType];
              });
              // Add lessons whose type did not exist in data when timetable last saved
              _.each(lessonsByType, function (lessonsOfType) {
                timetable.add(_.sample(lessonsOfType));
              });
            }
          } else {
            return App.request('addModule', semester, module.ModuleCode, module);
          }
        }));
      }
    }).then(function () {
      App.mainRegion.show(new TimetableView({
        academicYear: academicYear,
        semester: semester
      }));
    });
  }
});
