'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var config = require('../../common/config');

var navigationItem = App.request('addNavigationItem', {
  name: 'Timetable',
  icon: 'table',
  url: '/timetable'
});

module.exports = Marionette.Controller.extend({
  showTimetable: function (academicYear, semester, queryString) {
    var TimetableView = require('../views/TimetableView');
    var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
    if (!semester) {
      return Backbone.history.navigate(
        config.semTimetableFragment(),
        {
          trigger: true,
          replace: true
        });
    }
    navigationItem.select();
    if (queryString) {
      var selectedModules = App.request('selectedModules');
      var timetable = selectedModules.timetable;
      timetable.reset();
      var selectedCodes = selectedModules.pluck('ModuleCode');
      var routeModules = TimetableModuleCollection.fromQueryStringToJSON(queryString);
      var routeCodes = _.pluck(routeModules, 'ModuleCode');
      _.each(_.difference(selectedCodes, routeCodes), function (code) {
        selectedModules.remove(selectedModules.get(code));
      });
      _.each(routeModules, function (module) {
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
          App.request('addModule', module.ModuleCode, module);
        }
      });
    }
    App.mainRegion.show(new TimetableView({
      semester: semester
    }));
  }
});
