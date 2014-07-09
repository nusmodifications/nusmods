define(['require', 'underscore', 'app', 'backbone', 'backbone.marionette',
    'localforage', 'common/config'],
  function (require, _, App, Backbone, Marionette, localforage, config) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Timetable',
      icon: 'table',
      url: '/timetable'
    });

    return Marionette.Controller.extend({
      showTimetable: function (academicYear, semester, queryString) {
        require(['../views/TimetableView'],
          function (TimetableView) {
            if (!semester) {
              return Backbone.history.navigate(
                config.semTimetableFragment,
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
              var routeModules = selectedModules.fromQueryString(queryString);
              var routeCodes = _.pluck(routeModules, 'ModuleCode');
              _.each(_.difference(selectedCodes, routeCodes), function (code) {
                selectedModules.remove(selectedModules.get(code));
              });
              _.each(routeModules, function (module) {
                var selectedModule = selectedModules.get(module.ModuleCode);
                if (selectedModule) {
                  var selectedModuleLessons = selectedModule.get('lessons');
                  _.each(module.selectedLessons, function (lesson) {
                    timetable.add(selectedModuleLessons.where({
                      LessonType: lesson.LessonType,
                      ClassNo: lesson.ClassNo
                    }));
                  }, this);
                } else {
                  App.request('addModule', module.ModuleCode, module);
                }
              });
            }
            App.mainRegion.show(new TimetableView({
              semTimetableFragment: config.semTimetableFragment
            }));
          });
      }
    });
  });
