define(['require', 'app', 'backbone', 'backbone.marionette', 'localforage', 'json!config.json'],
  function (require, App, Backbone, Marionette, localforage, config) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Timetable',
      icon: 'table',
      url: '/timetable'
    });

    var semTimetableFragment = 'timetable/' + config.academicYear.replace('/', '-') + '/sem' + config.semester;
    var timetableView;

    return Marionette.Controller.extend({
      showTimetable: function (academicYear, semester, options) {
        require(['../views/TimetableView'],
          function (TimetableView) {
            if (!semester) {
              return Backbone.history.navigate(semTimetableFragment, {trigger: true});
            }
            navigationItem.select();
            timetableView = new TimetableView();
            App.mainRegion.show(timetableView);
            if (options) {
              options = JSON.parse(decodeURIComponent(options));
              timetableView.setOptions(options);
            } else {
              localforage.getItem('timetableOptions',
                function (options) {
                  timetableView.setOptions(options);
                });
            }
          });
      }
    });
  });
