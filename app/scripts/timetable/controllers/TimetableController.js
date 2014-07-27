'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Promise = require('bluebird');
var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
var TimetableView = require('../views/TimetableView');
var _ = require('underscore');
var config = require('../../common/config');
var localforage = require('localforage');

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
    navigationItem.select();
    Promise.resolve().then(function () {
      if (queryString && !Backbone.History.initialRoute) {
        return queryString;
      }
      return localforage.getItem(config.semTimetableFragment(semester) +
        ':queryString').then(function (savedQueryString) {
        if (Backbone.History.initialRoute && queryString && savedQueryString !== queryString) {
          // If initial query string does not match saved query string,
          // timetable is shared.
          var selectedModules = App.request('selectedModules', semester);
          selectedModules.shared = true;
          return queryString;
        }
        return savedQueryString;
      });
    }).then(function (queryString) {
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
            return Promise.resolve(App.request('addModule', semester, module.ModuleCode, module).promise);
          }
        }));
      }
    }).then(function () {
      App.mainRegion.show(new TimetableView({
        semester: semester
      }));
    });
  }
});
