define(['require', 'app', 'backbone.marionette', 'localforage'],
  function (require, App, Marionette, localforage) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Timetable',
      icon: 'table',
      url: '/timetable'
    });

    var timetableView;

    return Marionette.Controller.extend({
      showTimetable: function (academicYear, semester, options) {
        require(['../views/TimetableView'],
          function (TimetableView) {
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
